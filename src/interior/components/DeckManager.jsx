

import PropTypes from "prop-types";

function DeckManager({
  decks,
  activeDeckId,
  onSelectDeck,
  onAddDeck,
  onRemoveDeck,
  cylinderLength,
}) {
  return (
    <div className="interior-panel-section">
      <h3 className="interior-panel-title">
        <span className="icon">🏢</span>
        Decks / Levels
      </h3>

      <div className="deck-list">
        {decks.map((deck) => (
          <div
            key={deck.id}
            className={`deck-item ${activeDeckId === deck.id ? "active" : ""}`}
            onClick={() => onSelectDeck(deck.id)}
          >
            <div className="deck-header">
              <div className="deck-title">Level {deck.level}</div>
              <button
                className="interior-header-btn"
                style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm("Remove this deck?")) {
                    onRemoveDeck(deck.id);
                  }
                }}
              >
                ×
              </button>
            </div>
            <div className="deck-info">
              <span>Floor: {deck.floorHeight.toFixed(1)}m</span>
              <span>Height: {deck.ceilingHeight.toFixed(1)}m</span>
              <span>Rooms: {deck.rooms.length}</span>
            </div>
          </div>
        ))}
      </div>

      <button
        className="add-deck-btn"
        onClick={onAddDeck}
        disabled={decks.length >= Math.floor(cylinderLength / 2.5)}
        title="Add new deck/level"
      >
        Add Deck
      </button>

      <div
        style={{
          fontSize: "0.75rem",
          color: "#888",
          marginTop: "0.5rem",
          textAlign: "center",
        }}
      >
        Max {Math.floor(cylinderLength / 2.5)} decks
      </div>
    </div>
  );
}

DeckManager.propTypes = {
  decks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      level: PropTypes.number.isRequired,
      floorHeight: PropTypes.number.isRequired,
      ceilingHeight: PropTypes.number.isRequired,
      rooms: PropTypes.array.isRequired,
    })
  ).isRequired,
  activeDeckId: PropTypes.string,
  onSelectDeck: PropTypes.func.isRequired,
  onAddDeck: PropTypes.func.isRequired,
  onRemoveDeck: PropTypes.func.isRequired,
  cylinderLength: PropTypes.number.isRequired,
};

export default DeckManager;
