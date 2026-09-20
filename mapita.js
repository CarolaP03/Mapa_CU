import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


// creamos  zona donde estara el mapa
const mapa = document.getElementById('mapa3d');

// mensaje de prueba
console.log("jalando chido");


// fondo
const escena = new THREE.Scene();
escena.background = new THREE.Color(0xFFFFFF);


// posicion de la camara
const camara = new THREE.PerspectiveCamera(
60,
    mapa.clientWidth / mapa.clientHeight,
    0.1,1000
);
camara.position.set(0, 100, 200);


// Renderizador
const renderizador = new THREE.WebGLRenderer({
    antialias: true
});
renderizador.setSize(
    mapa.clientWidth,
    mapa.clientHeight
);
mapa.appendChild(renderizador.domElement);


// Controles del mapa
const controles = new OrbitControls(
    camara,
    renderizador.domElement
);
controles.enableDamping = true;


// luz
const luz = new THREE.HemisphereLight(
    0xffffff,
    0x444444,
    2
);
escena.add(luz);


// Cargar modelo 3D
const cargarmapa = new GLTFLoader();
cargarmapa.load(
    'assets/modelos/CU.glb',
    (modelo) => {
        escena.add(modelo.scene);
    },
);

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