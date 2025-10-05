/**
 * Geometry utilities for cylindrical habitat interiors
 * Handles conversions between 3D cylinder coordinates and 2D floor plans
 */

import * as THREE from "three";

/**
 * Convert 3D cylindrical position to 2D unwrapped coordinates
 * @param {number} x - 3D X position
 * @param {number} z - 3D Z position
 * @param {number} radius - Cylinder radius
 * @returns {Object} - {x: arc_length, y: height}
 */
export function cylinderTo2DUnwrapped(x, z, radius) {
  // Calculate angle from center
  const angle = Math.atan2(z, x);
  // Normalize to 0 to 2π
  const normalizedAngle = angle < 0 ? angle + Math.PI * 2 : angle;
  // Arc length along cylinder
  const arcLength = normalizedAngle * radius;

  return {
    x: arcLength,
    angle: normalizedAngle,
  };
}

/**
 * Convert 2D unwrapped coordinates to 3D cylindrical position
 * @param {number} x2D - Arc length along cylinder
 * @param {number} radius - Cylinder radius
 * @returns {Object} - {x, z}
 */
export function unwrapped2DToCylinder(x2D, radius) {
  const angle = x2D / radius;
  return {
    x: radius * Math.cos(angle),
    z: radius * Math.sin(angle),
    angle: angle,
  };
}

/**
 * Convert 3D position to polar coordinates (angle, radius from center)
 * @param {number} x - 3D X position
 * @param {number} z - 3D Z position
 * @returns {Object} - {angle, radius}
 */
export function cartesianToPolar(x, z) {
  const radius = Math.sqrt(x * x + z * z);
  let angle = Math.atan2(z, x);
  // Normalize to 0 to 2π
  if (angle < 0) angle += Math.PI * 2;

  return { angle, radius };
}

/**
 * Convert polar coordinates to Cartesian
 * @param {number} angle - Angle in radians (0 to 2π)
 * @param {number} radius - Distance from center
 * @returns {Object} - {x, z}
 */
export function polarToCartesian(angle, radius) {
  return {
    x: radius * Math.cos(angle),
    z: radius * Math.sin(angle),
  };
}

/**
 * Calculate the area of a room segment in cylindrical habitat
 * @param {Object} bounds - {angleStart, angleEnd, radiusInner, radiusOuter}
 * @returns {number} - Area in square meters
 */
export function calculateSegmentArea(bounds) {
  const { angleStart, angleEnd, radiusInner, radiusOuter } = bounds;
  const angleSpan = angleEnd - angleStart;

  // Area of annular sector: (1/2) * angleSpan * (r_outer² - r_inner²)
  const outerArea = 0.5 * angleSpan * radiusOuter * radiusOuter;
  const innerArea = 0.5 * angleSpan * radiusInner * radiusInner;

  return outerArea - innerArea;
}

/**
 * Calculate volume of a room segment
 * @param {Object} bounds - Room bounds with height info
 * @returns {number} - Volume in cubic meters
 */
export function calculateSegmentVolume(bounds) {
  const area = calculateSegmentArea(bounds);
  const height = bounds.heightEnd - bounds.heightStart;
  return area * height;
}

/**
 * Check if a point is inside a cylindrical segment
 * @param {Object} point - {x, z} position
 * @param {Object} bounds - Segment bounds
 * @returns {boolean}
 */
export function isPointInSegment(point, bounds) {
  const { angle, radius } = cartesianToPolar(point.x, point.z);

  // Check radial bounds
  if (radius < bounds.radiusInner || radius > bounds.radiusOuter) {
    return false;
  }

  // Check angular bounds (handle wraparound at 2π)
  let { angleStart, angleEnd } = bounds;

  // Normalize angles
  if (angleEnd < angleStart) angleEnd += Math.PI * 2;
  let testAngle = angle;
  if (testAngle < angleStart) testAngle += Math.PI * 2;

  return testAngle >= angleStart && testAngle <= angleEnd;
}

/**
 * Check collision between two room segments
 * @param {Object} bounds1 - First room bounds
 * @param {Object} bounds2 - Second room bounds
 * @returns {boolean} - True if rooms overlap
 */
