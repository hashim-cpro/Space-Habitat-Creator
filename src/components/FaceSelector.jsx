import { useRef, useState, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function FaceSelector({
  mesh,
  onFaceSelect,
  selectedFaceIndex,
  enabled,
}) {
  const { raycaster, camera, gl } = useThree();
  const [hoveredFaceIndex, setHoveredFaceIndex] = useState(null);
  const highlightRef = useRef();

  useEffect(() => {
    if (!enabled || !mesh) return;

    const handlePointerMove = (event) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera({ x, y }, camera);
      const intersects = raycaster.intersectObject(mesh, false);

      if (intersects.length > 0) {
        const faceIndex = intersects[0].faceIndex;
        setHoveredFaceIndex(faceIndex);
        gl.domElement.style.cursor = "pointer";
      } else {
        setHoveredFaceIndex(null);
        gl.domElement.style.cursor = "default";
      }
    };

    const handleClick = (event) => {
      if (hoveredFaceIndex !== null) {
        event.stopPropagation();
        event.preventDefault();
        onFaceSelect(hoveredFaceIndex);
      }
    };

    const handlePointerDown = (event) => {
      if (hoveredFaceIndex !== null) {
        event.stopPropagation();
        event.preventDefault();
      }
    };

    const handlePointerUp = (event) => {
      if (hoveredFaceIndex !== null) {
        event.stopPropagation();
        event.preventDefault();
      }
    };

    gl.domElement.addEventListener("pointermove", handlePointerMove);
    gl.domElement.addEventListener("click", handleClick, true); // Use capture phase
    gl.domElement.addEventListener("pointerdown", handlePointerDown, true); // Use capture phase
    gl.domElement.addEventListener("pointerup", handlePointerUp, true); // Use capture phase

    return () => {
      gl.domElement.removeEventListener("pointermove", handlePointerMove);
      gl.domElement.removeEventListener("click", handleClick, true);
      gl.domElement.removeEventListener("pointerdown", handlePointerDown, true);
      gl.domElement.removeEventListener("pointerup", handlePointerUp, true);
      gl.domElement.style.cursor = "default";
    };
  }, [enabled, mesh, hoveredFaceIndex, onFaceSelect, raycaster, camera, gl]);

  // Render face highlight
  if (
    !enabled ||
    !mesh ||
    (hoveredFaceIndex === null && selectedFaceIndex === null)
  ) {
    return null;
  }

  const displayFaceIndex =
    selectedFaceIndex !== null ? selectedFaceIndex : hoveredFaceIndex;

  if (displayFaceIndex === null) return null;

  const geometry = mesh.geometry;
  const index = geometry.index;

  if (!index) return null;

  const i1 = index.getX(displayFaceIndex * 3);
  const i2 = index.getX(displayFaceIndex * 3 + 1);
  const i3 = index.getX(displayFaceIndex * 3 + 2);

  const positionAttribute = geometry.attributes.position;
  const v1 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i1);
  const v2 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i2);
  const v3 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i3);

  // Transform vertices to world space
  v1.applyMatrix4(mesh.matrixWorld);
  v2.applyMatrix4(mesh.matrixWorld);
  v3.applyMatrix4(mesh.matrixWorld);

  const highlightGeometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    v1.x,
    v1.y,
    v1.z,
    v2.x,
    v2.y,
    v2.z,
    v3.x,
    v3.y,
    v3.z,
  ]);
  highlightGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(vertices, 3)
  );

  const color = selectedFaceIndex === displayFaceIndex ? "#00ff00" : "#ffff00";

  return (
    <mesh ref={highlightRef} geometry={highlightGeometry} renderOrder={999}>
      <meshBasicMaterial
        color={color}
        side={THREE.DoubleSide}
        transparent
        opacity={0.3}
        depthTest={false}
      />
    </mesh>
  );
}
