/**
 * Interior Design App - Modified to show exterior in wireframe
 */

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import * as THREE from "three";
import * as ModuleGenerators from "../utils/moduleGenerators";
import "./InteriorApp.css";

// Helper function to recreate geometry from parameters (same as in App.jsx)
function recreateGeometry(obj) {
  // If it's a module with a generator, regenerate it
  if (obj.type === "module" && obj.userData?.moduleDefinition) {
    const generatorFunc =
      ModuleGenerators[obj.userData.moduleDefinition.generator];
    if (generatorFunc) {
      const geometry = generatorFunc(obj.userData.parameters || obj.parameters);
      return {
        ...obj,
        geometry: geometry,
        parameters: obj.userData.parameters || obj.parameters,
        userData: {
          ...obj.userData,
          geometry: geometry,
        },
      };
    }
  }

  // For imported/custom geometry that was lost during save, skip it
  if (obj.type === "custom") {
    console.warn(
      `Cannot recreate custom/imported geometry for ${obj.name}. Object will be skipped.`
    );
    return null;
  }

  // For primitive shapes, ensure they have valid parameters
  if (!obj.parameters) {
    console.warn(`Object ${obj.name} missing parameters, skipping`);
    return null;
  }

  // For primitive shapes, geometry will be created in the component
  return obj;
}

// Component to render a single object in wireframe
function WireframeObject({ obj }) {
  const createGeometry = (type, parameters) => {
    // Ensure parameters exist
    if (!parameters) {
      console.error(`Missing parameters for ${type} geometry`);
      return new THREE.BoxGeometry(1, 1, 1);
    }

    switch (type) {
      case "box":
        return new THREE.BoxGeometry(
          parameters.width || 1,
          parameters.height || 1,
          parameters.depth || 1
        );
      case "sphere":
        return new THREE.SphereGeometry(parameters.radius || 1, 32, 32);
      case "cylinder":
        return new THREE.CylinderGeometry(
          parameters.radiusTop || parameters.radius || 1,
          parameters.radiusBottom || parameters.radius || 1,
          parameters.height || 2,
          32
        );
      case "cone":
        return new THREE.ConeGeometry(
          parameters.radius || 1,
          parameters.height || 2,
          32
        );
      case "torus":
        return new THREE.TorusGeometry(
          parameters.radius || 1,
          parameters.tube || 0.4,
          16,
          100
        );
      case "plane":
        return new THREE.PlaneGeometry(
          parameters.width || 1,
          parameters.height || 1
        );
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  };

  // Get geometry from object - prioritize actual geometry objects
  let geometry;
  if (obj.geometry && obj.geometry.isBufferGeometry) {
    geometry = obj.geometry;
  } else if (
    obj.parameters?.geometry &&
    obj.parameters.geometry.isBufferGeometry
  ) {
    geometry = obj.parameters.geometry;
  } else if (obj.userData?.geometry && obj.userData.geometry.isBufferGeometry) {
    geometry = obj.userData.geometry;
  } else {
    // Fallback: create geometry from parameters
    geometry = createGeometry(obj.type, obj.parameters || {});
  }

  const position = obj.transform?.position || [0, 0, 0];
  const rotation = obj.transform?.rotation || [0, 0, 0];
  const scale = obj.transform?.scale || [1, 1, 1];

  // Don't render if geometry is invalid
  if (!geometry || !geometry.isBufferGeometry) {
    console.warn("Invalid geometry for object:", obj.name, obj);
    return null;
  }

  // Create edges geometry for wireframe
  const edgesGeometry = new THREE.EdgesGeometry(geometry, 15); // 15 degree threshold for edges

  return (
    <group>
      {/* Solid semi-transparent mesh */}
      <mesh
        position={position}
        rotation={rotation}
        scale={scale}
        geometry={geometry}
      >
        <meshStandardMaterial
          color={obj.material?.color || "#cccccc"}
          transparent={true}
          opacity={0.15}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Wireframe overlay for edges */}
      <lineSegments
        position={position}
        rotation={rotation}
        scale={scale}
        geometry={edgesGeometry}
      >
        <lineBasicMaterial
          color={obj.material?.color || "#ffffff"}
          transparent={true}
          opacity={0.8}
        />
      </lineSegments>
    </group>
  );
}

function InteriorApp() {
  const [exteriorObjects, setExteriorObjects] = useState([]);

  // Load exterior objects from localStorage
  useEffect(() => {
    const loadExteriorObjects = () => {
      const savedData = localStorage.getItem("habitat-creator-exterior");
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (parsed.objects && Array.isArray(parsed.objects)) {
            // Recreate geometry for all objects, filter out nulls
            const objectsWithGeometry = parsed.objects
              .map((obj) => recreateGeometry(obj))
              .filter((obj) => obj !== null);
            setExteriorObjects(objectsWithGeometry);
            console.log(
              "Loaded exterior objects for interior view:",
              objectsWithGeometry.length
            );
          }
        } catch (error) {
          console.error("Failed to load exterior objects:", error);
        }
      }
    };

    // Load initially
    loadExteriorObjects();

    // Poll for changes every second
    const interval = setInterval(loadExteriorObjects, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#1a1a1a" }}>
      {/* Info Header */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 1000,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          padding: "15px 20px",
          borderRadius: "8px",
          color: "#fff",
          fontFamily: "monospace",
        }}
      >
        <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
          🏗️ Exterior Design - Wireframe View
        </h3>
        <div style={{ fontSize: "14px", color: "#aaa" }}>
          <div>Objects: {exteriorObjects.length}</div>
          <div style={{ marginTop: "5px", fontSize: "12px", color: "#666" }}>
            (Interior design features coming soon)
          </div>
        </div>
      </div>

      {/* 3D Wireframe Canvas */}
      <Canvas
        camera={{ position: [20, 20, 20], fov: 50 }}
        style={{ width: "100%", height: "100%" }}
      >
        <color attach="background" args={["#0a0a0a"]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 10]} intensity={0.8} />
        <directionalLight position={[-10, -10, -10]} intensity={0.3} />
        <pointLight position={[0, 20, 0]} intensity={0.5} />

        {/* Grid */}
        <Grid
          args={[100, 100]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#444"
          sectionSize={10}
          sectionThickness={1}
          sectionColor="#666"
          fadeDistance={50}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={true}
        />

        {/* Render all exterior objects in wireframe */}
        {exteriorObjects.map((obj) => (
          <WireframeObject key={obj.id} obj={obj} />
        ))}

        {/* Camera Controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
        />
      </Canvas>
    </div>
  );
}

export default InteriorApp;