export function checkSegmentCollision(bounds1, bounds2) {
  // Check height overlap
  if (
    bounds1.heightEnd <= bounds2.heightStart ||
    bounds2.heightEnd <= bounds1.heightStart
  ) {
    return false;
  }

  // Check radial overlap
  if (
    bounds1.radiusOuter <= bounds2.radiusInner ||
    bounds2.radiusOuter <= bounds1.radiusInner
  ) {
    return false;
  }

  // Check angular overlap
  const angle1Start = bounds1.angleStart;
  const angle1End = bounds1.angleEnd;
  const angle2Start = bounds2.angleStart;
  const angle2End = bounds2.angleEnd;

  // Normalize angles to handle wraparound
  const normalizeAngle = (a) => (a < 0 ? a + Math.PI * 2 : a) % (Math.PI * 2);

  const a1s = normalizeAngle(angle1Start);
  const a1e = normalizeAngle(angle1End);
  const a2s = normalizeAngle(angle2Start);
  const a2e = normalizeAngle(angle2End);

  // Check for angular overlap
  if (a1e < a1s) {
    // Segment 1 wraps around 0
    return a2s <= a1e || a2e >= a1s || (a2s >= a1s && a2e <= a1e + Math.PI * 2);
  }
  if (a2e < a2s) {
    // Segment 2 wraps around 0
    return a1s <= a2e || a1e >= a2s || (a1s >= a2s && a1e <= a2e + Math.PI * 2);
  }

  // Neither wraps
  return !(a1e <= a2s || a2e <= a1s);
}

/**
 * Generate a pie-slice room segment
 * @param {number} centerAngle - Center angle of slice (radians)
 * @param {number} angleSpan - Width of slice (radians)
 * @param {number} radiusInner - Inner radius
 * @param {number} radiusOuter - Outer radius
 * @param {number} heightStart - Floor height
 * @param {number} heightEnd - Ceiling height
 * @returns {Object} - Room bounds
 */
export function createPieSliceSegment(
  centerAngle,
  angleSpan,
  radiusInner,
  radiusOuter,
  heightStart,
  heightEnd
) {
  const halfSpan = angleSpan / 2;
  return {
    angleStart: centerAngle - halfSpan,
    angleEnd: centerAngle + halfSpan,
    radiusInner,
    radiusOuter,
    heightStart,
    heightEnd,
  };
}

/**
 * Generate a rectangular room positioned in cylinder
 * @param {number} centerAngle - Angle to center of room
 * @param {number} width - Room width (tangential)
 * @param {number} depth - Room depth (radial)
 * @param {number} radius - Distance from cylinder center
 * @param {number} heightStart - Floor height
 * @param {number} heightEnd - Ceiling height
 * @returns {Object} - Room bounds
 */
export function createRectangularSegment(
  centerAngle,
  width,
  depth,
  radius,
  heightStart,
  heightEnd
) {
  // Convert width to angular span at this radius
  const angleSpan = width / radius;
  const halfSpan = angleSpan / 2;

  return {
    angleStart: centerAngle - halfSpan,
    angleEnd: centerAngle + halfSpan,
    radiusInner: radius - depth / 2,
    radiusOuter: radius + depth / 2,
    heightStart,
    heightEnd,
  };
}

/**
 * Generate 3D mesh geometry for a cylindrical room segment
 * @param {Object} bounds - Room bounds
 * @param {number} segments - Number of subdivisions for curved surfaces
 * @returns {THREE.BufferGeometry}
 */
