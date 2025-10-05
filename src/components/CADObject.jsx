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
import { physicsWorld, notifyGeometryChanged } from "../utils/physicsSystem";
import {
  computeAlignmentSnaps,
  buildAlignmentGuideDescriptors,
  createGuideLine,
  clearAlignmentGuides,
} from "../utils/alignmentSystem";

export default function CADObject({
  object,
  isSelected,
  onSelect,
  transformMode,
  onTransform,
  axisLock,
  // allObjects prop no longer needed for collision (physicsWorld handles broad‑phase)
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
    // Check for geometry in priority order: root > userData > parameters > create new
    if (object.geometry && object.geometry.isBufferGeometry) {
      return object.geometry;
    }

    // Handle procedural modules
    if (object.type === "module" && object.userData?.geometry) {
      return object.userData.geometry;
    }

    // Handle custom/imported geometry in parameters
    if (
      object.parameters?.geometry &&
      object.parameters.geometry.isBufferGeometry
    ) {
      return object.parameters.geometry;
    }

    // Validate parameters exist for primitive shapes
    if (!object.parameters) {
      console.error(
        `Object ${object.name} (${object.id}) missing parameters, cannot create geometry`
      );
      return new THREE.BoxGeometry(1, 1, 1); // Fallback
    }

    // Generate primitive geometry based on type
    switch (object.type) {
      case "box":
        return new THREE.BoxGeometry(
          object.parameters.width || 1,
          object.parameters.height || 1,
          object.parameters.depth || 1
        );
      case "sphere":
        return new THREE.SphereGeometry(object.parameters.radius || 1, 32, 32);
      case "cylinder":
        return new THREE.CylinderGeometry(
          object.parameters.radiusTop || object.parameters.radius || 1,
          object.parameters.radiusBottom || object.parameters.radius || 1,
          object.parameters.height || 1,
          32
        );
      case "cone":
        return new THREE.ConeGeometry(
          object.parameters.radius || 1,
          object.parameters.height || 1,
          32
        );
      case "torus":
        return new THREE.TorusGeometry(
          object.parameters.radius || 1,
          object.parameters.tube || 0.4,
          16,
          100
        );
      case "plane":
        return new THREE.PlaneGeometry(
          object.parameters.width || 1,
          object.parameters.height || 1
        );
      case "custom":
        console.error(
          `Custom geometry for ${object.name} not found, using fallback`
        );
        return new THREE.BoxGeometry(1, 1, 1);
      default:
        console.warn(`Unknown object type ${object.type}, using box geometry`);
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

  // Store object ID in userData for scene lookup + register with physics
  useEffect(() => {
    const mesh = meshRef.current;
    if (mesh) {
      mesh.userData.objectId = object.id;
      if (isModule) {
        mesh.userData.isModule = true;
        mesh.userData.moduleDefinition = object.userData?.moduleDefinition;
      }
      physicsWorld.addBody(mesh);
      physicsWorld.resolveInitialOverlap(mesh);
    }
    return () => {
      if (mesh) physicsWorld.removeBody(mesh);
    };
  }, [object.id, isModule, object.userData?.moduleDefinition]);

  // When procedural module geometry regenerates, inform physics
  useEffect(() => {
    if (meshRef.current && isModule && object.userData?.geometry) {
      // geometry already replaced in parent; refresh bounding structures
      notifyGeometryChanged(meshRef.current);
    }
  }, [isModule, object.userData?.geometry]);

  useFrame(() => {
    if (meshRef.current && isSelected && isDragging) {
      // Use physics broad‑phase to gather potential colliders
      const otherMeshes = physicsWorld.getPotentialColliders(meshRef.current);

      // ALIGNMENT LOGIC (prior to collision finalization)
      // Compute potential snaps (one per axis) relative to nearby objects (same set used for collision)
      if (otherMeshes.length > 0) {
        const snaps = computeAlignmentSnaps(meshRef.current, otherMeshes);
        if (snaps.length) {
          // Apply snap deltas to position BEFORE collision blocking so that blocked axis logic respects alignment
          const pos = meshRef.current.position.clone();
          snaps.forEach((s) => {
            pos[s.axis] += s.delta; // move exactly onto target line/face
          });
          meshRef.current.position.copy(pos);
          meshRef.current.updateMatrixWorld();

          // Visual guides
          clearAlignmentGuides(scene);
          const guideDescs = buildAlignmentGuideDescriptors(
            meshRef.current,
            snaps
          );
          guideDescs.forEach((d) => scene.add(createGuideLine(d)));
        } else {
          clearAlignmentGuides(scene);
        }
      } else {
        clearAlignmentGuides(scene);
      }

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
      // Additionally: per-axis directional blocking: if movement along an axis causes collision, clamp that axis back.
      if (otherMeshes.length > 0) {
        const current = meshRef.current.position.clone();
        const last =
          meshRef.current.userData.lastSafePosition || current.clone();

        // Determine attempted delta
        const delta = current.clone().sub(last);

        if (!delta.equals(new THREE.Vector3(0, 0, 0))) {
          // Test each axis independently (X, Y, Z). We'll build a candidate position that only keeps axes that remain collision-free.
          const trial = last.clone();
          const axes = ["x", "y", "z"];
          axes.forEach((axis) => {
            if (delta[axis] === 0) return; // no movement along this axis
            trial[axis] += delta[axis];
            const collision = checkCollision(
              meshRef.current,
              trial,
              otherMeshes
            );
            if (collision) {
              // Revert that axis only (block movement in that direction)
              trial[axis] -= delta[axis];
            }
          });
          meshRef.current.position.copy(trial);
        }

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
          meshRef.current.updateMatrixWorld();
        }
        meshRef.current.userData.lastSafePosition =
          meshRef.current.position.clone();
        // Update physics world with new position
        physicsWorld.updateBody(meshRef.current);
      }
    } else if (meshRef.current && meshRef.current.material && !isDragging) {
      // Reset highlight when not dragging
      meshRef.current.material.emissive = new THREE.Color(0x000000);
      meshRef.current.material.emissiveIntensity = 0;
      meshRef.current.material.needsUpdate = true;
      clearAlignmentGuides(scene);
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
