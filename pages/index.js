import gsap from "gsap";
import Link from "next/link";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ScrollBasedAnimation() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const guiRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    /**
     * Debug
     */
    //const gui = new GUI();
    //guiRef.current = gui;

    const parameters = {
      materialColor: "#babaca",
    };

    /**
     * Base
     */
    // Canvas
    const canvas = canvasRef.current;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    /**
     * Objects
     */
    //TEXTURES
    const textureLoader = new THREE.TextureLoader();
    const gradientTexture = textureLoader.load(
      "./assets/textures/gradients/3.jpg",
    );
    gradientTexture.magFilter = THREE.NearestFilter;
    //Material
    const material = new THREE.MeshToonMaterial({
      color: parameters.materialColor,
      gradientMap: gradientTexture,
    });

    // Meshes
    const objectsDistance = 4;
    const mesh1 = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.4, 16, 100),
      material,
    );
    const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material);

    const mesh3 = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
      material,
    );

    const mesh4 = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1, 0),
      material,
    );

    const mesh5 = new THREE.Mesh(
      new THREE.CapsuleGeometry(1, 1, 16, 16, 16),
      material,
    );
    mesh1.position.y = -objectsDistance * 0;
    mesh2.position.y = -objectsDistance * 1;
    mesh3.position.y = -objectsDistance * 2;
    mesh4.position.y = -objectsDistance * 3;
    mesh5.position.y = -objectsDistance * 4;

    mesh1.position.x = 2;
    mesh2.position.x = -2;
    mesh3.position.x = 2;
    mesh4.position.x = -2;
    mesh5.position.x = 2;

    // Ajuste responsivo para mobile
    if (window.innerWidth <= 768) {
      mesh1.position.x = 0.8;
      mesh2.position.x = -0.8;
      mesh3.position.x = 0.8;
      mesh4.position.x = -0.8;
      mesh5.position.x = 0.8;
    } else {
      mesh1.position.x = 1.5;
      mesh2.position.x = -1.5;
      mesh3.position.x = 1.5;
      mesh4.position.x = -1.5;
      mesh5.position.x = 1.5;
    }

    scene.add(mesh1, mesh2, mesh3, mesh4, mesh5);

    const sectionMeshes = [mesh1, mesh2, mesh3, mesh4, mesh5];
    /**
     * Particles
     */
    const particlesCount = 2000;
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] =
        objectsDistance * 0.5 -
        Math.random() * objectsDistance * sectionMeshes.length;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    const particlesMaterial = new THREE.PointsMaterial({
      color: parameters.materialColor,
      sizeAttenuation: true,
      size: 0.01,
    });

    //Points
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    /**
     * Lights
     */

    const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
    directionalLight.position.set(1, 1, 0);
    scene.add(directionalLight);

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
    const cameraGroup = new THREE.Group();
    scene.add(cameraGroup);
    const camera = new THREE.PerspectiveCamera(
      35,
      sizes.width / sizes.height,
      0.1,
      100,
    );
    camera.position.z = 6;
    cameraGroup.add(camera);

    /**
     * Renderer
     */
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
    });

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    /**
     * Scroll
     */

    let scrollY = window.scrollY;
    let currentSection = 0;

    window.addEventListener("scroll", () => {
      scrollY = window.scrollY;
      const newSection = Math.round(scrollY / window.innerHeight);
      if (newSection !== currentSection) {
        currentSection = newSection;
        gsap.to(sectionMeshes[currentSection].rotation, {
          duration: 1.5,
          ease: "power2.inOut",
          x: "+=6",
          y: "+=3",
          z: "+=1.5",
        });
      }
    });

    /**
     * Paralax
     */

    const cursor = { x: 0, y: 0 };

    window.addEventListener("mousemove", (event) => {
      cursor.x = event.clientX / sizes.width - 0.5;
      cursor.y = event.clientY / sizes.height - 0.5;
    });

    /**
     * Animate
     */
    const clock = new THREE.Clock();
    let previousTime = 0;

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();
      const deltaTime = elapsedTime - previousTime;
      previousTime = elapsedTime;

      //Animate camera
      camera.position.y = (-scrollY / window.innerHeight) * objectsDistance;

      const parallaxX = -cursor.x;
      const parallaxY = cursor.y;

      cameraGroup.position.x =
        (parallaxX - cameraGroup.position.x) * deltaTime * 10;
      cameraGroup.position.y =
        (parallaxY - cameraGroup.position.y) * deltaTime * 10;

      //animate meshes
      for (const mesh of sectionMeshes) {
        mesh.rotation.x += deltaTime * 0.1;
        mesh.rotation.y += deltaTime * 0.12;
      }

      // Render
      renderer.render(scene, camera);

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

    tick();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      //gui.destroy();
      renderer.dispose();

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
    <>
      <canvas
        ref={canvasRef}
        className="webgl"
        style={{ backgroundColor: "#1e1e20" }}
      />

      <section className="section">
        <h1>
          <Link href="/portfolio">My Portfolio</Link>
        </h1>
      </section>
      <section className="section">
        <h2>
          <Link href="/projects">My Projects</Link>
        </h2>
      </section>
      <section className="section">
        <h2>
          <Link href="/contact">Contact me</Link>
        </h2>
      </section>
      <section className="section">
        <h2>
          <Link href="/learnings">Learnings</Link>
        </h2>
      </section>
      <section className="section">
        <h2>
          <Link href="/news">News</Link>
        </h2>
      </section>

      <style jsx>{`
        .webgl {
          position: fixed;
          top: 0;
          left: 0;
          outline: none;
        }

        .section {
          display: flex;
          align-items: center;
          height: 100vh;
          position: relative;
          font-family: "Cabin", sans-serif;
          color: #ffeded;
          text-transform: uppercase;
          font-size: 7vmin;
          padding-left: 10%;
          padding-right: 10%;
        }

        h1 {
          font-size: 10vmin;
        }
      `}</style>
    </>
  );
}
