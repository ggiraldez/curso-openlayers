// el objeto mapa de OpenLayers
var map;
// las capas WMS
var layer1, layer2;
// la capa vectorial
var vectorial;
// los controles
var medir, dibujar, consultar, consultar_gml;

OpenLayers.ProxyHost = '/proxy?url=';

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

$(function() {
    map = new OpenLayers.Map('mapa', { });
    agregar_layers();
    agregar_controles();

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

