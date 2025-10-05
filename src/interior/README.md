# 🏠 Interior Design System - README

## Overview

This is the **Interior Design System** for space habitat modules - completely separate from the exterior CAD system. It allows you to design the internal layout of cylindrical habitat modules with NASA standard compliance.

## 🎯 Features Implemented (MVP - Phase 1)

### ✅ Core Features

- **Multi-Deck System** - Create multiple floor levels within a habitat
- **2D Floor Plan Views**
  - **Polar View** - Top-down circular cross-section (best for visualization)
  - **Unwrapped View** - Cylinder unrolled flat (engineering view)
- **Room Library** - 13+ room types (sleep, hygiene, galley, work, etc.)
- **Drag-and-Drop Room Placement** - Click rooms to add to active deck
- **NASA Standards Validation** - Real-time compliance checking
- **Space Calculator** - Automatic area/volume calculations
- **Design Scoring** - 0-100 score based on NASA requirements

### 📐 2D View Modes Explained

#### 1. **Polar View** (Recommended for beginners)

```
Top-down view showing the circular cross-section:
        ┌─────┐
      ╱│  A  │╲
     ╱ │     │ ╲
    │  └─────┘  │
    │  ┌─────┐  │
     ╲ │  B  │ ╱
      ╲│     │╱
        └─────┘
```

- Shows rooms as pie slices or annular segments
- Intuitive spatial relationships
- Best for initial layout and presentations

#### 2. **Unwrapped View** (For precision work)

```
Cylinder "unrolled" into a rectangle:
╔═══════════════════════════════╗
║ Room A    │ Room B │ Room C  ║
║           │        │          ║
╚═══════════════════════════════╝
Width = 2πR (circumference)
```

- Shows curved wall as flat surface
- Easier to place rectangular rooms
- Standard engineering approach
- Better for precise measurements

## 🚀 How to Use

### 1. Launch Interior Design Mode

```javascript
// In your main app
import InteriorApp from "./interior/InteriorApp";

// Pass habitat module data
<InteriorApp
  habitatModule={{
    id: "habitat_001",
    radius: 7.5, // meters
    length: 20, // meters
  }}
/>;
```

### 2. Create Decks

1. Click **"➕ Add Deck"** in left sidebar
2. Each deck is a horizontal level
3. Select a deck to work on it

### 3. Add Rooms

1. Browse **Room Library** in left sidebar
2. Click a room type to add it
3. Room auto-places to avoid collisions
4. Click on room in viewport to select
5. Right-click to delete

### 4. Validation

- Real-time NASA standards checking
- Red errors = critical violations
- Yellow warnings = recommendations
- Design score updates automatically

## 📁 File Structure

```
src/interior/
├── InteriorApp.jsx              # Main app component
├── InteriorApp.css
│
├── components/
│   ├── DeckManager.jsx          # Multi-level deck system
│   ├── RoomLibrary.jsx          # Room type selector
│   ├── FloorPlanCanvas.jsx      # 2D floor plan renderer
│   ├── InteriorViewport3D.jsx   # 3D view (Phase 2)
│   ├── SpaceValidator.jsx       # NASA validation display
│   └── ViewModeToggle.jsx       # View mode switcher
│
├── utils/
│   ├── interiorGeometry.js      # Cylinder ↔ 2D conversions
│   ├── interiorRules.js         # Validation logic
│   ├── deckSystem.js            # Deck management
│   └── spaceCalculator.js       # Area/volume calculations
│
└── data/
    ├── nasaStandards.js         # NASA-STD-3001 requirements
    └── roomTypes.js             # Room definitions
```

## 🧮 Math Behind It

### Cylindrical to 2D Polar Conversion

```javascript
// 3D position in cylinder
const position3D = { x, y, z };

// Convert to polar
const angle = Math.atan2(z, x); // 0 to 2π
const radius = Math.sqrt(x * x + z * z);

// Polar coords
const polar = { angle, radius };
```

### Cylindrical to 2D Unwrapped

```javascript
// Convert angle to arc length
const arcLength = angle * radius;

// Unwrapped coords
const unwrapped = { x: arcLength, y: radius };
```

### Room Area Calculation (Annular Sector)

```javascript
// Room bounds
const { angleStart, angleEnd, radiusInner, radiusOuter } = room.bounds;

// Area formula
const angleSpan = angleEnd - angleStart;
const area = 0.5 * angleSpan * (radiusOuter² - radiusInner²);
```

## 📊 NASA Standards Enforced

### Minimum Space Per Crew Member

- Sleep: 2.5 m²
- Hygiene: 1.0 m²
- Galley: 2.0 m²
- Work: 1.5 m²
- Exercise: 2.5 m²
- Recreation: 1.5 m²
- Storage: 1.0 m²

