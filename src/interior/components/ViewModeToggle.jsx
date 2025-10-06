/**
 * View Mode Toggle Component
 * Switches between 2D polar, 2D unwrapped, and 3D interior views
 */

import PropTypes from "prop-types";

function ViewModeToggle({ viewMode, onChangeViewMode }) {
  const modes = [
    {
      id: "2d-polar",
      label: "Polar View",
      tooltip: "Top-down circular view",
    },
    {
      id: "2d-unwrapped",
      label: "Unwrapped",
      tooltip: "Cylinder unrolled flat",
    },
    {
      id: "3d-interior",
      label: "3D Interior",
      tooltip: "Perspective walkthrough",
    },
  ];

  return (
    <>
      {modes.map((mode) => (
        <button
          key={mode.id}
          className={`view-mode-btn ${viewMode === mode.id ? "active" : ""}`}
          onClick={() => onChangeViewMode(mode.id)}
          title={mode.tooltip}
        >
          {mode.label}
        </button>
      ))}
    </>
  );
}

ViewModeToggle.propTypes = {
  viewMode: PropTypes.oneOf(["2d-polar", "2d-unwrapped", "3d-interior"])
    .isRequired,
  onChangeViewMode: PropTypes.func.isRequired,
};

export default ViewModeToggle;
