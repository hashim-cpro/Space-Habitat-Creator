/**
 * Zone Transform Controls
 * Allows moving, rotating, and scaling zones with visual handles
 */

import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import * as THREE from "three";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";

function ZoneTransformControls({
  scene,
  camera,
  renderer,
  selectedZone,
  zoneMeshesMap,
  orbitControls,
  onZoneTransform,
}) {
  const transformControlsRef = useRef(null);

  useEffect(() => {
    if (!scene || !camera || !renderer || !selectedZone) {
      // Remove controls if no selection
      if (transformControlsRef.current) {
        scene.remove(transformControlsRef.current);
        transformControlsRef.current.dispose();
        transformControlsRef.current = null;
      }
      return;
    }

    // Get the mesh for the selected zone
    const zoneMesh = zoneMeshesMap.get(selectedZone.id);
    if (!zoneMesh) return;

    // Create transform controls if they don't exist
    if (!transformControlsRef.current) {
      const controls = new TransformControls(camera, renderer.domElement);

      // Start in translate mode
      controls.setMode("translate");
      controls.setSize(0.8);
      controls.setSpace("world");

      // Handle transform events
      controls.addEventListener("dragging-changed", (event) => {
        if (orbitControls) {
          orbitControls.enabled = !event.value;
        }
      });

      controls.addEventListener("objectChange", () => {
        if (onZoneTransform && zoneMesh) {
          // Get updated transform
          const position = zoneMesh.position.toArray();
          const rotation = zoneMesh.rotation.toArray().slice(0, 3);
          const scale = zoneMesh.scale.toArray();

          onZoneTransform({
            zoneId: selectedZone.id,
            position,
            rotation,
            scale,
          });
        }
      });

      scene.add(controls);
      transformControlsRef.current = controls;
    }

    // Attach to the selected zone mesh
    transformControlsRef.current.attach(zoneMesh);

    // Cleanup
    return () => {
      if (transformControlsRef.current) {
        transformControlsRef.current.detach();
      }
    };
  }, [
    scene,
    camera,
    renderer,
    selectedZone,
    zoneMeshesMap,
    orbitControls,
    onZoneTransform,
  ]);

  // Keyboard shortcuts for switching modes
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!transformControlsRef.current || !selectedZone) return;

      switch (event.key.toLowerCase()) {
        case "g": // Move (Grab)
          transformControlsRef.current.setMode("translate");
          break;
        case "r": // Rotate
          transformControlsRef.current.setMode("rotate");
          break;
        case "s": // Scale
          transformControlsRef.current.setMode("scale");
          break;
        case "escape":
          // Deselect
          if (transformControlsRef.current) {
            transformControlsRef.current.detach();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [selectedZone]);

  // This component doesn't render anything visible itself
  return null;
}

ZoneTransformControls.propTypes = {
  scene: PropTypes.object,
  camera: PropTypes.object,
  renderer: PropTypes.object,
  selectedZone: PropTypes.object,
  zoneMeshesMap: PropTypes.instanceOf(Map),
  orbitControls: PropTypes.object,
  onZoneTransform: PropTypes.func,
};

export default ZoneTransformControls;
