import * as THREE from "three";

/**
 * Procedural Geometry Generators for Habitat Modules
 * These create parametric shapes that can be scaled independently
 */

/**
 * Generate a rigid cylindrical module
 * @param {Object} params - { diameter, length, segments, withEndCaps }
 */
export function generateRigidCylinder({
  diameter = 4,
  length = 8,
  segments = 32,
}) {
  const radius = diameter / 2;
  const geometry = new THREE.CylinderGeometry(
    radius,
    radius,
    length,
    segments,
    1,
    false // Always keep endcaps for proper rendering
  );

  // Rotate to align with Z-axis (Three.js cylinders default to Y-axis)
  geometry.rotateX(Math.PI / 2);

  // Compute normals for proper rendering
  geometry.computeVertexNormals();

  // Add attachment point data to geometry
  geometry.userData.attachmentPoints = [
    {
      name: "front",
      position: new THREE.Vector3(0, 0, length / 2),
      normal: new THREE.Vector3(0, 0, 1),
      diameter,
    },
    {
      name: "back",
      position: new THREE.Vector3(0, 0, -length / 2),
      normal: new THREE.Vector3(0, 0, -1),
      diameter,
    },
  ];

  geometry.userData.moduleType = "rigid-cylinder";
  geometry.userData.dimensions = { diameter, length };

  return geometry;
}

/**
 * Generate an inflatable cylindrical module (BEAM-style)
 * @param {Object} params - { diameter, length, segments }
 */
export function generateInflatableCylinder({
  diameter = 6,
  length = 10,
  segments = 32,
}) {
  const radius = diameter / 2;

  // Create slightly bulged profile for inflatable appearance
  const shape = new THREE.Shape();
  const bulgeFactor = 0.05; // 5% bulge

  // Create bulged profile using quadratic curves
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = t * Math.PI * 2;
    const bulgeMult = 1 + bulgeFactor * Math.sin(t * Math.PI); // Bulge in middle
    const r = radius * bulgeMult;
    points.push(new THREE.Vector2(r * Math.cos(angle), r * Math.sin(angle)));
  }

  shape.setFromPoints(points);

  const extrudeSettings = {
    steps: Math.floor(length * 4),
    depth: length,
    bevelEnabled: false,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

  // Center and align
  geometry.translate(0, 0, -length / 2);
  geometry.rotateX(Math.PI / 2);

  // Add attachment points
  geometry.userData.attachmentPoints = [
    {
      name: "front",
      position: new THREE.Vector3(0, 0, length / 2),
      normal: new THREE.Vector3(0, 0, 1),
      diameter,
    },
    {
      name: "back",
      position: new THREE.Vector3(0, 0, -length / 2),
      normal: new THREE.Vector3(0, 0, -1),
      diameter,
    },
  ];

  geometry.userData.moduleType = "inflatable-cylinder";
  geometry.userData.dimensions = { diameter, length };

  return geometry;
}

/**
 * Generate a hemispherical dome module
 * @param {Object} params - { radius, segments, height }
 */
export function generateDome({
  radius = 4,
  segments = 32,
  heightRatio = 1.0, // 1.0 = full hemisphere, 0.5 = shallow dome
}) {
  const geometry = new THREE.SphereGeometry(
    radius,
    segments,
    segments,
    0, // phiStart
    Math.PI * 2, // phiLength (full circle)
    0, // thetaStart
    (Math.PI / 2) * heightRatio // thetaLength (hemisphere)
  );

  // Position so base is at origin
  geometry.translate(0, 0, 0);

  // Add attachment point at base
  geometry.userData.attachmentPoints = [
    {
      name: "base",
      position: new THREE.Vector3(0, 0, 0),
      normal: new THREE.Vector3(0, 0, -1),
    },
  ];

  geometry.userData.moduleType = "dome";
  geometry.userData.dimensions = { radius, heightRatio };

  return geometry;
}

/**
 * Generate a simple tunnel/corridor module
 * @param {Object} params - { diameter, length, segments }
 */
export function generateTunnel({ diameter = 2, length = 4, segments = 24 }) {
  const radius = diameter / 2;
  const geometry = new THREE.CylinderGeometry(
    radius,
    radius,
    length,
    segments,
    1,
    false // Keep closed for proper rendering
  );

  geometry.rotateX(Math.PI / 2);

  // Compute normals for proper rendering
  geometry.computeVertexNormals();

  geometry.userData.attachmentPoints = [
    {
      name: "front",
      position: new THREE.Vector3(0, 0, length / 2),
      normal: new THREE.Vector3(0, 0, 1),
      diameter,
    },
    {
      name: "back",
      position: new THREE.Vector3(0, 0, -length / 2),
      normal: new THREE.Vector3(0, 0, -1),
      diameter,
    },
  ];

  geometry.userData.moduleType = "tunnel";
  geometry.userData.dimensions = { diameter, length };

  return geometry;
}

