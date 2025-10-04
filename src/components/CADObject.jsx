import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { TransformControls } from "@react-three/drei";
import * as THREE from "three";
import { getModuleMaterial } from "../utils/moduleGenerators";
import {
  getAttachmentPoints,
  arePointsCompatible,
  snapModuleToPoint,
  showAttachmentPoints,
  hideAttachmentPoints,
  findClosestAttachmentPoint,
} from "../utils/connectionSystem";
import { checkCollision, getSafePosition } from "../utils/collisionDetection";

export default function CADObject({
  object,
  isSelected,
  onSelect,
  transformMode,
  onTransform,
  axisLock,
  allObjects = [], // Need all objects for snap detection
}) {
  const meshRef = useRef();
  const transformControlsRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  // snapTarget state removed (immediate snapping makes it unnecessary)
  const { scene } = useThree();

  // Track if this is a module
  const isModule = object.type === "module" && object.userData?.isModule;

  // Create unique material instance for modules so we can modify emissive properties
  const material = useMemo(() => {
    if (object.type === "module" && object.userData?.moduleDefinition) {
      // Clone module material for this instance so we can modify it
      const baseMaterial = getModuleMaterial(
        object.userData.geometry.userData.moduleType
      );
      return baseMaterial.clone();
    }
    return null;
  }, [
    object.type,
    object.userData?.moduleDefinition,
    object.userData?.geometry?.userData?.moduleType,
  ]);

  // Cleanup material on unmount
  useEffect(() => {
    return () => {
      if (material) {
        material.dispose();
      }
    };
  }, [material]);

  const geometry = useMemo(() => {
    // Handle procedural modules
    if (object.type === "module" && object.userData?.geometry) {
      return object.userData.geometry;
    }

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

  // Show/hide attachment points when module is selected
  useEffect(() => {
    const mesh = meshRef.current;
    if (isModule && mesh) {
      if (isSelected) {
        showAttachmentPoints(mesh, scene);
      } else {
        hideAttachmentPoints(mesh, scene);
      }
    }

    return () => {
      if (isModule && mesh) {
        hideAttachmentPoints(mesh, scene);
      }
    };
  }, [isSelected, isModule, scene]);

  // Store object ID in userData for scene lookup
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.userData.objectId = object.id;
      if (isModule) {
        meshRef.current.userData.isModule = true;
        meshRef.current.userData.moduleDefinition =
          object.userData?.moduleDefinition;
      }
    }
  }, [object.id, isModule, object.userData?.moduleDefinition]);

  useFrame(() => {
    if (meshRef.current && isSelected && isDragging) {
      // Get all other objects for collision detection
      const otherMeshes = allObjects
        .filter((obj) => obj.id !== object.id)
        .map((obj) => {
          const mesh = scene.getObjectByProperty("userData", {
            objectId: obj.id,
          });
          return mesh;
        })
        .filter(Boolean);

      if (isModule) {
        // IMMEDIATE SNAP LOGIC for modules (no force – direct alignment when in range)
        meshRef.current.updateMatrixWorld();

        // Get all other modules (excluding self)
        const otherModules = otherMeshes.filter((m) => m.userData?.isModule);

        if (otherModules.length > 0) {
          // Get attachment points from current module
          const myPoints = getAttachmentPoints(meshRef.current);

          // Find closest compatible attachment point
          let closestMatch = null;
          let minDistance = 4.5; // Snap activation range

          myPoints.forEach((myPoint) => {
            const closestPoint = findClosestAttachmentPoint(
              myPoint.position,
              otherModules,
              meshRef.current
            );

            if (
              closestPoint &&
              closestPoint.distance < minDistance &&
              arePointsCompatible(myPoint, closestPoint)
            ) {
              minDistance = closestPoint.distance;
              closestMatch = {
                myPoint,
                otherPoint: closestPoint,
                distance: closestPoint.distance,
              };
            }
          });

          if (closestMatch) {
            // If within snap distance, snap immediately (auto-align while dragging)
            if (closestMatch.distance < 1.2) {
              snapModuleToPoint(
                meshRef.current,
                closestMatch.myPoint,
                closestMatch.otherPoint
              );
              // snapped immediately
              if (meshRef.current.material) {
                meshRef.current.material.emissive = new THREE.Color(0x000000);
                meshRef.current.material.emissiveIntensity = 0;
              }
            } else {
              // Within magnetic field but not yet snap threshold → show pre-snap highlight
              // highlight only (using emissive)
              if (meshRef.current.material) {
                const intensity = Math.max(0, 1 - closestMatch.distance / 4.5);
                meshRef.current.material.emissive = new THREE.Color(0x0044ff);
                meshRef.current.material.emissiveIntensity = intensity * 1.2;
                meshRef.current.material.needsUpdate = true;
              }
            }
          } else {
            // clear highlight
            if (meshRef.current.material) {
              meshRef.current.material.emissive = new THREE.Color(0x000000);
              meshRef.current.material.emissiveIntensity = 0;
              meshRef.current.material.needsUpdate = true;
            }
          }
        }
      }

      // CONTINUOUS COLLISION PREVENTION (iterative resolution)
      if (otherMeshes.length > 0) {
        let iterations = 3; // small number of refinement passes
        while (iterations-- > 0) {
          const currentPos = meshRef.current.position.clone();
          const collision = checkCollision(
            meshRef.current,
            currentPos,
            otherMeshes
          );
          if (!collision) break;
          const previousPos =
            meshRef.current.userData.lastSafePosition || currentPos;
          const safePos = getSafePosition(
            meshRef.current,
            currentPos,
            previousPos,
            otherMeshes
          );
          meshRef.current.position.copy(safePos);
        }
        meshRef.current.userData.lastSafePosition =
          meshRef.current.position.clone();
      }
    } else if (meshRef.current && meshRef.current.material && !isDragging) {
      // Reset highlight when not dragging
      meshRef.current.material.emissive = new THREE.Color(0x000000);
      meshRef.current.material.emissiveIntensity = 0;
      meshRef.current.material.needsUpdate = true;
    }
  });

  const emitTransform = (commit = false) => {
    if (!meshRef.current) return;

    // (Commit no longer needed for snapping – handled live while dragging)

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
        {material ? (
          // Module-specific material (cloned instance for emissive control)
          <primitive object={material} attach="material" />
        ) : (
          // Standard material
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
        )}
      </mesh>

      {isSelected && transformMode && transformMode !== "none" && (
        <TransformControls
          ref={transformControlsRef}
          object={meshRef.current}
          mode={transformMode}
          onObjectChange={() => emitTransform(false)}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => {
            setIsDragging(false);
            emitTransform(true);
          }}
          space={getTransformSpace()}
          showX={getTransformShowX()}
          showY={getTransformShowY()}
          showZ={getTransformShowZ()}
        />
      )}
    </group>
  );
}
