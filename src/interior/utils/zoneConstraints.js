/**
 * Zone Constraints System
 * Handles collision detection, containment, and adaptive fitting for functional zones
 */

import * as THREE from "three";

/**
 * Check if a zone is completely contained within a container shape
 */
export function isZoneContained(zone, containerMesh) {
  if (!containerMesh || !containerMesh.geometry) return false;

  // Get zone corners in world space
  const zoneCorners = getZoneCorners(zone);

  // Check if all corners are inside the container
  const raycaster = new THREE.Raycaster();
  const containerBox = new THREE.Box3().setFromObject(containerMesh);

  for (const corner of zoneCorners) {
    // Quick AABB check first
    if (!containerBox.containsPoint(corner)) {
      return false;
    }

    // For more complex shapes, use raycasting
    if (containerMesh.geometry.type !== "BoxGeometry") {
      const direction = new THREE.Vector3(0, 0, 1);
      raycaster.set(corner, direction);
      const intersects = raycaster.intersectObject(containerMesh, true);
      if (intersects.length === 0) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Get all 8 corners of a zone in world space
 */
export function getZoneCorners(zone) {
  const hw = zone.size.width / 2;
  const hh = zone.size.height / 2;
  const hd = zone.size.depth / 2;

  const corners = [
    new THREE.Vector3(-hw, -hh, -hd),
    new THREE.Vector3(hw, -hh, -hd),
    new THREE.Vector3(-hw, hh, -hd),
    new THREE.Vector3(hw, hh, -hd),
    new THREE.Vector3(-hw, -hh, hd),
    new THREE.Vector3(hw, -hh, hd),
    new THREE.Vector3(-hw, hh, hd),
    new THREE.Vector3(hw, hh, hd),
  ];

  // Apply zone rotation and position
  const matrix = new THREE.Matrix4();
  matrix.makeRotationFromEuler(
    new THREE.Euler(...zone.rotation.map((r) => THREE.MathUtils.degToRad(r)))
  );
  matrix.setPosition(new THREE.Vector3(...zone.position));

  return corners.map((corner) => corner.applyMatrix4(matrix));
}

/**
 * Check if two zones overlap
 */
export function zonesOverlap(zone1, zone2) {
  const box1 = getZoneAABB(zone1);
  const box2 = getZoneAABB(zone2);

  return (
    box1.min.x < box2.max.x &&
    box1.max.x > box2.min.x &&
    box1.min.y < box2.max.y &&
    box1.max.y > box2.min.y &&
    box1.min.z < box2.max.z &&
    box1.max.z > box2.min.z
  );
}

/**
 * Get axis-aligned bounding box for a zone
 */
export function getZoneAABB(zone) {
  const corners = getZoneCorners(zone);
  const box = new THREE.Box3();
  corners.forEach((corner) => box.expandByPoint(corner));
  return box;
}

/**
 * Find a safe position for a zone that doesn't collide with others
 */
export function findSafePosition(
  zone,
  otherZones,
  containerMesh,
  maxAttempts = 50
) {
  const originalPos = [...zone.position];

  // Try the original position first
  if (isValidZonePlacement(zone, otherZones, containerMesh)) {
    return zone.position;
  }

  // Try nearby positions in a spiral pattern
  const step = 0.5; // meters
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const angle = (attempt * Math.PI * 2) / 8; // 8 directions
    const radius = Math.floor(attempt / 8) * step;

    const testZone = {
      ...zone,
      position: [
        originalPos[0] + Math.cos(angle) * radius,
        originalPos[1],
        originalPos[2] + Math.sin(angle) * radius,
      ],
    };

    if (isValidZonePlacement(testZone, otherZones, containerMesh)) {
      return testZone.position;
    }
  }

  // If no safe position found, return original
  return originalPos;
}

/**
 * Check if zone placement is valid (no collisions, within container)
 */
export function isValidZonePlacement(zone, otherZones, containerMesh) {
  // Check containment
  if (containerMesh && !isZoneContained(zone, containerMesh)) {
    return false;
  }

  // Check collisions with other zones
  for (const otherZone of otherZones) {
    if (otherZone.id !== zone.id && zonesOverlap(zone, otherZone)) {
      return false;
    }
  }

  return true;
}

/**
 * Constrain zone position to stay within container
 */
export function constrainToContainer(zone, containerMesh) {
  if (!containerMesh || !containerMesh.geometry) return zone;

  const containerBox = new THREE.Box3().setFromObject(containerMesh);
  const zoneBox = getZoneAABB(zone);

  const constrainedZone = { ...zone };

  // Adjust position if zone exceeds container bounds
  if (zoneBox.min.x < containerBox.min.x) {
    constrainedZone.position[0] += containerBox.min.x - zoneBox.min.x;
  }
  if (zoneBox.max.x > containerBox.max.x) {
    constrainedZone.position[0] -= zoneBox.max.x - containerBox.max.x;
  }
  if (zoneBox.min.y < containerBox.min.y) {
    constrainedZone.position[1] += containerBox.min.y - zoneBox.min.y;
  }
  if (zoneBox.max.y > containerBox.max.y) {
    constrainedZone.position[1] -= zoneBox.max.y - containerBox.max.y;
  }
  if (zoneBox.min.z < containerBox.min.z) {
    constrainedZone.position[2] += containerBox.min.z - zoneBox.min.z;
  }
  if (zoneBox.max.z > containerBox.max.z) {
    constrainedZone.position[2] -= zoneBox.max.z - containerBox.max.z;
  }

  return constrainedZone;
}

/**
 * Adaptively fit zone to container shape
 * Adjusts zone size to maximize space usage while staying within bounds
 */
export function adaptZoneToContainer(zone, containerMesh) {
  if (!containerMesh || !containerMesh.geometry) return zone;

  const containerBox = new THREE.Box3().setFromObject(containerMesh);
  const containerSize = new THREE.Vector3();
  containerBox.getSize(containerSize);

  const adaptedZone = { ...zone };

  // For cylindrical containers, we need special handling
  if (containerMesh.geometry.type === "CylinderGeometry") {
    const params = containerMesh.geometry.parameters;
    const radius = Math.min(params.radiusTop, params.radiusBottom);
    const height = params.height;

    // Calculate distance from center axis
    const distFromCenter = Math.sqrt(
      zone.position[0] * zone.position[0] + zone.position[2] * zone.position[2]
    );

    // Calculate maximum width/depth that fits at this distance from center
    const availableRadius = Math.max(0.5, radius - distFromCenter - 0.5);
    const maxDimension = Math.min(availableRadius * 1.4, radius * 0.8);

    adaptedZone.size.width = Math.min(zone.size.width, maxDimension);
    adaptedZone.size.depth = Math.min(zone.size.depth, maxDimension);
    adaptedZone.size.height = Math.min(zone.size.height, height * 0.85);
  } else {
    // For box containers, ensure zone fits within bounds
    const maxWidth = containerSize.x * 0.85;
    const maxHeight = containerSize.y * 0.85;
    const maxDepth = containerSize.z * 0.85;

    adaptedZone.size.width = Math.min(zone.size.width, maxWidth);
    adaptedZone.size.height = Math.min(zone.size.height, maxHeight);
    adaptedZone.size.depth = Math.min(zone.size.depth, maxDepth);
  }

  // Ensure zone still meets minimum volume after adaptation
  const zoneDef = FUNCTIONAL_ZONES[zone.type];
  if (zoneDef) {
    const volume =
      adaptedZone.size.width * adaptedZone.size.height * adaptedZone.size.depth;
    if (volume < zoneDef.minVolume) {
      const scale = Math.cbrt(zoneDef.minVolume / volume);
      adaptedZone.size.width *= scale;
      adaptedZone.size.height *= scale;
      adaptedZone.size.depth *= scale;
    }
  }

  return adaptedZone;
}

/**
 * Calculate push vector to separate overlapping zones
 */
export function calculateSeparationVector(zone1, zone2) {
  const box1 = getZoneAABB(zone1);
  const box2 = getZoneAABB(zone2);

  const center1 = box1.getCenter(new THREE.Vector3());
  const center2 = box2.getCenter(new THREE.Vector3());

  // Calculate overlap on each axis
  const overlapX = Math.min(box1.max.x - box2.min.x, box2.max.x - box1.min.x);
  const overlapY = Math.min(box1.max.y - box2.min.y, box2.max.y - box1.min.y);
  const overlapZ = Math.min(box1.max.z - box2.min.z, box2.max.z - box1.min.z);

  // Find axis with minimum overlap (easiest separation)
  const minOverlap = Math.min(overlapX, overlapY, overlapZ);

  const separation = new THREE.Vector3();

  if (minOverlap === overlapX) {
    separation.x = center1.x < center2.x ? -overlapX : overlapX;
  } else if (minOverlap === overlapY) {
    separation.y = center1.y < center2.y ? -overlapY : overlapY;
  } else {
    separation.z = center1.z < center2.z ? -overlapZ : overlapZ;
  }

  return separation;
}

/**
 * Resolve all zone collisions by pushing them apart
 */
export function resolveZoneCollisions(zones, maxIterations = 10) {
  let resolved = [...zones];

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let hasCollisions = false;

    for (let i = 0; i < resolved.length; i++) {
      for (let j = i + 1; j < resolved.length; j++) {
        if (zonesOverlap(resolved[i], resolved[j])) {
          hasCollisions = true;

          // Calculate separation vector
          const separation = calculateSeparationVector(
            resolved[i],
            resolved[j]
          );

          // Apply half the separation to each zone
          resolved[i] = {
            ...resolved[i],
            position: [
              resolved[i].position[0] - separation.x / 2,
              resolved[i].position[1] - separation.y / 2,
              resolved[i].position[2] - separation.z / 2,
            ],
          };

          resolved[j] = {
            ...resolved[j],
            position: [
              resolved[j].position[0] + separation.x / 2,
              resolved[j].position[1] + separation.y / 2,
              resolved[j].position[2] + separation.z / 2,
            ],
          };
        }
      }
    }

    if (!hasCollisions) break;
  }

  return resolved;
}

/**
 * Snap zone to nearest alignment guides
 */
export function snapZoneToGrid(zone, gridSize = 0.5) {
  return {
    ...zone,
    position: zone.position.map((p) => Math.round(p / gridSize) * gridSize),
  };
}

/**
 * Get available space around a zone
 */
export function getAvailableSpace(zone, containerMesh) {
  if (!containerMesh) return null;

  const containerBox = new THREE.Box3().setFromObject(containerMesh);
  const zoneBox = getZoneAABB(zone);

  return {
    left: zoneBox.min.x - containerBox.min.x,
    right: containerBox.max.x - zoneBox.max.x,
    bottom: zoneBox.min.y - containerBox.min.y,
    top: containerBox.max.y - zoneBox.max.y,
    front: zoneBox.min.z - containerBox.min.z,
    back: containerBox.max.z - zoneBox.max.z,
  };
}

// Import FUNCTIONAL_ZONES if needed for validation
import { FUNCTIONAL_ZONES } from "./functionalZones.js";

export default {
  isZoneContained,
  getZoneCorners,
  zonesOverlap,
  getZoneAABB,
  findSafePosition,
  isValidZonePlacement,
  constrainToContainer,
  adaptZoneToContainer,
  calculateSeparationVector,
  resolveZoneCollisions,
  snapZoneToGrid,
  getAvailableSpace,
};