### Safety Requirements

- Min corridor width: 1.2m
- Max egress distance: 30m
- Min ceiling height: 2.0m
- Two independent exit paths

### Adjacency Rules

- Galley ↔ Dining (required, <5m)
- Hygiene ↔ Sleep (preferred, <10m)
- Airlock ↔ Storage (required, <8m)
- Noisy ↔ Quiet (avoid, >5m separation)

## 🎨 Room Types Available

| Icon | Type             | Category   | Default Size |
| ---- | ---------------- | ---------- | ------------ |
| 🛏️   | Sleep Quarters   | Living     | 2.5×3.0m     |
| 🚿   | Hygiene Station  | Living     | 1.5×2.0m     |
| 🍽️   | Galley/Kitchen   | Living     | 3.0×4.0m     |
| 🪑   | Dining Area      | Living     | 3.0×4.0m     |
| 💻   | Work Station/Lab | Operations | 3.0×4.0m     |
| 💪   | Exercise Area    | Health     | 3.0×4.0m     |
| 🎮   | Recreation       | Living     | 3.0×3.5m     |
| 🏥   | Medical Bay      | Health     | 2.5×3.5m     |
| 📦   | Storage          | Operations | 2.0×3.0m     |
| 🌬️   | Life Support     | Systems    | 2.5×3.0m     |
| 🚪   | Airlock          | Systems    | 2.0×2.5m     |
| 🌱   | Greenhouse       | Operations | 3.0×4.0m     |
| 🎛️   | Command Center   | Operations | 3.0×4.0m     |

## 🔧 Customization

### Adding New Room Types

Edit `src/interior/data/roomTypes.js`:

```javascript
export const ROOM_TYPES = {
  myNewRoom: {
    id: "myNewRoom",
    name: "My New Room",
    icon: "🎯",
    category: "operations",
    color: "#4a90e2",
    defaultDimensions: { width: 3.0, length: 4.0, height: 2.8 },
    // ... more properties
  },
};
```

### Modifying NASA Standards

Edit `src/interior/data/nasaStandards.js`:

```javascript
export const NASA_STANDARDS = {
  spaceRequirements: {
    myNewRoom: {
      minPerPerson: 2.0, // m² per crew member
      priority: "important",
    },
  },
};
```

## 🚀 Future Enhancements (Phase 2+)

- [ ] 3D interior walkthrough with ray-traced lighting
- [ ] Furniture placement system
- [ ] HVAC/utility routing visualization
- [ ] Egress path analysis with pathfinding
- [ ] Drag-to-resize rooms in 2D view
- [ ] Deck rotation for multi-level views
- [ ] Export to NASA standard formats
- [ ] Collision-free room arrangement algorithm
- [ ] Acoustic simulation for noise zones
- [ ] Lighting simulation per room

## 🐛 Known Limitations (MVP)

1. **No room resizing** - Rooms use default dimensions
2. **Basic collision detection** - Rooms may overlap slightly
3. **Simple placement** - Auto-places at first available spot
4. **No furniture** - Room interiors are empty
5. **3D view placeholder** - Full 3D coming in Phase 2
6. **No undo/redo** - Must delete and re-add rooms
7. **No save/load** - Data not persisted yet

## 📚 Technical Documentation

See `INTERIOR_DESIGN_ARCHITECTURE.md` for:

- Complete system architecture
- Data structure specifications
- Algorithm details
- Integration patterns

## 🤝 Integration with Exterior System

The interior system is **completely isolated** from the exterior CAD:

```
src/
├── App.jsx                  # Exterior CAD (unchanged)
├── components/              # Exterior components
├── utils/                   # Exterior utilities
│
└── interior/                # Interior system (NEW, isolated)
    ├── InteriorApp.jsx      # Separate app
    ├── components/          # Interior components
    └── utils/               # Interior utilities
```

**Shared Data:**

- Habitat module dimensions (radius, length)
- Module ID for linking

**No Code Dependencies:**

- Can develop independently
- Can test independently
- Can deploy separately

## 💡 Tips & Best Practices

1. **Start with Polar View** - Easier to understand spatial layout
2. **Add Critical Rooms First** - Sleep, hygiene, galley, life support
3. **Check Validation Often** - Fix errors before adding more rooms
4. **Use Deck Levels Wisely** - Group related functions together
5. **Leave Corridor Space** - Don't fill 100% of area
6. **Consider Noise Zoning** - Separate quiet from loud spaces
7. **Plan Egress Paths** - Ensure access to airlocks

## 📞 Support & Questions

For questions or issues:

1. Check validation warnings for specific guidance
2. Review NASA standards in `nasaStandards.js`
3. Consult architecture document
4. Adjust crew size to see requirement changes

---

Built for NASA Space Apps Challenge 2024 🚀
