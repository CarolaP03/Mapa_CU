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
//escena.background = new THREE.Color(0xFFFFFF);


// posicion de la camara
const camara = new THREE.PerspectiveCamera(
60,
mapa.clientWidth / mapa.clientHeight,
    0.1,1000
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
        escena.environment = envMap;  //  para que  refleje
        escena.environmentIntensity = 0.7; // intensidad de la luz ambiental
 
         hdri.dispose();
        fondito.dispose();
    }
);

// cargar modelo 3D
// guardamos el modelo cargado y el grupo de edificios para poder detectar clicks
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
const puntero = new THREE.Raycaster(); //identificar hacia donde apuntamos
const coordenada = new THREE.Vector2();
 
//quita el numemro del final
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
    'Gimanasio_multifincional_UACJ_CU002', // edifico e
];
 
//identifica donde realizamos click
renderizador.domElement.addEventListener('click', (evento) => {
 
    const posicionCanvas =  renderizador.domElement.getBoundingClientRect(); //funcion del navegador, identifica donde empieza 
 
    coordenada.x = ((evento.clientX - posicionCanvas.left) / posicionCanvas.width) * 2 - 1;  //coordenada horizontal con formula
    coordenada.y = -((evSento.clientY - posicionCanvas.top) / posicionCanvas.height) * 2 + 1;  //coordenada vertical  con formula
 
    //identifica a quien le dimos click y desde donde 
    puntero.setFromCamera(coordenada,camara);
 
    //revisa si apunta a uno de los edifcios
    const intersecciones = puntero.intersectObjects(grupoEdificios.children, true);
    if (intersecciones.length === 0) return;
 
    //en caso de que si, solo dame el primer objeto que detectaste
    const primer = intersecciones[0].object;


    const base = nombreBase(primer.name);
    // solo reaccionamos si el nombre base esta en nuestra lista permitida
    if (!edificios.includes(base)) return;
    console.log("Clic en:", base);
});


/*ajustar tamaño y que no se corte*/
window.addEventListener('resize', () => {
    camara.aspect = mapa.clientWidth / mapa.clientHeight;
    camara.updateProjectionMatrix();
    renderizador.setSize(mapa.clientWidth, mapa.clientHeight);
});

// animacion
function animar() {
    requestAnimationFrame(animar);
    controles.update();
    renderizador.render(
        escena,
        camara
    );
}
animar();