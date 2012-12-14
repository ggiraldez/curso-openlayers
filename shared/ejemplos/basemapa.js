// el objeto mapa de OpenLayers
var map;
// las capas WMS
var layer1, layer2;
// la capa vectorial
var vectorial;
// capa de markers
var markers;
// los controles
var medir, dibujar, consultar, consultar_gml;
// iconos para markers
var iconos = {};
// nombres de los iconos
var nombres = ['marker', 'marker-blue', 'marker-green', 'marker-gold'];

OpenLayers.ProxyHost = '/proxy?url=';

function agregar_legend(layer) {
    var url = layer.getFullRequestString({
        REQUEST: 'GetLegendGraphic',
        LAYERS: '',
        LAYER: layer.params.LAYERS
    });
    $('<img>').attr('src', url).appendTo('.legend');
}

function agregar_layers() {
    layer1 = new OpenLayers.Layer.WMS("Capa WMS", 
            "http://vmap0.tiles.osgeo.org/wms/vmap0",
            { layers: 'basic' });
    map.addLayer(layer1);

    layer2 = new OpenLayers.Layer.WMS('OneGeology',
            "http://www.onegeology-arg.com.ar/geoserver/wms",
            { layers: 'GeoSciML:arg5m_geo', transparent: true });
    map.addLayer(layer2);

    vectorial = new OpenLayers.Layer.Vector();
    map.addLayer(vectorial);

    markers = new OpenLayers.Layer.Markers('Markers');
    map.addLayer(markers);

    agregar_legend(layer1);
    agregar_legend(layer2);
}

function agregar_controles() {
    map.addControl(new OpenLayers.Control.MousePosition({ numDigits: 3 }));

    medir = new OpenLayers.Control.Measure(OpenLayers.Handler.Path, { persist: true });
    medir.events.register('measure', null, function(medicion) {
        alert('La longitud es ' + medicion.measure + ' ' + medicion.units);
    });
    map.addControl(medir);

    dibujar = new OpenLayers.Control.DrawFeature(vectorial, OpenLayers.Handler.Point, {});
    map.addControl(dibujar);

    consultar = new OpenLayers.Control.WMSGetFeatureInfo({
        url: 'http://www.onegeology-arg.com.ar/geoserver/wms'
    });
    var popup;
    consultar.events.register('getfeatureinfo', null, function(evt) {
        if (popup) {
            map.removePopup(popup);
        }
        popup = new OpenLayers.Popup.FramedCloud(null,
            map.getLonLatFromPixel(evt.xy),
            new OpenLayers.Size(300,300),
            evt.text,
            null,
            true);
        popup.autoSize = false;
        map.addPopup(popup);
    });
    map.addControl(consultar);

    var formato_gml = new OpenLayers.Format.GML();
    var features;
    consultar_gml = new OpenLayers.Control.WMSGetFeatureInfo({
        url: 'http://www.onegeology-arg.com.ar/geoserver/wms'
    });
    consultar_gml.infoFormat = 'application/vnd.ogc.gml';
    consultar_gml.events.register('getfeatureinfo', null, function(evt) {
        if (features) {
            vectorial.removeFeatures(features);
        }
        features = formato_gml.read(evt.text);
        vectorial.addFeatures(features);
    });
    map.addControl(consultar_gml);
}

function crear_iconos() {
    $.each(nombres, function(idx, nombre) {
        iconos[nombre] = new OpenLayers.Icon('http://10.1.20.227:3000/libs/OpenLayers-2.12/img/' + nombre + '.png',
            new OpenLayers.Size(21,25),
            new OpenLayers.Pixel(-10, -25));
    });
}

function agregar_markers() {
    for (var i = 0; i < 10; i++) {
        var lon = (Math.random() * 14) - 70;
        var lat = (Math.random() * 33) - 55;
        var marker = new OpenLayers.Marker(new OpenLayers.LonLat(lon, lat),
                iconos[nombres[i % nombres.length]].clone());
        markers.addMarker(marker);
    }
}

function agregar_sismos() {
    var icono = new OpenLayers.Icon('http://10.1.20.227:3000/libs/earthquake.png', new OpenLayers.Size(32,32), new OpenLayers.Pixel(-16,-16));
    var sismos = new OpenLayers.Layer.GeoRSS('Sismos',
            'http://www.inpres.gov.ar/rss/sismos7d.xml',
            { icon: icono });
    map.addLayer(sismos);
}


$(function() {
    map = new OpenLayers.Map('mapa', { });
    agregar_layers();
    agregar_controles();
    crear_iconos();
    agregar_markers();
    agregar_sismos();

    var control_activo = null;
    var controles = ['medir', 'dibujar', 'consultar', 'consultar_gml'];

    $.each(controles, function(index, boton) {
        $('#' + boton).click(function(evt) {
            var control = window[boton];
            if (control.active) {
                control.deactivate();
                control_activo = null;
            } else {
                if (control_activo) {
                    control_activo.deactivate();
                }
                control.activate();
                control_activo = control;
            }
        });
    });

    map.moveTo(new OpenLayers.LonLat(-60, -34), 5);
});

