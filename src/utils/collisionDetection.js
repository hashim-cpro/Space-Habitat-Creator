import * as THREE from "three";

/**
 * Collision Detection System
 * Prevents objects from overlapping by detecting intersections
 */

/**
 * Get bounding box for an object
 * @param {THREE.Mesh} mesh - The mesh object
 * @returns {THREE.Box3} Bounding box in world space
 */
export function getBoundingBox(mesh) {
  if (!mesh || !mesh.geometry) return null;

  mesh.updateMatrixWorld(true);

  const box = new THREE.Box3();
  box.setFromObject(mesh);

  return box;
}

/**
 * Get bounding sphere for an object
 * @param {THREE.Mesh} mesh - The mesh object
 * @returns {THREE.Sphere} Bounding sphere in world space
 */
export function getBoundingSphere(mesh) {
  if (!mesh || !mesh.geometry) return null;

  mesh.updateMatrixWorld(true);

  const box = new THREE.Box3();
  box.setFromObject(mesh);

  const sphere = new THREE.Sphere();
  box.getBoundingSphere(sphere);

  return sphere;
}

/**
 * Check if two bounding boxes intersect
 * @param {THREE.Box3} box1
 * @param {THREE.Box3} box2
 * @returns {Boolean}
 */
export function boxesIntersect(box1, box2) {
  if (!box1 || !box2) return false;
  return box1.intersectsBox(box2);
}

/**
 * Check if two bounding spheres intersect
 * @param {THREE.Sphere} sphere1
 * @param {THREE.Sphere} sphere2
 * @returns {Boolean}
 */
export function spheresIntersect(sphere1, sphere2) {
  if (!sphere1 || !sphere2) return false;
  return sphere1.intersectsSphere(sphere2);
}

/**
 * Check if a mesh would collide with other objects at a new position
 * @param {THREE.Mesh} mesh - Mesh to check
 * @param {THREE.Vector3} newPosition - Proposed new position
 * @param {Array} otherObjects - Array of other objects to check against
 * @returns {Object|null} Collision info or null if no collision
 */
export function checkCollision(mesh, newPosition, otherObjects) {
  if (!mesh || !mesh.geometry) return null;

  // Store original position
  const originalPos = mesh.position.clone();

  // Temporarily move to new position
  mesh.position.copy(newPosition);
  mesh.updateMatrixWorld(true);

  // Get bounding sphere at new position
  const meshSphere = getBoundingSphere(mesh);

  // Check against all other objects
  let collision = null;

  for (const otherObj of otherObjects) {
    if (!otherObj || otherObj === mesh) continue;

    const otherSphere = getBoundingSphere(otherObj);

    if (otherSphere && spheresIntersect(meshSphere, otherSphere)) {
      // Get more accurate box collision
      const meshBox = getBoundingBox(mesh);
      const otherBox = getBoundingBox(otherObj);

      if (boxesIntersect(meshBox, otherBox)) {
        collision = {
          object: otherObj,
          distance: meshSphere.center.distanceTo(otherSphere.center),
          penetration:
            meshSphere.radius +
            otherSphere.radius -
            meshSphere.center.distanceTo(otherSphere.center),
        };
        break;
      }
    }
  }

  // Restore original position
  mesh.position.copy(originalPos);
  mesh.updateMatrixWorld(true);

  return collision;
}

/**
 * Calculate safe position that doesn't collide with other objects
 * @param {THREE.Mesh} mesh - Mesh to move
 * @param {THREE.Vector3} desiredPosition - Desired position
 * @param {THREE.Vector3} currentPosition - Current position
 * @param {Array} otherObjects - Objects to avoid
 * @returns {THREE.Vector3} Safe position
 */
export function getSafePosition(
  mesh,
  desiredPosition,
  currentPosition,
  otherObjects
) {
  if (!mesh || !mesh.geometry) return desiredPosition.clone();

  // Check if desired position would collide
  const collision = checkCollision(mesh, desiredPosition, otherObjects);

  if (!collision) {
    return desiredPosition.clone();
  }

  // Calculate direction of movement
  const direction = new THREE.Vector3().subVectors(
    desiredPosition,
    currentPosition
  );
  const moveDistance = direction.length();

  if (moveDistance < 0.001) {
    return currentPosition.clone();
  }

  direction.normalize();

  // Binary search for safe position along movement direction
  let safeDistance = 0;
  let unsafeDistance = moveDistance;
  const iterations = 10;

  for (let i = 0; i < iterations; i++) {
    const testDistance = (safeDistance + unsafeDistance) / 2;
    const testPosition = currentPosition
      .clone()
      .add(direction.clone().multiplyScalar(testDistance));

    const testCollision = checkCollision(mesh, testPosition, otherObjects);

    if (testCollision) {
      unsafeDistance = testDistance;
    } else {
      safeDistance = testDistance;
    }
  }

  // Add small margin to prevent surface touching
  const margin = 0.05;
  const finalDistance = Math.max(0, safeDistance - margin);

  return currentPosition
    .clone()
    .add(direction.clone().multiplyScalar(finalDistance));
}

/**
 * Get all meshes from objects array
 * @param {Array} objects - Array of scene objects
 * @param {THREE.Scene} scene - Three.js scene
 * @returns {Array} Array of THREE.Mesh objects
 */
export function getObjectMeshes(objects, scene) {
  const meshes = [];

  objects.forEach((obj) => {
    if (obj.threeObject && obj.threeObject.isMesh) {
      meshes.push(obj.threeObject);
    } else if (obj.id) {
      // Try to find in scene by object ID
      const mesh = scene.getObjectByProperty("userData", { objectId: obj.id });
      if (mesh && mesh.isMesh) {
        meshes.push(mesh);
      }
    }
  });

  return meshes;
}

/**
 * Check if point is inside bounding box (for surface detection)
 * @param {THREE.Vector3} point
 * @param {THREE.Box3} box
 * @returns {Boolean}
 */
export function pointInBox(point, box) {
  if (!box) return false;
  return box.containsPoint(point);
}

/**
 * Get closest point on box surface to a given point
 * @param {THREE.Vector3} point
 * @param {THREE.Box3} box
 * @returns {THREE.Vector3}
 */
export function closestPointOnBox(point, box) {
  if (!box) return point.clone();

  const clampedPoint = new THREE.Vector3(
    Math.max(box.min.x, Math.min(box.max.x, point.x)),
    Math.max(box.min.y, Math.min(box.max.y, point.y)),
    Math.max(box.min.z, Math.min(box.max.z, point.z))
  );

  return clampedPoint;
}

/**
 * Visualize bounding boxes for debugging
 * @param {THREE.Mesh} mesh
 * @param {THREE.Scene} scene
 * @param {Number} color
 */
export function visualizeBoundingBox(mesh, scene, color = 0xff0000) {
  const box = getBoundingBox(mesh);
  if (!box) return;

  const helper = new THREE.Box3Helper(box, color);
  helper.userData.isCollisionDebug = true;
  scene.add(helper);

  return helper;
}

/**
 * Clear all collision debug visuals
 * @param {THREE.Scene} scene
 */
export function clearCollisionDebug(scene) {
  const toRemove = [];
  scene.traverse((child) => {
    if (child.userData?.isCollisionDebug) {
      toRemove.push(child);
    }
  });

  toRemove.forEach((obj) => {
    scene.remove(obj);
    obj.geometry?.dispose();
    obj.material?.dispose();
  });
}
