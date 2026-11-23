//CODIGO RELACIONADO AL MAPA

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js'; /*pa meter el fondo*/ 

// creamos  zona donde estara el mapa
const mapa = document.getElementById('mapa3d');

// mensaje de prueba
console.log("jalando chido");




// escena
const escena = new THREE.Scene();

// posicion de la camara
const camara = new THREE.PerspectiveCamera(
    60,
    mapa.clientWidth / mapa.clientHeight,
    0.1, 1000
);
camara.position.set(0, 100, 200);




// renderizador
const renderizador = new THREE.WebGLRenderer({
    antialias: true
});
renderizador.setSize(
    mapa.clientWidth,
    mapa.clientHeight
);
mapa.appendChild(renderizador.domElement);



//controles del mapa
const controles = new OrbitControls(camara, renderizador.domElement);
controles.enableDamping = true;

// limites de Zoom
controles.minDistance = 50;  
controles.maxDistance = 230; 

// limites de rotacion vertical
controles.minPolarAngle = 0.1;               
controles.maxPolarAngle = Math.PI / 2 - 0.05; 

// limite perimetral del mapa
const limite = 150; 

controles.addEventListener('change', () => {
    //cada que se mueva la camara, establecer limite de movimiento 
    controles.target.x = THREE.MathUtils.clamp(controles.target.x, -limite, limite);
    controles.target.y = THREE.MathUtils.clamp(controles.target.y, 0, 0);
    controles.target.z = THREE.MathUtils.clamp(controles.target.z, -limite, limite);
});




 
//fondito
const fondito = new THREE.PMREMGenerator(renderizador);
fondito.compileEquirectangularShader();
 
new EXRLoader().load(
    'assets/hdri/citrus_orchard_road_puresky_2k.exr', 
    (hdri) => {
        hdri.mapping = THREE.EquirectangularReflectionMapping;
        const envMap = fondito.fromEquirectangular(hdri).texture;
        escena.background = envMap;   // fondo
        escena.environment = envMap;  // para que refleje
        escena.environmentIntensity = 0.7; // intensidad de la luz ambiental
 
        hdri.dispose();
        fondito.dispose();
    }
);




// cargar modelo 3D
let modeloCargado = null;
let grupoEdificios = null;

const cargarmapa = new GLTFLoader();
cargarmapa.load(
    'assets/modelos/CU.glb',
    (modelo) => {
        escena.add(modelo.scene);
        modeloCargado = modelo.scene;
        grupoEdificios = modeloCargado.getObjectByName('maposm_buildings');
    },
);




/*detectar click*/
const puntero = new THREE.Raycaster(); 
const coordenada = new THREE.Vector2();
 
//quita el numero del final
function nombreBase(nombre) {
    return nombre.replace(/_\d+$/, '');
}
 
//edificios que debera detectar
const edificios = [
    'Edificio_A',
    'Edificio_B',
    'Edificio_C',
    'Edificio_D1',
    'Edificio_D2',
    'Edificio_D3',
    'Edificio_D4',
    'Nucleo',
    'Gimanasio_multifincional_UACJ_CU002', // edificio e
];
 
//identifica donde realizamos click
renderizador.domElement.addEventListener('click', (evento) => {
    const posicionCanvas = renderizador.domElement.getBoundingClientRect(); 
 
    coordenada.x = ((evento.clientX - posicionCanvas.left) / posicionCanvas.width) * 2 - 1;  
    coordenada.y = -((evento.clientY - posicionCanvas.top) / posicionCanvas.height) * 2 + 1;  
 
    puntero.setFromCamera(coordenada, camara);
    
    if (!grupoEdificios) return;
 
    const intersecciones = puntero.intersectObjects(grupoEdificios.children, true);
    if (intersecciones.length === 0) {
        marcador.visible = false; 
        menuNiveles.classList.add('oculto'); 
        return;
    }
 
    const primer = intersecciones[0].object;
    const base = nombreBase(primer.name);
    
    if (!edificios.includes(base)) {
        marcador.visible = false;
        menuNiveles.classList.add('oculto');
        return;
    }

    console.log("Clic en:", base);

 //identificamos dimensiones
    const cajaEdificio = new THREE.Box3().setFromObject(primer);
    const centro = new THREE.Vector3();
    cajaEdificio.getCenter(centro); //se obtienen coordenadas centrales
    
    const techo = cajaEdificio.max.y; // obtenemos el punto mas alto del edificio

    //posicionamos
    marcador.position.x = centro.x;
    // lo subimos para darle le efecto 
    marcador.position.y = techo + 10; 
    marcador.position.z = centro.z;

    //lo hacemos visible
    marcador.visible = true;

    //guardamos de manera invisible el edificio que seleccionamos
    menuNiveles.dataset.edificio = base;

    //mostrar botones
    menuNiveles.classList.remove('oculto');
});





