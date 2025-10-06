/**
 * Zone Properties Panel
 * Edit properties of selected functional zones
 */

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  getZoneDefinition,
  calculateZoneVolume,
} from "../utils/functionalZones";
import "./ZonePropertiesPanel.css";

function ZonePropertiesPanel({ zone, onUpdateZone, onDeleteZone }) {
  const [localZone, setLocalZone] = useState(zone || null);

  useEffect(() => {
    if (zone) {
      // Ensure zone has properly initialized size object
      const validatedZone = {
        ...zone,
        size: {
          width: zone.size?.width ?? 2,
          height: zone.size?.height ?? 2,
          depth: zone.size?.depth ?? 2,
        },
        position: zone.position || [0, 0, 0],
        rotation: zone.rotation || [0, 0, 0],
        opacity: zone.opacity ?? 0.3,
      };
      setLocalZone(validatedZone);
    }
  }, [zone]);

  if (!zone || !localZone) {
    return (
      <div className="zone-properties-panel empty">
        <div className="empty-state">
          <div className="empty-icon"></div>
          <div className="empty-text">No zone selected</div>
          <div className="empty-hint">
            Click on a zone or drag one from the palette
          </div>
        </div>
      </div>
    );
  }

  const zoneDef = getZoneDefinition(zone.type);
  const volume = calculateZoneVolume(zone);
  const meetsMinVolume = volume >= zoneDef.minVolume;

  const handlePositionChange = (axis, value) => {
    const currentPosition = localZone.position || [0, 0, 0];
    const newPosition = [
      currentPosition[0] ?? 0,
      currentPosition[1] ?? 0,
      currentPosition[2] ?? 0,
    ];
    const axisIndex = { x: 0, y: 1, z: 2 }[axis];
    newPosition[axisIndex] = parseFloat(value) || 0;
    const updated = { ...localZone, position: newPosition };
    setLocalZone(updated);
    onUpdateZone(updated);
  };

  const handleSizeChange = (dimension, value) => {
    const newSize = {
      width: localZone.size?.width ?? 2,
      height: localZone.size?.height ?? 2,
      depth: localZone.size?.depth ?? 2,
      ...localZone.size,
    };
    newSize[dimension] = Math.max(0.5, parseFloat(value) || 0.5);
    const updated = { ...localZone, size: newSize };
    setLocalZone(updated);
    onUpdateZone(updated);
  };

  const handleOpacityChange = (value) => {
    const updated = { ...localZone, opacity: parseFloat(value) };
    setLocalZone(updated);
    onUpdateZone(updated);
  };

  const handleToggleLock = () => {
    const updated = { ...localZone, locked: !localZone.locked };
    setLocalZone(updated);
    onUpdateZone(updated);
  };

  const handleToggleVisibility = () => {
    const updated = { ...localZone, visible: !localZone.visible };
    setLocalZone(updated);
    onUpdateZone(updated);
  };

  const handleDelete = () => {
    if (confirm(`Delete ${zone.name}?`)) {
      onDeleteZone(zone.id);
    }
  };

  return (
    <div className="zone-properties-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="panel-title">
          <span className="zone-icon">{zone.icon}</span>
          <span className="zone-name">{zone.name}</span>
        </div>
        <div className="panel-actions">
          <button
            className={`action-btn ${localZone.locked ? "active" : ""}`}
            onClick={handleToggleLock}
            title={localZone.locked ? "Unlock" : "Lock"}
          >
            {localZone.locked ? "🔒" : "🔓"}
          </button>
          <button
            className={`action-btn ${!localZone.visible ? "active" : ""}`}
            onClick={handleToggleVisibility}
            title={localZone.visible ? "Hide" : "Show"}
          >
            {localZone.visible ? "Show" : "Hide"}
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="zone-description">{zoneDef.description}</div>

      {/* Volume Info */}
      <div className={`volume-info ${!meetsMinVolume ? "warning" : ""}`}>
        <div className="volume-label">Volume:</div>
        <div className="volume-value">
          {volume.toFixed(2)} m³
          {!meetsMinVolume && (
            <span className="volume-warning">
              Below minimum ({zoneDef.minVolume} m³)
            </span>
          )}
        </div>
      </div>

      {/* Position Controls */}
      <div className="property-section">
        <div className="section-title">Position</div>
        <div className="control-group">
          <div className="control-row">
            <label>X</label>
            <input
              type="number"
              step="0.1"
              value={(localZone.position?.[0] ?? 0).toFixed(2)}
              onChange={(e) => handlePositionChange("x", e.target.value)}
              disabled={localZone.locked}
            />
            <span className="unit">m</span>
          </div>
          <div className="control-row">
            <label>Y</label>
            <input
              type="number"
              step="0.1"
              value={(localZone.position?.[1] ?? 0).toFixed(2)}
              onChange={(e) => handlePositionChange("y", e.target.value)}
              disabled={localZone.locked}
            />
            <span className="unit">m</span>
          </div>
          <div className="control-row">
            <label>Z</label>
            <input
              type="number"
              step="0.1"
              value={(localZone.position?.[2] ?? 0).toFixed(2)}
              onChange={(e) => handlePositionChange("z", e.target.value)}
              disabled={localZone.locked}
            />
            <span className="unit">m</span>
          </div>
        </div>
      </div>

      {/* Size Controls */}
      <div className="property-section">
        <div className="section-title">Size</div>
        <div className="control-group">
          <div className="control-row">
            <label>Width</label>
            <input
              type="number"
              step="0.1"
              min="0.5"
              value={(localZone.size?.width ?? 2).toFixed(2)}
              onChange={(e) => handleSizeChange("width", e.target.value)}
              disabled={localZone.locked}
            />
            <span className="unit">m</span>
          </div>
          <div className="control-row">
            <label>Height</label>
            <input
              type="number"
              step="0.1"
              min="0.5"
              value={(localZone.size?.height ?? 2).toFixed(2)}
              onChange={(e) => handleSizeChange("height", e.target.value)}
              disabled={localZone.locked}
            />
            <span className="unit">m</span>
          </div>
          <div className="control-row">
            <label>Depth</label>
            <input
              type="number"
              step="0.1"
              min="0.5"
              value={(localZone.size?.depth ?? 2).toFixed(2)}
              onChange={(e) => handleSizeChange("depth", e.target.value)}
              disabled={localZone.locked}
            />
            <span className="unit">m</span>
          </div>
        </div>
      </div>

      {/* Appearance Controls */}
      <div className="property-section">
        <div className="section-title">Appearance</div>
        <div className="control-group">
          <div className="control-row">
            <label>Opacity</label>
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.05"
              value={localZone.opacity}
              onChange={(e) => handleOpacityChange(e.target.value)}
            />
            <span className="value">
              {(localZone.opacity * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="property-section">
        <div className="section-title">Metadata</div>
        <div className="metadata-grid">
          <div className="metadata-item">
            <span className="meta-label">Priority:</span>
            <span className={`meta-value priority-${zoneDef.priority}`}>
              {zoneDef.priority}
            </span>
          </div>
          <div className="metadata-item">
            <span className="meta-label">Min Volume:</span>
            <span className="meta-value">{zoneDef.minVolume} m³</span>
          </div>
          <div className="metadata-item">
            <span className="meta-label">Adaptive:</span>
            <span className="meta-value">
              {localZone.metadata.isAdaptive ? "✓ Yes" : "✗ No"}
            </span>
          </div>
        </div>
      </div>

      {/* Delete Button */}
      <div className="panel-footer">
        <button className="delete-btn" onClick={handleDelete}>
          Delete Zone
        </button>
      </div>
    </div>
  );
}

ZonePropertiesPanel.propTypes = {
  zone: PropTypes.object,
  onUpdateZone: PropTypes.func.isRequired,
  onDeleteZone: PropTypes.func.isRequired,
};

export default ZonePropertiesPanel;
