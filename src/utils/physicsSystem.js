import * as THREE from "three";
import { getBoundingBox, checkCollision } from "./collisionDetection";

/**
 * Lightweight Physics / Collision Layer
 * -------------------------------------
 * Goals:
 * 1. Prevent habitat modules (and any CADObject meshes) from overlapping on spawn or during transforms.
 * 2. Provide a broad‑phase accelerator (spatial hash) so we don't always brute force every object.
 * 3. Offer a simple API (addBody, removeBody, updateBody, getPotentialColliders, resolveInitialOverlap).
 * 4. Remain deterministic & frame‑friendly (no impulses, just positional correction like typical CAD editors).
 *
 * This is NOT a full physics engine (no dynamics / rigid bodies / inertia). It mirrors how many level editors
 * and simplified CAD tools implement collision: broad‑phase prune + narrow AABB test + conservative movement
 * clamping handled in the interaction component (CADObject).
 */

class SpatialHash {
  constructor(cellSize = 5) {
    this.cellSize = cellSize;
    this.cells = new Map(); // key -> Set(mesh)
    this.bodyCells = new Map(); // mesh.uuid -> string[] of keys currently occupied
  }

  _hash(x, y, z) {
    return `${x},${y},${z}`;
  }

  _computeCellsForBox(box) {
    if (!box) return [];
    const cs = this.cellSize;
    const minX = Math.floor(box.min.x / cs);
    const minY = Math.floor(box.min.y / cs);
    const minZ = Math.floor(box.min.z / cs);
    const maxX = Math.floor(box.max.x / cs);
    const maxY = Math.floor(box.max.y / cs);
    const maxZ = Math.floor(box.max.z / cs);
    const keys = [];
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          keys.push(this._hash(x, y, z));
        }
      }
    }
    return keys;
  }

  insert(mesh, box) {
    if (!mesh) return;
    const keys = this._computeCellsForBox(box);
    this.bodyCells.set(mesh.uuid, keys);
    keys.forEach((k) => {
      if (!this.cells.has(k)) this.cells.set(k, new Set());
      this.cells.get(k).add(mesh);
    });
  }

  remove(mesh) {
    const keys = this.bodyCells.get(mesh.uuid);
    if (keys) {
      keys.forEach((k) => {
        const cell = this.cells.get(k);
        if (cell) {
          cell.delete(mesh);
          if (cell.size === 0) this.cells.delete(k);
        }
      });
      this.bodyCells.delete(mesh.uuid);
    }
  }

  update(mesh, box) {
    // Early out: if no movement large enough to cross cell boundaries, we could skip.
    this.remove(mesh);
    this.insert(mesh, box);
  }

  query(box, excludeMesh) {
    const keys = this._computeCellsForBox(box);
    const results = new Set();
    keys.forEach((k) => {
      const cell = this.cells.get(k);
      if (cell) {
        cell.forEach((m) => {
          if (m !== excludeMesh) results.add(m);
        });
      }
    });
    return Array.from(results);
  }
}

class PhysicsWorld {
  constructor() {
    this.hash = new SpatialHash(5); // 5m cell size good for habitat scale
    this.bodies = new Set();
  }

  addBody(mesh) {
    if (!mesh || this.bodies.has(mesh)) return;
    this.bodies.add(mesh);
    mesh.updateMatrixWorld(true);
    const box = getBoundingBox(mesh);
    if (box) this.hash.insert(mesh, box);
  }

  removeBody(mesh) {
    if (!mesh || !this.bodies.has(mesh)) return;
    this.hash.remove(mesh);
    this.bodies.delete(mesh);
  }

  updateBody(mesh) {
    if (!mesh || !this.bodies.has(mesh)) return;
    mesh.updateMatrixWorld(true);
    const box = getBoundingBox(mesh);
    if (box) this.hash.update(mesh, box);
  }

  getPotentialColliders(mesh) {
    if (!mesh) return [];
    mesh.updateMatrixWorld(true);
    const box = getBoundingBox(mesh);
    if (!box) return [];
    return this.hash.query(box, mesh);
  }

