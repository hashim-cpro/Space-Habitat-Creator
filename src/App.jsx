import { useState, useEffect, useMemo, useRef } from "react";
import CADCanvas from "./components/CADCanvas";
import Toolbar from "./components/Toolbar";
import PropertiesPanel from "./components/PropertiesPanel";
import BodyPanel from "./components/BodyPanel";
import { exportToJSON, exportToSTL, exportToGLB } from "./utils/exportUtils";
import { importFiles } from "./utils/importUtils";
import { HistoryManager } from "./utils/historyManager";
import "./App.css";

function App() {
  const [objects, setObjects] = useState([]);
  const [selectedObjectIds, setSelectedObjectIds] = useState([]); // Multi-select support
  const [transformMode, setTransformMode] = useState("translate");
  const [gridSize] = useState(20);
  const [showGrid, setShowGrid] = useState(true);
  const [objectIdCounter, setObjectIdCounter] = useState(1);
  const [axisLock, setAxisLock] = useState(null); // 'x', 'y', 'z', or null
  const [isBodyPanelOpen, setBodyPanelOpen] = useState(false);
  const historyManager = useRef(new HistoryManager());
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const objectsRef = useRef(objects);

  useEffect(() => {
    objectsRef.current = objects;
  }, [objects]);

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
        <h1>🏗️ Habitat Model Viewer</h1>
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
      />

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