export function createSegmentGeometry(bounds, segments = 16) {
  const {
    angleStart,
    angleEnd,
    radiusInner,
    radiusOuter,
    heightStart,
    heightEnd,
  } = bounds;

  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const indices = [];

  const angleStep = (angleEnd - angleStart) / segments;
  const height = heightEnd - heightStart;

  // Generate vertices
  for (let i = 0; i <= segments; i++) {
    const angle = angleStart + i * angleStep;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // Inner ring, bottom
    vertices.push(radiusInner * cos, heightStart, radiusInner * sin);
    // Inner ring, top
    vertices.push(radiusInner * cos, heightEnd, radiusInner * sin);
    // Outer ring, bottom
    vertices.push(radiusOuter * cos, heightStart, radiusOuter * sin);
    // Outer ring, top
    vertices.push(radiusOuter * cos, heightEnd, radiusOuter * sin);
  }

  // Generate faces
  for (let i = 0; i < segments; i++) {
    const base = i * 4;
    const next = (i + 1) * 4;

    // Inner wall
    indices.push(base, base + 1, next + 1);
    indices.push(base, next + 1, next);

    // Outer wall
    indices.push(base + 2, next + 2, next + 3);
    indices.push(base + 2, next + 3, base + 3);

    // Bottom face
    indices.push(base, next, next + 2);
    indices.push(base, next + 2, base + 2);

    // Top face
    indices.push(base + 1, base + 3, next + 3);
    indices.push(base + 1, next + 3, next + 1);
  }

  // Side walls
  // Start wall
  indices.push(0, 2, 3);
  indices.push(0, 3, 1);
  // End wall
  const last = segments * 4;
  indices.push(last, last + 1, last + 3);
  indices.push(last, last + 3, last + 2);

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Get the center position of a room segment
 * @param {Object} bounds - Room bounds
 * @returns {Object} - {x, y, z}
 */
export function getSegmentCenter(bounds) {
  const centerAngle = (bounds.angleStart + bounds.angleEnd) / 2;
  const centerRadius = (bounds.radiusInner + bounds.radiusOuter) / 2;
  const centerHeight = (bounds.heightStart + bounds.heightEnd) / 2;

  return {
    x: centerRadius * Math.cos(centerAngle),
    y: centerHeight,
    z: centerRadius * Math.sin(centerAngle),
  };
}

/**
 * Calculate distance between two rooms
 * @param {Object} room1 - First room
 * @param {Object} room2 - Second room
 * @returns {number} - Distance in meters
 */
export function calculateRoomDistance(room1, room2) {
  const center1 = getSegmentCenter(room1.bounds);
  const center2 = getSegmentCenter(room2.bounds);

  const dx = center2.x - center1.x;
  const dy = center2.y - center1.y;
  const dz = center2.z - center1.z;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Find optimal position for new room (avoid collisions)
 * @param {Array} existingRooms - Array of existing room objects
 * @param {Object} newRoomDimensions - Desired room dimensions
 * @param {number} cylinderRadius - Habitat radius
 * @param {number} deckHeight - Deck floor height
 * @returns {Object} - Suggested bounds for new room
 */
export function findOptimalRoomPosition(
  existingRooms,
  newRoomDimensions,
  cylinderRadius,
  deckHeight
) {
  const { width, depth, height } = newRoomDimensions;

  // Try different angles around the cylinder
  const numAttempts = 36; // Try every 10 degrees
  const angleStep = (Math.PI * 2) / numAttempts;

  for (let i = 0; i < numAttempts; i++) {
    const testAngle = i * angleStep;
    const testRadius = cylinderRadius - depth / 2 - 1; // 1m clearance from wall

    const testBounds = createRectangularSegment(
      testAngle,
      width,
      depth,
      testRadius,
      deckHeight,
      deckHeight + height
    );

    // Check for collisions
    let hasCollision = false;
    for (const room of existingRooms) {
      if (checkSegmentCollision(testBounds, room.bounds)) {
        hasCollision = true;
        break;
      }
    }

    if (!hasCollision) {
      return testBounds;
    }
  }

  // If no clear spot found, return a default position (may collide)
  return createRectangularSegment(
    0,
    width,
    depth,
    cylinderRadius - depth / 2 - 1,
    deckHeight,
    deckHeight + height
  );
}

export default {
  cylinderTo2DUnwrapped,
  unwrapped2DToCylinder,
  cartesianToPolar,
  polarToCartesian,
  calculateSegmentArea,
  calculateSegmentVolume,
  isPointInSegment,
  checkSegmentCollision,
  createPieSliceSegment,
  createRectangularSegment,
  createSegmentGeometry,
  getSegmentCenter,
  calculateRoomDistance,
  findOptimalRoomPosition,
};
