import * as THREE from 'three'
import Stats from 'three/addons/libs/stats.module.js'
import { GroundedSkybox, OrbitControls } from 'three/examples/jsm/Addons.js'
import { RoomEnvironment } from 'three/examples/jsm/Addons.js'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import { RGBELoader } from 'three/examples/jsm/Addons.js'
import GUI from 'lil-gui'

const container = document.getElementById( 'container' )

const gui = new GUI()

const stats = new Stats()
stats.showPanel(0)
container.appendChild( stats.dom )

const renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true })
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 4.5
gui.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping
})
gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.01)
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
// scene.fog = new THREE.Fog(0xa0a0a0, 10, 50)

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
    
    const box = new THREE.Box3()
    box.setFromObject( model )
    const size = box.getSize( new THREE.Vector3() )
    console.trace(size)
    
    model.position.set( 0, 0, 0 );
    model.scale.set( 1, 1, 1 );
    scene.add( model );
    console.log(dumpObject(model).join('\n'));
}, undefined, function ( error ) {
    console.error( error );    
});

// const cubeTextureLoader = new THREE.CubeTextureLoader()
// const envMap = cubeTextureLoader.load([
//     '/static/environmentMaps/2/px.png',
//     '/static/environmentMaps/2/nx.png',
//     '/static/environmentMaps/2/py.png',
//     '/static/environmentMaps/2/ny.png',
//     '/static/environmentMaps/2/pz.png',
//     '/static/environmentMaps/2/nz.png'
// ])

// scene.environment = envMap
// scene.background = envMap

const rgbeLoader = new RGBELoader()
rgbeLoader.load('static/environmentMaps/2/2k.hdr', (environmentMap) => {
    environmentMap.mapping = THREE.EquirectangularReflectionMapping
    scene.environment = environmentMap

    const skybox = new GroundedSkybox(environmentMap, 5, 70)
    skybox.position.y = 5
    scene.add(skybox)
})

const sizes = {
    width: 800,
    height: 600
}
const aspectRatio = sizes.width / sizes.height

let frustumSize = { value: 3 }

const perspCamera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 )
const orthoCamera = new THREE.OrthographicCamera( frustumSize.value * aspectRatio / - 2, frustumSize.value * aspectRatio / 2, frustumSize.value / 2, frustumSize.value / - 2, 0.001, 1000 );
let camera = perspCamera

gui.add({ camera: 'perspective' }, 'camera', ['perspective', 'orthographic'] ).onChange(function(value) {
    if (value === 'orthographic') {
        camera = orthoCamera
    }
    else camera = perspCamera
    controls.object = camera
    controls.update()
})

gui.add(frustumSize, 'value').min(1).max(100).step(1)

if (camera === orthoCamera) {
    camera.position.set( - 1, 1, 1 );
    gui.add( camera, 'zoom', 1, 10 ).step( 0.01 )
}
else camera.position.set( 3, 3, 0 )

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