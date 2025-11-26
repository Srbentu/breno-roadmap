import gsap from "gsap";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreePage() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Canvas
    const canvas = canvasRef.current;

    // Scene
    const scene = new THREE.Scene();

    /**
     * Object
     */
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    /**
     * Sizes
     */
    const sizes = {
      width: 800,
      height: 600,
    };

    /**
     * Camera
     */
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
    camera.position.z = 3;
    scene.add(camera);

    /**
     * Renderer
     */
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
    });
    renderer.setSize(sizes.width, sizes.height);

    //const clock = new THREE.Clock();

    gsap.to(mesh.rotation, {
      y: Math.PI * 2,
      duration: 2,
      repeat: -1,
      ease: "linear",
    });

    //Animations
    const tick = () => {
      //const elapsedTime = clock.getElapsedTime();

      //update objects
      //mesh.rotation.y = Math.sin(elapsedTime);
      //mesh.rotation.x = Math.cos(elapsedTime);

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
      <canvas ref={canvasRef} className="webgl" />
    </>
  );
}
