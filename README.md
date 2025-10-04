# Habitat Model Viewer

A lightweight web viewer (React + Three.js via `@react-three/fiber`) focused on importing, viewing, and transforming 3D habitat components. Original CAD sketch / face editing features were removed to prioritize performance and simplicity.

## Features

- Import multiple `.glb`, `.gltf`, and `.stl` files (drag via Import button)
- Export current scene as:
  - GLB (binary glTF)
  - STL (ASCII)
  - JSON (internal scene description)
- Move / Rotate / Scale selected objects with transform gizmo
- Multi-select (Ctrl/Cmd click)
- Duplicate / Delete objects
- Axis lock (X / Y / Z keys) and undo/redo (Ctrl+Z / Ctrl+Shift+Z)
- Compact adaptive toolbar for minimal screen footprint
- Grid toggle

## Usage

Development:

```
npm install
npm run dev
```

Build:

```
npm run build
npm run preview
```

## Import Guidelines

| Aspect                   | Recommended                                      |
| ------------------------ | ------------------------------------------------ |
| Format                   | GLB (binary)                                     |
| Per-mesh triangle budget | ≤ 100k (soft warn above)                         |
| Textures                 | Use compressed (Basis/KTX2) before exporting GLB |
| Scale                    | 1 unit ≈ 1 meter                                 |

Heavy meshes log a console warning; future improvements can add simplification & LOD.

## Keyboard Shortcuts

| Key                   | Action           |
| --------------------- | ---------------- |
| Ctrl+Z                | Undo             |
| Ctrl+Shift+Z / Ctrl+Y | Redo             |
| Delete / Backspace    | Delete selection |
| X / Y / Z             | Toggle axis lock |
| Esc                   | Clear axis lock  |

## Code Structure

- `src/App.jsx` – application state & orchestration
- `src/components/Toolbar.jsx` – adaptive compact UI
- `src/components/CADCanvas.jsx` – Three.js canvas wrapper
- `src/components/CADObject.jsx` – individual object with transform controls
- `src/components/PropertiesPanel.jsx` – material & transform editing
- `src/utils/importUtils.js` – GLB/STL import logic
- `src/utils/exportUtils.js` – JSON / STL / GLB export
- `src/utils/historyManager.js` – undo/redo stack

## Future Ideas

- Mesh decimation / auto-LOD generation
- Texture compression pipeline hook (KTX2)
- Scene persistence (local storage / file save)
- Instancing for repeated modules

## License

Internal prototype for NASA Space Apps Challenge – adapt freely within project scope.
