import * as THREE from "three";

/**
 * Connection System - Handles snap-to-connect functionality
 * Manages attachment points, alignment, and visual feedback
 */

const SNAP_DISTANCE = 4.5; // Distance threshold for snapping (meters) - INCREASED for stronger magnetic effect
const ALIGNMENT_TOLERANCE = 0.2; // Angle tolerance for alignment (radians)
const MAGNETIC_STRENGTH = 1.5; // Magnetic pull strength - SIGNIFICANTLY INCREASED for stronger pull
const VISUAL_EFFECT_DISTANCE = 6.0; // Distance to show visual effects

/**
 * Extract attachment points from a module's geometry
 * @param {THREE.Mesh} module - The module mesh
 * @returns {Array} Array of attachment point objects with world positions
 */
export function getAttachmentPoints(module) {
  if (!module.geometry?.userData?.attachmentPoints) {
    return [];
  }

  const points = module.geometry.userData.attachmentPoints;
  const worldPoints = points.map((point) => {
    // Transform local position to world space
    const worldPos = point.position.clone();
    worldPos.applyMatrix4(module.matrixWorld);

    // Transform normal to world space
    const worldNormal = point.normal.clone();
    worldNormal.transformDirection(module.matrixWorld);
    worldNormal.normalize();

    return {
      name: point.name,
      position: worldPos,
      normal: worldNormal,
      module: module,
      localPosition: point.position.clone(),
      localNormal: point.normal.clone(),
    };
  });

  return worldPoints;
}

/**
 * Find all modules in the scene
 * @param {THREE.Scene} scene
 * @returns {Array} Array of module meshes
 */
export function getAllModules(scene) {
  const modules = [];
  scene.traverse((child) => {
    if (child.isMesh && child.userData?.isModule) {
      modules.push(child);
    }
  });
  return modules;
}

/**
 * Find the closest attachment point to a given position
 * @param {THREE.Vector3} position - Position to search from
 * @param {Array} modules - Array of modules to search
 * @param {THREE.Mesh} excludeModule - Module to exclude from search
 * @returns {Object|null} Closest attachment point or null
 */
export function findClosestAttachmentPoint(
  position,
  modules,
  excludeModule = null
) {
  let closest = null;
  let minDistance = SNAP_DISTANCE;

  modules.forEach((module) => {
    if (module === excludeModule) return;

    const points = getAttachmentPoints(module);
    points.forEach((point) => {
      const distance = position.distanceTo(point.position);
      if (distance < minDistance) {
        minDistance = distance;
        closest = {
          ...point,
          distance,
        };
      }
    });
  });

  return closest;
}

/**
 * Check if two attachment points are compatible for connection
 * @param {Object} point1 - First attachment point
 * @param {Object} point2 - Second attachment point
 * @returns {Boolean} True if compatible
 */
export function arePointsCompatible(point1, point2) {
  // Normals should be opposite (facing each other)
  const normalDot = point1.normal.dot(point2.normal);
  const areOpposite = normalDot < -0.8; // Nearly opposite

  // Check if diameters match (if specified)
  const diameter1 = point1.diameter || Infinity;
  const diameter2 = point2.diameter || Infinity;
  const diameterMatch = Math.abs(diameter1 - diameter2) < 0.5;

  return areOpposite && diameterMatch;
}

/**
 * Calculate snap transform for connecting two points
 * @param {Object} sourcePoint - Point on moving module
 * @param {Object} targetPoint - Point on stationary module
 * @returns {Object} { position, quaternion }
 */
export function calculateSnapTransform(sourcePoint, targetPoint) {
  // Calculate position offset
  const offset = new THREE.Vector3().subVectors(
    sourcePoint.localPosition,
    new THREE.Vector3(0, 0, 0)
  );

  const targetPos = targetPoint.position.clone();

  // Calculate rotation to align normals
  const sourceNormal = sourcePoint.localNormal.clone();
  const targetNormal = targetPoint.normal.clone().negate(); // Flip target normal

  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(sourceNormal, targetNormal);

  // Apply rotation to offset
  offset.applyQuaternion(quaternion);

  // Final position
  const position = targetPos.clone().sub(offset);

  return { position, quaternion };
}

/**
 * Snap a module to an attachment point
 * @param {THREE.Mesh} module - Module to snap
 * @param {Object} sourcePoint - Attachment point on module
 * @param {Object} targetPoint - Target attachment point
 */
export function snapModuleToPoint(module, sourcePoint, targetPoint) {
  const transform = calculateSnapTransform(sourcePoint, targetPoint);

  module.position.copy(transform.position);
  module.quaternion.copy(transform.quaternion);
  module.updateMatrixWorld();
}

