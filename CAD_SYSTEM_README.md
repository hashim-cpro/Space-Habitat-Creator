REMOVED: Consolidated into main README.

- **Header**: Grid toggle and object count
- **3D Viewport**: Interactive canvas with orbit controls
- **Gizmo Helper**: View orientation cube

## How to Use

### Adding Objects

1. Click any shape button in the left toolbar to add it to the scene
2. The object appears at the origin and is automatically selected

### Transforming Objects

1. Select an object by clicking on it
2. Choose a transform mode (Move, Rotate, or Scale) from the toolbar
3. Use the interactive gizmos to transform the object

### 2D Sketch to 3D

1. Click "2D Sketch" in the toolbar
2. Click on the canvas to add points
3. Close the path when done
4. Adjust extrude depth and bevel settings
5. Click "Create 3D Object" to generate the shape

### Material Editing

1. Select an object
2. Use the Properties Panel on the right to:
   - Change color with the color picker
   - Adjust metalness and roughness sliders
   - Set opacity
   - Toggle transparency and wireframe modes

### Export

1. Select an object (or export all)
2. Choose an export format from the Properties Panel
3. The file will be downloaded automatically

## Keyboard Shortcuts

- **Left Click**: Select object
- **Right Click + Drag**: Orbit camera
- **Middle Mouse + Drag**: Pan camera
- **Scroll**: Zoom in/out

## Technical Details

### Built With

- **React 19**: UI framework
- **Three.js**: 3D graphics library
- **React Three Fiber**: React renderer for Three.js
- **@react-three/drei**: Helper components
- **Vite**: Build tool

### Architecture

```
src/
├── components/
│   ├── CADCanvas.jsx          # Main 3D canvas
│   ├── Scene.jsx              # Scene manager
│   ├── CADObject.jsx          # Individual 3D objects
│   ├── Toolbar.jsx            # Left toolbar
│   ├── PropertiesPanel.jsx   # Right properties panel
│   └── SketchModal.jsx        # 2D sketch interface
├── utils/
│   └── exportUtils.js         # Export functionality
├── App.jsx                    # Main application
└── App.css                    # Global styles
```

### Object Data Structure

```javascript
{
  id: number,
  name: string,
  type: 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'plane' | 'extrude',
  parameters: { /* shape-specific parameters */ },
  transform: {
    position: [x, y, z],
    rotation: [x, y, z],
    scale: [x, y, z]
  },
  material: {
    color: string,
    metalness: number,
    roughness: number,
    opacity: number,
    transparent: boolean,
    wireframe: boolean
  }
}
```

## Future Enhancements

- [ ] Parametric constraints
- [ ] Boolean operations (union, subtract, intersect)
- [ ] Measurement tools
- [ ] Snap to grid
- [ ] Multiple material support
- [ ] Texture mapping
- [ ] Layer system
- [ ] Undo/Redo
- [ ] Save/Load projects
- [ ] Camera presets
- [ ] Lighting presets
- [ ] Advanced sketch tools (arcs, bezier curves)

## Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

## License

MIT

## Credits

Created for NASA Space Apps Challenge - Habitat Creator Project
