import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let model; // we’ll store the loaded model here
let mixer; // animation storage
let model2
// let mixer2
let model3
let model4
let mixer4

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
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls( camera, renderer.domElement );
camera.position.set(0,0,3)
controls.update()

// controls
const setControlLimits = () => {
  // Y Axis
  controls.minPolarAngle = Math.PI/2.4;
  controls.maxPolarAngle = Math.PI/1.5;
  // Scroll 
  controls.minDistance = 1;
  controls.maxDistance = 4;
  // Drag
  controls.enablePan = false;
  // X Axis
  const degToRad = Math.PI / 180;
  controls.minAzimuthAngle = -95 * degToRad;
  controls.maxAzimuthAngle = 95 * degToRad;
}
// setControlLimits()

// reset controls
const resetControls = () => {
  controls.minPolarAngle = 0
  controls.maxPolarAngle = Infinity
  controls.minDistance = 0
  controls.maxDistance = Infinity
  controls.minAzimuthAngle = 0
  controls.maxAzimuthAngle = Infinity
  controls.enablePan = true
  controls.update()
}

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
  "/assets/statue_tree.glb", // 3D object file
  (gltf) => {
    model = gltf.scene;
    model.position.y = -4
    model.scale.x = .02
    model.scale.y = .02
    model.scale.z = .02
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
loader.load(
  "/assets/duck.glb", // <-- 3D Object
  (gltf) => {
    model2 = gltf.scene;
    model2.position.x = .2
    model2.position.y = -.69
    model2.scale.x = .2
    model2.scale.y = .2
    model2.scale.z = .2
    model2.rotation.y = 2
    scene.add(model2);

  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.error("Error loading model:", error);
  }
)
loader.load(
  "/assets/angel_statue.glb", // <-- 3D Object
  (gltf) => {
    model3 = gltf.scene;
    model3.position.x = -.2
    model3.position.z = -2.2
    model3.position.y = -5
    model3.scale.x = .5
    model3.scale.y = .5
    model3.scale.z = .5
    scene.add(model3);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.error("Error loading model:", error);
  }
)
loader.load(
  "/assets/an_animated_cat.glb", // 3D object file
  (gltf) => {
    model4 = gltf.scene;
    model4.position.x = 4
    model4.position.y = 7.2
    model4.position.z = -7
    model4.scale.x = .05
    model4.scale.y = .05
    model4.scale.z = .05
    model4.rotation.y = -2.5
    scene.add(model4);

    mixer4 = new THREE.AnimationMixer(model4)
    let action2 = mixer4.clipAction(gltf.animations[0])
    action2.play()
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.error("Error loading model:", error);
  }
)

// loader.load(
//   "/assets/simple_moon_jellyfish_baked_animation.glb", // 3D object file
//   (gltf) => {
//     model3 = gltf.scene;
//     model3.position.x = .9
//     model3.position.y = -.1
//     model3.scale.x = .2
//     model3.scale.y = .2
//     model3.scale.z = .2
//     scene.add(model3);

//     mixer3 = new THREE.AnimationMixer(model3)
//     let action3 = mixer3.clipAction(gltf.animations[0])
//     action3.play()
//   },
//   (xhr) => {
//     console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
//   },
//   (error) => {
//     console.error("Error loading model:", error);
//   }
// )

const container = document.querySelector('canvas')
container.style.touchAction = "none"
container.style.cursor = "grab"

container.addEventListener("pointerup", () => {
  container.style.cursor = "grab";
}, {passive: false})
container.addEventListener("pointerdown", () => {
  container.style.cursor = "grabbing";
}, {passive: false})


// to see where camera position is
const zoom = document.querySelector('.objectZoom')
const convo = document.querySelector('.conversation')
zoom.addEventListener("click", () => {
  resetControls()

  gsap.to(controls.target, {
      x: 3,
      y: 7,
      z: 0,
      duration: 2,
    }
  )
  gsap.to(camera.position, {
      x: 3,
      y: 7,
      z: 0.01,
      duration: 2,
    }
  )

  convo.style.display = "flex"
  gsap.fromTo(convo, { opacity: 0 }, { opacity: 1, duration: 1, delay: 2 })

  controls.minPolarAngle = 0
  controls.maxPolarAngle = 0
  controls.minDistance = 0
  controls.maxDistance = 0
  controls.minAzimuthAngle = 0
  controls.maxAzimuthAngle = 0
})

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    controls.update()
    renderer.render(scene, camera);
    mixer.update(0.02)
    mixer4.update(0.02)
}
animate();
