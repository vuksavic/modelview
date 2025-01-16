import * as THREE from 'three'
import Stats from 'three/addons/libs/stats.module.js'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import { RoomEnvironment } from 'three/examples/jsm/Addons.js'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import GUI from 'lil-gui'

const container = document.getElementById( 'container' )

const gui = new GUI()

const stats = new Stats()
stats.showPanel(0)
container.appendChild( stats.dom )

const renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true })
renderer.setPixelRatio( window.devicePixelRatio )
renderer.setSize( window.innerWidth, window.innerHeight )
container.appendChild( renderer.domElement )

const pmremGenerator = new THREE.PMREMGenerator( renderer )

function dumpObject(obj, lines = [], isLast = true, prefix = '') {
    const localPrefix = isLast ? '└─' : '├─'
    lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`)
    const newPrefix = prefix + (isLast ? '  ' : '│ ')
    const lastNdx = obj.children.length - 1
    obj.children.forEach((child, ndx) => {
        const isLast = ndx === lastNdx
        dumpObject(child, lines, isLast, newPrefix)
    })
    return lines
}

const scene = new THREE.Scene()
scene.background = new THREE.Color( 0xbfe3dd )
scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture
scene.fog = new THREE.Fog(0xa0a0a0, 10, 50)

const loader = new GLTFLoader();
loader.load( 'assets/herman_miller_eames_lounge_chair/scene.gltf', function ( gltf ) {
    const model = gltf.scene;
    const wireframeController = gui.add({ wireframe: false }, 'wireframe').name('Wireframe');

    wireframeController.onChange(function(wireframe) {
        model.traverse(function(object) {
            if (object.isMesh) object.material.wireframe = wireframe;
        });
    });

    model.traverse(function (object) {
        if (object.isMesh) object.castShadow = true
    })
    
    model.position.set( 0, 0, 0 );
    model.scale.set( 1, 1, 1 );
    scene.add( model );
    console.log(dumpObject(model).join('\n'));
}, undefined, function ( error ) {
    console.error( error );    
});

const sizes = {
    width: 800,
    height: 600
}
const aspectRatio = sizes.width / sizes.height

const perspCamera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.001, 1000 )
const orthoCamera = new THREE.OrthographicCamera(-1 * aspectRatio, 1 * aspectRatio, 1, -1, 0.01, 100000)
let camera = perspCamera

gui.add({ camera: 'perspective' }, 'camera', ['perspective', 'orthographic'] ).onChange(function(value) {
    if (value === 'orthographic')
        camera = orthoCamera
    else camera = perspCamera
    controls.object = camera
    controls.update()
})

camera.position.set( 3, 3, 0 )

scene.add( camera )
const controls = new OrbitControls( camera, renderer.domElement )
controls.target.set( 0, 0.5, 0 )
controls.update()
controls.enablePan = true
controls.enableDamping = true

window.onresize = function() {
    
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    
    renderer.setSize( window.innerWidth, window.innerHeight )
}

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const clock = new THREE.Clock()

const tick = () => {
    stats.update()
    renderer.render( scene, camera )
    window.requestAnimationFrame(tick)
}

tick()