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
camera.position.set( 3, 3, 0 );

const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set( 0, 0.5, 0 );
controls.update();
controls.enablePan = true;
controls.enableDamping = true;

const loader = new GLTFLoader();
loader.load( 'assets/herman_miller_eames_lounge_chair/scene.gltf', function ( gltf ) {
    
    const model = gltf.scene;
    model.position.set( 0, 0, 0 );
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

const gui = new GUI();

const myObject = {
	myBoolean: true,
	myFunction: function() { console.log( 'Button Clicked!' ); },
	myString: 'lil-gui',
	myNumber: 1
};

gui.add( myObject, 'myBoolean' );  // Checkbox
gui.add( myObject, 'myFunction' ); // Button
gui.add( myObject, 'myString' );   // Text Field
gui.add( myObject, 'myNumber' );   // Number Field

// Add sliders to number fields by passing min and max
gui.add( myObject, 'myNumber', 0, 1 );
gui.add( myObject, 'myNumber', 0, 100, 2 ); // snap to even numbers

// Create dropdowns by passing an array or object of named values
gui.add( myObject, 'myNumber', [ 0, 1, 2 ] );
gui.add( myObject, 'myNumber', { Label1: 0, Label2: 1, Label3: 2 } );

// Chainable methods
gui.add( myObject, 'myProperty' )
	.name( 'Custom Name' )
	.onChange( value => {
		console.log( value );
	} );

// Create color pickers for multiple color formats
const colorFormats = {
	string: '#ffffff',
	int: 0xffffff,
	object: { r: 1, g: 1, b: 1 },
	array: [ 1, 1, 1 ]
};

gui.addColor( colorFormats, 'string' );