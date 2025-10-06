import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import CADCanvas from "./components/CADCanvas";
import Toolbar from "./components/Toolbar";
import PropertiesPanel from "./components/PropertiesPanel";
import BodyPanel from "./components/BodyPanel";
import LandingPage from "./components/LandingPage";
import ModuleLibraryPanel from "./components/ModuleLibraryPanel";
import ModuleParameterPanel from "./components/ModuleParameterPanel";
import { exportToJSON, exportToSTL, exportToGLB } from "./utils/exportUtils";
import { importFiles } from "./utils/importUtils";
import { HistoryManager } from "./utils/historyManager";
import * as ModuleGenerators from "./utils/moduleGenerators";
import { findFreeSpawnPosition } from "./utils/physicsSystem";
import * as THREE from "three";
import {
  saveProject,
  getProject,
  getCurrentProjectId,
  clearCurrentProject,
  createAutoSaver,
} from "./utils/projectStorage";
import "./App.css";

function EditorView({ initialProject, onExit }) {
  const [currentProject, setCurrentProject] = useState(initialProject);
  const [objects, setObjects] = useState(initialProject.objects || []);
  const [selectedObjectIds, setSelectedObjectIds] = useState([]);
  const [transformMode, setTransformMode] = useState("translate");
  const [gridSize] = useState(20);
  const [showGrid, setShowGrid] = useState(true);
  const [objectIdCounter, setObjectIdCounter] = useState(
    initialProject.objectIdCounter || 1
  );
  const [axisLock, setAxisLock] = useState(null);
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

  const visibleObjects = useMemo(
    () => objects.filter((obj) => !obj.hidden),
    [objects]
  );

  // Auto-save functionality
  const handleSave = useCallback(() => {
    const updatedProject = {
      ...currentProject,
      objects,
      objectIdCounter,
    };
    saveProject(updatedProject);
    setCurrentProject(updatedProject);
    console.log("✓ Project saved:", updatedProject.name);
  }, [currentProject, objects, objectIdCounter]);

  const autoSaver = useRef(createAutoSaver(handleSave, 3000));

  useEffect(() => {
    autoSaver.current();
  }, [objects, objectIdCounter]);

  const saveHistory = (newObjects) => {
    historyManager.current.push(newObjects);
    setCanUndo(historyManager.current.canUndo());
    setCanRedo(historyManager.current.canRedo());
  };

  const selectObject = (id, isMultiSelect = false) => {
    if (id === null) {
      setSelectedObjectIds([]);
      setSelectedModuleForParams(null);
      return;
    }

    if (isMultiSelect) {
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
      // If multiple objects are selected, move them all together
      if (selectedObjectIds.length > 1 && selectedObjectIds.includes(id)) {
        // Calculate delta from the moved object
        const movedObj = prevObjects.find((obj) => obj.id === id);
        if (!movedObj) return prevObjects;

        const delta = {
          position: [
            transform.position[0] - movedObj.transform.position[0],
            transform.position[1] - movedObj.transform.position[1],
            transform.position[2] - movedObj.transform.position[2],
          ],
          rotation: [
            transform.rotation[0] - movedObj.transform.rotation[0],
            transform.rotation[1] - movedObj.transform.rotation[1],
            transform.rotation[2] - movedObj.transform.rotation[2],
          ],
          scale: [
            transform.scale[0] / movedObj.transform.scale[0],
            transform.scale[1] / movedObj.transform.scale[1],
            transform.scale[2] / movedObj.transform.scale[2],
          ],
        };

        // Apply delta to all selected objects
        const newObjects = prevObjects.map((obj) => {
          if (selectedObjectIds.includes(obj.id)) {
            return {
              ...obj,
              transform: {
                position: [
                  obj.transform.position[0] + delta.position[0],
                  obj.transform.position[1] + delta.position[1],
                  obj.transform.position[2] + delta.position[2],
                ],
                rotation: [
                  obj.transform.rotation[0] + delta.rotation[0],
                  obj.transform.rotation[1] + delta.rotation[1],
                  obj.transform.rotation[2] + delta.rotation[2],
                ],
                scale: [
                  obj.transform.scale[0] * delta.scale[0],
                  obj.transform.scale[1] * delta.scale[1],
                  obj.transform.scale[2] * delta.scale[2],
                ],
              },
            };
          }
          return obj;
        });

        if (commit) {
          saveHistory(newObjects);
        }
        return newObjects;
      } else {
        // Single object movement
        const newObjects = prevObjects.map((obj) =>
          obj.id === id
            ? { ...obj, transform: { ...obj.transform, ...transform } }
            : obj
        );
        if (commit) {
          saveHistory(newObjects);
        }
        return newObjects;
      }
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.matches("input, textarea")) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z") ||
        ((e.ctrlKey || e.metaKey) && e.key === "y")
      ) {
        e.preventDefault();
        handleRedo();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelectedObjects();
      } else if (e.key === "x" || e.key === "X") {
        setAxisLock(axisLock === "x" ? null : "x");
      } else if (e.key === "y" || e.key === "Y") {
        setAxisLock(axisLock === "y" ? null : "y");
      } else if (e.key === "z" || e.key === "Z") {
        setAxisLock(axisLock === "z" ? null : "z");
      } else if (e.key === "Escape") {
        setAxisLock(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [objects, selectedObjectIds, axisLock, handleSave]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleExitToHome = () => {
    handleSave(); // Save before exiting
    onExit();
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
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={handleExitToHome}
            className="header-btn"
            title="Back to projects"
          >
            ← Home
          </button>
          <h1>{currentProject.name}</h1>
        </div>
        <div className="header-controls">
          <button
            onClick={handleSave}
            className="header-btn"
            title="Save (Ctrl+S)"
          >
            Save
          </button>
          <div className="undo-redo-group">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className="header-btn"
              title="Undo (Ctrl+Z)"
            >
              Undo
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className="header-btn"
              title="Redo (Ctrl+Shift+Z)"
            >
              Redo
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

function App() {
  const [currentView, setCurrentView] = useState("landing");
  const [currentProject, setCurrentProject] = useState(null);

  useEffect(() => {
    // Check if there's a current project on mount
    const projectId = getCurrentProjectId();
    if (projectId) {
      const project = getProject(projectId);
      if (project) {
        setCurrentProject(project);
        setCurrentView("editor");
      }
    }
  }, []);

  const handleOpenProject = (project) => {
    setCurrentProject(project);
    setCurrentView("editor");
  };

  const handleCreateProject = (project) => {
    setCurrentProject(project);
    setCurrentView("editor");
  };

  const handleExitToLanding = () => {
    clearCurrentProject();
    setCurrentProject(null);
    setCurrentView("landing");
  };

  if (currentView === "landing") {
    return (
      <LandingPage
        onOpenProject={handleOpenProject}
        onCreateProject={handleCreateProject}
      />
    );
  }

  if (currentView === "editor" && currentProject) {
    return (
      <EditorView
        initialProject={currentProject}
        onExit={handleExitToLanding}
      />
    );
  }

  return null;
}

export default App;
