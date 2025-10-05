/**
 * Space calculation utilities
 */

import {
  calculateSegmentArea,
  calculateSegmentVolume,
} from "./interiorGeometry";

/**
 * Calculate total usable area in interior
 * @param {Object} interiorConfig - Interior configuration
 * @returns {Object} - Area breakdown
 */
export function calculateTotalArea(interiorConfig) {
  let totalRoomArea = 0;
  let totalCorridorArea = 0;
  let totalUsableArea = 0;

  interiorConfig.decks.forEach((deck) => {
    deck.rooms.forEach((room) => {
      const area = room.area || calculateSegmentArea(room.bounds);
      totalRoomArea += area;
      totalUsableArea += area;
    });

    if (deck.corridors) {
      deck.corridors.forEach((corridor) => {
        const area = calculateSegmentArea(corridor.bounds);
        totalCorridorArea += area;
        totalUsableArea += area;
      });
    }
  });

  return {
    totalRoomArea,
    totalCorridorArea,
    totalUsableArea,
    totalArea: interiorConfig.totalVolume / 2.8, // Assuming 2.8m average height
  };
}

/**
 * Calculate space per crew member
 * @param {Object} interiorConfig - Interior configuration
 * @param {number} crewSize - Number of crew
 * @returns {Object} - Space metrics per person
 */
export function calculateSpacePerCrew(interiorConfig, crewSize) {
  const areas = calculateTotalArea(interiorConfig);

  return {
    totalVolumePerPerson: interiorConfig.totalVolume / crewSize,
    usableAreaPerPerson: areas.totalUsableArea / crewSize,
    roomAreaPerPerson: areas.totalRoomArea / crewSize,
  };
}

/**
 * Calculate space utilization percentage
 * @param {Object} interiorConfig - Interior configuration
 * @returns {number} - Utilization percentage (0-100)
 */
export function calculateUtilization(interiorConfig) {
  const areas = calculateTotalArea(interiorConfig);
  const totalPossibleArea =
    Math.PI * interiorConfig.cylRadius * interiorConfig.cylRadius;

  return (areas.totalUsableArea / totalPossibleArea) * 100;
}

/**
 * Calculate space breakdown by room type
 * @param {Array} rooms - Array of all rooms
 * @returns {Object} - Area breakdown by type
 */
export function calculateSpaceByType(rooms) {
  const breakdown = {};

  rooms.forEach((room) => {
    const area = room.area || calculateSegmentArea(room.bounds);

    if (!breakdown[room.type]) {
      breakdown[room.type] = {
        count: 0,
        totalArea: 0,
        totalVolume: 0,
        rooms: [],
      };
    }

    breakdown[room.type].count++;
    breakdown[room.type].totalArea += area;
    breakdown[room.type].totalVolume +=
      room.volume || calculateSegmentVolume(room.bounds);
    breakdown[room.type].rooms.push(room.id);
  });

  return breakdown;
}

/**
 * Calculate efficiency score
 * @param {Object} interiorConfig - Interior configuration
 * @param {number} crewSize - Number of crew
 * @returns {Object} - Efficiency metrics
 */
export function calculateEfficiency(interiorConfig, crewSize) {
  const areas = calculateTotalArea(interiorConfig);
  const spacePerCrew = calculateSpacePerCrew(interiorConfig, crewSize);

  // Optimal space per crew: 40-60 m²
  const optimalMin = 40;
  const optimalMax = 60;
  const actualSpace = spacePerCrew.usableAreaPerPerson;

  let spaceEfficiency = 100;
  if (actualSpace < optimalMin) {
    // Penalize under-utilization
    spaceEfficiency = (actualSpace / optimalMin) * 100;
  } else if (actualSpace > optimalMax) {
    // Penalize over-allocation
    spaceEfficiency = (optimalMax / actualSpace) * 100;
  }

  // Corridor efficiency (should be 10-20% of total)
  const corridorRatio = areas.totalCorridorArea / areas.totalUsableArea;
  let corridorEfficiency = 100;
  if (corridorRatio < 0.1) {
    corridorEfficiency = (corridorRatio / 0.1) * 100;
  } else if (corridorRatio > 0.2) {
    corridorEfficiency = (0.2 / corridorRatio) * 100;
  }

  const overallEfficiency = (spaceEfficiency + corridorEfficiency) / 2;

  return {
    overallEfficiency: Math.round(overallEfficiency),
    spaceEfficiency: Math.round(spaceEfficiency),
    corridorEfficiency: Math.round(corridorEfficiency),
    corridorRatio: Math.round(corridorRatio * 100),
  };
}

/**
 * Get space comparison to NASA standards
 * @param {Object} interiorConfig - Interior configuration
 * @param {number} crewSize - Number of crew
 * @returns {Object} - Comparison data
 */
export function compareToStandards(interiorConfig, crewSize) {
  const spacePerCrew = calculateSpacePerCrew(interiorConfig, crewSize);

  // NASA standards
  const minStandard = 25; // m³ per person minimum
  const optimalStandard = 50; // m³ per person optimal

  const meetsMinimum = spacePerCrew.totalVolumePerPerson >= minStandard;
  const meetsOptimal = spacePerCrew.totalVolumePerPerson >= optimalStandard;

  const percentOfMinimum =
    (spacePerCrew.totalVolumePerPerson / minStandard) * 100;
  const percentOfOptimal =
    (spacePerCrew.totalVolumePerPerson / optimalStandard) * 100;

  return {
    meetsMinimum,
    meetsOptimal,
    percentOfMinimum: Math.round(percentOfMinimum),
    percentOfOptimal: Math.round(percentOfOptimal),
    currentVolume: Math.round(spacePerCrew.totalVolumePerPerson),
    minRequired: minStandard,
    optimalTarget: optimalStandard,
  };
}

export default {
  calculateTotalArea,
  calculateSpacePerCrew,
  calculateUtilization,
  calculateSpaceByType,
  calculateEfficiency,
  compareToStandards,
};
