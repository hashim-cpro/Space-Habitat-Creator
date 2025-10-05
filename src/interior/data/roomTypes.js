/**
 * Room type definitions for interior design
 */

export const ROOM_TYPES = {
  sleep: {
    id: "sleep",
    name: "Sleep Quarters",
    icon: "🛏️",
    category: "living",
    description: "Private crew sleeping quarters with personal storage",
    color: "#4a90e2",
    defaultDimensions: {
      width: 2.5,
      length: 3.0,
      height: 2.5,
    },
    minDimensions: {
      width: 2.0,
      length: 2.5,
      height: 2.0,
    },
    privacy: "high",
    soundproofing: "high",
    features: ["bed", "storage", "lighting", "ventilation"],
  },

  hygiene: {
    id: "hygiene",
    name: "Hygiene Station",
    icon: "🚿",
    category: "living",
    description: "Bathroom and personal hygiene facilities",
    color: "#7ed321",
    defaultDimensions: {
      width: 1.5,
      length: 2.0,
      height: 2.5,
    },
    minDimensions: {
      width: 1.2,
      length: 1.5,
      height: 2.0,
    },
    privacy: "high",
    soundproofing: "medium",
    features: ["toilet", "sink", "shower", "storage"],
    waterRequired: true,
    drainage: true,
  },

  galley: {
    id: "galley",
    name: "Galley/Kitchen",
    icon: "🍽️",
    category: "living",
    description: "Food preparation and cooking area",
    color: "#f5a623",
    defaultDimensions: {
      width: 3.0,
      length: 4.0,
      height: 2.8,
    },
    minDimensions: {
      width: 2.5,
      length: 3.0,
      height: 2.5,
    },
    privacy: "low",
    soundproofing: "low",
    features: ["food-warmer", "sink", "storage", "waste-disposal"],
    waterRequired: true,
    powerRequired: true,
  },

  dining: {
    id: "dining",
    name: "Dining Area",
    icon: "🪑",
    category: "living",
    description: "Communal eating and social space",
    color: "#f8b500",
    defaultDimensions: {
      width: 3.0,
      length: 4.0,
      height: 2.8,
    },
    minDimensions: {
      width: 2.5,
      length: 3.0,
      height: 2.5,
    },
    privacy: "low",
    soundproofing: "low",
    features: ["table", "seating", "storage"],
  },

  work: {
    id: "work",
    name: "Work Station / Lab",
    icon: "💻",
    category: "operations",
    description: "Science lab and work stations",
    color: "#50e3c2",
    defaultDimensions: {
      width: 3.0,
      length: 4.0,
      height: 2.8,
    },
    minDimensions: {
      width: 2.0,
      length: 2.5,
      height: 2.5,
    },
    privacy: "medium",
    soundproofing: "medium",
    features: ["workbench", "computers", "storage", "equipment-racks"],
    powerRequired: true,
    dataRequired: true,
  },

  exercise: {
    id: "exercise",
    name: "Exercise Area",
    icon: "💪",
    category: "health",
    description: "Fitness equipment and exercise space",
    color: "#bd10e0",
    defaultDimensions: {
      width: 3.0,
      length: 4.0,
      height: 3.0,
    },
    minDimensions: {
      width: 2.5,
      length: 3.0,
      height: 2.5,
    },
    privacy: "low",
    soundproofing: "low",
    features: ["treadmill", "resistance-bands", "bike", "storage"],
    powerRequired: true,
    noiseLevel: "high",
  },

  recreation: {
    id: "recreation",
    name: "Recreation Area",
    icon: "🎮",
    category: "living",
    description: "Leisure and entertainment space",
    color: "#00d4ff",
    defaultDimensions: {
      width: 3.0,
      length: 3.5,
      height: 2.8,
    },
    minDimensions: {
      width: 2.5,
      length: 2.5,
      height: 2.5,
    },
    privacy: "low",
    soundproofing: "medium",
    features: ["seating", "entertainment", "games", "reading"],
    powerRequired: true,
  },

  medical: {
    id: "medical",
    name: "Medical Bay",
    icon: "🏥",
    category: "health",
    description: "Medical examination and treatment area",
    color: "#ff4444",
    defaultDimensions: {
      width: 2.5,
      length: 3.5,
      height: 2.8,
    },
    minDimensions: {
      width: 2.0,
      length: 3.0,
      height: 2.5,
    },
    privacy: "high",
    soundproofing: "high",
    features: ["exam-table", "medical-storage", "equipment", "sink"],
    waterRequired: true,
    powerRequired: true,
  },

  storage: {
    id: "storage",
    name: "Storage",
    icon: "📦",
    category: "operations",
    description: "General storage for supplies and equipment",
    color: "#9013fe",
    defaultDimensions: {
      width: 2.0,
      length: 3.0,
      height: 2.8,
    },
    minDimensions: {
      width: 1.5,
      length: 2.0,
      height: 2.0,
    },
    privacy: "low",
    soundproofing: "low",
    features: ["shelving", "lockers", "inventory-system"],
  },

  lifesupport: {
    id: "lifesupport",
    name: "Life Support / ECLSS",
    icon: "🌬️",
    category: "systems",
    description: "Environmental Control and Life Support Systems",
    color: "#ff6b35",
    defaultDimensions: {
      width: 2.5,
      length: 3.0,
      height: 2.8,
    },
    minDimensions: {
      width: 2.0,
      length: 2.5,
      height: 2.5,
    },
    privacy: "low",
    soundproofing: "required",
    features: ["air-recycling", "water-recycling", "climate-control"],
    powerRequired: true,
    noiseLevel: "high",
    maintenanceAccess: true,
  },

  airlock: {
    id: "airlock",
    name: "Airlock",
    icon: "🚪",
    category: "systems",
    description: "EVA airlock for extravehicular activities",
    color: "#666666",
    defaultDimensions: {
      width: 2.0,
      length: 2.5,
      height: 2.8,
    },
    minDimensions: {
      width: 1.8,
      length: 2.0,
      height: 2.5,
    },
    privacy: "low",
    soundproofing: "high",
    features: ["pressure-doors", "suit-storage", "safety-equipment"],
    powerRequired: true,
    pressureControl: true,
  },

  greenhouse: {
    id: "greenhouse",
    name: "Greenhouse / Plant Growth",
    icon: "🌱",
    category: "operations",
    description: "Plant growth and food production area",
    color: "#00ff88",
    defaultDimensions: {
      width: 3.0,
      length: 4.0,
      height: 2.8,
    },
    minDimensions: {
      width: 2.5,
      length: 3.0,
      height: 2.5,
    },
    privacy: "low",
    soundproofing: "low",
    features: ["grow-lights", "irrigation", "climate-control", "storage"],
    waterRequired: true,
    powerRequired: true,
    specialLighting: true,
  },

  command: {
    id: "command",
    name: "Command Center",
    icon: "🎛️",
    category: "operations",
    description: "Mission control and communication center",
    color: "#4169e1",
    defaultDimensions: {
      width: 3.0,
      length: 4.0,
      height: 2.8,
    },
    minDimensions: {
      width: 2.5,
      length: 3.0,
      height: 2.5,
    },
    privacy: "medium",
    soundproofing: "medium",
    features: ["consoles", "communications", "displays", "computers"],
    powerRequired: true,
    dataRequired: true,
    redundantPower: true,
  },

  corridor: {
    id: "corridor",
    name: "Corridor",
    icon: "🚶",
    category: "circulation",
    description: "Circulation path between spaces",
    color: "#888888",
    defaultDimensions: {
      width: 1.5,
      length: 4.0,
      height: 2.5,
    },
    minDimensions: {
      width: 1.2,
      length: 1.0,
      height: 2.0,
    },
    privacy: "low",
    soundproofing: "low",
    features: ["handrails", "lighting", "emergency-equipment"],
  },
};

// Category groupings for UI organization
export const ROOM_CATEGORIES = {
  living: {
    name: "Living Spaces",
    icon: "🏠",
    types: ["sleep", "hygiene", "galley", "dining", "recreation"],
  },
  operations: {
    name: "Operations",
    icon: "🔬",
    types: ["work", "command", "storage", "greenhouse"],
  },
  health: {
    name: "Health & Fitness",
    icon: "❤️",
    types: ["medical", "exercise"],
  },
  systems: {
    name: "Systems",
    icon: "⚙️",
    types: ["lifesupport", "airlock"],
  },
  circulation: {
    name: "Circulation",
    icon: "🚶",
    types: ["corridor"],
  },
};

/**
 * Get room type by ID
 */
export function getRoomType(id) {
  return ROOM_TYPES[id];
}

/**
 * Get all room types in a category
 */
export function getRoomsByCategory(category) {
  return Object.values(ROOM_TYPES).filter((room) => room.category === category);
}

/**
 * Get default area for room type (for crew size)
 */
export function getDefaultRoomArea(roomType, crewSize = 6) {
  const room = ROOM_TYPES[roomType];
  if (!room) return 0;
  const dims = room.defaultDimensions;
  return dims.width * dims.length;
}

export default ROOM_TYPES;
