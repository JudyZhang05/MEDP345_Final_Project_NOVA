import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "../vendor_mods/three/examples/jsm/controls/OrbitControls.js";

let model; // we’ll store the loaded model here
let mixer; // animation storage

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls( camera, renderer.domElement );
camera.position.set(0, 0, 3)
controls.update()
controls.minPolarAngle = Math.PI/2;
controls.maxPolarAngle = Math.PI/2;
controls.minDistance = 2;
controls.maxDistance = 4;


// Ambient light (overall brightness)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Directional light (like the sun)
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7.5);
scene.add(dirLight);

// Point light (emits light in all directions, like a bulb)
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(0, 5, 5);
scene.add(pointLight);

// Load GLB model
const loader = new GLTFLoader();
loader.load(
  "../public/assets/moonlight_ash_tree.glb", // <-- 3d object file
  (gltf) => {
    model = gltf.scene;
    model.position.y = -1.2
    scene.add(model);

    mixer = new THREE.AnimationMixer(model)
    let action = mixer.clipAction(gltf.animations[0])
    action.play()
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.error("Error loading model:", error);
  }
);

const container = document.querySelector('canvas')
container.style.touchAction = "none"
container.style.cursor = "grab"

container.addEventListener("pointerup", () => {
  container.style.cursor = "grab";
}, {passive: false})
container.addEventListener("pointerdown", () => {
  container.style.cursor = "grabbing";
}, {passive: false})


// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (model) {
        model.rotation.y += 0.001; // rotate around Y axis
    }

    controls.update()
    renderer.render(scene, camera);
    mixer.update(0.02)
}
animate();
