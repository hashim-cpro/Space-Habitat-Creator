import * as THREE from "three";
import { getBoundingBox } from "./collisionDetection";

/**
 * Alignment System
 * Provides axis-based center and face alignment suggestions with snapping.
 * We operate in world space using the current world-aligned AABBs (post-rotation boxes from Three.Box3).
 */

export const DEFAULT_ALIGN_THRESHOLD = 0.4; // meters tolerance to trigger snap

/**
 * Compute a single best snap per axis (x,y,z) among other meshes.
 * @param {THREE.Mesh} mesh - moving mesh
 * @param {THREE.Mesh[]} others - other candidate meshes
 * @param {number} threshold - distance within which to consider snapping
 * @returns {Array} snaps [{ axis, type, delta, targetValue, sourcePart, targetPart, diff }]
 */
export function computeAlignmentSnaps(
  mesh,
  others,
  threshold = DEFAULT_ALIGN_THRESHOLD
) {
  const snapsByAxis = { x: null, y: null, z: null };
  const myBox = getBoundingBox(mesh);
  if (!myBox) return [];
  const myCenter = myBox.getCenter(new THREE.Vector3());

  for (const other of others) {
    if (other === mesh) continue;
    const oBox = getBoundingBox(other);
    if (!oBox) continue;
    const oCenter = oBox.getCenter(new THREE.Vector3());

    // For each axis consider center-center, min-min, max-max
    ["x", "y", "z"].forEach((axis) => {
      const candidates = [];
      // center-center
      const centerDiff = Math.abs(myCenter[axis] - oCenter[axis]);
      if (centerDiff < threshold) {
        candidates.push({
          axis,
          type: "center",
          targetValue: oCenter[axis],
          sourceValue: myCenter[axis],
          diff: centerDiff,
          sourcePart: "center",
          targetPart: "center",
        });
      }
      // min-min
      const myMin = myBox.min[axis];
      const myMax = myBox.max[axis];
      const oMin = oBox.min[axis];
      const oMax = oBox.max[axis];
      const minDiff = Math.abs(myMin - oMin);
      if (minDiff < threshold) {
        candidates.push({
          axis,
          type: "flush-min",
          targetValue: oMin,
          sourceValue: myMin,
          diff: minDiff,
          sourcePart: "min",
          targetPart: "min",
        });
      }
      // max-max
      const maxDiff = Math.abs(myMax - oMax);
      if (maxDiff < threshold) {
        candidates.push({
          axis,
          type: "flush-max",
          targetValue: oMax,
          sourceValue: myMax,
          diff: maxDiff,
          sourcePart: "max",
          targetPart: "max",
        });
      }

      // Choose best (smallest diff) for this axis, comparing to existing best
      for (const c of candidates) {
        if (!snapsByAxis[axis] || c.diff < snapsByAxis[axis].diff) {
          // Compute delta required on position axis
          // Need delta on position such that sourceValue becomes targetValue.
          // Change in position equals (targetValue - sourceValue)
          c.delta = c.targetValue - c.sourceValue;
          snapsByAxis[axis] = c;
        }
      }
    });
  }

  return Object.values(snapsByAxis).filter(Boolean);
}

/**
 * Build guide line geometry descriptors for given snaps.
 * We only visualize for chosen snaps (one per axis).
 * @param {THREE.Mesh} mesh
 * @param {Array} snaps
 * @returns {Array<{start:THREE.Vector3,end:THREE.Vector3,color:number}>}
 */
export function buildAlignmentGuideDescriptors(mesh, snaps) {
  const guides = [];
  const box = getBoundingBox(mesh);
  if (!box) return guides;
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  snaps.forEach((snap) => {
    const axis = snap.axis;
    const color = snap.type === "center" ? 0xffd54f : 0x4dd0e1; // yellow for center, cyan for flush
    const start = center.clone();
    const end = center.clone();
    // Extend line length along perpendicular axes for visibility
    const len = Math.max(size.x, size.y, size.z) * 1.2;
    if (axis === "x") {
      start.x = end.x = snap.targetValue;
      start.y -= len / 2;
      end.y += len / 2;
    } else if (axis === "y") {
      start.y = end.y = snap.targetValue;
      start.x -= len / 2;
      end.x += len / 2;
    } else if (axis === "z") {
      start.z = end.z = snap.targetValue;
      start.x -= len / 2;
      end.x += len / 2;
    }
    guides.push({ start, end, color });
  });
  return guides;
}

/**
 * Create a THREE.Line for a guide descriptor
 */
export function createGuideLine(descriptor) {
  const geom = new THREE.BufferGeometry().setFromPoints([
    descriptor.start,
    descriptor.end,
  ]);
  const mat = new THREE.LineBasicMaterial({
    color: descriptor.color,
    linewidth: 2,
    transparent: true,
    opacity: 0.85,
  });
  const line = new THREE.Line(geom, mat);
  line.userData.isAlignmentGuide = true;
  return line;
}

/**
 * Remove existing alignment guides from scene
 */
export function clearAlignmentGuides(scene) {
  const toRemove = [];
  scene.traverse((obj) => {
    if (obj.userData?.isAlignmentGuide) toRemove.push(obj);
  });
  toRemove.forEach((l) => {
    scene.remove(l);
    l.geometry?.dispose();
    l.material?.dispose();
  });
}
