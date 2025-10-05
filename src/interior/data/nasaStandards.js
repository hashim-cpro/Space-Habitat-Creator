/**
 * NASA Space Habitat Standards and Requirements
 * Based on NASA-STD-3001 and habitat design guidelines
 */

export const NASA_STANDARDS = {
  // Minimum space requirements per crew member (m²)
  spaceRequirements: {
    sleep: {
      minPerPerson: 2.5,
      optimal: 4.0,
      description: "Private sleep quarters with storage",
      priority: "critical",
    },
    hygiene: {
      minPerPerson: 1.0,
      optimal: 1.5,
      description: "Bathroom and personal hygiene facilities",
      priority: "critical",
    },
    galley: {
      minPerPerson: 2.0,
      optimal: 3.0,
      description: "Food preparation area",
      priority: "critical",
    },
    dining: {
      minPerPerson: 1.5,
      optimal: 2.0,
      description: "Eating and social space",
      priority: "important",
    },
    work: {
      minPerPerson: 1.5,
      optimal: 2.5,
      description: "Work stations and labs",
      priority: "critical",
    },
    exercise: {
      minPerPerson: 2.5,
      optimal: 4.0,
      description: "Exercise equipment area",
      priority: "important",
    },
    recreation: {
      minPerPerson: 1.5,
      optimal: 2.5,
      description: "Leisure and entertainment",
      priority: "optional",
    },
    medical: {
      minPerPerson: 1.0,
      optimal: 2.0,
      description: "Medical bay (shared)",
      priority: "important",
    },
    storage: {
      minPerPerson: 1.0,
      optimal: 1.5,
      description: "General storage",
      priority: "important",
    },
    lifesupport: {
      minPerPerson: 0.5,
      optimal: 1.0,
      description: "ECLSS equipment",
      priority: "critical",
    },
  },

  // Dimensional requirements
  dimensions: {
    minCorridorWidth: 1.2, // meters
    optimalCorridorWidth: 1.5,
    minDoorWidth: 0.9,
    optimalDoorWidth: 1.0,
    minCeilingHeight: 2.0,
    optimalCeilingHeight: 2.8,
    minRoomWidth: 1.5,
    minRoomDepth: 1.5,
  },

  // Safety requirements
  safety: {
    maxEgressDistance: 30, // meters - max distance to exit
    minEgressPaths: 2, // number of independent escape routes
    minCorridorClearance: 1.2, // meters
    emergencyLightingRequired: true,
    fireSuppressionRequired: true,
    maxDeadEndLength: 6, // meters for dead-end corridors
  },

  // Adjacency rules - preferred and required relationships
  adjacencyRules: [
    {
      from: "galley",
      to: "dining",
      type: "required",
      maxDistance: 5,
      reason: "Food preparation near eating area",
    },
    {
      from: "hygiene",
      to: "sleep",
      type: "preferred",
      maxDistance: 10,
      reason: "Convenience for crew",
    },
    {
      from: "airlock",
      to: "storage",
      type: "required",
      maxDistance: 8,
      reason: "EVA suit storage near airlock",
    },
    {
      from: "medical",
      to: "sleep",
      type: "preferred",
      maxDistance: 15,
      reason: "Emergency access",
    },
    {
      from: "lifesupport",
      to: "sleep",
      type: "avoid",
      minDistance: 5,
      reason: "Noise and vibration",
    },
    {
      from: "exercise",
      to: "sleep",
      type: "avoid",
      minDistance: 5,
      reason: "Noise",
    },
    {
      from: "work",
      to: "recreation",
      type: "separated",
      minDistance: 3,
      reason: "Activity separation",
    },
  ],

  // Noise zoning
  noiseZones: {
    quiet: {
      maxNoise: 45, // dBA
      spaces: ["sleep", "medical", "work"],
    },
    moderate: {
      maxNoise: 60,
      spaces: ["dining", "recreation", "hygiene"],
    },
    loud: {
      maxNoise: 75,
      spaces: ["exercise", "lifesupport", "airlock"],
    },
  },

  // Environmental requirements
  environmental: {
    temperature: {
      min: 18, // Celsius
      max: 27,
      optimal: 22,
    },
    humidity: {
      min: 30, // percent
      max: 70,
      optimal: 50,
    },
    airVelocity: {
      min: 0.1, // m/s
      max: 0.5,
      optimal: 0.2,
    },
    co2Level: {
      max: 0.5, // percent
      alarm: 1.0,
    },
  },

  // Lighting requirements (lux)
  lighting: {
    sleep: { min: 50, max: 200, optimal: 100 },
    work: { min: 500, max: 1000, optimal: 750 },
    galley: { min: 300, max: 750, optimal: 500 },
    recreation: { min: 200, max: 500, optimal: 300 },
    corridor: { min: 100, max: 300, optimal: 200 },
    emergency: { min: 10, max: 50, optimal: 20 },
  },

  // Crew capacity calculations
  crewCapacity: {
    minTotalVolume: 25, // m³ per person (absolute minimum)
    optimalTotalVolume: 50, // m³ per person (comfortable)
    minPrivateVolume: 6, // m³ per person (sleep quarters)
    optimalPrivateVolume: 12,
  },

  // Storage requirements
  storage: {
    personalItems: 0.3, // m³ per person
    food30days: 0.5, // m³ per person per 30 days
    water: 0.002, // m³ per person per day (recycling assumed)
    equipment: 0.5, // m³ per person
    spares: 0.3, // m³ per person
  },

  // Mission-specific multipliers
  missionMultipliers: {
    mars: {
      storage: 1.5, // More storage for longer missions
      recreation: 1.3, // More space needed for mental health
      medical: 1.4, // Enhanced medical for long duration
    },
    moon: {
      storage: 1.2,
      recreation: 1.1,
      medical: 1.2,
    },
    leo: {
      storage: 1.0,
      recreation: 1.0,
      medical: 1.0,
    },
  },
};

