# 🚀 Quick Start - New Features

## Keyboard Shortcuts (The Essentials)

```
Ctrl+Z              Undo last action
Ctrl+Shift+Z        Redo last undone action
Ctrl+Click          Multi-select objects
Delete/Backspace    Delete selected objects

X                   Lock to X-axis (horizontal)
Y                   Lock to Y-axis (vertical)
Z                   Lock to Z-axis (depth)
Esc                 Unlock all axes
```

## Quick Workflows

### Precise Movement

1. Select object
2. Press `Y` (Y-axis lock)
3. Move up/down only
4. Press `Esc` to unlock

### Multi-Edit

1. Click first object
2. `Ctrl+Click` more objects
3. Press `Delete` to remove all
4. Or click Duplicate to copy all

### Smart Sketching

1. Click "2D Sketch"
2. Add points by clicking
3. Switch to "Line Tool"
4. Hover near point → yellow snap
5. Click to connect
6. Create extrusion

## UI Tour

```
╔═══════════════════════════════════════════════════════════════╗
║ 🏗️ Habitat CAD | [↶][↷] [X][Y][Z] [Grid✓] Objects:5 | Sel:2 ║
╠═══════╦═══════════════════════════════════════════════╦═══════╣
║       ║                                               ║       ║
║ [Box] ║                                               ║ Props ║
║ [⚪]  ║          3D Canvas View                      ║       ║
║       ║                                               ║ Color ║
║ Move  ║                                               ║ [████]║
║ Rot   ║         (Orbit with mouse)                   ║       ║
║ Scale ║                                               ║ Export║
║       ║                                               ║       ║
║ [🎯]  ║                                               ║ [JSON]║
║ Face  ║                                               ║ [OBJ] ║
║       ║                                               ║ [STL] ║
║ [Copy]║                                               ║       ║
║ [Del] ║                                               ║       ║
╚═══════╩═══════════════════════════════════════════════╩═══════╝
```

## What Changed?

**Before:**

- Single selection only
- No undo/redo
- Free movement in all directions
- Basic sketch tool

**Now:**

- ✅ Multi-select (Ctrl+Click)
- ✅ Undo/Redo (Ctrl+Z/Ctrl+Shift+Z)
- ✅ Axis-locked transforms (X/Y/Z keys)
- ✅ Magnetic point snapping (15px)
- ✅ Improved sketch with line tool
- ✅ Delete key support

## Test Drive (30 seconds)

```bash
# 1. Multi-select test (10 seconds)
Add 3 shapes → Ctrl+Click each → Press Delete → Press Ctrl+Z

# 2. Axis lock test (10 seconds)
Add box → Press Y → Try moving → Only goes up/down → Press Esc

# 3. Sketch test (10 seconds)
2D Sketch → Click 4 points → Line Tool → Connect → Extrude
```

## Pro Tips

💡 **Undo liberally** - Ctrl+Z lets you experiment freely  
💡 **Y-lock first** - Most natural for "lifting" objects up  
💡 **Sketch with points first** - Layout shape, then connect with lines  
💡 **15-pixel rule** - Get within 15px to snap automatically  
💡 **Multi-delete power** - Select many, delete once, undo if needed

## Common Patterns

### Align Objects in a Row

```
1. Add first object
2. Duplicate (Ctrl+Click → Duplicate)
3. Press X (lock horizontal)
4. Move to the right
5. Repeat
```

### Create Perfect Vertical Stack

```
1. Add first object
2. Duplicate
3. Press Y (lock vertical)
4. Move up
5. Repeat
```

### Build from Sketch

```
1. 2D Sketch button
2. Point Tool → outline shape
3. Line Tool → connect points
   (auto-snaps within 15px)
4. Extrude → 3D object
5. Move/Scale as normal
```

## Troubleshooting Quick Fixes

🔴 **Undo not working?**  
→ Click canvas first (ensure focus)

🔴 **Multi-select not working?**  
→ Hold Ctrl before clicking

🔴 **Stuck in axis lock?**  
→ Press Esc to unlock

🔴 **Snap not working?**  
→ Get closer (15 pixel range)

---

**Server:** http://localhost:5173/  
**Docs:** See ESSENTIAL_FEATURES_IMPLEMENTED.md
