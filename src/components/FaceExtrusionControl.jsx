// no longer needed, keeping for future use
import { useRef, useState, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";

export default function FaceExtrusionControl({
  object,
  faceIndex,
  onExtrude,
  orbitControlsRef,
}) {
  const { gl, camera } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [extrudeDistance, setExtrudeDistance] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const startPointRef = useRef(null);
  const faceDataRef = useRef(null);

  useEffect(() => {
    if (!object || faceIndex === null) return;

    const geometry = object.geometry;
    const position = geometry.attributes.position;
    const index = geometry.index;

    const faceStart = faceIndex * 3;
    const a = index ? index.array[faceStart] : faceStart;
    const b = index ? index.array[faceStart + 1] : faceStart + 1;
    const c = index ? index.array[faceStart + 2] : faceStart + 2;

    const vA = new THREE.Vector3(
      position.array[a * 3],
      position.array[a * 3 + 1],
      position.array[a * 3 + 2]
    );
    const vB = new THREE.Vector3(
      position.array[b * 3],
      position.array[b * 3 + 1],
      position.array[b * 3 + 2]
    );
    const vC = new THREE.Vector3(
      position.array[c * 3],
      position.array[c * 3 + 1],
      position.array[c * 3 + 2]
    );

    vA.applyMatrix4(object.matrixWorld);
    vB.applyMatrix4(object.matrixWorld);
    vC.applyMatrix4(object.matrixWorld);

    const center = new THREE.Vector3().add(vA).add(vB).add(vC).divideScalar(3);

    const cb = new THREE.Vector3().subVectors(vC, vB);
    const ab = new THREE.Vector3().subVectors(vA, vB);
    const normal = new THREE.Vector3().crossVectors(cb, ab).normalize();

    faceDataRef.current = { center, normal };
  }, [object, faceIndex]);

  const handlePointerDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    if (orbitControlsRef?.current) {
      orbitControlsRef.current.enabled = false;
    }
    startPointRef.current = e.point ? e.point.clone() : new THREE.Vector3();
    gl.domElement.style.cursor = "grabbing";
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalPointerMove = (e) => {
      if (!startPointRef.current || !faceDataRef.current) return;

      const { normal, center } = faceDataRef.current;

      const rect = gl.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
        normal,
        center
      );
      const intersectPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersectPoint);

      if (intersectPoint) {
        const delta = new THREE.Vector3().subVectors(
          intersectPoint,
          startPointRef.current
        );
        const distance = delta.dot(normal);
        setExtrudeDistance(distance);
      }
    };

    const handleGlobalPointerUp = () => {
      setIsDragging(false);
      if (orbitControlsRef?.current) {
        orbitControlsRef.current.enabled = true;
      }
      gl.domElement.style.cursor = "crosshair";

      if (Math.abs(extrudeDistance) > 0.01) {
        onExtrude(extrudeDistance);
      }

      setExtrudeDistance(0);
    };

    gl.domElement.addEventListener("pointermove", handleGlobalPointerMove);
    gl.domElement.addEventListener("pointerup", handleGlobalPointerUp);

    return () => {
      gl.domElement.removeEventListener("pointermove", handleGlobalPointerMove);
      gl.domElement.removeEventListener("pointerup", handleGlobalPointerUp);
    };
  }, [isDragging, extrudeDistance, onExtrude, gl, camera, orbitControlsRef]);

  const handlePointerMove = (e) => {
    if (!isDragging || !startPointRef.current || !faceDataRef.current) return;
    e.stopPropagation();

    const { normal } = faceDataRef.current;

    const currentPoint = e.point || new THREE.Vector3();
    const delta = new THREE.Vector3().subVectors(
      currentPoint,
      startPointRef.current
    );
    const distance = delta.dot(normal);

    setExtrudeDistance(distance);
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    e.stopPropagation();

    setIsDragging(false);
    gl.domElement.style.cursor = "auto";

    if (Math.abs(extrudeDistance) > 0.01) {
      onExtrude(extrudeDistance);
    }

    setExtrudeDistance(0);
  };

  if (!faceDataRef.current) return null;

  const { center, normal } = faceDataRef.current;
  const handlePosition = center
    .clone()
    .add(normal.clone().multiplyScalar(0.5 + extrudeDistance));

  return (
    <group>
      <mesh position={handlePosition}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
        <meshBasicMaterial color="#4a9cff" />
      </mesh>

      <mesh
        position={handlePosition
          .clone()
          .add(normal.clone().multiplyScalar(0.2))}
      >
        <coneGeometry args={[0.08, 0.15, 8]} />
        <meshBasicMaterial color="#4a9cff" />
        <group rotation={[Math.PI / 2, 0, 0]} />
      </mesh>

      <mesh
        position={handlePosition
          .clone()
          .add(normal.clone().multiplyScalar(-0.2))}
      >
        <coneGeometry args={[0.08, 0.15, 8]} />
        <meshBasicMaterial color="#ff6b6b" />
        <group rotation={[-Math.PI / 2, 0, 0]} />
      </mesh>

      <mesh
        position={handlePosition}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={(e) => {
          handlePointerUp(e);
          setIsHovering(false);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setIsHovering(true);
          gl.domElement.style.cursor = "grab";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setIsHovering(false);
          if (!isDragging) {
            gl.domElement.style.cursor = "crosshair";
          }
        }}
      >
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial
          transparent
          opacity={isHovering || isDragging ? 0.2 : 0}
          color="#4a9cff"
          depthTest={false}
        />
      </mesh>

      {isDragging && Math.abs(extrudeDistance) > 0.01 && (
        <Html position={handlePosition.toArray()}>
          <div
            style={{
              background: "rgba(0, 0, 0, 0.8)",
              color: extrudeDistance > 0 ? "#4a9cff" : "#ff6b6b",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "bold",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              transform: "translate(-50%, -120%)",
            }}
          >
            {extrudeDistance > 0 ? "+" : "-"}{" "}
            {Math.abs(extrudeDistance).toFixed(2)}
          </div>
        </Html>
      )}

      {!isDragging && (
        <Html position={handlePosition.toArray()}>
          <div
            style={{
              background: "rgba(0, 0, 0, 0.7)",
              color: "#fff",
              padding: "6px 10px",
              borderRadius: "4px",
              fontSize: "11px",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              transform: "translate(-50%, -150%)",
            }}
          >
            Drag to extrude
          </div>
        </Html>
      )}
    </group>
  );
}