//cargamos el marcador (identificador)
const cargar_textura = new THREE.TextureLoader();
const textura = cargar_textura.load('assets/iconos/marcador.png'); 

const material = new THREE.SpriteMaterial({ 
    map: textura, //visualiza el marcador
    depthTest: false // pa que se vea detras de objetos
});

const marcador = new THREE.Sprite(material);
// tamaño del marcador
marcador.scale.set(15, 15, 1); 
marcador.visible = false; // se oculta al inicio

escena.add(marcador);




//botones planos y visor
const btnLobby = document.getElementById('lobby');
const btnPrimerNivel = document.getElementById('primer_nivel');
const btnSegundoNivel = document.getElementById('segundo_nivel');
const menuNiveles = document.getElementById('menu-niveles');

const visorPlanos = document.getElementById('visor-planos');
const contenedorSvg = document.getElementById('contenedor-svg');
const btnCerrarPlano = document.getElementById('btn-cerrar-plano');
let instanciaPanzoom = null; 




// funcion para cargar los planos SVG
function cargarPlano(rutaSVG) {
    fetch(rutaSVG)
        .then(respuesta => respuesta.text())
        .then(svgData => {
            contenedorSvg.innerHTML = svgData;
            visorPlanos.classList.remove('oculto');

            if (instanciaPanzoom) instanciaPanzoom.destroy(); 
            instanciaPanzoom = Panzoom(contenedorSvg, {
                maxScale: 5, 
                minScale: 0.5,
                canvas: true
            });
            
            contenedorSvg.parentElement.addEventListener('wheel', instanciaPanzoom.zoomWithWheel);
            activarIconosInteractivos();
        })
        .catch(error => console.error("Error cargando el plano:", error));
}



// traductor de nombres de edificios a prefijos de archivos SVG
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

// cerramos el visor de planos
btnCerrarPlano.addEventListener('click', () => {
    visorPlanos.classList.add('oculto');
    setTimeout(() => { contenedorSvg.innerHTML = ''; }, 300); 
});


//base datos temporal para prueba
const baseDatosLugares = {
    "Cafeteria_A": {
        titulo: "Salón A114",
        descripcion: "Espacio de prueba seleccionado en el Edificio A.",
        imagen: "assets/iconos/marcador.png" 
    }
};

function activarIconosInteractivos() {
    contenedorSvg.addEventListener('click', (evento) => {
        const elementoConId = evento.target.closest('[id]');
        
        if (!elementoConId) return;

        const idIcono = elementoConId.id;
        const infoLugar = baseDatosLugares[idIcono];

        if (!infoLugar) return;

        evento.stopPropagation(); 
        console.log("¡Clic detectado con éxito en el espacio:", idIcono, "!");

        // cargamos la información en la ventana flotante
        document.getElementById('ventana-titulo').textContent = infoLugar.titulo;
        document.getElementById('ventana-descripcion').textContent = infoLugar.descripcion;
        document.getElementById('ventana-imagen').src = infoLugar.imagen;

        // mostramos la ventana
        document.getElementById('ventana-info').style.display = 'flex';
    });
}



// logica para cerrar la ventana info icono
const ventanaInfo = document.getElementById('ventana-info');
const btnCerrarVentana = document.getElementById('btn-cerrar-ventana');

btnCerrarVentana.addEventListener('click', () => {
    ventanaInfo.style.display = 'none';
});

ventanaInfo.addEventListener('click', (e) => {
    if (e.target === ventanaInfo) {
        ventanaInfo.style.display = 'none';
    }
});

// animacion 3D
function animar() {
    requestAnimationFrame(animar);
    controles.update();
    renderizador.render(
        escena,
        camara
    );
}
animar();