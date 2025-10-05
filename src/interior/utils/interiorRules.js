/**
 * Validation utilities for interior design rules
 * Enforces NASA standards and safety requirements
 */

import {
  NASA_STANDARDS,
  validateRoom,
  validateAdjacency,
} from "../data/nasaStandards";
import { calculateRoomDistance } from "./interiorGeometry";

/**
 * Validate entire interior design
 * @param {Object} interiorConfig - Complete interior configuration
 * @param {number} crewSize - Number of crew members
 * @returns {Object} - Validation results with errors and warnings
 */
export function validateInteriorDesign(interiorConfig, crewSize) {
  const errors = [];
  const warnings = [];
  const roomValidations = [];

  // Collect all rooms from all decks
  const allRooms = [];
  interiorConfig.decks.forEach((deck) => {
    deck.rooms.forEach((room) => {
      allRooms.push({ ...room, deckId: deck.id, deckLevel: deck.level });
    });
  });

  // 1. Validate individual rooms
  allRooms.forEach((room) => {
    const validation = validateRoom(room, crewSize);
    roomValidations.push({
      roomId: room.id,
      roomType: room.type,
      ...validation,
    });

    if (!validation.valid) {
      errors.push(...validation.errors.map((e) => `${room.name}: ${e}`));
    }
    warnings.push(...validation.warnings.map((w) => `${room.name}: ${w}`));
  });

  // 2. Check space requirements are met
  const spaceCheck = checkSpaceRequirements(allRooms, crewSize);
  errors.push(...spaceCheck.errors);
  warnings.push(...spaceCheck.warnings);

  // 3. Validate adjacencies
  const adjacencyCheck = checkAdjacencies(allRooms);
  errors.push(...adjacencyCheck.errors);
  warnings.push(...adjacencyCheck.warnings);

  // 4. Check safety requirements
  const safetyCheck = checkSafetyRequirements(interiorConfig);
  errors.push(...safetyCheck.errors);
  warnings.push(...safetyCheck.warnings);

  // 5. Check noise zoning
  const noiseCheck = checkNoiseZoning(allRooms);
  warnings.push(...noiseCheck.warnings);

  // 6. Validate deck structure
  const deckCheck = validateDecks(
    interiorConfig.decks,
    interiorConfig.cylLength
  );
  errors.push(...deckCheck.errors);
  warnings.push(...deckCheck.warnings);

  return {
    valid: errors.length === 0,
    errors: [...new Set(errors)], // Remove duplicates
    warnings: [...new Set(warnings)],
    score: calculateDesignScore(
      interiorConfig,
      crewSize,
      errors.length,
      warnings.length
    ),
    roomValidations,
  };
}

/**
 * Check if all required space types are present with sufficient area
 */
function checkSpaceRequirements(rooms, crewSize) {
  const errors = [];
  const warnings = [];

  // Group rooms by type
  const roomsByType = {};
  rooms.forEach((room) => {
    if (!roomsByType[room.type]) {
      roomsByType[room.type] = [];
    }
    roomsByType[room.type].push(room);
  });

  // Check each required space type
  Object.entries(NASA_STANDARDS.spaceRequirements).forEach(
    ([type, standard]) => {
      const roomsOfType = roomsByType[type] || [];
      const totalArea = roomsOfType.reduce(
        (sum, room) => sum + (room.area || 0),
        0
      );
      const requiredArea = standard.minPerPerson * crewSize;

      if (roomsOfType.length === 0) {
        if (standard.priority === "critical") {
          errors.push(`Missing critical space: ${type}`);
        } else if (standard.priority === "important") {
          warnings.push(`Missing important space: ${type}`);
        } else {
          warnings.push(`Optional space not included: ${type}`);
        }
      } else if (totalArea < requiredArea) {
        const deficit = requiredArea - totalArea;
        if (standard.priority === "critical") {
          errors.push(
            `${type}: ${totalArea.toFixed(
              1
            )}m² provided, ${requiredArea.toFixed(
              1
            )}m² required (deficit: ${deficit.toFixed(1)}m²)`
          );
        } else {
          warnings.push(
            `${type}: ${totalArea.toFixed(
              1
            )}m² provided, ${requiredArea.toFixed(1)}m² recommended`
          );
        }
      }
    }
  );

  return { errors, warnings };
}

/**
 * Check adjacency rules between rooms
 */
function checkAdjacencies(rooms) {
  const errors = [];
  const warnings = [];

  // Create lookup for room distances
  const roomDistances = new Map();

  rooms.forEach((room1, i) => {
    rooms.slice(i + 1).forEach((room2) => {
      const distance = calculateRoomDistance(room1, room2);
      const key = `${room1.id}-${room2.id}`;
      roomDistances.set(key, distance);
    });
  });

  // Check all adjacency rules
  NASA_STANDARDS.adjacencyRules.forEach((rule) => {
    const fromRooms = rooms.filter((r) => r.type === rule.from);
    const toRooms = rooms.filter((r) => r.type === rule.to);

    if (fromRooms.length === 0 || toRooms.length === 0) {
      return; // Can't check if rooms don't exist
    }

    fromRooms.forEach((fromRoom) => {
      toRooms.forEach((toRoom) => {
        const key = `${fromRoom.id}-${toRoom.id}`;
        const distance = roomDistances.get(key);

        const adjValidation = validateAdjacency(fromRoom, toRoom, distance);

        errors.push(...adjValidation.errors);
        warnings.push(...adjValidation.warnings);
      });
    });
  });

  return { errors, warnings };
}

