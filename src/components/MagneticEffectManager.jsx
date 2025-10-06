import { useEffect, useRef, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  findClosestAttachmentPoint,
  getAttachmentPoints,
  createMagneticFieldEffect,
  animateMagneticField,
  createSnapGlow,
  createConnectionBolt,
} from "../utils/connectionSystem";

/**
 * MagneticEffectManager - Handles visual effects for magnetic snapping
 * Shows particle rings, glows, and connection bolts when modules snap together
 */
export default function MagneticEffectManager({
  objects,
  selectedObjectIds,
  scene,
}) {
  const magneticParticlesRef = useRef([]);
  const activeEffectsRef = useRef([]);
  const lastSnapPointRef = useRef(null);

  // Clean up effects on unmount
  useEffect(() => {
    return () => {
      // Clean up all magnetic particles
      magneticParticlesRef.current.forEach((particle) => {
        scene.remove(particle);
        particle.geometry?.dispose();
        particle.material?.dispose();
      });
      magneticParticlesRef.current = [];

      // Clean up all active effects
      activeEffectsRef.current.forEach((effect) => {
        scene.remove(effect);
        effect.geometry?.dispose();
        effect.material?.dispose();
      });
      activeEffectsRef.current = [];
    };
  }, [scene]);

  // Animate effects and check for snap points
  useFrame(() => {
    // Find actual mesh objects in the scene for selected IDs
    const selectedMeshes = selectedObjectIds
      .map((id) => scene.getObjectByProperty("userData", { objectId: id }))
      .filter((mesh) => mesh && mesh.isMesh && mesh.userData?.isModule);

    // DEBUG: Log selection status
    if (selectedObjectIds.length > 0 && Math.random() > 0.99) {
      console.log("MagneticEffectManager:", {
        selectedIds: selectedObjectIds.length,
        foundMeshes: selectedMeshes.length,
        isModule: selectedMeshes.map((m) => m.userData?.isModule),
      });
    }

    if (selectedMeshes.length === 0) {
      // Clear all effects when nothing selected
      if (magneticParticlesRef.current.length > 0) {
        magneticParticlesRef.current.forEach((particle) => {
          scene.remove(particle);
          particle.geometry?.dispose();
          particle.material?.dispose();
        });
        magneticParticlesRef.current = [];
        lastSnapPointRef.current = null;
      }
      return;
    }

    // Get all non-selected module meshes from the scene
    const targetModules = objects
      .filter((obj) => !selectedObjectIds.includes(obj.id))
      .map((obj) => scene.getObjectByProperty("userData", { objectId: obj.id }))
      .filter((mesh) => mesh && mesh.isMesh && mesh.userData?.isModule);

    // For each selected module mesh, find closest snap point
    selectedMeshes.forEach((selectedModule) => {
      if (!selectedModule || !selectedModule.userData?.isModule) return;
      const attachmentPoints = getAttachmentPoints(selectedModule);

      attachmentPoints.forEach((sourcePoint) => {
        const closestPoint = findClosestAttachmentPoint(
          sourcePoint.position,
          targetModules,
          selectedModule
        );

        if (closestPoint) {
          const distance = closestPoint.distance;

          // Show magnetic field effect when within INCREASED visual range
          if (distance < 6.0) {
            // Increased from 5.0
            // Check if we need to create new particles for this snap point
            const snapPointKey = `${sourcePoint.module.uuid}_${closestPoint.module.uuid}`;

            // DEBUG: Log effect activation
            if (Math.random() > 0.98) {
              console.log("Visual effects active:", {
                distance: distance.toFixed(2),
                particles: magneticParticlesRef.current.length,
              });
            }

            if (lastSnapPointRef.current !== snapPointKey) {
              // Remove old particles
              magneticParticlesRef.current.forEach((particle) => {
                scene.remove(particle);
                particle.geometry?.dispose();
                particle.material?.dispose();
              });
              magneticParticlesRef.current = [];

              // Create new magnetic field particles - BIGGER and BRIGHTER
              const particles = createMagneticFieldEffect(
                closestPoint.position,
                1.5, // Increased radius from 1.2
                0x00ffff
              );

              particles.forEach((particle) => {
                // Make particles MUCH bigger and brighter
                particle.scale.set(2, 2, 2); // Double the size
                if (particle.material) {
                  particle.material.opacity = 1.0; // Full opacity
                  particle.material.emissiveIntensity = 1.5; // Brighter glow
                }
                scene.add(particle);
              });
              magneticParticlesRef.current = particles;
              lastSnapPointRef.current = snapPointKey;
            }

            // Animate existing particles with MORE dramatic movement
            if (magneticParticlesRef.current.length > 0) {
              animateMagneticField(magneticParticlesRef.current, distance, 6.0);

              // Add extra scaling animation for visibility
              const time = Date.now() / 1000;
              magneticParticlesRef.current.forEach((particle, i) => {
                const intensity = Math.max(0, 1 - distance / 6.0);
                const scale =
                  2 + Math.sin(time * 3 + i * 0.5) * 0.5 * intensity;
                particle.scale.set(scale, scale, scale);
              });
            }

            // Create snap glow MORE FREQUENTLY when close
            if (distance < 2.0 && Math.random() > 0.7) {
              // Increased chance from 0.9
              const glow = createSnapGlow(closestPoint.position, 0x00ffff);
              glow.scale.set(2, 2, 2); // Make glow bigger
              scene.add(glow);
              activeEffectsRef.current.push(glow);
            }

            // Add pulsing ring effect for extra visibility
            if (distance < 3.0 && Math.random() > 0.95) {
              const ringGeo = new THREE.RingGeometry(0.5, 0.8, 32);
              const ringMat = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide,
                emissive: 0x00ffff,
                emissiveIntensity: 2.0,
              });
              const ring = new THREE.Mesh(ringGeo, ringMat);
              ring.position.copy(closestPoint.position);
              ring.lookAt(sourcePoint.position);
              ring.userData.isSnapGlow = true;
              ring.userData.createdAt = Date.now();
              scene.add(ring);
              activeEffectsRef.current.push(ring);
            }
          } else {
            // Clear particles if too far
            if (lastSnapPointRef.current) {
              magneticParticlesRef.current.forEach((particle) => {
                scene.remove(particle);
                particle.geometry?.dispose();
                particle.material?.dispose();
              });
              magneticParticlesRef.current = [];
              lastSnapPointRef.current = null;
            }
          }
        }
      });
    });

    // Clean up old effects (glows and bolts) - slower fade for more visibility
    const now = Date.now();
    activeEffectsRef.current = activeEffectsRef.current.filter((effect) => {
      const age = now - effect.userData.createdAt;

      if (age > 800) {
        // Increased from 500ms to 800ms
        scene.remove(effect);
        effect.geometry?.dispose();
        effect.material?.dispose();
        return false;
      }

      // Slower fade out
      if (effect.material) {
        effect.material.opacity = Math.max(0, 1 - age / 800);
      }

      // Scale up rings as they fade
      if (effect.geometry?.type === "RingGeometry") {
        const scale = 1 + (age / 800) * 2;
        effect.scale.set(scale, scale, scale);
      }

      return true;
    });
  });

  /**
   * Create connection bolt effect when snap happens
   */
  const createSnapEffect = useCallback(
    (point1, point2) => {
      const bolt = createConnectionBolt(point1, point2);
      scene.add(bolt);
      activeEffectsRef.current.push(bolt);

      // Add glow at both connection points
      const glow1 = createSnapGlow(point1, 0x00ff00);
      const glow2 = createSnapGlow(point2, 0x00ff00);
      scene.add(glow1);
      scene.add(glow2);
      activeEffectsRef.current.push(glow1, glow2);
    },
    [scene]
  );

  // Expose createSnapEffect for external use
  useEffect(() => {
    window.__createSnapEffect = createSnapEffect;
    return () => {
      delete window.__createSnapEffect;
    };
  }, [createSnapEffect]);

  return null; // This is a logic-only component
}
