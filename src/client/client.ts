import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'
const container = document.getElementById( 'container' ) as HTMLElement

const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(5))

// const light = new THREE.PointLight()
// light.position.set(2.5, 7.5, 15)
// scene.add(light)

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.set(0, 0, 5.0)

const renderer = new THREE.WebGLRenderer()
renderer.physicallyCorrectLights = true
renderer.shadowMap.enabled = true
renderer.setSize(window.innerWidth*0.8, window.innerHeight*0.8)
container.appendChild( renderer.domElement );
// document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 1, 0)

const material = new THREE.MeshPhysicalMaterial({})

const pmremGenerator = new THREE.PMREMGenerator(renderer)
const envTexture = new THREE.CubeTextureLoader().load(
    [
        'img/px_50.png',
        'img/nx_50.png',
        'img/py_50.png',
        'img/ny_50.png',
        'img/pz_50.png',
        'img/nz_50.png',
    ],
    () => {
        material.envMap = pmremGenerator.fromCubemap(envTexture).texture
        pmremGenerator.dispose()
        scene.background = material.envMap
    }
)

const loader = new GLTFLoader()
loader.load(
    'models/text_pingpong.glb',
    function (gltf) {
        gltf.scene.traverse(function (child) {
            if ((child as THREE.Mesh).isMesh) {
                const m = child as THREE.Mesh
                m.receiveShadow = true
                m.castShadow = true
            }
            if ((child as THREE.Light).isLight) {
                const l = child as THREE.Light
                l.castShadow = true
                l.shadow.bias = -0.003
                l.shadow.mapSize.width = 2048
                l.shadow.mapSize.height = 2048
            }
        })
        scene.add(gltf.scene)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth*0.8, window.innerHeight*0.8)
    render()
}

const stats = Stats()
// document.body.appendChild(stats.dom)
container.appendChild( stats.domElement );

const gui = new GUI({autoPlace: false})
container.appendChild( gui.domElement );

const animationsFolder = gui.addFolder('Animations')
animationsFolder.open()

const clock = new THREE.Clock()

function animate() {
    requestAnimationFrame(animate)

    controls.update()

    render()

    stats.update()
}

function render() {
    renderer.render(scene, camera)
}

animate()