/**
 * Check safety requirements (egress, corridors, etc.)
 */
function checkSafetyRequirements(interiorConfig) {
  const errors = [];
  const warnings = [];

  interiorConfig.decks.forEach((deck) => {
    // Check corridor widths
    if (deck.corridors) {
      deck.corridors.forEach((corridor) => {
        if (corridor.width < NASA_STANDARDS.dimensions.minCorridorWidth) {
          errors.push(
            `Corridor ${corridor.id} width ${corridor.width}m below minimum ${NASA_STANDARDS.dimensions.minCorridorWidth}m`
          );
        }
      });
    }

    // Check egress paths (simplified - would need pathfinding for full implementation)
    const hasAirlock = deck.rooms.some((r) => r.type === "airlock");
    if (!hasAirlock && deck.rooms.length > 0) {
      warnings.push(`Deck ${deck.level} has no direct airlock access`);
    }

    // Check ceiling heights
    deck.rooms.forEach((room) => {
      const height =
        room.bounds.heightEnd - room.bounds.heightStart || deck.ceilingHeight;
      if (height < NASA_STANDARDS.dimensions.minCeilingHeight) {
        errors.push(
          `Room ${room.name} ceiling height ${height}m below minimum ${NASA_STANDARDS.dimensions.minCeilingHeight}m`
        );
      }
    });
  });

  return { errors, warnings };
}

/**
 * Check noise zoning - noisy rooms shouldn't be near quiet ones
 */
function checkNoiseZoning(rooms) {
  const warnings = [];

  const quietRooms = rooms.filter((r) =>
    NASA_STANDARDS.noiseZones.quiet.spaces.includes(r.type)
  );
  const loudRooms = rooms.filter((r) =>
    NASA_STANDARDS.noiseZones.loud.spaces.includes(r.type)
  );

  quietRooms.forEach((quietRoom) => {
    loudRooms.forEach((loudRoom) => {
      const distance = calculateRoomDistance(quietRoom, loudRoom);
      if (distance < 5) {
        // 5m minimum separation recommended
        warnings.push(
          `Noisy ${loudRoom.type} within ${distance.toFixed(1)}m of quiet ${
            quietRoom.type
          } - consider soundproofing or separation`
        );
      }
    });
  });

  return { warnings };
}

/**
 * Validate deck structure and distribution
 */
function validateDecks(decks, cylLength) {
  const errors = [];
  const warnings = [];

  if (decks.length === 0) {
    errors.push("No decks defined");
    return { errors, warnings };
  }

  // Check deck heights don't exceed cylinder length
  decks.forEach((deck) => {
    const deckTop = deck.floorHeight + deck.ceilingHeight;
    if (deckTop > cylLength) {
      errors.push(`Deck ${deck.level} extends beyond habitat length`);
    }
  });

  // Check for overlapping decks
  for (let i = 0; i < decks.length - 1; i++) {
    const deck1 = decks[i];
    const deck2 = decks[i + 1];
    const deck1Top = deck1.floorHeight + deck1.ceilingHeight;
    if (deck1Top > deck2.floorHeight) {
      errors.push(`Decks ${deck1.level} and ${deck2.level} overlap`);
    }
  }

  return { errors, warnings };
}

/**
 * Calculate overall design score (0-100)
 */
function calculateDesignScore(
  interiorConfig,
  crewSize,
  errorCount,
  warningCount
) {
  let score = 100;

  // Deduct for errors and warnings
  score -= errorCount * 10;
  score -= warningCount * 3;

  // Bonus for good space utilization
  const allRooms = interiorConfig.decks.flatMap((d) => d.rooms);
  const totalUsedVolume = allRooms.reduce(
    (sum, room) => sum + (room.volume || 0),
    0
  );
  const totalVolume = interiorConfig.totalVolume;
  const utilization = totalUsedVolume / totalVolume;

  if (utilization > 0.4 && utilization < 0.7) {
    score += 10; // Bonus for optimal utilization (40-70%)
  } else if (utilization < 0.3) {
    score -= 5; // Penalty for under-utilization
  } else if (utilization > 0.8) {
    score -= 10; // Penalty for over-crowding
  }

  // Bonus for having all critical spaces
  const hasAllCritical = Object.entries(NASA_STANDARDS.spaceRequirements)
    .filter(([, standard]) => standard.priority === "critical")
    .every(([type]) => allRooms.some((room) => room.type === type));

  if (hasAllCritical) {
    score += 15;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Get validation summary for display
 */
export function getValidationSummary(validationResult) {
  const { errors, warnings, score } = validationResult;

  let status = "excellent";
  if (errors.length > 0) {
    status = "invalid";
  } else if (warnings.length > 5) {
    status = "needs-improvement";
  } else if (warnings.length > 0) {
    status = "good";
  }

  return {
    status,
    score,
    errorCount: errors.length,
    warningCount: warnings.length,
    message: getStatusMessage(status, errors.length, warnings.length),
  };
}

function getStatusMessage(status, errorCount, warningCount) {
  switch (status) {
    case "excellent":
      return "✅ Design meets all NASA standards!";
    case "good":
      return `✓ Design is valid with ${warningCount} minor recommendations`;
    case "needs-improvement":
      return `⚠️ Design has ${warningCount} issues to address`;
    case "invalid":
      return `❌ Design has ${errorCount} critical errors`;
    default:
      return "Design validation pending";
  }
}

export default {
  validateInteriorDesign,
  getValidationSummary,
};
