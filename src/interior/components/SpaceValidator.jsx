/**
 * Space Validator Component
 * Displays validation results and NASA standard compliance
 */

import PropTypes from "prop-types";
import { getValidationSummary } from "../utils/interiorRules";

function SpaceValidator({ validation, crewSize }) {
  if (!validation) {
    return (
      <div className="interior-panel-section">
        <h3 className="interior-panel-title">
          <span className="icon">✅</span>
          Validation
        </h3>
        <div style={{ textAlign: "center", padding: "1rem", color: "#888" }}>
          Add rooms to see validation...
        </div>
      </div>
    );
  }

  const summary = getValidationSummary(validation);

  return (
    <div className="interior-panel-section">
      <h3 className="interior-panel-title">
        <span className="icon">✅</span>
        NASA Standards Compliance
      </h3>

      {/* Summary */}
      <div className={`validation-summary ${summary.status}`}>
        <div style={{ fontSize: "1.2rem" }}>
          {summary.status === "excellent" && "✅"}
          {summary.status === "good" && "✓"}
          {summary.status === "needs-improvement" && "⚠️"}
          {summary.status === "invalid" && "❌"}
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
            Score: {summary.score}/100
          </div>
          <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>
            {summary.message}
          </div>
        </div>
      </div>

      {/* Errors */}
      {validation.errors.length > 0 && (
        <div>
          <div
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
              color: "#ff4444",
            }}
          >
            Errors ({validation.errors.length})
          </div>
          <div className="validation-list">
            {validation.errors.map((error, index) => (
              <div key={index} className="validation-item error">
                <span>❌</span>
                <span>{error}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <div
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
              color: "#ffa726",
            }}
          >
            Warnings ({validation.warnings.length})
          </div>
          <div className="validation-list" style={{ maxHeight: "200px" }}>
            {validation.warnings.slice(0, 10).map((warning, index) => (
              <div key={index} className="validation-item warning">
                <span>⚠️</span>
                <span>{warning}</span>
              </div>
            ))}
            {validation.warnings.length > 10 && (
              <div
                style={{
                  textAlign: "center",
                  fontSize: "0.75rem",
                  color: "#888",
                  marginTop: "0.5rem",
                }}
              >
                +{validation.warnings.length - 10} more warnings
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info */}
      <div
        style={{
          marginTop: "1rem",
          padding: "0.75rem",
          background: "rgba(74, 144, 226, 0.1)",
          borderRadius: "6px",
          fontSize: "0.75rem",
          color: "#aaa",
        }}
      >
        <div style={{ marginBottom: "0.5rem" }}>
          <strong>Crew Size:</strong> {crewSize} people
        </div>
        <div>
          Validating against NASA-STD-3001 standards for long-duration habitats.
        </div>
      </div>
    </div>
  );
}

SpaceValidator.propTypes = {
  validation: PropTypes.shape({
    valid: PropTypes.bool.isRequired,
    errors: PropTypes.arrayOf(PropTypes.string).isRequired,
    warnings: PropTypes.arrayOf(PropTypes.string).isRequired,
    score: PropTypes.number.isRequired,
  }),
  crewSize: PropTypes.number.isRequired,
};

export default SpaceValidator;
