import React, { useState, useMemo } from "react";
import { MODULE_LIBRARY, MODULE_CATEGORIES } from "../utils/moduleLibrary";
import "./ModuleLibraryPanel.css";

/**
 * ModuleLibraryPanel - Sidebar showing available modules
 * Supports drag-and-drop to add modules to scene
 */
export default function ModuleLibraryPanel({ onModuleSelect, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState(
    new Set(Object.values(MODULE_CATEGORIES))
  );

  // Filter modules by category and search
  const filteredModules = useMemo(() => {
    let modules = MODULE_LIBRARY;

    // Filter by category
    if (selectedCategory !== "all") {
      modules = modules.filter((mod) => mod.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      modules = modules.filter(
        (mod) =>
          mod.name.toLowerCase().includes(term) ||
          mod.description.toLowerCase().includes(term)
      );
    }

    return modules;
  }, [selectedCategory, searchTerm]);

  // Group modules by category
  const groupedModules = useMemo(() => {
    const groups = {};
    filteredModules.forEach((mod) => {
      if (!groups[mod.category]) {
        groups[mod.category] = [];
      }
      groups[mod.category].push(mod);
    });
    return groups;
  }, [filteredModules]);

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleModuleClick = (module) => {
    onModuleSelect(module);
  };

  const handleDragStart = (e, module) => {
    e.dataTransfer.setData("module", JSON.stringify(module));
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="module-library-panel">
      <div className="panel-header">
        <h2>🏗️ Module Library</h2>
        <button className="close-btn" onClick={onClose} title="Close">
          ✕
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Search modules..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <button
          className={selectedCategory === "all" ? "active" : ""}
          onClick={() => setSelectedCategory("all")}
        >
          All Modules
        </button>
        {Object.values(MODULE_CATEGORIES).map((cat) => (
          <button
            key={cat}
            className={selectedCategory === cat ? "active" : ""}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Module List */}
      <div className="module-list">
        {Object.keys(groupedModules).length === 0 ? (
          <div className="no-results">
            <p>No modules found</p>
            <small>Try a different search or category</small>
          </div>
        ) : (
          Object.entries(groupedModules).map(([category, modules]) => (
            <div key={category} className="module-category">
              <div
                className="category-header"
                onClick={() => toggleCategory(category)}
              >
                <span className="expand-icon">
                  {expandedCategories.has(category) ? "▼" : "▶"}
                </span>
                <h3>{category}</h3>
                <span className="count">({modules.length})</span>
              </div>

              {expandedCategories.has(category) && (
                <div className="category-modules">
                  {modules.map((module) => (
                    <ModuleCard
                      key={module.id}
                      module={module}
                      onClick={() => handleModuleClick(module)}
                      onDragStart={(e) => handleDragStart(e, module)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Instructions */}
      <div className="panel-footer">
        <small>
          💡 <strong>Tip:</strong> Click to place or drag to canvas
        </small>
      </div>
    </div>
  );
}

/**
 * ModuleCard - Individual module item
 */
function ModuleCard({ module, onClick, onDragStart }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`module-card ${module.type} ${isHovered ? "hovered" : ""}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable
      onDragStart={onDragStart}
    >
      <div className="module-icon">{module.icon}</div>
      <div className="module-info">
        <h4>{module.name}</h4>
        <p className="module-description">{module.description}</p>

        {module.type === "procedural" && (
          <div className="module-params">
            <span className="param-badge">⚙️ Adjustable</span>
            {module.defaultParams && (
              <span className="param-preview">
                {Object.entries(module.defaultParams)
                  .slice(0, 2)
                  .map(([key, val]) => `${key}: ${val}`)
                  .join(", ")}
              </span>
            )}
          </div>
        )}

        {module.type === "imported" && (
          <div className="module-params">
            <span className="param-badge">
              {module.isPriority ? "⭐ Priority" : "📦 Custom"}
            </span>
          </div>
        )}
      </div>

      {isHovered && (
        <div className="hover-hint">
          <span>Click or Drag to Add</span>
        </div>
      )}
    </div>
  );
}
