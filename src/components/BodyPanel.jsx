import "./BodyPanel.css";

export default function BodyPanel({
  isOpen,
  bodies,
  selectedIds,
  onSelect,
  onToggleVisibility,
  onDelete,
  onClose,
}) {
  return (
    <aside className={`body-panel ${isOpen ? "open" : ""}`}>
      <div className="body-panel-header">
        <h3>Bodies ({bodies.length})</h3>
        <button className="body-panel-close" onClick={onClose} title="Close">
          ✕
        </button>
      </div>
      <div className="body-panel-list">
        {bodies.length === 0 ? (
          <p className="body-panel-empty">No bodies in scene yet.</p>
        ) : (
          bodies.map((body) => {
            const isSelected = selectedIds.includes(body.id);
            return (
              <div
                key={body.id}
                className={`body-row ${isSelected ? "selected" : ""} ${
                  body.hidden ? "hidden" : ""
                }`}
              >
                <button
                  className="body-row-visibility"
                  onClick={() => onToggleVisibility(body.id)}
                  title={body.hidden ? "Show" : "Hide"}
                >
                  {body.hidden ? "Hidden" : "Visible"}
                </button>
                <button
                  className="body-row-name"
                  onClick={() => onSelect(body.id)}
                  title="Select body"
                >
                  {body.name || `Body ${body.id}`}
                </button>
                <button
                  className="body-row-delete"
                  onClick={() => onDelete(body.id)}
                  title="Delete"
                >
                  ×
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
