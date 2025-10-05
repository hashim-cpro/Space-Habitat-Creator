/**
 * Functional Zones System
 * Defines 3D volumes for different functionalities (sleeping, gym, lab, etc.)
 * These zones are adaptive, transparent, and moveable within habitat shapes
 */

import * as THREE from "three";

// Define functional zone types with their properties
export const FUNCTIONAL_ZONES = {
  sleeping: {
    id: "sleeping",
    name: "Sleeping Zone",
    icon: "🛏️",
    color: 0x4a90e2,
    opacity: 0.3,
    minVolume: 6, // cubic meters
    defaultSize: { width: 2.5, height: 2.5, depth: 3.0 },
    priority: "high",
    description: "Private sleeping quarters for crew members",
  },
  hygiene: {
    id: "hygiene",
    name: "Hygiene Zone",
    icon: "🚿",
    color: 0x7ed321,
    opacity: 0.3,
    minVolume: 3,
    defaultSize: { width: 1.5, height: 2.5, depth: 2.0 },
    priority: "high",
    description: "Bathroom and personal hygiene facilities",
  },
  lab: {
    id: "lab",
    name: "Laboratory Zone",
    icon: "🔬",
    color: 0x50e3c2,
    opacity: 0.3,
    minVolume: 8,
    defaultSize: { width: 3.0, height: 2.8, depth: 4.0 },
    priority: "medium",
    description: "Science lab and research workstations",
  },
  gym: {
    id: "gym",
    name: "Exercise Zone",
    icon: "💪",
    color: 0xbd10e0,
    opacity: 0.3,
    minVolume: 10,
    defaultSize: { width: 3.0, height: 3.0, depth: 4.0 },
    priority: "medium",
    description: "Fitness equipment and exercise space",
  },
  kitchen: {
    id: "kitchen",
    name: "Galley/Kitchen Zone",
    icon: "🍽️",
    color: 0xf5a623,
    opacity: 0.3,
    minVolume: 6,
    defaultSize: { width: 2.5, height: 2.8, depth: 3.5 },
    priority: "high",
    description: "Food preparation and cooking area",
  },
  dining: {
    id: "dining",
    name: "Dining Zone",
    icon: "🪑",
    color: 0xf8b500,
    opacity: 0.3,
    minVolume: 6,
    defaultSize: { width: 2.5, height: 2.8, depth: 3.0 },
    priority: "medium",
    description: "Communal eating and social space",
  },
  medical: {
    id: "medical",
    name: "Medical Zone",
    icon: "🏥",
    color: 0xff4444,
    opacity: 0.3,
    minVolume: 5,
    defaultSize: { width: 2.5, height: 2.8, depth: 3.0 },
    priority: "high",
    description: "Medical examination and treatment area",
  },
  storage: {
    id: "storage",
    name: "Storage Zone",
    icon: "📦",
    color: 0x9013fe,
    opacity: 0.3,
    minVolume: 4,
    defaultSize: { width: 2.0, height: 2.8, depth: 2.5 },
    priority: "low",
    description: "General storage for supplies",
  },
  command: {
    id: "command",
    name: "Command Zone",
    icon: "🎛️",
    color: 0x4169e1,
    opacity: 0.3,
    minVolume: 8,
    defaultSize: { width: 3.0, height: 2.8, depth: 4.0 },
    priority: "high",
    description: "Mission control and communication center",
  },
  recreation: {
    id: "recreation",
    name: "Recreation Zone",
    icon: "🎮",
    color: 0x00d4ff,
    opacity: 0.3,
    minVolume: 6,
    defaultSize: { width: 2.5, height: 2.8, depth: 3.0 },
    priority: "low",
    description: "Leisure and entertainment space",
  },
  greenhouse: {
    id: "greenhouse",
    name: "Greenhouse Zone",
    icon: "🌱",
    color: 0x00ff88,
    opacity: 0.3,
    minVolume: 8,
    defaultSize: { width: 3.0, height: 2.8, depth: 4.0 },
    priority: "medium",
    description: "Plant growth and food production",
  },
  airlock: {
    id: "airlock",
    name: "Airlock Zone",
    icon: "🚪",
    color: 0x666666,
    opacity: 0.3,
    minVolume: 4,
    defaultSize: { width: 2.0, height: 2.8, depth: 2.5 },
    priority: "high",
    description: "EVA airlock for extravehicular activities",
  },
};

/**
 * Create a functional zone instance
 */
