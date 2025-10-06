/**
 * Zone Palette Component
 * Drag-and-drop interface for functional zones
 */

import { useState } from "react";
import PropTypes from "prop-types";
import { getAllZoneTypes } from "../utils/functionalZones";
import "./ZonePalette.css";

function ZonePalette({ onZoneDragStart, disabled }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const zoneTypes = getAllZoneTypes();

  // Filter zones by search and category
  const filteredZones = zoneTypes.filter((zone) => {
    const matchesSearch =
      zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || zone.priority === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleDragStart = (e, zoneType) => {
    if (disabled) return;

    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("zone-type", zoneType.id);

    // Create drag preview
    const dragPreview = document.createElement("div");
    dragPreview.style.cssText = `
      background: ${hexToRgba(zoneType.color, 0.8)};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      pointer-events: none;
    `;
    dragPreview.textContent = `${zoneType.icon} ${zoneType.name}`;
    dragPreview.style.position = "absolute";
    dragPreview.style.top = "-1000px";
    document.body.appendChild(dragPreview);
    e.dataTransfer.setDragImage(dragPreview, 0, 0);

    setTimeout(() => document.body.removeChild(dragPreview), 0);

    if (onZoneDragStart) {
      onZoneDragStart(zoneType);
    }
  };

  return (
    <div className="zone-palette">
      <div className="zone-palette-header">
        <h3>Nexus Habitat Creator</h3>
        <p className="subtitle">Drag zones into your habitat</p>
      </div>

      {/* Search and Filter */}
      <div className="zone-palette-controls">
        <input
          type="text"
          className="zone-search"
          placeholder="Search zones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="zone-filters">
          <button
            className={`filter-btn ${
              selectedCategory === "all" ? "active" : ""
            }`}
            onClick={() => setSelectedCategory("all")}
          >
            All
          </button>
          <button
            className={`filter-btn ${
              selectedCategory === "high" ? "active" : ""
            }`}
            onClick={() => setSelectedCategory("high")}
          >
            Essential
          </button>
          <button
            className={`filter-btn ${
              selectedCategory === "medium" ? "active" : ""
            }`}
            onClick={() => setSelectedCategory("medium")}
          >
            Important
          </button>
          <button
            className={`filter-btn ${
              selectedCategory === "low" ? "active" : ""
            }`}
            onClick={() => setSelectedCategory("low")}
          >
            Optional
          </button>
        </div>
      </div>

      {/* Zone Grid */}
      <div className="zone-grid">
        {filteredZones.map((zone) => (
          <div
            key={zone.id}
            className={`zone-card ${disabled ? "disabled" : ""}`}
            draggable={!disabled}
            onDragStart={(e) => handleDragStart(e, zone)}
            style={{
              borderColor: hexToRgba(zone.color, 0.5),
              cursor: disabled ? "not-allowed" : "grab",
            }}
          >
            <div
              className="zone-card-icon"
              style={{
                background: `linear-gradient(135deg, ${hexToRgba(
                  zone.color,
                  0.2
                )}, ${hexToRgba(zone.color, 0.4)})`,
                borderColor: hexToRgba(zone.color, 0.6),
              }}
            >
              {zone.icon}
            </div>
            <div className="zone-card-info">
              <div className="zone-card-name">{zone.name}</div>
              <div className="zone-card-desc">{zone.description}</div>
              <div className="zone-card-meta">
                <span className={`priority-badge priority-${zone.priority}`}>
                  {zone.priority}
                </span>
                <span className="volume-badge">{zone.minVolume}m³ min</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredZones.length === 0 && (
        <div className="no-zones">
          <div className="no-zones-icon"></div>
          <div>No zones found</div>
          <div className="no-zones-hint">Try a different search term</div>
        </div>
      )}

      {/* Instructions */}
      <div className="zone-palette-instructions">
        <div className="instruction-item">
          <span className="instruction-icon"></span>
          <span>Drag zones into 3D viewport</span>
        </div>
        <div className="instruction-item">
          <span className="instruction-icon"></span>
          <span>Zones adapt to container shape</span>
        </div>
        <div className="instruction-item">
          <span className="instruction-icon"></span>
          <span>Auto-collision detection</span>
        </div>
      </div>
    </div>
  );
}

// Helper function to convert hex to rgba
function hexToRgba(hex, alpha = 1) {
  const r = (hex >> 16) & 255;
  const g = (hex >> 8) & 255;
  const b = hex & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

ZonePalette.propTypes = {
  onZoneDragStart: PropTypes.func,
  disabled: PropTypes.bool,
};

ZonePalette.defaultProps = {
  disabled: false,
};

export default ZonePalette;
