// los colores de fichas disponibles
var colores = ['roja', 'amarilla', 'azul', 'verde', 'naranja', 'violeta'];
// la secuencia actual de colores elegida por el juego
var solucion;
// la longitud de la secuencia a jugar
var longitud = 4;
// cantidad de intentos de adivinanza
var intentos = 8;

// generar una secuencia de colores al azar de longitud cant
function generar_secuencia(cant) {
    var secuencia = [];
    for (var i = 0; i < cant; i++) {
        var j = Math.floor(Math.random() * colores.length);
        var color = colores[j];
        secuencia.push(color);
    }
    return secuencia;
}

// contar la cantidad de aciertos completos (color y posición) de la secuencia
// respecto de la solución dada
function aciertos_completos(secuencia, solucion) {
    var result = 0;
    for (var i = 0; i < solucion.length; i++) {
        if (secuencia[i] == solucion[i]) {
            result++;
        }
    }
    return result;
}

// contar la cantidad de aciertos parciales (color) de la secuencia
// respecto de la solución dada
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

// determinar el color de la ficha dada (el elemento HTML)
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

// obtener la secuencia jugada en una fila
function obtener_jugada(fila) {
    return $(fila).find('.ficha').map(function() {
        return color_de_ficha(this);
    });
}

// calcular los aciertos de una jugada y mostrar los resultados
// devuelve true si el jugador adivinó la secuencia
function puntuar_jugada(jugada, fila) {
    var completos = aciertos_completos(jugada, solucion);
    var parciales = aciertos_parciales(jugada, solucion) - completos;
    var pistas = $(fila).find('.pista');
    pistas.slice(0, completos).addClass('completo');
    pistas.slice(completos, completos + parciales).addClass('parcial');
    if (completos == solucion.length) {
        return true;
    } else {
        return false;
    }
}

// cambiar el color de una ficha gris
function colorear_ficha(ficha, color) {
    $(ficha).removeClass('gris').addClass(color);
}

// mostrar la secuencia solución
function mostrar_solucion() {
    var fichas_solucion = $('.solucion .ficha');
    fichas_solucion.each(function(index, elt) {
        colorear_ficha(elt, solucion[index]);
    });
}

// inicializar el juego
function iniciar_juego() {
    solucion = generar_secuencia(longitud);
    var fichas = $('.tablero .ficha');
    $.each(colores, function(index, color) {
        fichas.removeClass(color);
    });
    fichas.addClass('gris');
    var pistas = $('.tablero .pista').removeClass('completo').removeClass('parcial');
}

// código HTML de una ficha
function crear_ficha(color) {
    color = color || 'gris';
    return $('<div>').addClass('ficha').addClass(color);
}

// código HTML de resultados con pistas
function crear_resultados() {
    var result = $('<div>').addClass('resultados');
    for (var i = 0; i < longitud; i++) {
        $('<div>').addClass('pista').appendTo(result);
    }
    return result;
}

// crear el tablero
function crear_tablero() {
    // por las dudas, limpiar todo primero
    $('.barra-izq').empty();
    $('.jugadas').empty();
    $('.solucion').empty();
    // crear las fichas en la barra para jugar
    $.each(colores, function(index, color) {
        $('.barra-izq').append(crear_ficha(color));
    });
    var lista = $('<ul>').appendTo('.jugadas');
    for (var i = 0; i < intentos; i++) {
        var fila = $('<li>').appendTo(lista);
        for (var j = 0; j < longitud; j++) {
            fila.append(crear_ficha());
        }
        fila.append(crear_resultados());
    }
    for (var i = 0; i < longitud; i++) {
        $('.solucion').append(crear_ficha());
    }

    // conectar los handlers de evento a las fichas creadas
    $('.barra-izq .ficha').click(on_jugar_ficha);
    $('.jugadas .ficha').click(on_deshacer_jugada);
}

// handler de eventos para los clicks sobre las fichas de la barra izquierda
function on_jugar_ficha(evt) {
    var ficha = $(this);
    var clases = ficha.attr('class');
    var primer_ficha_gris = $('.jugadas .ficha.gris').first();
    var color = color_de_ficha(ficha);
    colorear_ficha(primer_ficha_gris, color);

    var fila = primer_ficha_gris.parent();
    var jugada = obtener_jugada(fila);
    if (jugada.length == solucion.length) {
        if (puntuar_jugada(jugada, fila)) {
            mostrar_solucion();
            alert('Adivinaste!');
            iniciar_juego();
        } else if ($('.jugadas .ficha.gris').length == 0) {
            // si no es posible seguir jugando (ie. no quedan fichas grises)
            // el jugador perdió
            mostrar_solucion();
            alert('Perdiste. Mejor suerte la próxima.');
            iniciar_juego();
        }
    }
}

// handler de eventos para las fichas de las jugadas, para posibilitar el deshacer
function on_deshacer_jugada(evt) {
    var ficha = $(this);
    if (ficha.hasClass('gris')) {
        // la ficha aún no fue jugada
        return;
    }
    if (!ficha.next().hasClass('ficha')) {
        // el siguiente elemento no es una ficha, por lo tanto
        // esta es la última ficha de una jugada y ya sabemos
        // el resultado
        // esto no puede deshacerse
        return;
    }
    if (ficha.next().hasClass('gris')) {
        // la siguiente ficha es gris, así que todavía no se jugó
        // por lo tanto, esta ficha es la última jugada
        ficha.removeClass(color_de_ficha(ficha)).addClass('gris');
    }
}

$(function() {
    console.log('DOM cargado!');
    crear_tablero();
    iniciar_juego();
});