/**
 * Create a connection between two modules
 * @param {Object} sourcePoint - Attachment point on first module
 * @param {Object} targetPoint - Attachment point on second module
 * @returns {Object} Connection object
 */
export function createConnection(sourcePoint, targetPoint) {
  const connection = {
    id: `${sourcePoint.module.uuid}_${sourcePoint.name}_${targetPoint.module.uuid}_${targetPoint.name}`,
    source: {
      module: sourcePoint.module,
      pointName: sourcePoint.name,
      position: sourcePoint.position.clone(),
    },
    target: {
      module: targetPoint.module,
      pointName: targetPoint.name,
      position: targetPoint.position.clone(),
    },
    timestamp: Date.now(),
  };

  // Store connection in both modules
  if (!sourcePoint.module.userData.connections) {
    sourcePoint.module.userData.connections = [];
  }
  if (!targetPoint.module.userData.connections) {
    targetPoint.module.userData.connections = [];
  }

  sourcePoint.module.userData.connections.push(connection);
  targetPoint.module.userData.connections.push(connection);

  return connection;
}

/**
 * Check if a module has any connections
 * @param {THREE.Mesh} module
 * @returns {Boolean}
 */
export function hasConnections(module) {
  return module.userData.connections && module.userData.connections.length > 0;
}

/**
 * Get all connections for a module
 * @param {THREE.Mesh} module
 * @returns {Array}
 */
export function getModuleConnections(module) {
  return module.userData.connections || [];
}

/**
 * Remove a connection
 * @param {Object} connection
 */
export function removeConnection(connection) {
  const sourceModule = connection.source.module;
  const targetModule = connection.target.module;

  if (sourceModule.userData.connections) {
    sourceModule.userData.connections =
      sourceModule.userData.connections.filter((c) => c.id !== connection.id);
  }

  if (targetModule.userData.connections) {
    targetModule.userData.connections =
      targetModule.userData.connections.filter((c) => c.id !== connection.id);
  }
}

/**
 * Calculate magnetic pull force toward snap point
 * @param {THREE.Vector3} position - Current position
 * @param {THREE.Vector3} targetPosition - Target snap position
 * @param {Number} distance - Distance to target
 * @returns {THREE.Vector3} Force vector
 */
export function calculateMagneticForce(position, targetPosition, distance) {
  if (distance >= SNAP_DISTANCE) return new THREE.Vector3();

  // MUCH stronger pull as distance decreases - exponential curve for dramatic effect
  // Using cubic power for even stronger pull when close
  const normalizedDist = (SNAP_DISTANCE - distance) / SNAP_DISTANCE;
  const strength = MAGNETIC_STRENGTH * Math.pow(normalizedDist, 1.5);

  const force = new THREE.Vector3().subVectors(targetPosition, position);
  force.normalize();
  force.multiplyScalar(strength);

  return force;
}

/**
 * Visual feedback helpers
 */

/**
 * Create attachment point marker (small sphere)
 */
export function createAttachmentMarker(color = 0x00ff00) {
  const geometry = new THREE.SphereGeometry(0.15, 16, 16);
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.6,
  });
  const marker = new THREE.Mesh(geometry, material);
  marker.userData.isAttachmentMarker = true;
  return marker;
}

/**
 * Create connection line visual
 */
export function createConnectionLine(point1, point2, color = 0x00ff00) {
  const geometry = new THREE.BufferGeometry().setFromPoints([
    point1.position,
    point2.position,
  ]);
  const material = new THREE.LineBasicMaterial({
    color,
    linewidth: 2,
    transparent: true,
    opacity: 0.8,
  });
  const line = new THREE.Line(geometry, material);
  line.userData.isConnectionLine = true;
  return line;
}

/**
 * Create snap preview ghost
 */
export function createSnapPreview(module) {
  const ghost = module.clone();
  ghost.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.3,
        wireframe: true,
      });
    }
  });
  ghost.userData.isSnapPreview = true;
  return ghost;
}

/**
 * Create magnetic field effect (particle ring)
 */
export function createMagneticFieldEffect(
  position,
  radius = 1.0,
  color = 0x00ffff
) {
  const particleCount = 24;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.8,
        emissive: color,
        emissiveIntensity: 0.5,
      })
    );

    particle.position.set(
      position.x + Math.cos(angle) * radius,
      position.y,
      position.z + Math.sin(angle) * radius
    );

    particle.userData.isMagneticParticle = true;
    particle.userData.angle = angle;
    particle.userData.baseRadius = radius;
    particle.userData.targetPosition = position.clone();
    particles.push(particle);
  }

  return particles;
}

