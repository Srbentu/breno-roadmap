import { GUI } from "lil-gui";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export default function BlenderPage() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    /**
     * Loaders
     */

    const gltfLoader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();
    //const cubeTextureLoader = new THREE.CubeTextureLoader();
    //const rgbeLoader = new RGBELoader();

    // Debug
    const gui = new GUI();

    //const debugObject = {};

    // Canvas
    const canvas = canvasRef.current;

    // Scene
    const scene = new THREE.Scene();

    /**
     * Environment Map
     */

    scene.environmentIntensity = 1;
    gui.add(scene, "environmentIntensity").min(0).max(10).step(0.001);

    scene.backgroundBlurriness = 0;
    gui.add(scene, "backgroundBlurriness").min(0).max(1).step(0.001);
    scene.backgroundIntensity = 1;
    gui.add(scene, "backgroundIntensity").min(0).max(10).step(0.001);
    scene.backgroundRotation.y = 1;
    gui
      .add(scene.backgroundRotation, "y")
      .min(0)
      .max(Math.PI * 2)
      .step(0.001)
      .name("backgroundRotationY");
    gui
      .add(scene.environmentRotation, "y")
      .min(0)
      .max(Math.PI * 2)
      .step(0.001)
      .name("environmentRotationY");

    //LCD cube texture
    // const environmentMap = cubeTextureLoader.load([
    //   "/assets/environmentMaps/0/px.png",
    //   "/assets/environmentMaps/0/nx.png",
    //   "/assets/environmentMaps/0/py.png",
    //   "/assets/environmentMaps/0/ny.png",
    //   "/assets/environmentMaps/0/pz.png",
    //   "/assets/environmentMaps/0/nz.png",
    // ]);
    // scene.environment = environmentMap;
    // scene.background = environmentMap;

    // HDR equirectangular texture
    // rgbeLoader.load("/assets/environmentMaps/2/2k.hdr", (environmentMap) => {
    //   environmentMap.mapping = THREE.EquirectangularReflectionMapping;
    //   scene.environment = environmentMap;
    //   const skybox = new GroundedSkybox(environmentMap, 15, 70);
    //   skybox.position.y = 15;
    //   scene.add(skybox);
    // });

    /**
     * Real time environment map
     */

    // Base environment map
    const environmentMap = textureLoader.load(
      "/assets/environmentMaps/blockadesLabsSkybox/interior_views_cozy_wood_cabin_with_cauldron_and_p.jpg",
    );
    environmentMap.mapping = THREE.EquirectangularReflectionMapping;
    environmentMap.colorSpace = THREE.SRGBColorSpace;

    scene.background = environmentMap;

    /**
     * Torus Knot
     */
    const torusKnot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
      new THREE.MeshStandardMaterial({
        roughness: 0,
        metalness: 1,
        color: 0xaaaaaa,
      }),
    );

    const holyDonut = new THREE.Mesh(
      new THREE.TorusGeometry(8, 0.5),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(10, 10, 10) }),
    );
    holyDonut.layers.enable(1);
    holyDonut.position.y = 3.5;
    scene.add(holyDonut);

    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
      type: THREE.HalfFloatType,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
    });
    scene.environment = cubeRenderTarget.texture;

    //cube camera
    const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
    cubeCamera.layers.set(1);

    torusKnot.position.y = 4;
    torusKnot.position.x = -4;
    scene.add(torusKnot);

    gltfLoader.load(
      "/assets/models/flightHelmet/glTF/FlightHelmet.gltf",
      (gltf) => {
        gltf.scene.scale.set(10, 10, 10);
        scene.add(gltf.scene);
      },
    );

    /**
     * Sizes
     */
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    window.addEventListener("resize", () => {
      // Update sizes
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      // Update camera
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      // Update renderer
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    /**
     * Camera
     */
    // Base camera
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      100,
    );
    camera.position.set(-8, 4, 8);
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 1, 0);
    controls.enableDamping = true;

    /**
     * Renderer
     */
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const clock = new THREE.Clock();
    //let previousTime = 0;

    //Animations
    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      if (holyDonut) {
        holyDonut.rotation.x = Math.sin(elapsedTime) * 2;
        cubeCamera.update(renderer, scene);
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
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <canvas
        style={{ margin: "0", padding: "0" }}
        ref={canvasRef}
        className="webgl"
      />
    </>
  );
}
