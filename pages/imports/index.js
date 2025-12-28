import GUI from "lil-gui";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export default function ImportedModels() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Debug GUI
    const gui = new GUI();

    // Scene
    const scene = new THREE.Scene();

    // Loaders
    let mixer = null;
    let actions = [];
    let activeAction = null;
    let animationFolder = null;
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/assets/draco/");
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
    gltfLoader.load("/assets/models/Fox/glTF/Fox.gltf", (gltf) => {
      mixer = new THREE.AnimationMixer(gltf.scene);
      actions = gltf.animations.map((clip) => mixer.clipAction(clip));
      // Play default (first) animation
      activeAction = actions[0];
      activeAction.play();
      gltf.scene.scale.set(0.025, 0.025, 0.025);
      scene.add(gltf.scene);

      // GUI for animation selection
      const animNames = gltf.animations.map(
        (clip) => clip.name || `Anim${gltf.animations.indexOf(clip)}`,
      );
      const params = { Animation: animNames[0] };
      if (animationFolder) gui.removeFolder(animationFolder);
      animationFolder = gui.addFolder("Animations");
      animationFolder.add(params, "Animation", animNames).onChange((name) => {
        const idx = animNames.indexOf(name);
        if (activeAction) activeAction.stop();
        activeAction = actions[idx];
        activeAction.reset().play();
      });
      animationFolder.open();
    });

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({
        color: "#444444",
        metalness: 0,
        roughness: 0.5,
      }),
    );
    floor.receiveShadow = true;
    floor.rotation.x = -Math.PI * 0.5;
    scene.add(floor);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024);
    directionalLight.shadow.camera.far = 15;
    directionalLight.shadow.camera.left = -7;
    directionalLight.shadow.camera.top = 7;
    directionalLight.shadow.camera.right = 7;
    directionalLight.shadow.camera.bottom = -7;
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      100,
    );
    camera.position.set(2, 2, 2);
    scene.add(camera);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.75, 0);
    controls.enableDamping = true;

    // Resize handler
    const handleResize = () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener("resize", handleResize);

    const clock = new THREE.Clock();
    let previousTime = 0;
    // Animation loop
    const tick = () => {
      const elapsedTime = clock.getElapsedTime();
      const deltaTime = elapsedTime - previousTime;
      previousTime = elapsedTime;

      // Model animation
      if (mixer) {
        mixer.update(deltaTime);
      }

      // Update controls
      controls.update();

      // Render
      renderer.render(scene, camera);

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

    tick();

    // Cleanup
    return () => {
      //stop = true;
      window.removeEventListener("resize", handleResize);
      gui.destroy();
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        className="webgl"
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}
