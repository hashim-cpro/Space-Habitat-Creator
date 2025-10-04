import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import CADCanvas from './components/CADCanvas';
import Toolbar from './components/Toolbar';
import PropertiesPanel from './components/PropertiesPanel';
import ImprovedSketchModal from './components/ImprovedSketchModal';
import { exportToJSON, exportToOBJ, exportToSTL, exportToGLTF } from './utils/exportUtils';
import { HistoryManager } from './utils/historyManager';
import './App.css';

function App() {
  const [objects, setObjects] = useState([]);
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [transformMode, setTransformMode] = useState('translate');
  const [showSketchModal, setShowSketchModal] = useState(false);
  const [gridSize] = useState(20);
  const [showGrid, setShowGrid] = useState(true);
  const [objectIdCounter, setObjectIdCounter] = useState(1);

  const getDefaultParameters = (type) => {
    switch (type) {
      case 'box':
        return { width: 2, height: 2, depth: 2 };
      case 'sphere':
        return { radius: 1 };
      case 'cylinder':
        return { radiusTop: 1, radiusBottom: 1, height: 2 };
      case 'cone':
        return { radius: 1, height: 2 };
      case 'torus':
        return { radius: 1, tube: 0.4 };
      case 'plane':
        return { width: 2, height: 2 };
      default:
        return {};
    }
  };

  const addShape = (type) => {
    const newObject = {
      id: objectIdCounter,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${objectIdCounter}`,
      type,
      parameters: getDefaultParameters(type),
      transform: {
        position: [0, 1, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
      material: {
        color: '#888888',
        selectedColor: '#4a7c59',
        hoverColor: '#6a9c79',
        metalness: 0.5,
        roughness: 0.5,
        opacity: 1,
        transparent: false,
        wireframe: false,
      },
    };

    setObjects([...objects, newObject]);
    setSelectedObjectId(newObject.id);
    setObjectIdCounter(objectIdCounter + 1);
  };

  const selectObject = (id) => {
    setSelectedObjectId(id);
  };

  const updateObjectTransform = (id, transform) => {
    setObjects(objects.map(obj => 
      obj.id === id ? { ...obj, transform: { ...obj.transform, ...transform } } : obj
    ));
  };

  const updateObject = (id, updates) => {
    setObjects(objects.map(obj => 
      obj.id === id ? { ...obj, ...updates } : obj
    ));
  };

  const deleteSelectedObject = () => {
    if (selectedObjectId) {
      setObjects(objects.filter(obj => obj.id !== selectedObjectId));
      setSelectedObjectId(null);
    }
  };

  const duplicateSelectedObject = () => {
    if (selectedObjectId) {
      const selectedObj = objects.find(obj => obj.id === selectedObjectId);
      if (selectedObj) {
        const newObject = {
          ...selectedObj,
          id: objectIdCounter,
          name: `${selectedObj.name} Copy`,
          transform: {
            ...selectedObj.transform,
            position: [
              selectedObj.transform.position[0] + 2,
              selectedObj.transform.position[1],
              selectedObj.transform.position[2],
            ],
          },
        };
        setObjects([...objects, newObject]);
        setSelectedObjectId(newObject.id);
        setObjectIdCounter(objectIdCounter + 1);
      }
    }
  };

  const createExtrusionFromSketch = (points, depth, bevelEnabled, bevelSize) => {
    // Create a shape from the points
    const shape = new THREE.Shape();
    
    if (points.length > 0) {
      shape.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        shape.lineTo(points[i].x, points[i].y);
      }
      shape.lineTo(points[0].x, points[0].y); // Close the shape
    }

    const extrudeSettings = {
      depth: depth,
      bevelEnabled: bevelEnabled,
      bevelThickness: bevelEnabled ? bevelSize : 0,
      bevelSize: bevelEnabled ? bevelSize : 0,
      bevelSegments: 3,
    };

    const newObject = {
      id: objectIdCounter,
      name: `Extruded Shape ${objectIdCounter}`,
      type: 'extrude',
      parameters: {
        shape: shape,
        extrudeSettings: extrudeSettings,
      },
      transform: {
        position: [0, 1, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
      material: {
        color: '#888888',
        selectedColor: '#4a7c59',
        hoverColor: '#6a9c79',
        metalness: 0.5,
        roughness: 0.5,
        opacity: 1,
        transparent: false,
        wireframe: false,
      },
    };

    setObjects([...objects, newObject]);
    setSelectedObjectId(newObject.id);
    setObjectIdCounter(objectIdCounter + 1);
  };

  const handleExport = (format) => {
    switch (format) {
      case 'json':
        exportToJSON(objects);
        break;
      case 'obj':
        exportToOBJ(objects);
        break;
      case 'stl':
        exportToSTL(objects);
        break;
      case 'gltf':
        exportToGLTF(objects);
        break;
      default:
        console.error('Unknown export format:', format);
    }
  };

  const selectedObject = objects.find(obj => obj.id === selectedObjectId);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏗️ Habitat CAD Creator</h1>
        <div className="header-controls">
          <label>
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
            />
            Show Grid
          </label>
          <div className="object-count">Objects: {objects.length}</div>
        </div>
      </header>

      <div className="app-content">
        <Toolbar
          onAddShape={addShape}
          transformMode={transformMode}
          onSetTransformMode={setTransformMode}
          onStartSketch={() => setShowSketchModal(true)}
          onDelete={deleteSelectedObject}
          onDuplicate={duplicateSelectedObject}
          selectedObjectId={selectedObjectId}
        />

        <div className="canvas-container">
          <CADCanvas
            objects={objects}
            selectedObjectId={selectedObjectId}
            onSelectObject={selectObject}
            transformMode={transformMode}
            onTransformObject={updateObjectTransform}
            gridSize={gridSize}
            showGrid={showGrid}
          />
        </div>

        <PropertiesPanel
          selectedObject={selectedObject}
          onUpdateObject={updateObject}
          onExport={handleExport}
        />
      </div>

      {showSketchModal && (
        <SketchModal
          onClose={() => setShowSketchModal(false)}
          onCreateExtrusion={createExtrusionFromSketch}
        />
      )}
    </div>
  );
}

export default App;
