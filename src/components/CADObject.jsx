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
}) {
  const meshRef = useRef();
  const transformControlsRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { scene } = useThree();

  const isModule = object.type === "module" && object.userData?.isModule;

  const material = useMemo(() => {
    if (object.type === "module" && object.userData?.moduleDefinition) {
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

  useEffect(() => {
    return () => {
      if (material) {
        material.dispose();
      }
    };
  }, [material]);

  const geometry = useMemo(() => {
    if (object.geometry && object.geometry.isBufferGeometry) {
      return object.geometry;
    }

    if (object.type === "module" && object.userData?.geometry) {
      return object.userData.geometry;
    }

    if (
      object.parameters?.geometry &&
      object.parameters.geometry.isBufferGeometry
    ) {
      return object.parameters.geometry;
    }

    if (!object.parameters) {
      console.error(
        `Object ${object.name} (${object.id}) missing parameters, cannot create geometry`
      );
      return new THREE.BoxGeometry(1, 1, 1); // Fallback
    }

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

  useEffect(() => {
    if (meshRef.current && isModule && object.userData?.geometry) {
      notifyGeometryChanged(meshRef.current);
    }
  }, [isModule, object.userData?.geometry]);

  useFrame(() => {
    if (meshRef.current && isSelected && isDragging) {
      const otherMeshes = physicsWorld.getPotentialColliders(meshRef.current);

      if (otherMeshes.length > 0) {
        const snaps = computeAlignmentSnaps(meshRef.current, otherMeshes);
        if (snaps.length) {
          const pos = meshRef.current.position.clone();
          snaps.forEach((s) => {
            pos[s.axis] += s.delta; // move exactly onto target line/face
          });
          meshRef.current.position.copy(pos);
          meshRef.current.updateMatrixWorld();

          // Visual guides that don't work for some reason
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
        meshRef.current.updateMatrixWorld();

        const otherModules = otherMeshes.filter((m) => m.userData?.isModule);

        if (otherModules.length > 0) {
          const myPoints = getAttachmentPoints(meshRef.current);

          let closestMatch = null;
          let minDistance = 4.5;

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
            if (closestMatch.distance < 1.2) {
              snapModuleToPoint(
                meshRef.current,
                closestMatch.myPoint,
                closestMatch.otherPoint
              );
              if (meshRef.current.material) {
                meshRef.current.material.emissive = new THREE.Color(0x000000);
                meshRef.current.material.emissiveIntensity = 0;
              }
            } else {
              
              if (meshRef.current.material) {
                const intensity = Math.max(0, 1 - closestMatch.distance / 4.5);
                meshRef.current.material.emissive = new THREE.Color(0x0044ff);
                meshRef.current.material.emissiveIntensity = intensity * 1.2;
                meshRef.current.material.needsUpdate = true;
              }
            }
          } else {
            if (meshRef.current.material) {
              meshRef.current.material.emissive = new THREE.Color(0x000000);
              meshRef.current.material.emissiveIntensity = 0;
              meshRef.current.material.needsUpdate = true;
            }
          }
        }
      }

      
      if (otherMeshes.length > 0) {
        const current = meshRef.current.position.clone();
        const last =
          meshRef.current.userData.lastSafePosition || current.clone();

        const delta = current.clone().sub(last);

        if (!delta.equals(new THREE.Vector3(0, 0, 0))) {
       
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
        physicsWorld.updateBody(meshRef.current);
      }
    } else if (meshRef.current && meshRef.current.material && !isDragging) {
      meshRef.current.material.emissive = new THREE.Color(0x000000);
      meshRef.current.material.emissiveIntensity = 0;
      meshRef.current.material.needsUpdate = true;
      clearAlignmentGuides(scene);
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
          <primitive object={material} attach="material" />
        ) : (
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
