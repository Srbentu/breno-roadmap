import CANNON from "cannon";
import GUI from "lil-gui";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function PhysicsScene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    /** Debug */
    const gui = new GUI();
    const debugObject = {};

    debugObject.createSphere = () => {
      createSphere(Math.random() + 0.5, {
        x: (Math.random() - 0.5) * 3,
        y: 3,
        z: (Math.random() - 0.5) * 3,
      });
    };
    debugObject.createBox = () => {
      createBox(Math.random(), Math.random(), Math.random(), {
        x: (Math.random() - 0.5) * 3,
        y: 3,
        z: (Math.random() - 0.5) * 3,
      });
    };
    debugObject.reset = () => {
      objectToUpdate.forEach((object) => {
        object.body.removeEventListener("collide", playHitSound);
        world.removeBody(object.body);
        scene.remove(object.mesh);
      });
      objectToUpdate.splice(0, objectToUpdate.length);
    };
    gui.add(debugObject, "createSphere");
    gui.add(debugObject, "createBox");
    gui.add(debugObject, "reset");

    /** Base */
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();

    const hitSound = new Audio("/assets/sounds/hit.mp3");
    const playHitSound = (collision) => {
      const impactStrength = collision.contact.getImpactVelocityAlongNormal();
      if (impactStrength < 1.5) {
        hitSound.volume = Math.random();
        hitSound.currentTime = 0;
        hitSound.play();
      }
    };

    /** Textures */
    const textureLoader = new THREE.TextureLoader();
    console.log(textureLoader);
    const cubeTextureLoader = new THREE.CubeTextureLoader();

    const environmentMapTexture = cubeTextureLoader.load([
      "/assets/textures/environmentMap/0/px.png",
      "/assets/textures/environmentMap/0/nx.png",
      "/assets/textures/environmentMap/0/py.png",
      "/assets/textures/environmentMap/0/ny.png",
      "/assets/textures/environmentMap/0/pz.png",
      "/assets/textures/environmentMap/0/nz.png",
    ]);

    /** Physics */

    // World
    const world = new CANNON.World();
    world.broadphase = new CANNON.SAPBroadphase(world);
    world.allowSleep = true;
    world.gravity.set(0, -9.82, 0);

    // Physics material
    const defaultMaterial = new CANNON.Material("concrete");

    const defaultMaterialContactMaterial = new CANNON.ContactMaterial(
      defaultMaterial,
      defaultMaterial,
      {
        friction: 0.1,
        restitution: 0.7,
      },
    );

    world.addContactMaterial(defaultMaterialContactMaterial);
    world.defaultContactMaterial = defaultMaterialContactMaterial;

    // //Sphere
    // const sphereShape = new CANNON.Sphere(0.5);
    // const sphereBody = new CANNON.Body({
    //   mass: 1,
    //   position: new CANNON.Vec3(0, 3, 0),
    //   shape: sphereShape,
    // });
    // sphereBody.applyLocalForce(
    //   new CANNON.Vec3(150, 0, 0),
    //   new CANNON.Vec3(0, 0, 0),
    // );
    // world.addBody(sphereBody);

    //Floor
    const floorShape = new CANNON.Plane();
    const floorBody = new CANNON.Body();
    floorBody.mass = 0;
    floorBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(-1, 0, 0),
      Math.PI / 2,
    );
    floorBody.addShape(floorShape);
    world.addBody(floorBody);

    // /** Test sphere */
    // const sphere = new THREE.Mesh(
    //   new THREE.SphereGeometry(0.5, 32, 32),
    //   new THREE.MeshStandardMaterial({
    //     metalness: 0.3,
    //     roughness: 0.4,
    //     envMap: environmentMapTexture,
    //     envMapIntensity: 0.5,
    //   }),
    // );
    // sphere.castShadow = true;
    // sphere.position.y = 0.5;
    // scene.add(sphere);

    /** Floor */
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({
        color: "#777777",
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5,
      }),
    );
    floor.receiveShadow = true;
    floor.rotation.x = -Math.PI * 0.5;
    scene.add(floor);

    /** Lights */
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024);
    directionalLight.shadow.camera.far = 15;
    directionalLight.shadow.camera.left = -7;
    directionalLight.shadow.camera.top = 7;
    directionalLight.shadow.camera.right = 7;
    directionalLight.shadow.camera.bottom = -7;
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    /** Sizes */
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const handleResize = () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener("resize", handleResize);

    /** Camera */
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      100,
    );
    camera.position.set(-3, 3, 3);
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;

    /** Renderer */
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    /** Utils */
    const objectToUpdate = [];

    //Sphere
    const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      metalness: 0.3,
      roughness: 0.4,
      envMap: environmentMapTexture,
      envMapIntensity: 0.5,
    });

    const createSphere = (radius, position) => {
      // Three.js mesh
      const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
      mesh.scale.set(radius, radius, radius);
      mesh.castShadow = true;
      mesh.position.copy(position);
      scene.add(mesh);

      // Cannon.js body
      const shape = new CANNON.Sphere(radius);
      const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape,
        material: defaultMaterial,
      });
      body.position.copy(position);
      world.addBody(body);

      //save in objectToUpdate

      objectToUpdate.push({ mesh, body });
    };
    createSphere(0.5, { x: 0, y: 3, z: 0 });

    //Box
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const boxMaterial = new THREE.MeshStandardMaterial({
      metalness: 0.3,
      roughness: 0.4,
      envMap: environmentMapTexture,
      envMapIntensity: 0.5,
    });

    const createBox = (width, height, depth, position) => {
      // Three.js mesh
      const mesh = new THREE.Mesh(boxGeometry, boxMaterial);
      mesh.scale.set(width, height, depth);
      mesh.castShadow = true;
      mesh.position.copy(position);
      scene.add(mesh);

      // Cannon.js body
      const shape = new CANNON.Box(
        new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5),
      );

      const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape: shape,
        material: defaultMaterial,
      });
      body.position.copy(position);
      body.addEventListener("collide", playHitSound);
      world.addBody(body);

      // Save in objects
      objectToUpdate.push({ mesh, body });
    };

    /** Animate */
    const clock = new THREE.Clock();
    const tick = () => {
      // Update physics world
      const delta = clock.getDelta();

      //sphereBody.applyForce(new CANNON.Vec3(-0.5, 0, 0), sphereBody.position);
      world.step(1 / 60, delta, 3);
      //sphere.position.copy(sphereBody.position);

      objectToUpdate.forEach(({ mesh, body }) => {
        mesh.position.copy(body.position);
        mesh.quaternion.copy(body.quaternion);
      });

      controls.update();
      renderer.render(scene, camera);
      window.requestAnimationFrame(tick);
    };
    tick();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      gui.destroy();
      renderer.dispose();
      controls.dispose();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
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