  // Similar but for a hypothetical position (used for spawn probing)
  getPotentialCollidersAtPosition(mesh, position) {
    if (!mesh) return [];
    const original = mesh.position.clone();
    mesh.position.copy(position);
    mesh.updateMatrixWorld(true);
    const box = getBoundingBox(mesh);
    mesh.position.copy(original);
    mesh.updateMatrixWorld(true);
    if (!box) return [];
    return this.hash.query(box, mesh);
  }

  // Try to resolve initial overlap by searching outward in a spiral on XZ plane.
  resolveInitialOverlap(mesh, maxRadius = 50, step = 1.5) {
    if (!mesh) return;
    // Quick check: if no collision, nothing to do
    if (!this.isOverlapping(mesh)) return;

    const start = mesh.position.clone();
    const directions = [];
    // Generate spiral (square spiral pattern)
    for (let r = step; r <= maxRadius; r += step) {
      for (let dx = -r; dx <= r; dx += step) {
        directions.push(new THREE.Vector3(dx, 0, -r));
        directions.push(new THREE.Vector3(dx, 0, r));
      }
      for (let dz = -r + step; dz <= r - step; dz += step) {
        directions.push(new THREE.Vector3(-r, 0, dz));
        directions.push(new THREE.Vector3(r, 0, dz));
      }
      // Test each candidate radius layer before expanding
      for (const offset of directions) {
        const testPos = start.clone().add(offset);
        const potentials = this.getPotentialCollidersAtPosition(mesh, testPos);
        const collision = checkCollision(mesh, testPos, potentials);
        if (!collision) {
          mesh.position.copy(testPos);
          mesh.updateMatrixWorld(true);
          this.updateBody(mesh);
          return true;
        }
      }
      directions.length = 0; // reset layer buffer
    }
    return false; // Failed to find free spot (very unlikely unless space saturated)
  }

  isOverlapping(mesh) {
    const potentials = this.getPotentialColliders(mesh);
    const collision = checkCollision(mesh, mesh.position.clone(), potentials);
    return !!collision;
  }
}

// Export a singleton instance (sufficient for this app scope)
export const physicsWorld = new PhysicsWorld();

// Helper for external systems (e.g., after parameter change)
export function notifyGeometryChanged(mesh) {
  physicsWorld.updateBody(mesh);
}

/**
 * Find a free spawn position for a new geometry near a preferred point (default origin)
 * Uses radial search on XZ plane expanding outward until a non-overlapping spot found.
 * @param {THREE.BufferGeometry} geometry
 * @param {THREE.Vector3} preferredPosition
 * @param {number} maxRadius
 * @returns {THREE.Vector3}
 */
export function findFreeSpawnPosition(
  geometry,
  preferredPosition = new THREE.Vector3(0, 0, 0),
  maxRadius = 100
) {
  if (!geometry.boundingSphere) geometry.computeBoundingSphere();
  const r = geometry.boundingSphere ? geometry.boundingSphere.radius : 1;
  const spacing = r * 0.2 + 0.25; // small clearance margin
  const testMesh = new THREE.Mesh(geometry); // ephemeral test mesh (not added to scene)
  testMesh.updateMatrixWorld(true);

  // First try preferred position
  let potentials = physicsWorld.getPotentialCollidersAtPosition(
    testMesh,
    preferredPosition
  );
  if (!checkCollision(testMesh, preferredPosition.clone(), potentials)) {
    return preferredPosition.clone();
  }

  for (
    let radiusLayer = r + spacing;
    radiusLayer <= maxRadius;
    radiusLayer += r * 1.5 + spacing
  ) {
    const circumference = 2 * Math.PI * radiusLayer;
    const steps = Math.max(6, Math.floor(circumference / (r * 1.2)));
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const candidate = new THREE.Vector3(
        preferredPosition.x + Math.cos(angle) * radiusLayer,
        preferredPosition.y,
        preferredPosition.z + Math.sin(angle) * radiusLayer
      );
      potentials = physicsWorld.getPotentialCollidersAtPosition(
        testMesh,
        candidate
      );
      if (!checkCollision(testMesh, candidate.clone(), potentials)) {
        return candidate;
      }
    }
  }
  // Fallback: preferred position (will later be resolved by overlap resolver)
  return preferredPosition.clone();
}