/**
 * Generate a multi-level cylindrical module (with floors)
 * @param {Object} params - { diameter, length, levels, segments }
 */
export function generateMultiLevelCylinder({
  diameter = 6,
  length = 12,
  levels = 2,
  segments = 32,
}) {
  const radius = diameter / 2;

  // Create outer cylinder
  const outerGeometry = new THREE.CylinderGeometry(
    radius,
    radius,
    length,
    segments,
    1,
    false
  );

  outerGeometry.rotateX(Math.PI / 2);

  // Note: Floor planes would require BufferGeometryUtils.mergeGeometries
  // which is not available in the basic Three.js build.
  // For now, just return the outer cylinder.
  // Floors can be added as separate objects if needed.

  outerGeometry.userData.attachmentPoints = [
    {
      name: "front",
      position: new THREE.Vector3(0, 0, length / 2),
      normal: new THREE.Vector3(0, 0, 1),
    },
    {
      name: "back",
      position: new THREE.Vector3(0, 0, -length / 2),
      normal: new THREE.Vector3(0, 0, -1),
    },
  ];

  outerGeometry.userData.moduleType = "multi-level-cylinder";
  outerGeometry.userData.dimensions = { diameter, length, levels };

  return outerGeometry;
}

/**
 * Generate a simple docking collar/port
 * @param {Object} params - { diameter, depth, segments }
 */
export function generateDockingPort({
  diameter = 1.2,
  depth = 0.3,
  segments = 16,
}) {
  const radius = diameter / 2;

  // Create collar ring
  const ringGeometry = new THREE.CylinderGeometry(
    radius,
    radius * 0.9,
    depth,
    segments
  );

  ringGeometry.rotateX(Math.PI / 2);

  ringGeometry.userData.attachmentPoints = [
    {
      name: "outer",
      position: new THREE.Vector3(0, 0, depth / 2),
      normal: new THREE.Vector3(0, 0, 1),
    },
    {
      name: "inner",
      position: new THREE.Vector3(0, 0, -depth / 2),
      normal: new THREE.Vector3(0, 0, -1),
    },
  ];

  ringGeometry.userData.moduleType = "docking-port";
  ringGeometry.userData.dimensions = { diameter, depth };

  return ringGeometry;
}

/**
 * Generate a conical adapter (for connecting different sized modules)
 * @param {Object} params - { diameterStart, diameterEnd, length, segments }
 */
export function generateAdapter({
  diameterStart = 4,
  diameterEnd = 2,
  length = 2,
  segments = 32,
}) {
  const geometry = new THREE.CylinderGeometry(
    diameterEnd / 2,
    diameterStart / 2,
    length,
    segments
  );

  geometry.rotateX(Math.PI / 2);

  geometry.userData.attachmentPoints = [
    {
      name: "large",
      position: new THREE.Vector3(0, 0, -length / 2),
      normal: new THREE.Vector3(0, 0, -1),
      diameter: diameterStart,
    },
    {
      name: "small",
      position: new THREE.Vector3(0, 0, length / 2),
      normal: new THREE.Vector3(0, 0, 1),
      diameter: diameterEnd,
    },
  ];

  geometry.userData.moduleType = "adapter";
  geometry.userData.dimensions = { diameterStart, diameterEnd, length };

  return geometry;
}

/**
 * Generate attachment point visualization (small sphere)
 */
export function generateAttachmentMarker(radius = 0.15) {
  const geometry = new THREE.SphereGeometry(radius, 16, 16);
  return geometry;
}

/**
 * Helper: Create material for module type
 */
export function getModuleMaterial(moduleType) {
  const materials = {
    "rigid-cylinder": new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.6,
      roughness: 0.4,
      side: THREE.DoubleSide,
    }),
    "inflatable-cylinder": new THREE.MeshStandardMaterial({
      color: 0xf0f0e8,
      metalness: 0.1,
      roughness: 0.8,
      side: THREE.DoubleSide,
    }),
    dome: new THREE.MeshStandardMaterial({
      color: 0xe0e0e0,
      metalness: 0.3,
      roughness: 0.6,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    }),
    tunnel: new THREE.MeshStandardMaterial({
      color: 0xaaaaaa,
      metalness: 0.7,
      roughness: 0.3,
      side: THREE.DoubleSide,
    }),
    "multi-level-cylinder": new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      metalness: 0.5,
      roughness: 0.5,
      side: THREE.DoubleSide,
    }),
    "docking-port": new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.8,
      roughness: 0.2,
      side: THREE.DoubleSide,
    }),
    adapter: new THREE.MeshStandardMaterial({
      color: 0xbbbbbb,
      metalness: 0.6,
      roughness: 0.4,
      side: THREE.DoubleSide,
    }),
  };

  return materials[moduleType] || materials["rigid-cylinder"];
}