/**
 * Create snap glow effect
 */
export function createSnapGlow(position, color = 0x00ffff) {
  const geometry = new THREE.SphereGeometry(0.5, 32, 32);
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.6,
    emissive: color,
    emissiveIntensity: 1.0,
  });
  const glow = new THREE.Mesh(geometry, material);
  glow.position.copy(position);
  glow.userData.isSnapGlow = true;
  glow.userData.createdAt = Date.now();
  return glow;
}

/**
 * Animate magnetic field particles
 */
export function animateMagneticField(particles, distance, targetDistance) {
  const pulseAmount = 0.2;

  particles.forEach((particle, i) => {
    if (!particle.userData.isMagneticParticle) return;

    const time = Date.now() / 1000;
    const angle = particle.userData.angle + time;
    const baseRadius = particle.userData.baseRadius;
    const targetPos = particle.userData.targetPosition;

    // Pulse effect based on distance
    const intensity = Math.max(0, 1 - distance / targetDistance);
    const radius =
      baseRadius * (1 + Math.sin(time * 5 + i) * pulseAmount * intensity);

    particle.position.set(
      targetPos.x + Math.cos(angle) * radius,
      targetPos.y + Math.sin(time * 3) * 0.2 * intensity,
      targetPos.z + Math.sin(angle) * radius
    );

    // Fade based on distance
    particle.material.opacity = 0.8 * intensity;
  });
}

/**
 * Create connection bolt effect (visual confirmation)
 */
export function createConnectionBolt(point1, point2) {
  const points = [];
  const segments = 8;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = new THREE.Vector3().lerpVectors(point1, point2, t);

    // Add randomness for lightning effect
    if (i > 0 && i < segments) {
      point.x += (Math.random() - 0.5) * 0.3;
      point.y += (Math.random() - 0.5) * 0.3;
      point.z += (Math.random() - 0.5) * 0.3;
    }

    points.push(point);
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0x00ffff,
    linewidth: 3,
    transparent: true,
    opacity: 1.0,
    emissive: 0x00ffff,
    emissiveIntensity: 1.0,
  });

  const bolt = new THREE.Line(geometry, material);
  bolt.userData.isConnectionBolt = true;
  bolt.userData.createdAt = Date.now();

  return bolt;
}

/**
 * Highlight module on hover
 */
export function highlightModule(module, highlight = true) {
  module.traverse((child) => {
    if (child.isMesh) {
      if (highlight) {
        child.userData.originalMaterial = child.material;
        child.material = child.material.clone();
        child.material.emissive = new THREE.Color(0x00ff00);
        child.material.emissiveIntensity = 0.3;
      } else {
        if (child.userData.originalMaterial) {
          child.material = child.userData.originalMaterial;
          delete child.userData.originalMaterial;
        }
      }
    }
  });
}

/**
 * Show attachment points for a module
 */
export function showAttachmentPoints(module, scene) {
  hideAttachmentPoints(module, scene); // Clear existing

  const points = getAttachmentPoints(module);
  const markers = [];

  points.forEach((point) => {
    const marker = createAttachmentMarker(0x00ff00);
    marker.position.copy(point.position);
    marker.userData.parentModule = module;
    scene.add(marker);
    markers.push(marker);

    // Add direction arrow
    const arrowHelper = new THREE.ArrowHelper(
      point.normal,
      point.position,
      0.5,
      0x00ff00,
      0.2,
      0.1
    );
    arrowHelper.userData.isAttachmentMarker = true;
    arrowHelper.userData.parentModule = module;
    scene.add(arrowHelper);
    markers.push(arrowHelper);
  });

  module.userData.attachmentMarkers = markers;
}

/**
 * Hide attachment points for a module
 */
export function hideAttachmentPoints(module, scene) {
  if (module.userData.attachmentMarkers) {
    module.userData.attachmentMarkers.forEach((marker) => {
      scene.remove(marker);
      marker.geometry?.dispose();
      marker.material?.dispose();
    });
    delete module.userData.attachmentMarkers;
  }
}

/**
 * Clear all visual feedback from scene
 */
export function clearVisualFeedback(scene) {
  const toRemove = [];
  scene.traverse((child) => {
    if (
      child.userData.isAttachmentMarker ||
      child.userData.isConnectionLine ||
      child.userData.isSnapPreview
    ) {
      toRemove.push(child);
    }
  });
  toRemove.forEach((obj) => {
    scene.remove(obj);
    obj.geometry?.dispose();
    obj.material?.dispose();
  });
}
