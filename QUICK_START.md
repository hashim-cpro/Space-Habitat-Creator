# Quick Start Guide - Habitat CAD Creator

## 🚀 Getting Started

Your CAD system is now running at **http://localhost:5173/**

## 📋 Basic Workflow

### 1. Add Your First Shape

- Look at the **left sidebar** (Toolbar)
- Under "Add Shape", click any shape button:
  - ⬜ Box
  - ⚪ Sphere
  - ⬤ Cylinder
  - 🔺 Cone
  - ⭕ Torus
  - ▭ Plane

### 2. Transform Objects

- Click on any object in the 3D view to select it
- Choose a transform mode from the toolbar:
  - ↔️ Move (translate)
  - 🔄 Rotate
  - ⤢ Scale
- Drag the colored gizmo arrows/circles to transform

### 3. Customize Materials

- Select an object
- Look at the **right sidebar** (Properties Panel)
- Adjust:
  - Color (color picker or hex value)
  - Metalness (0-1 slider)
  - Roughness (0-1 slider)
  - Opacity (0-1 slider)
  - Enable/disable transparency
  - Enable/disable wireframe mode

### 4. Create Custom 2D Sketch → 3D

- Click "✏️ 2D Sketch" in the toolbar
- A modal opens with a canvas
- **Click on the canvas** to add points
- Add at least 3 points to create a shape
- Click "Close Path" when done
- Adjust the extrude depth slider
- (Optional) Enable bevel and adjust size
- Click "Create 3D Object"

### 5. Edit Objects

- **Duplicate**: Select object → Click "📋 Duplicate"
- **Delete**: Select object → Click "🗑️ Delete"
- **Rename**: Select object → Edit name in Properties Panel

### 6. Camera Controls

- **Rotate View**: Right-click + drag
- **Pan View**: Middle mouse button + drag (or Shift + Right-click + drag)
- **Zoom**: Scroll wheel
- **View Cube**: Bottom-right corner shows orientation

### 7. Export Your Model

- In the Properties Panel, scroll to "Export"
- Choose format:
  - **JSON**: Complete scene data (includes all settings)
  - **OBJ**: For CAD software (AutoCAD, Blender, etc.)
  - **STL**: For 3D printing
  - **GLTF**: For web/game engines
- File downloads automatically

## 💡 Tips

1. **Grid Toggle**: Use the checkbox in the header to show/hide the grid
2. **Object Count**: Monitor how many objects you've created in the header
3. **Selection**: Selected objects appear green
4. **Hover Effect**: Objects turn lighter green when you hover over them
5. **Transform Info**: See position, rotation, and scale in Properties Panel

## 🎨 Example Workflow: Create a Simple Habitat

1. Add a **Cylinder** (will be the main body)
2. Select it and use the **Move** tool to position it
3. Add a **Sphere** (will be the dome)
4. Scale the sphere down to fit on top
5. Add a **Box** (will be the entrance)
6. Scale and position it as a doorway
7. Customize colors for each piece
8. Export as OBJ when done!

## 🖌️ Sketch Example: Custom Shape

1. Click "2D Sketch"
2. Create a pentagon by clicking 5 points
3. Click "Close Path"
4. Set extrude depth to 3.0
5. Enable bevel, set size to 0.2
6. Click "Create 3D Object"
7. Now you have a custom extruded pentagon!

## ⌨️ Pro Tips

- **Center Camera**: If lost, add a new object to jump back to origin
- **Clean Workspace**: Delete test objects before starting your final design
- **Layer Your Work**: Build from bottom to top for easier visualization
- **Save Often**: Export to JSON periodically to save your work
- **Experiment**: Try combining multiple shapes with different materials

## 🐛 Troubleshooting

**Can't see objects?**

- Check if they're at the origin (0, 0, 0)
- Zoom out using scroll wheel
- Reset camera by rotating view

**Transform gizmo not showing?**

- Make sure an object is selected (click on it)
- Ensure a transform mode is active (Move/Rotate/Scale)

**Export not working?**

- Check browser's download settings
- Make sure pop-ups are allowed

## 🎯 Next Steps

Start building your lunar habitat! Combine shapes, customize materials, and create your vision of a space habitat.

Happy building! 🚀🏗️
