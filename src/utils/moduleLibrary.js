/**
 * Module Library - Defines all available habitat modules
 * Includes both procedural and imported models
 */

export const MODULE_CATEGORIES = {
  BASIC: "Basic Modules",
  INFLATABLE: "Inflatable Modules",
  CONNECTORS: "Connectors",
  SPECIALIZED: "Specialized Equipment",
  IMPORTED: "Custom Models",
};

export const MODULE_LIBRARY = [
  // ===== BASIC RIGID MODULES =====
  {
    id: "rigid-small",
    name: "Small Habitat Module",
    category: MODULE_CATEGORIES.BASIC,
    type: "procedural",
    generator: "generateRigidCylinder",
    defaultParams: { diameter: 4, length: 6 },
    adjustableParams: [
      { name: "diameter", label: "Diameter (m)", min: 2, max: 8, step: 0.5 },
      { name: "length", label: "Length (m)", min: 3, max: 20, step: 0.5 },
    ],
    icon: "🏠",
    description: "Small rigid cylindrical habitat module",
  },
  {
    id: "rigid-medium",
    name: "Medium Habitat Module",
    category: MODULE_CATEGORIES.BASIC,
    type: "procedural",
    generator: "generateRigidCylinder",
    defaultParams: { diameter: 6, length: 10 },
    adjustableParams: [
      { name: "diameter", label: "Diameter (m)", min: 2, max: 8, step: 0.5 },
      { name: "length", label: "Length (m)", min: 3, max: 20, step: 0.5 },
    ],
    icon: "🏘️",
    description: "Medium rigid cylindrical habitat module",
  },
  {
    id: "rigid-large",
    name: "Large Habitat Module",
    category: MODULE_CATEGORIES.BASIC,
    type: "procedural",
    generator: "generateRigidCylinder",
    defaultParams: { diameter: 8, length: 14 },
    adjustableParams: [
      { name: "diameter", label: "Diameter (m)", min: 2, max: 10, step: 0.5 },
      { name: "length", label: "Length (m)", min: 3, max: 25, step: 0.5 },
    ],
    icon: "🏢",
    description: "Large rigid cylindrical habitat module",
  },
  {
    id: "multi-level",
    name: "Multi-Level Module",
    category: MODULE_CATEGORIES.BASIC,
    type: "procedural",
    generator: "generateMultiLevelCylinder",
    defaultParams: { diameter: 6, length: 12, levels: 2 },
    adjustableParams: [
      { name: "diameter", label: "Diameter (m)", min: 4, max: 10, step: 0.5 },
      { name: "length", label: "Length (m)", min: 6, max: 20, step: 0.5 },
      { name: "levels", label: "Number of Floors", min: 1, max: 4, step: 1 },
    ],
    icon: "🏗️",
    description: "Cylindrical module with multiple internal floors",
  },
  {
    id: "rounded-box",
    name: "Rounded Box Module",
    category: MODULE_CATEGORIES.BASIC,
    type: "procedural",
    generator: "generateRoundedBox",
    defaultParams: {
      width: 6,
      height: 4,
      length: 10,
      radius: 0.8,
      curveSegments: 8,
    },
    adjustableParams: [
      { name: "width", label: "Width (m)", min: 2, max: 40, step: 0.5 },
      { name: "height", label: "Height (m)", min: 2, max: 40, step: 0.5 },
      { name: "length", label: "Length (m)", min: 3, max: 60, step: 0.5 },
      { name: "radius", label: "Corner Radius", min: 0.1, max: 5, step: 0.1 },
      {
        name: "curveSegments",
        label: "Curve Segments",
        min: 4,
        max: 32,
        step: 1,
      },
    ],
    icon: "🧊",
    description: "Rectangular prism with rounded corners",
  },
  {
    id: "filleted-cylinder",
    name: "Filleted Cylinder",
    category: MODULE_CATEGORIES.BASIC,
    type: "procedural",
    generator: "generateFilletedCylinder",
    defaultParams: {
      diameter: 6,
      length: 12,
      fillet: 1,
      radialSegments: 32,
      filletSegments: 10,
    },
    adjustableParams: [
      { name: "diameter", label: "Diameter (m)", min: 2, max: 20, step: 0.5 },
      { name: "length", label: "Length (m)", min: 4, max: 60, step: 0.5 },
      { name: "fillet", label: "Fillet Radius", min: 0.2, max: 5, step: 0.1 },
      {
        name: "radialSegments",
        label: "Radial Segments",
        min: 8,
        max: 64,
        step: 2,
      },
      {
        name: "filletSegments",
        label: "Fillet Segments",
        min: 4,
        max: 32,
        step: 1,
      },
    ],
    icon: "🛢️",
    description: "Cylinder with rounded end transitions (capsule)",
  },
  {
    id: "hex-prism",
    name: "Hex Prism Module",
    category: MODULE_CATEGORIES.BASIC,
    type: "procedural",
    generator: "generateHexPrism",
    defaultParams: { diameter: 6, length: 10 },
    adjustableParams: [
      {
        name: "diameter",
        label: "Across Flats (m)",
        min: 2,
        max: 30,
        step: 0.5,
      },
      { name: "length", label: "Length (m)", min: 3, max: 60, step: 0.5 },
    ],
    icon: "⬡",
    description: "Hexagonal prism module",
  },
  {
    id: "poly-prism",
    name: "Polygon Prism",
    category: MODULE_CATEGORIES.BASIC,
    type: "procedural",
    generator: "generatePolyPrism",
    defaultParams: { sides: 5, diameter: 6, length: 10 },
    adjustableParams: [
      { name: "sides", label: "Sides", min: 3, max: 16, step: 1 },
      {
        name: "diameter",
        label: "Across Flats (m)",
        min: 2,
        max: 30,
        step: 0.5,
      },
      { name: "length", label: "Length (m)", min: 3, max: 60, step: 0.5 },
    ],
    icon: "🔷",
    description: "Generic N‑gon prism module",
  },

  // ===== INFLATABLE MODULES =====
  {
    id: "inflatable-medium",
    name: "Inflatable Module (BEAM-style)",
    category: MODULE_CATEGORIES.INFLATABLE,
    type: "procedural",
    generator: "generateInflatableCylinder",
    defaultParams: { diameter: 6, length: 10 },
    adjustableParams: [
      { name: "diameter", label: "Diameter (m)", min: 3, max: 10, step: 0.5 },
      { name: "length", label: "Length (m)", min: 4, max: 20, step: 0.5 },
    ],
    icon: "🎈",
    description: "Expandable inflatable habitat module",
  },
  {
    id: "inflatable-large",
    name: "Large Inflatable Module",
    category: MODULE_CATEGORIES.INFLATABLE,
    type: "procedural",
    generator: "generateInflatableCylinder",
    defaultParams: { diameter: 10, length: 15 },
    adjustableParams: [
      { name: "diameter", label: "Diameter (m)", min: 3, max: 15, step: 0.5 },
      { name: "length", label: "Length (m)", min: 4, max: 25, step: 0.5 },
    ],
    icon: "🎪",
    description: "Large expandable inflatable habitat",
  },

  // ===== DOMES =====
  {
    id: "dome-full",
    name: "Observation Dome",
    category: MODULE_CATEGORIES.BASIC,
    type: "procedural",
    generator: "generateDome",
    defaultParams: { radius: 4, heightRatio: 1.0 },
    adjustableParams: [
      { name: "radius", label: "Radius (m)", min: 2, max: 8, step: 0.5 },
      {
        name: "heightRatio",
        label: "Height Ratio",
        min: 0.3,
        max: 1.0,
        step: 0.1,
      },
    ],
    icon: "🔮",
    description: "Hemispherical dome for observation",
  },
  {
    id: "dome-shallow",
    name: "Shallow Dome Cap",
    category: MODULE_CATEGORIES.BASIC,
    type: "procedural",
    generator: "generateDome",
    defaultParams: { radius: 4, heightRatio: 0.5 },
    adjustableParams: [
      { name: "radius", label: "Radius (m)", min: 2, max: 8, step: 0.5 },
      {
        name: "heightRatio",
        label: "Height Ratio",
        min: 0.2,
        max: 1.0,
        step: 0.1,
      },
    ],
    icon: "⛑️",
    description: "Shallow dome cap for module ends",
  },

  // ===== CONNECTORS & TUNNELS =====
  {
    id: "tunnel-short",
    name: "Short Tunnel",
    category: MODULE_CATEGORIES.CONNECTORS,
    type: "procedural",
    generator: "generateTunnel",
    defaultParams: { diameter: 2, length: 3 },
    adjustableParams: [
      { name: "diameter", label: "Diameter (m)", min: 1, max: 3, step: 0.25 },
      { name: "length", label: "Length (m)", min: 1, max: 10, step: 0.5 },
    ],
    icon: "🚇",
    description: "Short connecting tunnel",
  },
  {
    id: "tunnel-long",
    name: "Long Tunnel",
    category: MODULE_CATEGORIES.CONNECTORS,
    type: "procedural",
    generator: "generateTunnel",
    defaultParams: { diameter: 2, length: 8 },
    adjustableParams: [
      { name: "diameter", label: "Diameter (m)", min: 1, max: 3, step: 0.25 },
      { name: "length", label: "Length (m)", min: 1, max: 15, step: 0.5 },
    ],
    icon: "🛤️",
    description: "Long connecting tunnel",
  },
  {
    id: "docking-port",
    name: "Docking Port",
    category: MODULE_CATEGORIES.CONNECTORS,
    type: "procedural",
    generator: "generateDockingPort",
    defaultParams: { diameter: 1.2, depth: 0.3 },
    adjustableParams: [
      {
        name: "diameter",
        label: "Diameter (m)",
        min: 0.8,
        max: 2.0,
        step: 0.1,
      },
      { name: "depth", label: "Depth (m)", min: 0.2, max: 0.8, step: 0.1 },
    ],
    icon: "🔗",
    description: "Simple docking collar",
  },
  {
    id: "adapter",
    name: "Size Adapter",
    category: MODULE_CATEGORIES.CONNECTORS,
    type: "procedural",
    generator: "generateAdapter",
    defaultParams: { diameterStart: 4, diameterEnd: 2, length: 2 },
    adjustableParams: [
      {
        name: "diameterStart",
        label: "Large End (m)",
        min: 2,
        max: 8,
        step: 0.5,
      },
      {
        name: "diameterEnd",
        label: "Small End (m)",
        min: 1,
        max: 6,
        step: 0.5,
      },
      { name: "length", label: "Length (m)", min: 1, max: 5, step: 0.5 },
    ],
    icon: "🔌",
    description: "Conical adapter for different module sizes",
  },

  // ===== IMPORTED MODELS (STL/GLB) =====
  {
    id: "airlock-detailed",
    name: "Airlock (Detailed)",
    category: MODULE_CATEGORIES.SPECIALIZED,
    type: "imported",
    modelPath: "/models/airlock-detailed.stl",
    defaultScale: 1.0,
    icon: "🚪",
    description: "Detailed airlock with hatches",
    isPriority: true,
  },
  {
    id: "node-4way",
    name: "4-Way Junction Node",
    category: MODULE_CATEGORIES.CONNECTORS,
    type: "imported",
    modelPath: "/models/node-4way.stl",
    defaultScale: 1.0,
    icon: "✚",
    description: "Four-port junction hub (cross)",
    isPriority: true,
  },
  {
    id: "node-6way",
    name: "6-Way Junction Node",
    category: MODULE_CATEGORIES.CONNECTORS,
    type: "imported",
    modelPath: "/models/node-6way.stl",
    defaultScale: 1.0,
    icon: "✳️",
    description: "Six-port junction hub (3D)",
    isPriority: true,
  },
  {
    id: "solar-array",
    name: "Solar Panel Array",
    category: MODULE_CATEGORIES.SPECIALIZED,
    type: "imported",
    modelPath: "/models/solar-array.stl",
    defaultScale: 1.0,
    icon: "☀️",
    description: "Deployable solar panel array",
    isPriority: false,
  },
  {
    id: "antenna-dish",
    name: "Communications Antenna",
    category: MODULE_CATEGORIES.SPECIALIZED,
    type: "imported",
    modelPath: "/models/antenna-dish.stl",
    defaultScale: 1.0,
    icon: "📡",
    description: "Parabolic communications dish",
    isPriority: false,
  },
  {
    id: "docking-adapter-detailed",
    name: "Docking Adapter (NASA CBM)",
    category: MODULE_CATEGORIES.CONNECTORS,
    type: "imported",
    modelPath: "/models/docking-adapter.stl",
    defaultScale: 1.0,
    icon: "🔘",
    description: "NASA Common Berthing Mechanism",
    isPriority: false,
  },
  {
    id: "cupola",
    name: "Observation Cupola",
    category: MODULE_CATEGORIES.SPECIALIZED,
    type: "imported",
    modelPath: "/models/cupola-observation.stl",
    defaultScale: 1.0,
    icon: "👁️",
    description: "Multi-window observation dome",
    isPriority: false,
  },
  {
    id: "plant-rack",
    name: "Plant Growth System",
    category: MODULE_CATEGORIES.SPECIALIZED,
    type: "imported",
    modelPath: "/models/plant-rack.stl",
    defaultScale: 1.0,
    icon: "🌱",
    description: "Hydroponic plant growth rack",
    isPriority: false,
  },
];

/**
 * Get modules by category
 */
export function getModulesByCategory(category) {
  return MODULE_LIBRARY.filter((mod) => mod.category === category);
}

/**
 * Get module by ID
 */
export function getModuleById(id) {
  return MODULE_LIBRARY.find((mod) => mod.id === id);
}

/**
 * Get all procedural modules
 */
export function getProceduralModules() {
  return MODULE_LIBRARY.filter((mod) => mod.type === "procedural");
}

/**
 * Get all imported modules
 */
export function getImportedModules() {
  return MODULE_LIBRARY.filter((mod) => mod.type === "imported");
}

/**
 * Get priority imported modules (models needed first)
 */
export function getPriorityModules() {
  return MODULE_LIBRARY.filter(
    (mod) => mod.type === "imported" && mod.isPriority
  );
}

/**
 * Get available modules (procedural + successfully loaded imported)
 */
export function getAvailableModules(loadedModels = []) {
  return MODULE_LIBRARY.filter((mod) => {
    if (mod.type === "procedural") return true;
    return loadedModels.includes(mod.id);
  });
}
