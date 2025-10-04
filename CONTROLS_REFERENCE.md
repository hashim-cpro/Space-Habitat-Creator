# ⌨️ Keyboard & Mouse Controls Reference

## 🖱️ Mouse Controls

### Camera Navigation

| Action              | Control                      |
| ------------------- | ---------------------------- |
| **Rotate View**     | Right Click + Drag           |
| **Pan View**        | Middle Mouse + Drag          |
| **Zoom In/Out**     | Scroll Wheel Up/Down         |
| **Focus on Object** | Select object + Double Click |

### Object Interaction

| Action            | Control                         |
| ----------------- | ------------------------------- |
| **Select Object** | Left Click on object            |
| **Deselect**      | Left Click on empty space       |
| **Multi-select**  | Ctrl + Left Click (coming soon) |

### Transform Gizmos

| Action                | Control                         |
| --------------------- | ------------------------------- |
| **Move Object**       | Click & drag gizmo arrows       |
| **Rotate Object**     | Click & drag gizmo circles      |
| **Scale Object**      | Click & drag gizmo cubes        |
| **Constrain to Axis** | Drag specific axis arrow/circle |

## 🎨 UI Interactions

### Toolbar

| Action               | Result                  |
| -------------------- | ----------------------- |
| Click shape button   | Add new shape at origin |
| Click "2D Sketch"    | Open sketch modal       |
| Click transform mode | Activate that mode      |
| Click "Duplicate"    | Copy selected object    |
| Click "Delete"       | Remove selected object  |

### Properties Panel

| Action              | Result                     |
| ------------------- | -------------------------- |
| Edit name field     | Rename object              |
| Click color picker  | Choose new color           |
| Drag sliders        | Adjust material properties |
| Toggle checkboxes   | Enable/disable features    |
| Click export button | Download file              |

### Sketch Modal

| Action                   | Result                  |
| ------------------------ | ----------------------- |
| Click on canvas          | Add point to path       |
| Click "Clear All"        | Remove all points       |
| Click "Close Path"       | Connect to first point  |
| Drag depth slider        | Adjust extrusion        |
| Click "Create 3D Object" | Generate extruded shape |

## 💡 Pro Tips

### Efficient Modeling

- Use **Right Click + Drag** frequently to inspect your model from all angles
- **Scroll** to zoom out for overview, zoom in for details
- Select transform mode first, then select objects for quick editing
- Use the **View Cube** (bottom-right) to snap to standard views

### Precision Work

- **Zoom in close** when positioning small objects
- Use the **grid** as a reference for sizing
- Check **Position values** in Properties Panel for exact placement
- Toggle **Wireframe mode** to see through objects

### Material Design

- Start with base color, then adjust metalness/roughness
- Use **low roughness** (0-0.3) for shiny surfaces
- Use **high roughness** (0.7-1.0) for matte surfaces
- Enable **Transparency** before adjusting opacity
- Use **Wireframe** to debug geometry

### Sketch Mode

- Plan your shape before starting
- Click methodically, don't rush
- Keep shapes simple (3-8 points work best)
- Use **Close Path** for clean closed shapes
- Experiment with different extrude depths

## 🎯 Common Workflows

### Creating a Basic Habitat Module

```
1. Click "Cylinder" → adds main body
2. Click "Move" → position it
3. Click "Sphere" → adds dome
4. Move and scale sphere to fit on top
5. Click "Box" → adds entrance
6. Adjust materials for each piece
7. Export as OBJ
```

### Making a Custom Window Frame

```
1. Click "2D Sketch"
2. Click 4 corners to make rectangle
3. Click "Close Path"
4. Set extrude depth to 0.5
5. Enable bevel, set to 0.1
6. Click "Create 3D Object"
7. Adjust color/material
```

### Duplicating and Arranging

```
1. Create one object
2. Select it
3. Click "Duplicate"
4. Click "Move" mode
5. Drag duplicate to new position
6. Repeat as needed
```

## 📐 Coordinate System

### Axis Colors (on gizmos)

- **Red** = X axis (left/right)
- **Green** = Y axis (up/down)
- **Blue** = Z axis (forward/back)

### Origin Point

- Center of grid = (0, 0, 0)
- New objects spawn at (0, 1, 0) - slightly above ground
- Grid shows 1-unit squares

## 🎨 Visual Indicators

### Object States

| Visual      | Meaning                   |
| ----------- | ------------------------- |
| Gray color  | Default/unselected        |
| Light green | Hover (mouse over)        |
| Green       | Selected                  |
| Green gizmo | Transform controls active |

### UI States

| Visual          | Meaning                     |
| --------------- | --------------------------- |
| Green button    | Active transform mode       |
| Gray button     | Inactive/available          |
| Red button      | Destructive action (delete) |
| Disabled button | Not available yet           |

## 🚀 Speed Tips

1. **Quick Add-and-Edit**

   - Click shape → It's auto-selected → Start transforming immediately

2. **Fast Duplication**

   - Select → Duplicate → Move → Repeat

3. **Material Presets**

   - Design one object's material → Duplicate for consistency

4. **Grid Reference**

   - Count grid squares for even spacing
   - Use section lines (every 5 squares) for major divisions

5. **View Management**
   - Rotate to side view for vertical alignment
   - Rotate to top view for circular patterns
   - Use View Cube for quick standard views

## ⚠️ Important Notes

### Performance

- Dozens of objects: ✅ Smooth
- Hundreds of objects: ⚠️ May slow down
- Complex extrusions: ⚠️ More computation

### Best Practices

- Save progress by exporting to JSON regularly
- Name your objects for easy identification
- Use layers of complexity (start simple, add detail)
- Test exports early to verify workflow

### Limitations

- No undo/redo yet - work carefully!
- No snap-to-grid yet - position by eye or values
- No boolean operations yet - build additively
- No texture mapping yet - colors only

---

## 🎓 Learning Path

### Beginner

1. Add a few basic shapes
2. Practice camera controls
3. Try each transform mode
4. Change some colors
5. Export to JSON

### Intermediate

1. Build a simple structure (3-5 objects)
2. Use duplicate for symmetry
3. Try sketch-to-3D with simple shapes
4. Experiment with materials
5. Export to OBJ/STL

### Advanced

1. Design complete habitat module
2. Create custom shapes via sketch
3. Use precise positioning
4. Apply realistic materials
5. Export in multiple formats

---

**Happy Creating! 🏗️✨**
