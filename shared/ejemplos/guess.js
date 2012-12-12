var colores = ['roja', 'amarilla', 'azul', 'verde', 'naranja', 'violeta'];

function generar_secuencia(cant) {
    var secuencia = [];
    for (var i = 0; i < cant; i++) {
        var j = Math.floor(Math.random() * colores.length);
        var color = colores[j];
        secuencia.push(color);
    }
    return secuencia;
}

function aciertos_completos(secuencia, solucion) {
    var result = 0;
    for (var i = 0; i < solucion.length; i++) {
        if (secuencia[i] == solucion[i]) {
            result++;
        }
    }
    return result;
}

function aciertos_parciales(secuencia, solucion) {
    function contar_por_color(sec) {
        var cantidades = {};
        for (var i = 0; i < sec.length; i++) {
            cantidades[sec[i]] = (cantidades[sec[i]] || 0) + 1;
        }
        return cantidades;
    }
    var cant_sec = contar_por_color(secuencia);
    var cant_sol = contar_por_color(solucion);
    var result = 0;

    for (var col in cant_sol) {
        result = result + Math.min(cant_sol[col], cant_sec[col] || 0);
    }

    return result;
}

function color_de_ficha(ficha) {
    ficha = $(ficha);
    var clases = ficha.attr('class').split(' ');
    for (var i = 0; i < clases.length; i++) {
        if ($.inArray(clases[i], colores) >= 0) {
            return clases[i];
        }
    }
    return null;
}

$(function() {
    console.log('DOM cargado!');
    $('.barra-izq .ficha').click(function(evt) {
        var ficha = $(this);
        var clases = ficha.attr('class');
        var primer_ficha_gris = $('.tablero .ficha.gris').first();
        var color = color_de_ficha(ficha);
        primer_ficha_gris.removeClass('gris');
        primer_ficha_gris.addClass(color);
    });
});

