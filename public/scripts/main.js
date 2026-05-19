import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

window.onload = () => {
  //adding socket into client
  const socket = io();

  // ADDED DUCK ELEMENT:
  // listens for the active duck list from server.js
  // every connected user gets represented as a duck
  socket.on("active ducks", (ducks) => {
    // remove old ducks before adding updated duck list
    for (let id in activeDuckModels) {
      scene.remove(activeDuckModels[id]);
      delete activeDuckModels[id];
    }

    // ADDED DUCK ELEMENT:
    // add one duck for every active user
    for (let id in ducks) {
      addDuck(id, ducks[id].x, ducks[id].y, ducks[id].z, ducks[id].rotation);
    }
  });

  console.log("file has loaded");

  socket.emit("chat message", "hello it's me");

  const form = document.getElementById("userSpeechForm");
  const messages = document.getElementById("allMessages");
  const username = document.getElementById("username");
  const wish = document.getElementById("userWish");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    socket.emit("user wish", `<b>${username.value} Duck:<b> ${wish.value}`);
    wish.value = "";
  });

  socket.on("server sent data", (dataFromServer) => {
    // adds conversation functions
    const item = document.createElement("p");
    item.innerHTML = dataFromServer;
    messages.appendChild(item);
  });

  socket.on("total clients", (dataFromServer) => {
    // updates active user count
    console.log(dataFromServer);
    const updateUsers = document.createElement("p");
    updateUsers.innerHTML = `&#x1F7E2 ${dataFromServer} Online`;
    messages.appendChild(updateUsers);
  });
};

function startExperience() {
  const loadingScreen = document.querySelector(".loading");
  gsap.fromTo(
    loadingScreen,
    { opacity: 1 },
    { opacity: 0, duration: 1, delay: 2 },
  );
  setTimeout(() => {
    // for insurance wait for 2 secs
    loadingScreen.style.display = "none";
  }, 3500);
}

let model; // we’ll store the loaded model here
let mixer; // animation storage
let model3;
let model4;
let mixer4;

// ADDED DUCK ELEMENT:
// stores all active duck models by socket/user id
let activeDuckModels = {};

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

// Audio Listener
const listener = new THREE.AudioListener();
camera.add(listener);

// Renderer
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// BACKGROUND MUSIC
const bgMusic = new THREE.Audio(listener);
// Load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load('/assets/audio/Leaf.mp3', (buffer) => {
  bgMusic.setBuffer(buffer);
  bgMusic.setLoop(true);
  bgMusic.setVolume(0.4);

});

let duckSoundBuffer = null;
const duckAudioLoader = new THREE.AudioLoader();

duckAudioLoader.load('/assets/audio/Duck.mp3', (buffer) => {
  duckSoundBuffer = buffer;
});

// Start music after first interaction
window.addEventListener(
  "click",
  async () => {
    const context = listener.context;

    if (context.state === "suspended") {
      await context.resume();
    }

    if (!bgMusic.isPlaying) {
      bgMusic.play();
      console.log("Music started");
    }
  },
  { once: true }
);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 0, 3);
controls.update();

// controls
const setControlLimits = () => {
  // Y Axis
  controls.minPolarAngle = Math.PI / 2.4;
  controls.maxPolarAngle = Math.PI / 1.5;
  // Scroll
  controls.minDistance = 1;
  controls.maxDistance = 4;
  // Drag
  controls.enablePan = false;
  // X Axis
  const degToRad = Math.PI / 180;
  controls.minAzimuthAngle = -95 * degToRad;
  controls.maxAzimuthAngle = 95 * degToRad;
};
setControlLimits();

// reset controls
const resetControls = () => {
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Infinity;
  controls.minDistance = 0;
  controls.maxDistance = Infinity;
  controls.minAzimuthAngle = 0;
  controls.maxAzimuthAngle = Infinity;
  controls.enablePan = true;
  controls.update();
};

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

// ADDED DUCK ELEMENT:
// reusable function that loads one duck for one active user
// each duck gets x, y, z, and rotation from server.js
function addDuck(id, x, y, z, ducksRotation) {
  loader.load(
    "/assets/duck.glb",

    (gltf) => {
      let duck = gltf.scene;

      // ADDED DUCK ELEMENT:
      // places ducks onto different stair levels
      duck.position.x = x;
      duck.position.y = y;
      duck.position.z = z;

      duck.scale.x = 0.2;
      duck.scale.y = 0.2;
      duck.scale.z = 0.2;

      // ADDED DUCK ELEMENT:
      // ducks face different directions
      duck.rotation.y = ducksRotation;

      scene.add(duck);

      // saves this duck so we can remove/update it later
      activeDuckModels[id] = duck;

      // Postional Audio
      if(duckSoundBuffer) {
        const duckSound = new THREE.PositionalAudio(listener);
      
        duckSound.setBuffer(duckSoundBuffer);

        // Core Spatial Settings
        duckSound.setRefDistance(1); // Closer = Louder
        duckSound.setRolloffFactor(2); //Stronger Distance Fade
        duckSound.setMaxDistance(12);

        duckSound.setLoop(true);
        duckSound.setVolume(0.4);

        duckSound.setDirectionalCone(120, 180, 0.3);

        duck.add(duckSound);

        // Basically autoplay
        const tryPlay = () => {
          if(!duckSound.isPlaying) duckSound.play();
        };
         
        window.addEventListener("click", tryPlay, { once: true });
      }
    },

    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% duck loaded");
    },

    (error) => {
      console.error("Error loading duck:", error);
    },
  );
}

