/**
 * Deck/Level management utilities
 */

/**
 * Create a new deck structure
 * @param {number} id - Deck ID
 * @param {number} level - Deck level number (1, 2, 3...)
 * @param {number} floorHeight - Height of floor from habitat bottom (meters)
 * @param {number} ceilingHeight - Height of ceiling above floor (meters)
 * @returns {Object} - Deck object
 */
export function createDeck(id, level, floorHeight, ceilingHeight = 2.8) {
  return {
    id: `deck_${id}`,
    level,
    floorHeight,
    ceilingHeight,
    layoutType: "radial", // 'radial', 'segmented', 'open'
    rooms: [],
    corridors: [],
  };
}

/**
 * Calculate how many decks can fit in a habitat
 * @param {number} habitatLength - Total habitat cylinder length (meters)
 * @param {number} deckHeight - Height per deck (meters)
 * @returns {number} - Maximum number of decks
 */
export function calculateMaxDecks(habitatLength, deckHeight = 2.8) {
  return Math.floor(habitatLength / deckHeight);
}

/**
 * Generate evenly-spaced decks
 * @param {number} numDecks - Number of decks to create
 * @param {number} habitatLength - Total habitat length
 * @param {number} deckHeight - Height per deck
 * @returns {Array} - Array of deck objects
 */
export function generateEvenlySpacedDecks(
  numDecks,
  habitatLength,
  deckHeight = 2.8
) {
  const decks = [];
  const spacing = habitatLength / numDecks;

  for (let i = 0; i < numDecks; i++) {
    const floorHeight = i * spacing;
    decks.push(createDeck(i + 1, i + 1, floorHeight, deckHeight));
  }

  return decks;
}

/**
 * Get usable area on a deck (accounting for cylinder shape)
 * @param {number} radius - Cylinder radius
 * @param {number} innerClearance - Clearance from center (meters)
 * @returns {number} - Usable floor area (m²)
 */
export function getDeckUsableArea(radius, innerClearance = 1.0) {
  const outerArea = Math.PI * radius * radius;
  const innerArea = Math.PI * innerClearance * innerClearance;
  return outerArea - innerArea;
}

/**
 * Calculate total volume of a deck
 * @param {number} radius - Cylinder radius
 * @param {number} height - Deck ceiling height
 * @returns {number} - Volume (m³)
 */
export function getDeckVolume(radius, height) {
  return Math.PI * radius * radius * height;
}

/**
 * Distribute rooms evenly around a deck (radial layout)
 * @param {Array} rooms - Array of rooms to place
 * @param {number} radius - Cylinder radius
 * @param {number} deckHeight - Deck floor height
 * @param {number} ceilingHeight - Deck ceiling height
 * @returns {Array} - Rooms with updated bounds
 */
export function distributeRoomsRadially(
  rooms,
  radius,
  deckHeight,
  ceilingHeight
) {
  const anglePerRoom = (Math.PI * 2) / rooms.length;

  return rooms.map((room, index) => {
    const centerAngle = index * anglePerRoom;
    const angleSpan = anglePerRoom * 0.9; // 90% to leave gaps

    // Use room dimensions or defaults
    const roomDepth = room.dimensions?.length || 3.0;
    const radiusOuter = radius - 1; // 1m from wall
    const radiusInner = Math.max(radiusOuter - roomDepth, 2);

    return {
      ...room,
      bounds: {
        angleStart: centerAngle - angleSpan / 2,
        angleEnd: centerAngle + angleSpan / 2,
        radiusInner,
        radiusOuter,
        heightStart: deckHeight,
        heightEnd: deckHeight + ceilingHeight,
      },
    };
  });
}

/**
 * Distribute rooms in concentric rings
 * @param {Array} rooms - Array of rooms
 * @param {number} radius - Cylinder radius
 * @param {number} deckHeight - Deck floor height
 * @param {number} ceilingHeight - Deck ceiling height
 * @param {number} numRings - Number of concentric rings (2-3 typical)
 * @returns {Array} - Rooms with updated bounds
 */
export function distributeRoomsInRings(
  rooms,
  radius,
  deckHeight,
  ceilingHeight,
  numRings = 2
) {
  const roomsPerRing = Math.ceil(rooms.length / numRings);
  const ringWidth = (radius - 2) / numRings; // 2m center clearance

  return rooms.map((room, index) => {
    const ringIndex = Math.floor(index / roomsPerRing);
    const positionInRing = index % roomsPerRing;
    const roomsInThisRing = Math.min(
      roomsPerRing,
      rooms.length - ringIndex * roomsPerRing
    );

    const radiusOuter = radius - 1 - ringIndex * ringWidth;
    const radiusInner = radiusOuter - ringWidth * 0.9;

    const anglePerRoom = (Math.PI * 2) / roomsInThisRing;
    const centerAngle = positionInRing * anglePerRoom;
    const angleSpan = anglePerRoom * 0.85;

    return {
      ...room,
      bounds: {
        angleStart: centerAngle - angleSpan / 2,
        angleEnd: centerAngle + angleSpan / 2,
        radiusInner,
        radiusOuter,
        heightStart: deckHeight,
        heightEnd: deckHeight + ceilingHeight,
      },
    };
  });
}

/**
 * Create a central corridor around the deck
 * @param {string} deckId - Deck ID
 * @param {number} radius - Cylinder radius
 * @param {number} deckHeight - Deck floor height
 * @param {number} ceilingHeight - Deck ceiling height
 * @param {number} corridorWidth - Width of corridor (meters)
 * @returns {Object} - Corridor definition
 */
export function createCircularCorridor(
  deckId,
  radius,
  deckHeight,
  ceilingHeight,
  corridorWidth = 1.5
) {
  const corridorRadius = radius / 2;

  return {
    id: `corridor_${deckId}_circular`,
    type: "circular",
    width: corridorWidth,
    bounds: {
      angleStart: 0,
      angleEnd: Math.PI * 2,
      radiusInner: corridorRadius - corridorWidth / 2,
      radiusOuter: corridorRadius + corridorWidth / 2,
      heightStart: deckHeight,
      heightEnd: deckHeight + ceilingHeight,
    },
    connectsRooms: [], // Will be populated based on room positions
  };
}

/**
 * Validate deck configuration
 * @param {Object} deck - Deck object
 * @param {number} habitatLength - Total habitat length
 * @returns {Object} - Validation result
 */
export function validateDeck(deck, habitatLength) {
  const errors = [];
  const warnings = [];

  // Check deck fits within habitat
  const deckTop = deck.floorHeight + deck.ceilingHeight;
  if (deckTop > habitatLength) {
    errors.push("Deck extends beyond habitat length");
  }

  // Check ceiling height
  if (deck.ceilingHeight < 2.0) {
    errors.push("Ceiling height below minimum 2.0m");
  } else if (deck.ceilingHeight < 2.5) {
    warnings.push("Ceiling height below recommended 2.5m");
  }

  // Check room collisions
  for (let i = 0; i < deck.rooms.length - 1; i++) {
    for (let j = i + 1; j < deck.rooms.length; j++) {
      // Collision checking would go here
      // Using interiorGeometry.checkSegmentCollision
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export default {
  createDeck,
  calculateMaxDecks,
  generateEvenlySpacedDecks,
  getDeckUsableArea,
  getDeckVolume,
  distributeRoomsRadially,
  distributeRoomsInRings,
  createCircularCorridor,
  validateDeck,
};
