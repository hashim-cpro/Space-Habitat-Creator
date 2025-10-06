/**
 * Room Library Component
 * Displays available room types for placement
 */

import PropTypes from "prop-types";
import { ROOM_TYPES, ROOM_CATEGORIES } from "../data/roomTypes";
import { useState } from "react";

function RoomLibrary({ onAddRoom, crewSize }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter rooms
  const filteredRooms = Object.values(ROOM_TYPES).filter((room) => {
    const matchesCategory =
      selectedCategory === "all" || room.category === selectedCategory;
    const matchesSearch =
      searchTerm === "" ||
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="interior-panel-section">
      <h3 className="interior-panel-title">
        <span className="icon"></span>
        Room Library
      </h3>

      {/* Search */}
      <div className="interior-form-group">
        <input
          type="text"
          className="interior-form-input"
          placeholder="Search rooms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Category Filter */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <button
          className={`view-mode-btn ${
            selectedCategory === "all" ? "active" : ""
          }`}
          style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem" }}
          onClick={() => setSelectedCategory("all")}
        >
          All
        </button>
        {Object.entries(ROOM_CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            className={`view-mode-btn ${
              selectedCategory === key ? "active" : ""
            }`}
            style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem" }}
            onClick={() => setSelectedCategory(key)}
            title={cat.name}
          >
            {cat.icon}
          </button>
        ))}
      </div>

      {/* Room List */}
      <div className="room-library-grid">
        {filteredRooms.map((room) => (
          <div
            key={room.id}
            className="room-library-item"
            onClick={() => onAddRoom(room.id)}
            draggable="true"
            onDragStart={(e) => {
              e.dataTransfer.setData("roomType", room.id);
              e.dataTransfer.effectAllowed = "copy";
            }}
            style={{ cursor: "grab" }}
            title={`Click to add or drag ${room.name} onto canvas`}
          >
            <div
              className="room-icon"
              style={{ background: `${room.color}22` }}
            >
              {room.icon}
            </div>
            <div className="room-info">
              <div className="room-name">{room.name}</div>
              <div className="room-details">
                {room.defaultDimensions.width}×{room.defaultDimensions.length}m
                • ~
                {Math.round(
                  room.defaultDimensions.width *
                    room.defaultDimensions.length *
                    crewSize
                )}
                m²
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
          No rooms found
        </div>
      )}
    </div>
  );
}

RoomLibrary.propTypes = {
  onAddRoom: PropTypes.func.isRequired,
  crewSize: PropTypes.number.isRequired,
};

export default RoomLibrary;
