import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { TransformControls } from "@react-three/drei";
import * as THREE from "three";

export default function CADObject({
  object,
  isSelected,
  onSelect,
  transformMode,
  onTransform,
  axisLock,
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  const geometry = useMemo(() => {
    switch (object.type) {
      case "box":
        return new THREE.BoxGeometry(
          object.parameters.width,
          object.parameters.height,
          object.parameters.depth
        );
      case "sphere":
        return new THREE.SphereGeometry(object.parameters.radius, 32, 32);
      case "cylinder":
        return new THREE.CylinderGeometry(
          object.parameters.radiusTop,
          object.parameters.radiusBottom,
          object.parameters.height,
          32
        );
      case "cone":
        return new THREE.ConeGeometry(
          object.parameters.radius,
          object.parameters.height,
          32
        );
      case "torus":
        return new THREE.TorusGeometry(
          object.parameters.radius,
          object.parameters.tube,
          16,
          100
        );
      case "plane":
        return new THREE.PlaneGeometry(
          object.parameters.width,
          object.parameters.height
        );
      case "custom":
        return object.parameters.geometry;
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  }, [object]);

  useEffect(() => {
    if (object.type === "custom") return undefined;
    return () => {
      geometry.dispose?.();
    };
  }, [geometry, object.type]);

  useFrame(() => {
    if (meshRef.current && isSelected) {
      // Optional: Add subtle animation or highlight effect
    }
  });

  const emitTransform = (commit = false) => {
    if (!meshRef.current) return;
    onTransform(
      {
        position: meshRef.current.position.toArray(),
        rotation: meshRef.current.rotation.toArray().slice(0, 3),
        scale: meshRef.current.scale.toArray(),
      },
      { commit }
    );
  };

  // Axis constraint based on axisLock
  const getTransformSpace = () => {
    if (!axisLock) return "world";
    return "local";
  };

  const getTransformShowX = () => {
    if (!axisLock) return true;
    return axisLock === "x";
  };

  const getTransformShowY = () => {
    if (!axisLock) return true;
    return axisLock === "y";
  };

  const getTransformShowZ = () => {
    if (!axisLock) return true;
    return axisLock === "z";
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        position={object.transform.position}
        rotation={object.transform.rotation}
        scale={object.transform.scale}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(e);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
        }}
        castShadow
        receiveShadow
      >
        <primitive object={geometry} attach="geometry" />
        <meshStandardMaterial
          color={
            isSelected
              ? object.material.selectedColor
              : hovered
              ? object.material.hoverColor
              : object.material.color
          }
          metalness={object.material.metalness}
          roughness={object.material.roughness}
          transparent={
            object.material.transparent || object.material.opacity < 1
          }
          opacity={object.material.opacity}
          wireframe={object.material.wireframe}
          side={THREE.DoubleSide}
          depthWrite={object.material.opacity >= 1}
        />
      </mesh>

      {isSelected && transformMode && transformMode !== "none" && (
        <TransformControls
          object={meshRef.current}
          mode={transformMode}
          onObjectChange={() => emitTransform(false)}
          onMouseUp={() => emitTransform(true)}
          space={getTransformSpace()}
          showX={getTransformShowX()}
          showY={getTransformShowY()}
          showZ={getTransformShowZ()}
        />
      )}
    </group>
  );
}
