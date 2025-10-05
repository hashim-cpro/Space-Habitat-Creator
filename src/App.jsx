import { useState, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import CADCanvas from "./components/CADCanvas";
import Toolbar from "./components/Toolbar";
import PropertiesPanel from "./components/PropertiesPanel";
import BodyPanel from "./components/BodyPanel";
import ModuleLibraryPanel from "./components/ModuleLibraryPanel";
import ModuleParameterPanel from "./components/ModuleParameterPanel";
import { exportToJSON, exportToSTL, exportToGLB } from "./utils/exportUtils";
import { importFiles } from "./utils/importUtils";
import { HistoryManager } from "./utils/historyManager";
import * as ModuleGenerators from "./utils/moduleGenerators";
import { findFreeSpawnPosition } from "./utils/physicsSystem";
import "./App.css";

// Helper function to recreate geometry from parameters
function recreateGeometry(obj) {
  // If it's a module with a generator, regenerate it
  if (obj.type === "module" && obj.userData?.moduleDefinition) {
    const generatorFunc =
      ModuleGenerators[obj.userData.moduleDefinition.generator];
    if (generatorFunc) {
      const geometry = generatorFunc(obj.userData.parameters || obj.parameters);
      return {
        ...obj,
        geometry: geometry,
        parameters: obj.userData.parameters || obj.parameters,
        userData: {
          ...obj.userData,
          geometry: geometry,
        },
      };
    }
  }

  // For imported/custom geometry that was lost during save, skip it
  if (obj.type === "custom") {
    console.warn(
      `Cannot recreate custom/imported geometry for ${obj.name}. Object will be skipped. Re-import the file.`
    );
    return null;
  }

  // For primitive shapes, ensure they have valid parameters
  // The geometry will be created by CADObject component
  if (!obj.parameters) {
    console.warn(`Object ${obj.name} missing parameters, skipping`);
    return null;
  }

  return obj;
}

function App() {
  const [objects, setObjects] = useState([]);
  const [selectedObjectIds, setSelectedObjectIds] = useState([]); // Multi-select support
  const [transformMode, setTransformMode] = useState("translate");
  const [gridSize] = useState(20);
  const [showGrid, setShowGrid] = useState(true);
  const [objectIdCounter, setObjectIdCounter] = useState(1);
  const [axisLock, setAxisLock] = useState(null); // 'x', 'y', 'z', or null
  const [isBodyPanelOpen, setBodyPanelOpen] = useState(false);
  const [isModuleLibraryOpen, setModuleLibraryOpen] = useState(false);
  const [selectedModuleForParams, setSelectedModuleForParams] = useState(null);
  const historyManager = useRef(new HistoryManager());
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const objectsRef = useRef(objects);

  useEffect(() => {
    objectsRef.current = objects;
  }, [objects]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("habitat-creator-exterior");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.objects && Array.isArray(parsed.objects)) {
          console.log("Raw objects from localStorage:", parsed.objects.length);
          // Recreate geometry for objects that need it, filter out nulls (custom objects)
          const objectsWithGeometry = parsed.objects
            .map((obj) => {
              const recreated = recreateGeometry(obj);
              if (!recreated) {
                console.log(
                  `Filtered out object: ${obj.name} (type: ${obj.type})`
                );
              }
              return recreated;
            })
            .filter((obj) => obj !== null);
          setObjects(objectsWithGeometry);
          setObjectIdCounter(
            parsed.objectIdCounter || parsed.objects.length + 1
          );
          console.log(
            "Loaded exterior design from localStorage:",
            objectsWithGeometry.length,
            "objects"
          );
        }
      } catch (error) {
        console.error("Failed to load saved data:", error);
      }
    } else {
      console.log("No saved data found in localStorage");
    }
  }, []);

  // Auto-save to localStorage every 3 seconds
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (objects.length > 0) {
        // Serialize objects, but skip Three.js geometry objects (can't be stringified)
        const serializableObjects = objects.map((obj) => {
          const { geometry: _geometry, ...rest } = obj;
          // For modules, ensure parameters are at root level for recreation
          if (obj.type === "module" && obj.userData?.parameters) {
            return {
              ...rest,
              parameters: obj.userData.parameters,
            };
          }
          return rest;
        });

        const dataToSave = {
          objects: serializableObjects,
          objectIdCounter,
          timestamp: Date.now(),
        };
        localStorage.setItem(
          "habitat-creator-exterior",
          JSON.stringify(dataToSave)
        );
        console.log("Auto-saved exterior design");
      }
    }, 3000);

    return () => clearInterval(saveInterval);
  }, [objects, objectIdCounter]);

  const visibleObjects = useMemo(
    () => objects.filter((obj) => !obj.hidden),
    [objects]
  );

  // Save state to history
  const saveHistory = (newObjects) => {
    historyManager.current.push(newObjects);
    setCanUndo(historyManager.current.canUndo());
    setCanRedo(historyManager.current.canRedo());
  };

  // Removed primitive shape creation; focused on imports only.

  const selectObject = (id, isMultiSelect = false) => {
    if (id === null) {
      // Unselect all
      setSelectedObjectIds([]);
      setSelectedModuleForParams(null);
      return;
    }

    if (isMultiSelect) {
      // Toggle selection
      if (selectedObjectIds.includes(id)) {
        setSelectedObjectIds(selectedObjectIds.filter((objId) => objId !== id));
      } else {
        setSelectedObjectIds([...selectedObjectIds, id]);
      }
    } else {
      setSelectedObjectIds([id]);

      // If selecting a procedural module, open parameter panel
      const selectedObj = objects.find((obj) => obj.id === id);
      if (
        selectedObj?.type === "module" &&
        selectedObj?.geometryType === "procedural"
      ) {
        setSelectedModuleForParams(selectedObj);
      } else {
        setSelectedModuleForParams(null);
      }
    }
  };

  const updateObjectTransform = (id, transform, { commit = false } = {}) => {
    setObjects((prevObjects) => {
      const newObjects = prevObjects.map((obj) =>
        obj.id === id
          ? { ...obj, transform: { ...obj.transform, ...transform } }
          : obj
      );
      if (commit) {
        saveHistory(newObjects);
      }
      return newObjects;
    });
  };

  const updateObject = (id, updates) => {
    const newObjects = objects.map((obj) =>
      obj.id === id ? { ...obj, ...updates } : obj
    );
    setObjects(newObjects);
    saveHistory(newObjects);
  };

  const deleteSelectedObjects = () => {
    if (selectedObjectIds.length > 0) {
      const newObjects = objects.filter(
        (obj) => !selectedObjectIds.includes(obj.id)
      );
      setObjects(newObjects);
      setSelectedObjectIds([]);
      saveHistory(newObjects);
    }
  };

  const duplicateSelectedObjects = () => {
    if (selectedObjectIds.length > 0) {
      const newObjects = [...objects];
      const newIds = [];
      let counter = objectIdCounter;

      selectedObjectIds.forEach((id) => {
        const selectedObj = objects.find((obj) => obj.id === id);
        if (selectedObj) {
          const newObject = {
            ...selectedObj,
            id: counter,
            name: `${selectedObj.name} Copy`,
            transform: {
              ...selectedObj.transform,
              position: [
                selectedObj.transform.position[0] + 2,
                selectedObj.transform.position[1],
                selectedObj.transform.position[2],
              ],
            },
            hidden: false,
          };
          newObjects.push(newObject);
          newIds.push(counter);
          counter++;
        }
      });

      setObjects(newObjects);
      setSelectedObjectIds(newIds);
      setObjectIdCounter(counter);
      saveHistory(newObjects);
    }
  };

  // Removed sketch/extrusion functionality

  // Undo/Redo functions
  const handleUndo = () => {
    const previousState = historyManager.current.undo();
    if (previousState) {
      setObjects(previousState);
      setCanUndo(historyManager.current.canUndo());
      setCanRedo(historyManager.current.canRedo());
    }
  };

  const handleRedo = () => {
    const nextState = historyManager.current.redo();
    if (nextState) {
      setObjects(nextState);
      setCanUndo(historyManager.current.canUndo());
      setCanRedo(historyManager.current.canRedo());
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in input fields
      if (e.target.matches("input, textarea")) {
        return;
      }

      // Ctrl+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl+Shift+Z or Ctrl+Y for redo
      else if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z") ||
        ((e.ctrlKey || e.metaKey) && e.key === "y")
      ) {
        e.preventDefault();
        handleRedo();
      }
      // Delete key
      else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelectedObjects();
      }
      // X, Y, Z keys for axis locking
      else if (e.key === "x" || e.key === "X") {
        setAxisLock(axisLock === "x" ? null : "x");
      } else if (e.key === "y" || e.key === "Y") {
        setAxisLock(axisLock === "y" ? null : "y");
      } else if (e.key === "z" || e.key === "Z") {
        setAxisLock(axisLock === "z" ? null : "z");
      }
      // Escape to clear axis lock
      else if (e.key === "Escape") {
        setAxisLock(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [objects, selectedObjectIds, axisLock]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExport = (format) => {
    if (format === "json") return exportToJSON(visibleObjects);
    if (format === "stl") return exportToSTL(visibleObjects);
    if (format === "glb") return exportToGLB(visibleObjects);
  };

  const handleImportFiles = async (files) => {
    const blueprints = await importFiles(files);
    if (!blueprints.length) return;
    let counter = objectIdCounter;
    const newObjs = [...objects];
    const newIds = [];
    blueprints.forEach((bp) => {
      const obj = {
        id: counter,
        hidden: false,
        ...bp,
        // Ensure geometry is in both locations for export compatibility
        geometry: bp.geometry || bp.parameters?.geometry,
      };
      newObjs.push(obj);
      newIds.push(counter);
      counter++;
    });
    setObjects(newObjs);
    setObjectIdCounter(counter);
    setSelectedObjectIds(newIds);
    saveHistory(newObjs);
    setBodyPanelOpen(true);
  };

  // Module System Functions
  const handleModuleSelect = (moduleDefinition) => {
    const counter = objectIdCounter;

    if (moduleDefinition.type === "procedural") {
      // Generate geometry for procedural modules
      const generatorFunc = ModuleGenerators[moduleDefinition.generator];
      if (!generatorFunc) {
        console.error(
          `Generator function ${moduleDefinition.generator} not found`
        );
        return;
      }

      const geometry = generatorFunc(moduleDefinition.defaultParams);

      // Determine a free spawn position (avoid origin collision)
      const freePos = findFreeSpawnPosition(
        geometry,
        new THREE.Vector3(0, 0, 0)
      );

      const newModule = {
        id: counter,
        name: moduleDefinition.name,
        type: "module",
        geometryType: "procedural",
        hidden: false,
        transform: {
          position: [freePos.x, freePos.y, freePos.z],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
        },
        material: {
          color: "#cccccc",
          metalness: 0.6,
          roughness: 0.4,
          transparent: false,
          opacity: 1,
          wireframe: false,
          selectedColor: "#00ff88",
          hoverColor: "#00ddff",
        },
        parameters: moduleDefinition.defaultParams,
        geometry: geometry,
        userData: {
          isModule: true,
          moduleDefinition: moduleDefinition,
          parameters: moduleDefinition.defaultParams,
          geometry: geometry,
          connections: [],
        },
      };

      const newObjs = [...objects, newModule];
      setObjects(newObjs);
      setObjectIdCounter(counter + 1);
      setSelectedObjectIds([counter]);
      saveHistory(newObjs);

      // Open parameter panel for adjustment
      setSelectedModuleForParams(newModule);
    } else if (moduleDefinition.type === "imported") {
      // Handle imported STL/GLB models
      console.log(`Would load model from: ${moduleDefinition.modelPath}`);
      // TODO: Implement STL/GLB loading when models are available
      alert(
        `Model ${moduleDefinition.name} will be loaded when available at ${moduleDefinition.modelPath}`
      );
    }
  };

  const handleModuleParameterChange = (newParams) => {
    if (!selectedModuleForParams) return;

    const moduleId = selectedModuleForParams.id;
    const moduleDef = selectedModuleForParams.userData.moduleDefinition;

    // Regenerate geometry with new parameters
    const generatorFunc = ModuleGenerators[moduleDef.generator];
    if (!generatorFunc) return;

    const newGeometry = generatorFunc(newParams);

    // Update the module
    const newObjects = objects.map((obj) => {
      if (obj.id === moduleId) {
        return {
          ...obj,
          parameters: newParams,
          geometry: newGeometry,
          userData: {
            ...obj.userData,
            parameters: newParams,
            geometry: newGeometry,
          },
        };
      }
      return obj;
    });

    setObjects(newObjects);
    saveHistory(newObjects);

    // Update selected module reference
    const updatedModule = newObjects.find((obj) => obj.id === moduleId);
    setSelectedModuleForParams(updatedModule);
  };

  const handleToggleVisibility = (id) => {
    const newObjects = objects.map((obj) =>
      obj.id === id ? { ...obj, hidden: !obj.hidden } : obj
    );
    setObjects(newObjects);
    setSelectedObjectIds((prev) =>
      newObjects.find((obj) => obj.id === id)?.hidden
        ? prev.filter((objId) => objId !== id)
        : prev
    );
    saveHistory(newObjects);
  };

  const handleSelectFromPanel = (id) => {
    setSelectedObjectIds([id]);
  };

  const handleDeleteObject = (id) => {
    const newObjects = objects.filter((obj) => obj.id !== id);
    setObjects(newObjects);
    setSelectedObjectIds((prev) => prev.filter((objId) => objId !== id));
    saveHistory(newObjects);
  };

  const selectedObjects = objects.filter((obj) =>
    selectedObjectIds.includes(obj.id)
  );
  const selectedObject =
    selectedObjects.length === 1 ? selectedObjects[0] : null;
  const drawerOpen = selectedObjects.length > 0;

  return (
    <div className="app">
      <header className="app-header">
        <h1>🛰️ Nexus Habitat Creator</h1>
        <div className="header-controls">
          <div className="undo-redo-group">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className="header-btn"
              title="Undo (Ctrl+Z)"
            >
              ↶ Undo
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className="header-btn"
              title="Redo (Ctrl+Shift+Z)"
            >
              ↷ Redo
            </button>
          </div>
          <div className="axis-lock-group">
            <button
              onClick={() => setAxisLock(axisLock === "x" ? null : "x")}
              className={`axis-btn ${axisLock === "x" ? "active" : ""}`}
              title="Lock to X axis (X key)"
            >
              X
            </button>
            <button
              onClick={() => setAxisLock(axisLock === "y" ? null : "y")}
              className={`axis-btn ${axisLock === "y" ? "active" : ""}`}
              title="Lock to Y axis (Y key)"
            >
              Y
            </button>
            <button
              onClick={() => setAxisLock(axisLock === "z" ? null : "z")}
              className={`axis-btn ${axisLock === "z" ? "active" : ""}`}
              title="Lock to Z axis (Z key)"
            >
              Z
            </button>
          </div>
          <label>
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
            />
            Show Grid
          </label>
          <div className="object-count">
            Visible: {visibleObjects.length} / Total: {objects.length} |
            Selected: {selectedObjectIds.length}
          </div>
        </div>
      </header>

      <Toolbar
        transformMode={transformMode}
        onSetTransformMode={setTransformMode}
        onDelete={deleteSelectedObjects}
        onDuplicate={duplicateSelectedObjects}
        selectedCount={selectedObjectIds.length}
        onImportFiles={handleImportFiles}
        onExport={handleExport}
        onToggleBodies={() => setBodyPanelOpen((prev) => !prev)}
        bodyPanelOpen={isBodyPanelOpen}
        onToggleModules={() => setModuleLibraryOpen((prev) => !prev)}
        moduleLibraryOpen={isModuleLibraryOpen}
      />

      {isModuleLibraryOpen && (
        <ModuleLibraryPanel
          onModuleSelect={handleModuleSelect}
          onClose={() => setModuleLibraryOpen(false)}
        />
      )}

      {selectedModuleForParams && (
        <ModuleParameterPanel
          module={selectedModuleForParams}
          onParameterChange={handleModuleParameterChange}
          onClose={() => setSelectedModuleForParams(null)}
        />
      )}

      <div className={`app-content ${drawerOpen ? "drawer-open" : ""}`}>
        <div className="canvas-container">
          <CADCanvas
            objects={visibleObjects}
            selectedObjectIds={selectedObjectIds}
            onSelectObject={selectObject}
            transformMode={transformMode}
            onTransformObject={updateObjectTransform}
            gridSize={gridSize}
            showGrid={showGrid}
            axisLock={axisLock}
          />
        </div>
        <div className={`properties-drawer ${drawerOpen ? "open" : ""}`}>
          {drawerOpen && (
            <PropertiesPanel
              selectedObject={selectedObject}
              selectedObjects={selectedObjects}
              onUpdateObject={updateObject}
              onExport={handleExport}
            />
          )}
        </div>
        <BodyPanel
          isOpen={isBodyPanelOpen}
          bodies={objects}
          selectedIds={selectedObjectIds}
          onSelect={handleSelectFromPanel}
          onToggleVisibility={handleToggleVisibility}
          onDelete={handleDeleteObject}
          onClose={() => setBodyPanelOpen(false)}
        />
      </div>
    </div>
  );
}

export default App;
