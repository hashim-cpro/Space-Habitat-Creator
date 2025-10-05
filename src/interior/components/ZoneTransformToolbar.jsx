/**
 * Zone Transform Toolbar
 * Fixed right-side toolbar for transform operations
 */

import { useState } from "react";
import PropTypes from "prop-types";
import "./ZoneTransformToolbar.css";

function ZoneTransformToolbar({
  selectedZone,
  transformMode,
  onModeChange,
  onDelete,
}) {
  const [mode, setMode] = useState(transformMode || "translate");

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  const isDisabled = !selectedZone;

  return (
    <div className={`zone-transform-toolbar ${isDisabled ? "disabled" : ""}`}>
      <div className="toolbar-title">Transform</div>

      <button
        className={`toolbar-btn ${mode === "translate" ? "active" : ""}`}
        onClick={() => handleModeChange("translate")}
        data-tooltip="Move (G)"
        disabled={isDisabled}
      >
        ↔️
        <span className="shortcut">G</span>
      </button>

      <button
        className={`toolbar-btn ${mode === "rotate" ? "active" : ""}`}
        onClick={() => handleModeChange("rotate")}
        data-tooltip="Rotate (R)"
        disabled={isDisabled}
      >
        🔄
        <span className="shortcut">R</span>
      </button>

      <button
        className={`toolbar-btn ${mode === "scale" ? "active" : ""}`}
        onClick={() => handleModeChange("scale")}
        data-tooltip="Scale (S)"
        disabled={isDisabled}
      >
        ⚏<span className="shortcut">S</span>
      </button>

      <div className="toolbar-divider"></div>

      <button
        className="toolbar-btn"
        onClick={onDelete}
        data-tooltip="Delete (Del)"
        disabled={isDisabled}
        style={{ color: "#ff4444" }}
      >
        🗑️
      </button>

      {isDisabled && (
        <div className="toolbar-info">Select a zone to transform</div>
      )}
    </div>
  );
}

ZoneTransformToolbar.propTypes = {
  selectedZone: PropTypes.object,
  transformMode: PropTypes.oneOf(["translate", "rotate", "scale"]),
  onModeChange: PropTypes.func,
  onDelete: PropTypes.func,
};

export default ZoneTransformToolbar;
