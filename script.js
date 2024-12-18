import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const clock = new THREE.Clock();
const container = document.getElementById( 'container' );

const stats = new Stats();
container.appendChild( stats.dom );

const renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true });
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
container.appendChild( renderer.domElement );

const pmrremGenerator = new THREE.PMREMGenerator( renderer );

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xbfe3dd );
scene.environment = pmrremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture;

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
camera.position.set( 5, 2, 8 );

const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set( 0, 0.5, 0 );
controls.update();
controls.enablePan = true;
controls.enableDamping = true;

const loader = new GLTFLoader();
loader.load( 'assets/herman_miller_eames_lounge_chair/scene.gltf', function ( gltf ) {
    
    const model = gltf.scene;
    model.position.set( 1, 1, 0 );
    model.scale.set( 1, 1, 1 );
    scene.add( model );
    renderer.setAnimationLoop( animate );

}, undefined, function ( error ) {
    
    console.error( error );

} );

window.onresize = function() {
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {
    
    const delta = clock.getDelta();
    controls.update( delta );
    stats.update();
    renderer.render( scene, camera );

}