loader.load(
  "/assets/statue_tree.glb", // Main tree and land model
  (gltf) => {
    model = gltf.scene;
    model.position.y = -4;
    model.scale.x = 0.02;
    model.scale.y = 0.02;
    model.scale.z = 0.02;
    scene.add(model);

    mixer = new THREE.AnimationMixer(model);
    let action = mixer.clipAction(gltf.animations[0]);
    action.play();
  },
  (xhr) => {
    if ((xhr.loaded / xhr.total) * 100 == 100) {
      // when this 3D object finishes loading starts the experience
      startExperience();
    }
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.error("Error loading model:", error);
  },
);
loader.load(
  "/assets/angel_statue.glb", // <-- Glorified middle statue
  (gltf) => {
    model3 = gltf.scene;
    model3.position.x = -0.2;
    model3.position.z = -2.2;
    model3.position.y = -5;
    model3.scale.x = 0.5;
    model3.scale.y = 0.5;
    model3.scale.z = 0.5;
    scene.add(model3);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.error("Error loading model:", error);
  },
);

loader.load(
  "/assets/an_animated_cat.glb", // Animated Cat model
  (gltf) => {
    model4 = gltf.scene;
    model4.position.x = 4;
    model4.position.y = 7.2;
    model4.position.z = -7;
    model4.scale.x = 0.05;
    model4.scale.y = 0.05;
    model4.scale.z = 0.05;
    model4.rotation.y = -2.5;
    scene.add(model4);

    mixer4 = new THREE.AnimationMixer(model4);
    let action2 = mixer4.clipAction(gltf.animations[0]);
    action2.play();
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.error("Error loading model:", error);
  },
);

const container = document.querySelector("canvas");
container.style.touchAction = "none";
container.style.cursor = "grab";

container.addEventListener(
  // revert grabbing style
  "pointerup",
  () => {
    container.style.cursor = "grab";
  },
  { passive: false },
);

container.addEventListener(
  // change cursor style to resemble grabbing when dragging
  "pointerdown",
  () => {
    container.style.cursor = "grabbing";
  },
  { passive: false },
);

// to see where camera position is
const zoom = document.querySelector(".objectZoom");
const chatSymbol = document.getElementById("chatSymbol");
const convo = document.querySelector(".conversation");
convo.style.display = "none";

zoom.addEventListener("click", () => {
  if (convo.style.display == "none") {
    resetControls(); // reset controls so pre-established limitations does not hinder camera movement

    // change chat icon to exit/cancel icon
    chatSymbol.src = "https://www.svgrepo.com/show/486564/cancel.svg";

    // graceful join
    gsap.to(controls.target, {
      // moves the camera angle
      x: 3,
      y: 7,
      z: 0,
      duration: 2,
    });

    gsap.to(camera.position, {
      // moves the camera position
      x: 3,
      y: 7,
      z: 0.01,
      duration: 2,
    });

    convo.style.display = "flex";
    gsap.fromTo(convo, { opacity: 0 }, { opacity: 1, duration: 1, delay: 2 });

    // freezes the orbit controls
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = 0;
    controls.minDistance = 0;
    controls.maxDistance = 0;
    controls.minAzimuthAngle = 0;
    controls.maxAzimuthAngle = 0;
  } else {
    resetControls();

    // revert back to chat icon
    chatSymbol.src = "https://www.svgrepo.com/show/501494/chat.svg";

    // graceful exit
    gsap.fromTo(convo, { opacity: 1 }, { opacity: 0, duration: 1 });
    setTimeout(() => {
      gsap.to(controls.target, {
        // moves the camera angle
        x: 0,
        y: 0,
        z: 0,
        duration: 2,
      });
      gsap.to(camera.position, {
        // moves the camera position
        x: 0,
        y: 0,
        z: 3,
        duration: 2,
      });
      convo.style.display = "none";
    }, 1000);
  }
  setControlLimits(); // place limitations back on to orbit controls
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // REMOVED OLD DUCK ROTATION
  // ADDED DUCK ELEMENT
  // keeps judy's mouse-follow rotation behavior
  // applies to all active realtime ducks
  for (let id in activeDuckModels) {
    if (activeDuckModels[id]) {
      window.addEventListener("mousemove", (e) => {
        activeDuckModels[id].rotation.y =
          500 / e.clientX >= 2.9 ? 3 : 500 / e.clientX;
      });
    }
  }

  controls.update();
  renderer.render(scene, camera);

  if (mixer) {
    mixer.update(0.02);
  }

  if (mixer4) {
    mixer4.update(0.02);
  }
}

window.addEventListener('mousemove', (e) => {
  if(model2){
    model2.rotation.y = 500/e.clientX >= 2.9 ? 3 : 500/e.clientX; // Duck rotates to follow user's cursor
  }
})

animate();

//ABOUT pop up
const bodyPage = document.body;
const blurredBackground = document.querySelector(".blurred-Overlay");
const aboutBttn = document.querySelector(".about");
const aboutPage = document.querySelector(".about-text");
const closeBttn = document.getElementById("about-button");
aboutBttn.addEventListener("click", () => {
  blurredBackground.style.visibility = "visible";
  aboutPage.style.filter = "none";
  aboutPage.style.visibility = "visible";
});
closeBttn.addEventListener("click", () => {
  blurredBackground.style.visibility = "hidden";
  bodyPage.style.filter = "none";
  aboutPage.style.visibility = "hidden";
});