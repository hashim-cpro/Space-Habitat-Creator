# 🚀 Interior Design System - Quick Start Guide

## Get Started in 3 Steps

### Step 1: Import and Launch

In your main React app (or create a standalone page):

```javascript
// Example: Create a new route or page
import InteriorApp from "./interior/InteriorApp";

function InteriorDesignPage() {
  // Define your habitat module (from exterior system)
  const habitatModule = {
    id: "habitat_001",
    name: "Main Habitat Module",
    radius: 7.5, // meters
    length: 20, // meters
  };

  return <InteriorApp habitatModule={habitatModule} />;
}

export default InteriorDesignPage;
```

### Step 2: Design Your Interior

1. **Add Decks**

   - Click "➕ Add Deck" to create levels
   - Each deck = one floor
   - Typically 2-3 decks per 20m habitat

2. **Place Rooms**

   - Browse Room Library (left sidebar)
   - Click room type to add
   - Room auto-places on active deck

3. **Check Validation**
   - Watch right sidebar for errors/warnings
   - Green = good, Red = fix required
   - Design score updates automatically

### Step 3: View & Adjust

- **🎯 Polar View** - Best for layout overview
- **📏 Unwrapped View** - Best for precise work
- **🏠 3D Interior** - Coming in Phase 2

---

## Example: Design for 6-Person Crew

```javascript
// Recommended minimum layout:

Deck 1 (Ground Level):
✅ Galley (Kitchen)        - 12 m²
✅ Dining Area             - 12 m²
✅ Recreation              - 9 m²
✅ Storage                 - 6 m²

Deck 2 (Mid Level):
✅ 6× Sleep Quarters       - 15 m² (2.5 m² each)
✅ 2× Hygiene Stations     - 6 m² (3 m² each)
✅ Medical Bay             - 6 m²

Deck 3 (Upper Level):
✅ Work Lab                - 9 m²
✅ Exercise Area           - 15 m²
✅ Life Support Systems    - 3 m²
✅ Greenhouse (optional)   - 21 m²

Total: ~114 m² = 19 m²/person ✓
```

---

## Quick Tips

### ✅ DO:

- Start with critical spaces (sleep, hygiene, galley)
- Check validation after each room
- Use polar view for initial layout
- Adjust crew size to see requirements change
- Leave space for corridors (~15-20% of total)

### ❌ DON'T:

- Overcrowd the deck (max 70% utilization)
- Place noisy rooms near quiet ones
- Forget life support systems
- Exceed habitat dimensions

---

## Keyboard Shortcuts

- **Click** - Select room
- **Right-Click** - Delete room
- **Hover** - Highlight room

---

## NASA Requirements Cheat Sheet

| Space Type   | Min/Person | Priority  |
| ------------ | ---------- | --------- |
| Sleep        | 2.5 m²     | Critical  |
| Hygiene      | 1.0 m²     | Critical  |
| Galley       | 2.0 m²     | Critical  |
| Work         | 1.5 m²     | Critical  |
| Exercise     | 2.5 m²     | Important |
| Recreation   | 1.5 m²     | Optional  |
| Storage      | 1.0 m²     | Important |
| Medical      | 1.0 m²     | Important |
| Life Support | 0.5 m²     | Critical  |

**Total Minimum:** ~13.5 m² per person  
**Recommended:** 19-25 m² per person  
**Optimal:** 40-60 m² per person

---

## Troubleshooting

### "No decks defined" error

- Click "➕ Add Deck" to create first level

### "Missing critical space: [type]" error

- Add the required room type from library
- Check crew size - may need multiple rooms

### Rooms overlapping

- System auto-places but may overlap slightly
- Future update will prevent this
- For now, delete and re-add if needed

### Design score low

- Check validation panel for specific issues
- Ensure all critical rooms present
- Verify sufficient area for crew size
- Check adjacency warnings

---

## Next Steps

Once your interior is designed:

1. **Save Design** - (Coming soon) Export to JSON
2. **Export Data** - (Coming soon) NASA format export
3. **3D Walkthrough** - (Phase 2) Full 3D interior view
4. **Add Furniture** - (Phase 2) Detailed room interiors

---

## Support

See `src/interior/README.md` for full documentation

Happy designing! 🏗️🚀
