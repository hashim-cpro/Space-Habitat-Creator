# 🚀 CAD System Upgrade Plan - Professional Features

## Phase 1: Face Selection & Highlighting ✅ (In Progress)

### Implemented:

- ✅ FaceSelector component for detecting face hover/click
- ✅ Face highlighting (yellow for hover, green for selected)
- ✅ CAD operations utility with boolean operations
- ✅ CSG library integrated (three-csg-ts)

### Next Steps:

1. Update CADObject to support face selection mode
2. Add face selection toggle to toolbar
3. Display selected face info in properties panel
4. Add "Sketch on Face" button when face is selected

## Phase 2: Boolean Operations

### Features to Add:

- **Union**: Combine two objects into one
- **Subtract**: Cut one object from another
- **Intersect**: Keep only overlapping volume
- UI buttons in toolbar for each operation
- Select two objects, then apply operation
- Real-time preview before applying

## Phase 3: Face Extrusion

### Features to Add:

- Select a face on any object
- Extrude face inward or outward
- Adjustable extrude distance (slider or input)
- Preview before applying
- Modify existing geometry or create new object

## Phase 4: Advanced 3D Sketching

### Current Sketch System:

- 2D canvas modal
- Click to add points
- Extrude to 3D

### New 3D Sketch System:

1. **Sketch on Face**:

   - Select a face
   - Click "Sketch" button
   - Camera aligns perpendicular to face
   - Sketch directly in 3D space on that plane
   - Snap points to face plane

2. **Sketch Tools**:
   - **Line Tool**: Click two points
   - **Rectangle Tool**: Click diagonal corners
   - **Circle Tool**: Click center, drag radius
   - **Arc Tool**: Click start, end, control point
   - **Polygon Tool**: Click multiple points, close path
3. **Sketch Management**:

   - Each sketch is a selectable entity
   - Edit existing sketches (move points, add/remove)
   - Delete sketches
   - Convert sketch to 3D (extrude, revolve, sweep)

4. **Sketch Constraints** (Future):
   - Horizontal/Vertical lines
   - Parallel/Perpendicular
   - Equal length
   - Tangent curves
   - Dimensional constraints

## Phase 5: Additional CAD Operations

### Features to Add:

1. **Fillet/Chamfer**:

   - Round edges (fillet)
   - Cut edges at angle (chamfer)
   - Select edge, specify radius/distance

2. **Shell**:

   - Hollow out solid
   - Specify wall thickness
   - Remove selected faces

3. **Mirror**:

   - Mirror geometry across plane
   - Select object and mirror plane
   - Create copy or replace

4. **Pattern/Array**:

   - Linear array (rows/columns)
   - Circular array (around axis)
   - Specify count and spacing

5. **Revolve**:

   - Select 2D profile
   - Specify axis
   - Create 3D by rotation

6. **Sweep**:

   - Select profile and path
   - Extrude along path

7. **Loft**:
   - Select multiple profiles
   - Blend between them

## Phase 6: Dynamic UI (Shapr3D Style)

### UI Improvements:

1. **Context-Sensitive Panels**:

   - Show relevant tools based on selection
   - Face selected → Extrude, Sketch options
   - Edge selected → Fillet, Chamfer options
   - Multiple objects → Boolean operations

2. **Floating Toolbars**:

   - Tool options appear near cursor
   - Quick access to common operations
   - Minimize panel clutter

3. **Gesture Controls** (Touch-friendly):

   - Pinch to zoom
   - Two-finger rotate
   - Swipe for tool selection

4. **Quick Actions Menu**:

   - Right-click context menu
   - Show available operations for selection
   - Keyboard shortcuts displayed

5. **Collapsible Panels**:
   - Hide/show left/right panels
   - Maximize 3D viewport
   - Pin frequently used tools

## Technical Architecture

### New Component Structure:

```
src/
├── components/
│   ├── CADCanvas.jsx              # Main 3D viewport
│   ├── Scene.jsx                  # Scene manager
│   ├── CADObject.jsx              # 3D object with face selection
│   ├── FaceSelector.jsx           # ✅ Face detection & highlight
│   ├── SketchPlane.jsx            # NEW: 3D sketch plane
│   ├── SketchTools.jsx            # NEW: Line, rect, circle tools
│   ├── SketchEntity.jsx           # NEW: Individual sketch object
│   ├── BooleanOperator.jsx        # NEW: CSG operation handler
│   ├── Toolbar.jsx                # Updated with new tools
│   ├── PropertiesPanel.jsx        # Updated for face/edge props
│   ├── ContextMenu.jsx            # NEW: Right-click menu
│   └── FloatingTools.jsx          # NEW: Context-sensitive tools
├── utils/
│   ├── cadOperations.js           # ✅ Boolean, extrude, etc.
│   ├── sketchUtils.js             # NEW: Sketch geometry helpers
│   ├── geometryUtils.js           # NEW: Mesh manipulation
│   └── exportUtils.js             # Existing export functions
└── hooks/
    ├── useFaceSelection.js        # NEW: Face selection logic
    ├── useSketchMode.js           # NEW: Sketch mode state
    └── useBooleanOps.js           # NEW: Boolean operations
```

### State Management:

```javascript
{
  // Existing
  objects: [],
  selectedObjectId: null,
  transformMode: 'translate',

  // New
  selectionMode: 'object' | 'face' | 'edge' | 'vertex',
  selectedFaceIndex: null,
  selectedEdgeIndex: null,
  sketchMode: {
    active: boolean,
    plane: {center, normal, uAxis, vAxis},
    currentTool: 'line' | 'rectangle' | 'circle' | 'polygon',
    sketches: []
  },
  booleanOperation: {
    active: boolean,
    type: 'union' | 'subtract' | 'intersect',
    objectIds: []
  }
}
```

## Implementation Priority

### **Immediate (Next 2 hours)**:

1. ✅ Face selection working
2. ✅ Boolean operations utility
3. Face extrusion
4. Basic 3D sketch on face

### **Short Term (Next session)**:

1. Complete sketch tools (line, rect, circle)
2. Sketch entity management
3. Boolean operations UI
4. Context menu

### **Medium Term**:

1. Advanced sketch features
2. Fillet/chamfer
3. Pattern operations
4. Dynamic UI improvements

### **Long Term**:

1. Constraints system
2. Parametric features
3. Assembly mode
4. Advanced surface operations

## Key Challenges

1. **Performance**: CSG operations can be slow

   - Solution: Web Workers for heavy computations
   - Progress indicators
   - Optimization passes

2. **Mesh Quality**: Boolean ops can create bad geometry

   - Solution: Mesh cleanup routines
   - Validation before operations
   - User warnings

3. **Undo/Redo**: Complex history for CAD ops

   - Solution: Command pattern
   - Serialize operations
   - Efficient memory management

4. **Selection Complexity**: Faces, edges, vertices
   - Solution: Layered raycasting
   - Visual feedback for each type
   - Clear mode indicators

## Success Metrics

- [ ] Users can select and extrude faces
- [ ] Boolean operations work reliably
- [ ] Sketching feels natural and intuitive
- [ ] UI responds to context
- [ ] Performance stays smooth (<60fps)
- [ ] Complex models can be built
- [ ] Export produces valid files

---

**Status**: Phase 1 in progress
**Next Action**: Implement face extrusion and 3D sketch plane
