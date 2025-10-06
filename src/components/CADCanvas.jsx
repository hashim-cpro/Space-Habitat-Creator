import { Canvas, useThree } from "@react-three/fiber";
import { useRef } from "react";
import {
  OrbitControls,
  Grid,
  GizmoHelper,
  GizmoViewcube,
} from "@react-three/drei";
import Scene from "./Scene";
import MagneticEffectManager from "./MagneticEffectManager";
import { useTouchGestures } from "../utils/touchGestures";

function SceneContent({
  objects,
  selectedObjectIds,
  onSelectObject,
  transformMode,
  onTransformObject,
  axisLock,
}) {
  const { scene } = useThree();

  return (
    <>
      <Scene
        objects={objects}
        selectedObjectIds={selectedObjectIds}
        onSelectObject={onSelectObject}
        transformMode={transformMode}
        onTransformObject={onTransformObject}
        axisLock={axisLock}
      />
      <MagneticEffectManager
        objects={objects}
        selectedObjectIds={selectedObjectIds}
        scene={scene}
      />
    </>
  );
}

export default function CADCanvas({
  objects,
  selectedObjectIds,
  onSelectObject,
  transformMode,
  onTransformObject,
  gridSize,
  showGrid,
  axisLock,
}) {
  const orbitControlsRef = useRef();

  useTouchGestures(orbitControlsRef, true);

  return (
    <Canvas
      camera={{ position: [10, 10, 10], fov: 50 }}
      style={{ background: "#1a1a1a" }}
      onPointerMissed={() => onSelectObject(null)}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={0.5} />

      {showGrid && (
        <Grid
          args={[gridSize, gridSize]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#6e6e6e"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#9d4b4b"
          fadeDistance={100}
          fadeStrength={1}
          infiniteGrid
        />
      )}

      <SceneContent
        objects={objects}
        selectedObjectIds={selectedObjectIds}
        onSelectObject={onSelectObject}
        transformMode={transformMode}
        onTransformObject={onTransformObject}
        axisLock={axisLock}
      />

      <OrbitControls ref={orbitControlsRef} makeDefault />

      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewcube />
      </GizmoHelper>
    </Canvas>
  );
}
