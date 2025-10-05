import React, { useRef } from "react";
import "./Toolbar.css";

export default function Toolbar({
  transformMode,
  onSetTransformMode,
  onDelete,
  onDuplicate,
  selectedCount,
  onImportFiles,
  onExport,
  onToggleBodies,
  bodyPanelOpen,
  onToggleModules,
  moduleLibraryOpen,
}) {
  const fileInputRef = useRef(null);

  const transformModes = [
    { mode: "translate", icon: "↔", label: "Move" },
    { mode: "rotate", icon: "⟳", label: "Rotate" },
    { mode: "scale", icon: "⤢", label: "Scale" },
  ];

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) onImportFiles(files);
    e.target.value = "";
  };

  return (
    <aside className="toolbar modern">
      <button
        className={`toolbar-toggle ${bodyPanelOpen ? "active" : ""}`}
        onClick={onToggleBodies}
        title="Toggle body list"
      >
        ☰ Bodies
      </button>

      <button
        className={`toolbar-toggle ${moduleLibraryOpen ? "active" : ""}`}
        onClick={onToggleModules}
        title="Toggle module library"
      >
        🏗️ Modules
      </button>

      <div className="toolbar-section">
        <span className="section-title">Transform</span>
        <div className="button-column">
          {transformModes.map((tm) => (
            <button
              key={tm.mode}
              className={`toolbar-btn ${
                transformMode === tm.mode ? "active" : ""
              }`}
              onClick={() => onSetTransformMode(tm.mode)}
              style={{ width: "90px" }}
            >
              <span className="btn-icon">{tm.icon}</span>
              <span className="btn-label" style={{ fontSize: "11px" }}>
                {tm.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-section">
        <span className="section-title">Files</span>
        <button
          className="toolbar-btn wide"
          onClick={() => fileInputRef.current?.click()}
          style={{ width: "90px" }}
        >
          <span className="btn-icon">⬆</span>
          <span className="btn-label" style={{ fontSize: "13px" }}>
            Import
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".glb,.gltf,.stl"
          multiple
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <div className="export-chip-group">
          <button onClick={() => onExport("glb")}>GLB</button>
          <button onClick={() => onExport("stl")}>STL</button>
          <button onClick={() => onExport("json")}>JSON</button>
        </div>
      </div>

      <div className="toolbar-section">
        <span className="section-title">Selection</span>
        <button
          className="toolbar-btn"
          onClick={onDuplicate}
          disabled={!selectedCount}
          style={{ width: "90px" }}
        >
          <span className="btn-icon">⧉</span>
          <span className="btn-label" style={{ fontSize: "13px" }}>
            Duplicate
          </span>
        </button>
        <button
          className="toolbar-btn danger"
          onClick={onDelete}
          disabled={!selectedCount}
          style={{ width: "90px" }}
        >
          <span className="btn-icon">✖</span>
          <span className="btn-label" style={{ fontSize: "13px" }}>
            Delete
          </span>
        </button>
        <span className="selection-count">
          {selectedCount ? `${selectedCount} selected` : "No selection"}
        </span>
      </div>
    </aside>
  );
}