export function createFunctionalZone(zoneType, position = [0, 0, 0]) {
  const zoneDef = FUNCTIONAL_ZONES[zoneType];
  if (!zoneDef) {
    console.error(`Unknown zone type: ${zoneType}`);
    return null;
  }

  // Ensure position has valid numbers
  const safePosition = [
    isNaN(position[0]) || position[0] === undefined ? 0 : Number(position[0]),
    isNaN(position[1]) || position[1] === undefined ? 0 : Number(position[1]),
    isNaN(position[2]) || position[2] === undefined ? 0 : Number(position[2]),
  ];

  const zone = {
    id: `zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: zoneType,
    name: zoneDef.name,
    icon: zoneDef.icon,
    position: safePosition,
    size: { ...zoneDef.defaultSize },
    color: zoneDef.color,
    opacity: zoneDef.opacity,
    rotation: [0, 0, 0],
    locked: false,
    visible: true,
    metadata: {
      volume: 0,
      isAdaptive: true,
      containerId: null, // ID of container shape
      priority: zoneDef.priority,
      description: zoneDef.description,
    },
  };

  // Calculate initial volume
  zone.metadata.volume = zone.size.width * zone.size.height * zone.size.depth;

  return zone;
}

/**
 * Get all functional zone types
 */
export function getAllZoneTypes() {
  return Object.keys(FUNCTIONAL_ZONES).map((key) => ({
    id: key,
    ...FUNCTIONAL_ZONES[key],
  }));
}

/**
 * Get zone definition by type
 */
export function getZoneDefinition(zoneType) {
  return FUNCTIONAL_ZONES[zoneType];
}

/**
 * Calculate volume of a zone
 */
export function calculateZoneVolume(zone) {
  return zone.size.width * zone.size.height * zone.size.depth;
}

/**
 * Check if zone meets minimum volume requirements
 */
export function validateZoneVolume(zone) {
  const zoneDef = FUNCTIONAL_ZONES[zone.type];
  if (!zoneDef) return false;

  const volume = calculateZoneVolume(zone);
  return volume >= zoneDef.minVolume;
}

/**
 * Update zone size while maintaining minimum volume
 */
export function updateZoneSize(zone, newSize) {
  const zoneDef = FUNCTIONAL_ZONES[zone.type];
  if (!zoneDef) return zone;

  const updatedZone = {
    ...zone,
    size: { ...newSize },
  };

  // Check if new volume is valid
  const newVolume = calculateZoneVolume(updatedZone);
  if (newVolume >= zoneDef.minVolume) {
    updatedZone.metadata.volume = newVolume;
    return updatedZone;
  }

  // If too small, scale proportionally to meet minimum
  const scale = Math.cbrt(zoneDef.minVolume / newVolume);
  updatedZone.size = {
    width: newSize.width * scale,
    height: newSize.height * scale,
    depth: newSize.depth * scale,
  };
  updatedZone.metadata.volume = zoneDef.minVolume;

  return updatedZone;
}

/**
 * Create THREE.js mesh for a functional zone
 */
export function createZoneMesh(zone) {
  const geometry = new THREE.BoxGeometry(
    zone.size.width,
    zone.size.height,
    zone.size.depth
  );

  const material = new THREE.MeshStandardMaterial({
    color: zone.color,
    transparent: true,
    opacity: zone.opacity,
    side: THREE.DoubleSide,
    depthWrite: false,
    emissive: zone.color,
    emissiveIntensity: 0.2,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...zone.position);
  mesh.rotation.set(...zone.rotation);

  // Add edges for better visualization
  const edges = new THREE.EdgesGeometry(geometry);
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: zone.color,
    transparent: true,
    opacity: 0.8,
    linewidth: 2,
  });
  const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
  mesh.add(edgeLines);

  // Store zone data in mesh
  mesh.userData = {
    zoneId: zone.id,
    zoneType: zone.type,
    zoneName: zone.name,
    isDraggable: true,
    isFunctionalZone: true,
  };

  return mesh;
}

/**
 * Update zone mesh with new data
 */
export function updateZoneMesh(mesh, zone) {
  mesh.position.set(...zone.position);
  mesh.rotation.set(...zone.rotation);

  // Update geometry if size changed
  const currentSize = mesh.geometry.parameters;
  if (
    currentSize.width !== zone.size.width ||
    currentSize.height !== zone.size.height ||
    currentSize.depth !== zone.size.depth
  ) {
    mesh.geometry.dispose();
    mesh.geometry = new THREE.BoxGeometry(
      zone.size.width,
      zone.size.height,
      zone.size.depth
    );

    // Update edges
    const edgeLines = mesh.children.find((child) => child.isLineSegments);
    if (edgeLines) {
      edgeLines.geometry.dispose();
      edgeLines.geometry = new THREE.EdgesGeometry(mesh.geometry);
    }
  }

  // Update material
  mesh.material.color.setHex(zone.color);
  mesh.material.opacity = zone.opacity;
  mesh.material.emissive.setHex(zone.color);
  mesh.visible = zone.visible;

  return mesh;
}

/**
 * Get zone bounding box
 */
export function getZoneBoundingBox(zone) {
  const halfWidth = zone.size.width / 2;
  const halfHeight = zone.size.height / 2;
  const halfDepth = zone.size.depth / 2;

  return {
    min: {
      x: zone.position[0] - halfWidth,
      y: zone.position[1] - halfHeight,
      z: zone.position[2] - halfDepth,
    },
    max: {
      x: zone.position[0] + halfWidth,
      y: zone.position[1] + halfHeight,
      z: zone.position[2] + halfDepth,
    },
  };
}

export default {
  FUNCTIONAL_ZONES,
  createFunctionalZone,
  getAllZoneTypes,
  getZoneDefinition,
  calculateZoneVolume,
  validateZoneVolume,
  updateZoneSize,
  createZoneMesh,
  updateZoneMesh,
  getZoneBoundingBox,
};