/**
 * Validates if a room meets NASA standards
 * @param {Object} room - Room object with type, area, volume
 * @param {number} crewSize - Total crew size
 * @returns {Object} Validation result
 */
export function validateRoom(room, crewSize) {
  const standard = NASA_STANDARDS.spaceRequirements[room.type];
  if (!standard) {
    return {
      valid: false,
      errors: [`Unknown room type: ${room.type}`],
      warnings: [],
    };
  }

  const errors = [];
  const warnings = [];

  // Check area requirements
  const requiredArea = standard.minPerPerson * crewSize;
  if (room.area < requiredArea) {
    if (standard.priority === "critical") {
      errors.push(
        `Area ${room.area.toFixed(1)}m² is below minimum ${requiredArea.toFixed(
          1
        )}m² for ${crewSize} crew`
      );
    } else {
      warnings.push(
        `Area ${room.area.toFixed(
          1
        )}m² is below recommended ${requiredArea.toFixed(1)}m²`
      );
    }
  }

  // Check dimensions
  if (room.dimensions) {
    const minDim = NASA_STANDARDS.dimensions;
    if (
      room.dimensions.width < minDim.minRoomWidth ||
      room.dimensions.length < minDim.minRoomDepth
    ) {
      warnings.push("Room dimensions below recommended minimums");
    }
    if (room.dimensions.height < minDim.minCeilingHeight) {
      errors.push(
        `Ceiling height ${room.dimensions.height}m below minimum ${minDim.minCeilingHeight}m`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates adjacency between two rooms
 * @param {Object} room1 - First room
 * @param {Object} room2 - Second room
 * @param {number} distance - Distance between rooms (meters)
 * @returns {Object} Validation result
 */
export function validateAdjacency(room1, room2, distance) {
  const errors = [];
  const warnings = [];

  const rules = NASA_STANDARDS.adjacencyRules.filter(
    (rule) =>
      (rule.from === room1.type && rule.to === room2.type) ||
      (rule.from === room2.type && rule.to === room1.type)
  );

  rules.forEach((rule) => {
    if (rule.type === "required" && distance > rule.maxDistance) {
      errors.push(
        `${rule.from} must be within ${rule.maxDistance}m of ${rule.to}: ${rule.reason}`
      );
    } else if (rule.type === "avoid" && distance < rule.minDistance) {
      warnings.push(
        `${rule.from} should be at least ${rule.minDistance}m from ${rule.to}: ${rule.reason}`
      );
    } else if (rule.type === "preferred" && distance > rule.maxDistance) {
      warnings.push(
        `${rule.from} preferably within ${rule.maxDistance}m of ${rule.to}: ${rule.reason}`
      );
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calculate total space requirement for crew
 * @param {number} crewSize - Number of crew members
 * @param {string} destination - Mission destination ('mars', 'moon', 'leo')
 * @returns {Object} Space requirements breakdown
 */
export function calculateSpaceRequirements(crewSize, destination = "mars") {
  const multiplier = NASA_STANDARDS.missionMultipliers[destination] || {};
  const requirements = {};
  let totalArea = 0;

  Object.entries(NASA_STANDARDS.spaceRequirements).forEach(([type, data]) => {
    const mult = multiplier[type] || 1.0;
    const area = data.minPerPerson * crewSize * mult;
    requirements[type] = {
      area: area,
      priority: data.priority,
      description: data.description,
    };
    totalArea += area;
  });

  return {
    totalArea,
    totalVolume: totalArea * NASA_STANDARDS.dimensions.optimalCeilingHeight,
    perCrewArea: totalArea / crewSize,
    breakdown: requirements,
  };
}

export default NASA_STANDARDS;
