# 🏠 Interior Design System Architecture

## Overview

This document describes the interior design system for space habitat modules, completely separate from the exterior CAD system.

## System Structure

```
src/
├── interior/                      # NEW: Interior design system (isolated)
│   ├── InteriorApp.jsx           # Main interior design app
│   ├── InteriorApp.css
│   │
│   ├── components/               # Interior-specific components
│   │   ├── InteriorModeToggle.jsx
│   │   ├── DeckManager.jsx       # Multi-level deck system
│   │   ├── FloorPlanCanvas.jsx   # 2D floor plan editor
│   │   ├── InteriorViewport3D.jsx # 3D interior walkthrough
│   │   ├── RoomLibrary.jsx       # Interior space types
│   │   ├── RoomPropertiesPanel.jsx
│   │   ├── SpaceValidator.jsx    # NASA rules checking
│   │   ├── ViewModeToggle.jsx    # Polar vs Unwrapped view
│   │   └── FurnitureLibrary.jsx  # (Phase 2)
│   │
│   ├── utils/                    # Interior-specific utilities
│   │   ├── interiorGeometry.js   # Cylinder → 2D conversions
│   │   ├── interiorRules.js      # NASA standards & validation
│   │   ├── roomGenerators.js     # Room shape generators
│   │   ├── deckSystem.js         # Deck/level management
│   │   ├── pathfinding.js        # Corridor/egress calculation
│   │   └── spaceCalculator.js    # Area/volume calculations
│   │
│   └── data/
│       ├── roomTypes.js          # Room definitions
│       ├── nasaStandards.js      # Official NASA requirements
│       └── furnitureTypes.js     # (Phase 2)
│
└── App.jsx                       # EXISTING: Exterior design (unchanged)
```

## Key Concepts

### 1. Coordinate Systems

#### Cylinder 3D (Storage format)

```javascript
{
  x: radius * cos(angle),
  y: heightAboveFloor,
  z: radius * sin(angle)
}
```

#### 2D Unwrapped (Editor format)

```javascript
{
  x: angle * radius,  // Arc length along cylinder
  y: heightAboveFloor
}
```

#### 2D Polar (Visualization)

```javascript
{
  angle: θ,           // Radians from 0 to 2π
  radius: distance from center
}
```

### 2. Data Structure

```javascript
// Interior data attached to exterior habitat module
{
  habitatModuleId: "hab_001",
  interiorConfig: {
    mode: "multi-deck",
    cylRadius: 7.5,      // meters
    cylLength: 20,       // meters
    totalVolume: 3534,   // m³

    decks: [
      {
        id: "deck_001",
        level: 1,
        floorHeight: 0,      // meters from bottom
        ceilingHeight: 2.8,  // meters
        layoutType: "radial", // or "segmented", "open"

        rooms: [
          {
            id: "room_001",
            type: "sleep_quarters",
            name: "Crew Quarters A",

            // Position in cylinder (3D)
            position: { x: 5, y: 0.5, z: 2 },

            // Bounding in polar coords
            bounds: {
              angleStart: 0,      // radians
              angleEnd: 1.047,    // 60° in radians
              radiusInner: 2,     // meters from center
              radiusOuter: 7,     // meters from center
              heightStart: 0,
              heightEnd: 2.8
            },

            // Metadata
            area: 15.5,           // m²
            volume: 43.4,         // m³
            occupancy: 2,

            // Interior features
            walls: [
              { from: [x1,y1,z1], to: [x2,y2,z2], type: "partition" }
            ],
            doors: [
              { position: [x,y,z], connectsTo: "corridor_001" }
            ],

            // Requirements
            requirements: {
              minArea: 12,
              privacy: true,
              soundproofing: true,
              adjacentTo: ["hygiene"],
              avoid: ["galley", "exercise"]
            },

            // Validation state
            valid: true,
            violations: []
          }
        ],

        corridors: [
          {
            id: "corridor_001",
            type: "radial",      // or "circumferential"
            width: 1.2,          // meters
            path: [[x1,y1,z1], [x2,y2,z2], ...],
            connectsRooms: ["room_001", "room_002"]
          }
        ]
      }
    ],

    // Global validation
    validation: {
      totalCrewCapacity: 6,
      spacePerCrew: 42.5,      // m² per person
      meetsNASAStandards: true,
      violations: []
    }
  }
}
```

### 3. View Modes

#### Mode 1: Polar/Radial View (Default)

- Top-down circular cross-section
- Rooms as pie slices or annular segments
- Intuitive for cylindrical habitats
- Best for: Initial layout, spatial relationships

#### Mode 2: Unwrapped View

- Cylinder "unrolled" into rectangle
- Width = πD (circumference)
- Standard engineering approach
- Best for: Precise measurements, rectangular rooms

#### Mode 3: 3D Interior View

- Perspective walkthrough
- Shows actual interior appearance
- Ray-traced lighting (optional)
- Best for: Visualization, presentations

### 4. Room Placement Methods

#### A. Radial Segments (Pie slices)

```
      ┌─────┐
    ╱│  A  │╲
   ╱ │     │ ╲
  │  └─────┘  │
  │  ┌─────┐  │
   ╲ │  B  │ ╱
    ╲│     │╱
      └─────┘
```

#### B. Concentric Rings

```
  ┌───────────┐
  │  Corridor │  ← Outer ring
  ├───────────┤
  │   Rooms   │  ← Middle ring
  ├───────────┤
  │   Core    │  ← Inner ring
  └───────────┘
```

#### C. Free-form Placement

- User places rectangular rooms
- Auto-snap to cylinder curvature
- Collision detection
- Best for custom layouts

## Implementation Phases

### Phase 1: MVP (Week 1) ✅

- [x] Interior mode toggle
- [x] Single deck support
- [x] 2D polar floor plan view
- [x] Basic room placement (drag & drop)
- [x] Room types library
- [x] Basic validation (area requirements)

### Phase 2: Core Features (Week 2)

- [ ] Multi-deck system
- [ ] 3D interior visualization
- [ ] Wall/partition editor
- [ ] Corridor generation
- [ ] Advanced rule engine
- [ ] Unwrapped view mode

### Phase 3: Advanced (Week 3+)

- [ ] Furniture placement
- [ ] HVAC/utility routing
- [ ] Lighting simulation
- [ ] Egress path analysis
- [ ] Export to NASA formats

## NASA Standards Integration

### Required Spaces (per crew member)

- Sleep: 2.5 m²
- Hygiene: 1.0 m²
- Galley: 2.0 m²
- Work: 1.5 m²
- Exercise: 2.5 m²
- Recreation: 1.5 m²
- Storage: 1.0 m²
- Medical: 1.0 m² (shared)

### Safety Rules

- Minimum corridor width: 1.2m
- Maximum egress distance: 30m
- Minimum headroom: 2.0m
- Emergency lighting required
- Two independent egress paths

### Adjacency Preferences

- Galley → Dining (adjacent)
- Hygiene → Sleep (nearby)
- Airlock → Suit Storage (adjacent)
- Noisy → Quiet (separated)

## File Organization Notes

- **Complete isolation** from exterior CAD system
- Can be run as separate app or integrated
- Shared data format for habitat shells
- No code dependencies between systems
- Can develop/test independently
