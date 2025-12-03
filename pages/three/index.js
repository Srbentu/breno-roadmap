import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
//import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default function ThreePage() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

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
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

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
    // camera.position.y = 2;
    // camera.position.x = 2;
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
