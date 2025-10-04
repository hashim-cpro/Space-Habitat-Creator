import React, { useState, useEffect } from "react";
import "./ModuleParameterPanel.css";

/**
 * ModuleParameterPanel - Adjustable parameters for selected module
 * Shows up when a procedural module is selected
 */
export default function ModuleParameterPanel({
  module,
  onParameterChange,
  onClose,
}) {
  const [params, setParams] = useState({});

  useEffect(() => {
    if (module?.userData?.moduleDefinition) {
      const def = module.userData.moduleDefinition;
      setParams(module.userData.parameters || def.defaultParams || {});
    }
  }, [module]);

  if (!module?.userData?.moduleDefinition) {
    return null;
  }

  const def = module.userData.moduleDefinition;

  // Only show for procedural modules
  if (def.type !== "procedural" || !def.adjustableParams) {
    return null;
  }

  const handleParamChange = (paramName, value) => {
    const newParams = { ...params, [paramName]: value };
    setParams(newParams);
    onParameterChange(newParams);
  };

  return (
    <div className="module-parameter-panel">
      <div className="param-header">
        <h3>⚙️ Module Parameters</h3>
        <button className="close-btn" onClick={onClose} title="Close">
          ✕
        </button>
      </div>

      <div className="param-info">
        <div className="module-icon">{def.icon}</div>
        <div>
          <h4>{def.name}</h4>
          <p>{def.description}</p>
        </div>
      </div>

      <div className="param-controls">
        {def.adjustableParams.map((param) => (
          <ParamControl
            key={param.name}
            param={param}
            value={params[param.name] ?? param.min}
            onChange={(val) => handleParamChange(param.name, val)}
          />
        ))}
      </div>

      <div className="param-actions">
        <button className="apply-btn" onClick={() => onParameterChange(params)}>
          ✓ Apply Changes
        </button>
        <button
          className="reset-btn"
          onClick={() => {
            setParams(def.defaultParams);
            onParameterChange(def.defaultParams);
          }}
        >
          ↺ Reset to Default
        </button>
      </div>
    </div>
  );
}

/**
 * ParamControl - Individual parameter slider/input
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
