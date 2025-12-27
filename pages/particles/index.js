import GUI from "lil-gui";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function Particles() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const guiRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    /**
     * Base
     */
    // Debug
    const gui = new GUI();
    guiRef.current = gui;

    // Canvas
    const canvas = canvasRef.current;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    /**
     * Textures
     */
    const textureLoader = new THREE.TextureLoader();
    const particleTexture = textureLoader.load(
      "./assets/textures/particles/2.png",
    );

    /**
     * Particles
     */

    // Geometry
    const particlesGeometry = new THREE.BufferGeometry();
    const count = 5000;
    const colors = new Float32Array(count * 3);

    const positions = new Float32Array(count * 3); // Multiply by 3 because each position is composed of 3 values (x, y, z)

    for (
      let i = 0;
      i < count * 3;
      i++ // Multiply by 3 for same reason
    ) {
      positions[i] = (Math.random() - 0.5) * 10;
      colors[i] = Math.random();
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    ); // Create the Three.js BufferAttribute and specify that each information is composed of 3 values
    particlesGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3),
    );
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      sizeAttenuation: true,
      alphaMap: particleTexture,
      transparent: true,
      depthWrite: false,
      //alphaTest: 0.001,
      //depthTest: false,
      blending: THREE.AdditiveBlending,
      //color: new THREE.Color("#ff88cc"),
      vertexColors: true,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    /**
     * Sizes
     */
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const handleResize = () => {
      // Update sizes
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      // Update camera
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      // Update renderer
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);

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
    camera.position.z = 3;
    scene.add(camera);

    // Controls
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

    /**
     * Animate
     */
    //const clock = new THREE.Clock();

    const tick = () => {
      //const elapsedTime = clock.getElapsedTime();

      //particles.rotation.x = elapsedTime * 0.2;

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
      window.removeEventListener("resize", handleResize);
      gui.destroy();
      renderer.dispose();
      controls.dispose();

      // Dispose geometries and materials
      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <canvas ref={canvasRef} className="webgl" style={{ display: "block" }} />
    </div>
  );
}
