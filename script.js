// CODIGO RELACIONADO A LA NAVBAR
/*barra de navegacion*/  
/*aignamos variables*/ 
const menuBtn = document.querySelector('.menu-btn');
const navlinks = document.querySelector('.nav-links');
const links = navlinks.querySelectorAll('a');

/*cada que el usuario clickee el menu se activa el boton*/
menuBtn.addEventListener('click', () => {
    navlinks.classList.toggle('active');
    
    /*si la barra esta activa, el icono cambiara y se expandera la lista con los enlaces*/
    if (navlinks.classList.contains('active')) {
        menuBtn.innerHTML = "✕";
        menuBtn.setAttribute("aria-expanded", "true");
    } else {
        /*si no simplemente mantendra el icono original*/ 
        menuBtn.innerHTML = "☰";
        menuBtn.setAttribute("aria-expanded", "false");
    }
});

/*cada que se clickee un enlace, se removera el menu y regresara a tu estado original*/
links.forEach(link => {
    link.addEventListener('click', () => {
        navlinks.classList.remove('active');
        menuBtn.innerHTML = "☰";
        menuBtn.setAttribute("aria-expanded", "false");
    })
});

/*imodo oscuro*/
const botonluna = document.getElementById('botonluna');
botonluna.addEventListener('click', () => {
    document.body.classList.toggle('modo-oscuro');
    if (document.body.classList.contains('modo-oscuro')) {
    }
});

//botones planos
const btnLobby = document.getElementById('lobby');
const btnPrimerNivel = document.getElementById('primer_nivel');
const btnSegundoNivel = document.getElementById('segundo_nivel');
const menuNiveles = document.getElementById('menu-niveles');

// planos visualizacion 
const visorPlanos = document.getElementById('visor-planos');
const contenedorSvg = document.getElementById('contenedor-svg');
const btnCerrarPlano = document.getElementById('btn-cerrar-plano');
let instanciaPanzoom = null; 

// funcion para cargar los planos SVG
function cargarPlano(rutaSVG) {
    fetch(rutaSVG)
        .then(respuesta => respuesta.text())
        .then(svgData => {
            //lo introducimos en el html
            contenedorSvg.innerHTML = svgData;
            
            //mostramos en pantalla
            visorPlanos.classList.remove('oculto');

            // se activian funcionalidades de desplazamiento y zoom
            if (instanciaPanzoom) instanciaPanzoom.destroy(); 
            instanciaPanzoom = Panzoom(contenedorSvg, {
                maxScale: 5, 
                minScale: 0.5,
                canvas: true
            });
            
            // permitimos el zoom con la rueda del mouse/arrastre con el dedo
            contenedorSvg.parentElement.addEventListener('wheel', instanciaPanzoom.zoomWithWheel);

            // activamos la deteccion de clicks en los iconos del plano
            activarIconosInteractivos();
        })
        .catch(error => console.error("Error cargando el plano:", error));
}

// funcion para detectar click en los planos y mostrar informacion
function activarIconosInteractivos() {
    const iconos = contenedorSvg.querySelectorAll('[id^="icono"]'); 

    iconos.forEach(icono => {
        icono.style.cursor = 'pointer'; 

        icono.addEventListener('click', (evento) => {
            evento.stopPropagation(); 
            
            console.log("Hiciste clic en el elemento con ID:", icono.id);
            alert("Aquí abriremos la foto o información para: " + icono.id);
        });
    });
}

// funcion para traducir nombres de edificios a como estan descritos en  los planos
const traductorNombres = {
    'Edificio_A': 'A',
    'Edificio_B': 'B',
    'Edificio_C': 'C',
    'Edificio_D1': 'D1',
    'Edificio_D2': 'D2',
    'Edificio_D3': 'D3',
    'Edificio_D4': 'D4',
    'Nucleo': 'NUCLEO',
    'Gimanasio_multifincional_UACJ_CU002': 'E' 
};

btnLobby.addEventListener('click', () => {
    const edificioActual = menuNiveles.dataset.edificio; 
    const prefijo = traductorNombres[edificioActual];
    cargarPlano(`assets/planos/${prefijo}_LOBBY.svg`); 
});

btnPrimerNivel.addEventListener('click', () => {
    const edificioActual = menuNiveles.dataset.edificio;
    const prefijo = traductorNombres[edificioActual];
    cargarPlano(`assets/planos/${prefijo}_PRIMER_NIVEL.svg`);
});

btnSegundoNivel.addEventListener('click', () => {
    const edificioActual = menuNiveles.dataset.edificio;
    const prefijo = traductorNombres[edificioActual];
    cargarPlano(`assets/planos/${prefijo}_SEGUNDO_NIVEL.svg`);
});

// cerramos el visor
btnCerrarPlano.addEventListener('click', () => {
    visorPlanos.classList.add('oculto');
    // limpiamos el contenido del contenedor svg
    setTimeout(() => { contenedorSvg.innerHTML = ''; }, 300); 
});