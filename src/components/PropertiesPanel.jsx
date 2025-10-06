import { useState, useEffect } from "react";
import "./PropertiesPanel.css";

export default function PropertiesPanel({
  selectedObject,
  selectedObjects,
  onUpdateObject,
  onExport,
  onParameterChange,
}) {
  const [name, setName] = useState("");
  const [material, setMaterial] = useState({
    color: "#888888",
    metalness: 0.5,
    roughness: 0.5,
    opacity: 1,
    transparent: false,
    wireframe: false,
  });
  const [params, setParams] = useState({});

  useEffect(() => {
    if (selectedObject) {
      setName(selectedObject.name);
      setMaterial(selectedObject.material);

      if (selectedObject?.userData?.moduleDefinition) {
        const def = selectedObject.userData.moduleDefinition;
        setParams(
          selectedObject.userData.parameters || def.defaultParams || {}
        );
      } else {
        setParams({});
      }
    }
  }, [selectedObject]);

  const handleMaterialChange = (key, value) => {
    const newMaterial = { ...material, [key]: value };

    // Automatically enable transparent when opacity < 1
    if (key === "opacity" && value < 1 && !newMaterial.transparent) {
      newMaterial.transparent = true;
    }

    setMaterial(newMaterial);
    if (selectedObject) {
      onUpdateObject(selectedObject.id, { material: newMaterial });
    }
  };

  const handleTransformChange = (type, index, value) => {
    if (!selectedObject) return;

    const newTransform = { ...selectedObject.transform };
    const parsedValue = parseFloat(value) || 0;

    if (type === "position") {
      newTransform.position = [...newTransform.position];
      newTransform.position[index] = parsedValue;
    } else if (type === "rotation") {
      newTransform.rotation = [...newTransform.rotation];
      newTransform.rotation[index] = (parsedValue * Math.PI) / 180; // Convert to radians
    } else if (type === "scale") {
      newTransform.scale = [...newTransform.scale];
      newTransform.scale[index] = parsedValue;
    }

    onUpdateObject(selectedObject.id, { transform: newTransform });
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    if (selectedObject) {
      onUpdateObject(selectedObject.id, { name: newName });
    }
  };

  const exportFormats = [
    { value: "json", label: "JSON" },
    { value: "stl", label: "STL" },
    { value: "glb", label: "GLB" },
  ];

  const handleParamChange = (paramName, value) => {
    const newParams = { ...params, [paramName]: value };
    setParams(newParams);
    if (onParameterChange) {
      onParameterChange(newParams);
    }
  };

  const handleResetParams = () => {
    if (selectedObject?.userData?.moduleDefinition) {
      const def = selectedObject.userData.moduleDefinition;
      setParams(def.defaultParams);
      if (onParameterChange) {
        onParameterChange(def.defaultParams);
      }
    }
  };

  const isProceduralModule =
    selectedObject?.userData?.moduleDefinition?.type === "procedural" &&
    selectedObject?.userData?.moduleDefinition?.adjustableParams;

  if (!selectedObject) {
    const multiSelectMessage =
      selectedObjects && selectedObjects.length > 1
        ? `${selectedObjects.length} objects selected`
        : "No object selected";

    return (
      <div className="properties-panel">
        <div className="panel-header">
          <h2>Properties</h2>
        </div>
        <div className="panel-content">
          <p className="no-selection">{multiSelectMessage}</p>
          {selectedObjects && selectedObjects.length > 1 && (
            <div className="multi-select-info">
              <p>Multi-select editing coming soon!</p>
            </div>
          )}
          <div className="export-section">
            <h3>Export Project</h3>
            {exportFormats.map((format) => (
              <button
                key={format.value}
                onClick={() => onExport(format.value)}
                className="export-btn"
              >
                Export as {format.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="properties-panel">
      <div className="panel-header">
        <h2>Properties</h2>
      </div>

      <div className="panel-content">
        <div className="property-group">
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            className="property-input"
          />
        </div>

        <div className="property-group">
          <label>Type</label>
          <input
            type="text"
            value={selectedObject.type}
            disabled
            className="property-input"
          />
        </div>

        <div className="property-group">
          <h3>Material</h3>

          <label>Color</label>
          <div className="color-input-group">
            <input
              type="color"
              value={material.color}
              onChange={(e) => handleMaterialChange("color", e.target.value)}
              className="color-picker"
            />
            <input
              type="text"
              value={material.color}
              onChange={(e) => handleMaterialChange("color", e.target.value)}
              className="property-input"
            />
          </div>

          <label>Metalness: {material.metalness.toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={material.metalness}
            onChange={(e) =>
              handleMaterialChange("metalness", parseFloat(e.target.value))
            }
            className="slider"
          />

          <label>Roughness: {material.roughness.toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={material.roughness}
            onChange={(e) =>
              handleMaterialChange("roughness", parseFloat(e.target.value))
            }
            className="slider"
          />

          <label>Opacity: {material.opacity.toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={material.opacity}
            onChange={(e) =>
              handleMaterialChange("opacity", parseFloat(e.target.value))
            }
            className="slider"
          />

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={material.transparent}
                onChange={(e) =>
                  handleMaterialChange("transparent", e.target.checked)
                }
              />
              Transparent
            </label>
          </div>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={material.wireframe}
                onChange={(e) =>
                  handleMaterialChange("wireframe", e.target.checked)
                }
              />
              Wireframe
            </label>
          </div>
        </div>

        <div className="property-group">
          <h3>Transform</h3>

          <label>Position (X, Y, Z)</label>
          <div className="vector-input">
            <input
              type="number"
              step="0.1"
              value={selectedObject.transform.position[0].toFixed(2)}
              onChange={(e) =>
                handleTransformChange("position", 0, e.target.value)
              }
              className="vector-field"
              title="X"
            />
            <input
              type="number"
              step="0.1"
              value={selectedObject.transform.position[1].toFixed(2)}
              onChange={(e) =>
                handleTransformChange("position", 1, e.target.value)
              }
              className="vector-field"
              title="Y"
            />
            <input
              type="number"
              step="0.1"
              value={selectedObject.transform.position[2].toFixed(2)}
              onChange={(e) =>
                handleTransformChange("position", 2, e.target.value)
              }
              className="vector-field"
              title="Z"
            />
          </div>

          <label>Rotation (X°, Y°, Z°)</label>
          <div className="vector-input">
            <input
              type="number"
              step="1"
              value={(
                (selectedObject.transform.rotation[0] * 180) /
                Math.PI
              ).toFixed(0)}
              onChange={(e) =>
                handleTransformChange("rotation", 0, e.target.value)
              }
              className="vector-field"
              title="X°"
            />
            <input
              type="number"
              step="1"
              value={(
                (selectedObject.transform.rotation[1] * 180) /
                Math.PI
              ).toFixed(0)}
              onChange={(e) =>
                handleTransformChange("rotation", 1, e.target.value)
              }
              className="vector-field"
              title="Y°"
            />
            <input
              type="number"
              step="1"
              value={(
                (selectedObject.transform.rotation[2] * 180) /
                Math.PI
              ).toFixed(0)}
              onChange={(e) =>
                handleTransformChange("rotation", 2, e.target.value)
              }
              className="vector-field"
              title="Z°"
            />
          </div>

          <label>Scale (X, Y, Z)</label>
          <div className="vector-input">
            <input
              type="number"
              step="0.1"
              value={selectedObject.transform.scale[0].toFixed(2)}
              onChange={(e) =>
                handleTransformChange("scale", 0, e.target.value)
              }
              className="vector-field"
              title="X"
            />
            <input
              type="number"
              step="0.1"
              value={selectedObject.transform.scale[1].toFixed(2)}
              onChange={(e) =>
                handleTransformChange("scale", 1, e.target.value)
              }
              className="vector-field"
              title="Y"
            />
            <input
              type="number"
              step="0.1"
              value={selectedObject.transform.scale[2].toFixed(2)}
              onChange={(e) =>
                handleTransformChange("scale", 2, e.target.value)
              }
              className="vector-field"
              title="Z"
            />
          </div>
        </div>

        {isProceduralModule && (
          <div className="property-group module-params-group">
            <h3>Module Parameters</h3>
            <div className="module-info-compact">
              <span className="module-icon-small">
                {selectedObject.userData.moduleDefinition.icon}
              </span>
              <span className="module-desc-small">
                {selectedObject.userData.moduleDefinition.description}
              </span>
            </div>
            <div className="param-controls">
              {selectedObject.userData.moduleDefinition.adjustableParams.map(
                (param) => (
                  <ParamControl
                    key={param.name}
                    param={param}
                    value={params[param.name] ?? param.min}
                    onChange={(val) => handleParamChange(param.name, val)}
                  />
                )
              )}
            </div>
            <button className="reset-params-btn" onClick={handleResetParams}>
              ↺ Reset to Default
            </button>
          </div>
        )}

        <div className="export-section">
          <h3>Export</h3>
          {exportFormats.map((format) => (
            <button
              key={format.value}
              onClick={() => onExport(format.value)}
              className="export-btn"
            >
              Export as {format.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * ParamControl - Individual parameter slider/input for module parameters
 */
function ParamControl({ param, value, onChange }) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    setLocalValue(val);
  };

  const handleSliderRelease = () => {
    onChange(localValue);
  };

  const handleInputChange = (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      setLocalValue(val);
      onChange(val);
    }
  };

  return (
    <div className="param-control">
      <label>
        <span className="param-label">{param.label}</span>
        <span className="param-value">{localValue.toFixed(2)}</span>
      </label>
      <div className="param-input-group">
        <input
          type="range"
          min={param.min}
          max={param.max}
          step={param.step}
          value={localValue}
          onChange={handleSliderChange}
          onMouseUp={handleSliderRelease}
          onTouchEnd={handleSliderRelease}
        />
        <input
          type="number"
          min={param.min}
          max={param.max}
          step={param.step}
          value={localValue}
          onChange={handleInputChange}
          className="number-input"
        />
      </div>
    </div>
  );
}
