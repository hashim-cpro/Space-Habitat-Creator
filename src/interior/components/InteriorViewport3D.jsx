/**
 * Interior 3D Viewport Component
 * Renders 3D perspective view of interior spaces
 * (Placeholder for Phase 2 implementation)
 */

import PropTypes from "prop-types";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

function InteriorViewport3D({
  interiorConfig,
  activeDeck,
  selectedRoomId,
  onSelectRoom,
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current; // Store ref for cleanup

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 15);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x4a90e2, 0x2a2a4f);
    scene.add(gridHelper);

    // Placeholder cylinder
    if (interiorConfig) {
      const cylGeometry = new THREE.CylinderGeometry(
        interiorConfig.cylRadius,
        interiorConfig.cylRadius,
        interiorConfig.cylLength,
        32
      );
      const cylMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
      });
      const cylinder = new THREE.Mesh(cylGeometry, cylMaterial);
      cylinder.rotation.x = Math.PI / 2;
      scene.add(cylinder);

      // Wireframe
      const wireGeometry = new THREE.CylinderGeometry(
        interiorConfig.cylRadius + 0.1,
        interiorConfig.cylRadius + 0.1,
        interiorConfig.cylLength + 0.2,
        32
      );
      const wireMaterial = new THREE.MeshBasicMaterial({
        color: 0x00f5ff,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
      });
      const wireframe = new THREE.Mesh(wireGeometry, wireMaterial);
      wireframe.rotation.x = Math.PI / 2;
      scene.add(wireframe);
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [interiorConfig]);

  // TODO: Implement room rendering in 3D
  useEffect(() => {
    if (!sceneRef.current || !activeDeck) return;

    // Future: Render rooms as 3D geometries
    // For now, just a placeholder
  }, [activeDeck, selectedRoomId, onSelectRoom]);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(20, 20, 40, 0.9)",
          padding: "2rem",
          borderRadius: "8px",
          border: "1px solid rgba(0, 245, 255, 0.3)",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏗️</div>
        <div style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
          3D Interior View
        </div>
        <div style={{ fontSize: "0.9rem", color: "#888" }}>
          Full 3D walkthrough coming in Phase 2
        </div>
      </div>
    </div>
  );
}

InteriorViewport3D.propTypes = {
  interiorConfig: PropTypes.object.isRequired,
  activeDeck: PropTypes.object,
  selectedRoomId: PropTypes.string,
  onSelectRoom: PropTypes.func.isRequired,
};

export default InteriorViewport3D;
