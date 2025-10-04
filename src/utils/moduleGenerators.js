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
    "rounded-box": new THREE.MeshStandardMaterial({
      color: 0xcfd8dc,
      metalness: 0.45,
      roughness: 0.55,
      side: THREE.DoubleSide,
    }),
    "filleted-cylinder": new THREE.MeshStandardMaterial({
      color: 0xd8d8d8,
      metalness: 0.55,
      roughness: 0.35,
      side: THREE.DoubleSide,
    }),
    "hex-prism": new THREE.MeshStandardMaterial({
      color: 0xb0c4de,
      metalness: 0.5,
      roughness: 0.45,
      side: THREE.DoubleSide,
    }),
    "poly-prism": new THREE.MeshStandardMaterial({
      color: 0x9fb7ef,
      metalness: 0.5,
      roughness: 0.5,
      side: THREE.DoubleSide,
    }),
  };

  return materials[moduleType] || materials["rigid-cylinder"];
}

/**
 * Rounded Box (rectangular prism with corner radius) extruded along Z
 * params: { width, height, length, radius, curveSegments }
 * Collisions: geometry centered at origin, long axis Z (-L/2 .. +L/2)
 */
export function generateRoundedBox({
  width = 6,
  height = 4,
  length = 10,
  radius = 0.8,
  curveSegments = 8,
}) {
  const w = width;
  const h = height;
  const maxR = Math.min(radius, w / 2 - 0.01, h / 2 - 0.01);
  const shape = new THREE.Shape();
  const x0 = -w / 2;
  const y0 = -h / 2;
  // Start at bottom-left (after radius)
  shape.moveTo(x0 + maxR, y0);
  shape.lineTo(x0 + w - maxR, y0);
  shape.absarc(x0 + w - maxR, y0 + maxR, maxR, -Math.PI / 2, 0, false);
  shape.lineTo(x0 + w, y0 + h - maxR);
  shape.absarc(x0 + w - maxR, y0 + h - maxR, maxR, 0, Math.PI / 2, false);
  shape.lineTo(x0 + maxR, y0 + h);
  shape.absarc(x0 + maxR, y0 + h - maxR, maxR, Math.PI / 2, Math.PI, false);
  shape.lineTo(x0, y0 + maxR);
  shape.absarc(x0 + maxR, y0 + maxR, maxR, Math.PI, Math.PI * 1.5, false);

  const extrudeSettings = {
    steps: Math.max(1, Math.floor(length * 2)),
    depth: length,
    bevelEnabled: false,
    curveSegments: Math.max(curveSegments, 4),
  };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  // Center along Z
  geometry.translate(0, 0, -length / 2);
  // IMPORTANT: Do NOT rotate – extrude builds along +Z already; keeping consistent with other modules.
  geometry.computeVertexNormals();

  const diameter = Math.max(w, h); // use largest cross dimension for compatibility
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
  geometry.userData.moduleType = "rounded-box";
  geometry.userData.dimensions = { width, height, length, radius: maxR };
  return geometry;
}

/**
 * Filleted (capsule) cylinder along Z
 * params: { diameter, length, fillet, radialSegments, filletSegments }
 * length = straight segment + 2*fillet
 */
export function generateFilletedCylinder({
  diameter = 6,
  length = 12,
  fillet = 1,
  radialSegments = 32,
  filletSegments = 10,
}) {
  const radius = diameter / 2;
  const maxFillet = Math.min(fillet, length / 2 - 0.05, radius);
  const straightHalf = length / 2 - maxFillet;
  if (straightHalf <= 0) {
    // Degenerate -> sphere
    const sphere = new THREE.SphereGeometry(
      radius,
      radialSegments,
      radialSegments
    );
    // Align to Z (already symmetric) – leave as is
    sphere.userData.attachmentPoints = [
      {
        name: "front",
        position: new THREE.Vector3(0, 0, radius),
        normal: new THREE.Vector3(0, 0, 1),
        diameter,
      },
      {
        name: "back",
        position: new THREE.Vector3(0, 0, -radius),
        normal: new THREE.Vector3(0, 0, -1),
        diameter,
      },
    ];
    sphere.userData.moduleType = "filleted-cylinder";
    sphere.userData.dimensions = {
      diameter,
      length: radius * 2,
      fillet: radius,
    };
    return sphere;
  }
  // Build profile in XZ plane for lathe around Z? Easier: build in XY then rotate. We'll build in X/Y with Y vertical, then rotate like cylinders.
  const profile = [];
  // Bottom hemisphere quarter (180 -> 270) mirrored for capsule along Y
  for (let i = 0; i <= filletSegments; i++) {
    const t = i / filletSegments;
    const angle = Math.PI + (Math.PI / 2) * t; // 180 to 270
    profile.push(
      new THREE.Vector2(
        radius * Math.sin(angle),
        -straightHalf - maxFillet * Math.cos(angle)
      )
    );
  }
  // Straight side
  profile.push(new THREE.Vector2(radius, -straightHalf));
  profile.push(new THREE.Vector2(radius, straightHalf));
  // Top hemisphere quarter (0 -> 90)
  for (let i = 0; i <= filletSegments; i++) {
    const t = i / filletSegments;
    const angle = (Math.PI / 2) * t;
    profile.push(
      new THREE.Vector2(
        radius * Math.sin(angle),
        straightHalf + maxFillet * Math.cos(angle)
      )
    );
  }
  const lathe = new THREE.LatheGeometry(profile, radialSegments);
  // Rotate so Y axis becomes Z axis
  lathe.rotateX(Math.PI / 2);
  lathe.computeVertexNormals();
  lathe.userData.attachmentPoints = [
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
  lathe.userData.moduleType = "filleted-cylinder";
  lathe.userData.dimensions = { diameter, length, fillet: maxFillet };
  return lathe;
}

/**
 * Hexagonal prism based on across-flats diameter
 * params: { diameter, length }
 */
export function generateHexPrism({ diameter = 6, length = 10 }) {
  // CylinderGeometry with 6 radial segments forms hex; across flats = 2 * R * cos(pi/6) => we invert
  const circRadius = diameter / (2 * Math.cos(Math.PI / 6));
  const geometry = new THREE.CylinderGeometry(
    circRadius,
    circRadius,
    length,
    6,
    1,
    false
  );
  geometry.rotateX(Math.PI / 2); // Align to Z
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
  geometry.userData.moduleType = "hex-prism";
  geometry.userData.dimensions = { diameter, length };
  return geometry;
}

/**
 * Generic polygon prism (N-gon) – sides >= 3
 * params: { sides, diameter, length }
 */
export function generatePolyPrism({ sides = 5, diameter = 6, length = 10 }) {
  const s = Math.max(3, Math.floor(sides));
  const circRadius = diameter / (2 * Math.cos(Math.PI / s));
  const geometry = new THREE.CylinderGeometry(
    circRadius,
    circRadius,
    length,
    s,
    1,
    false
  );
  geometry.rotateX(Math.PI / 2);
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
  geometry.userData.moduleType = "poly-prism";
  geometry.userData.dimensions = { sides: s, diameter, length };
  return geometry;
}
