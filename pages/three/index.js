import { gsap } from "gsap";
import GUI from "lil-gui";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function ThreePage() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    /**
     * TEXTURE
     */
    const loadingManager = new THREE.LoadingManager();
    const textureLoader = new THREE.TextureLoader(loadingManager);
    const texture = textureLoader.load("/assets/img/door.jpg");

    /**
     * DEBUG GUI
     */
    const gui = new GUI({
      width: 400,
      title: "Three.js Debugger",
    });
    gui.hide();
    window.addEventListener("keydown", (event) => {
      if (event.key === "h") {
        gui.show(gui._hidden);
      }
    });
    const debugObject = {};

    // Canvas
    const canvas = canvasRef.current;

    // Scene
    const scene = new THREE.Scene();

    const cursor = { x: 0, y: 0 };

    window.addEventListener("mousemove", (event) => {
      cursor.x = event.clientX / window.innerWidth - 0.5;
      cursor.y = -(event.clientY / window.innerHeight - 0.5);
    });

    /**
     * Object
     */
    const geometry = new THREE.BoxGeometry(1, 1, 1, 5, 5, 5);
    //debugObject.color = "#979af2";
    //const geometry = new THREE.TorusKnotGeometry(0.7, 0.2, 100, 16);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      //wireframe: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const cubeTweaks = gui.addFolder("Cube");
    cubeTweaks
      .add(mesh.position, "y")
      .min(-3)
      .max(3)
      .step(0.01)
      .name("elevation");
    cubeTweaks.add(mesh, "visible");
    cubeTweaks.add(mesh.material, "wireframe");
    //cubeTweaks.addColor(debugObject, "color").onChange(() => {
    //material.color.set(debugObject.color);
    //});
    debugObject.spin = () => {
      gsap.to(mesh.rotation, { y: mesh.rotation.y + Math.PI * 2 });
    };
    cubeTweaks.add(debugObject, "spin");
    debugObject.subdivision = 2;
    cubeTweaks
      .add(debugObject, "subdivision")
      .min(0)
      .max(20)
      .step(1)
      .onChange(() => {
        mesh.geometry.dispose();
        mesh.geometry = new THREE.BoxGeometry(
          1,
          1,
          1,
          debugObject.subdivision,
          debugObject.subdivision,
          debugObject.subdivision,
        );
      });

    /**
     * Sizes
     */
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    window.addEventListener("resize", () => {
      //update sizes
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      //update camera
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      //update renderer
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    window.addEventListener("dblclick", (event) => {
      if (!document.fullscreenElement) {
        canvas.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });

    /**
     * Camera
     */
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      1,
      100,
    );
    camera.position.z = 2;
    camera.position.y = 2;
    camera.position.x = 2;
    // camera.lookAt(mesh.position);
    scene.add(camera);

    //CONTROLS
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;

    /**
     * Renderer
     */
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    //const clock = new THREE.Clock();

    // gsap.to(mesh.rotation, {
    //   y: Math.PI * 1,
    //   duration: 2,
    //   repeat: -1,
    //   ease: "linear",
    // });

    //Animations
    const tick = () => {
      //const elapsedTime = clock.getElapsedTime();

      //update objects
      //mesh.rotation.y = Math.sin(elapsedTime);
      //mesh.rotation.x = Math.cos(elapsedTime);

      //Update controls
      controls.update();

      //Render
      renderer.render(scene, camera);
      window.requestAnimationFrame(tick);
    };
    tick();

    // Cleanup
    return () => {
      cubeTweaks.destroy();
      geometry.dispose();
      material.dispose();
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
