/**
 * Floor Plan Canvas Component
 * Renders 2D floor plan (polar or unwrapped view)
 */

import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { ROOM_TYPES } from "../data/roomTypes";

function FloorPlanCanvas({
  deck,
  cylinderRadius,
  viewMode,
  selectedRoomId,
  onSelectRoom,
  onRemoveRoom,
  onAddRoom,
}) {
  const canvasRef = useRef(null);
  const [hoveredRoomId, setHoveredRoomId] = useState(null);
  const [isDraggingNewRoom, setIsDraggingNewRoom] = useState(false);
  const [draggedRoomType, setDraggedRoomType] = useState(null);

  useEffect(() => {
    if (!deck) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, rect.width, rect.height);

    if (viewMode === "2d-polar") {
      drawPolarView(ctx, rect.width, rect.height);
    } else if (viewMode === "2d-unwrapped") {
      drawUnwrappedView(ctx, rect.width, rect.height);
    }
  }, [deck, cylinderRadius, viewMode, selectedRoomId, hoveredRoomId]); // eslint-disable-line react-hooks/exhaustive-deps

  const drawPolarView = (ctx, width, height) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) / (cylinderRadius * 2.5);

    ctx.strokeStyle = "rgba(0, 245, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, cylinderRadius * scale, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, 1 * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      const innerR = 1 * scale;
      const outerR = cylinderRadius * scale;
      ctx.beginPath();
      ctx.moveTo(
        centerX + Math.cos(angle) * innerR,
        centerY + Math.sin(angle) * innerR
      );
      ctx.lineTo(
        centerX + Math.cos(angle) * outerR,
        centerY + Math.sin(angle) * outerR
      );
      ctx.stroke();
    }

    if (deck && deck.rooms) {
      deck.rooms.forEach((room) => {
        drawRoomPolar(ctx, room, centerX, centerY, scale);
      });
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "12px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("0°", centerX + cylinderRadius * scale + 15, centerY);
    ctx.fillText("90°", centerX, centerY - cylinderRadius * scale - 10);
    ctx.fillText("180°", centerX - cylinderRadius * scale - 15, centerY);
    ctx.fillText("270°", centerX, centerY + cylinderRadius * scale + 20);
  };

  const drawUnwrappedView = (ctx, width, height) => {
    const circumference = Math.PI * 2 * cylinderRadius;
    const scaleX = width / circumference;
    const scaleY = height / (cylinderRadius * 2);
    const offsetY = height / 2;

    ctx.strokeStyle = "rgba(0, 245, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;

    for (let i = 0; i <= 12; i++) {
      const x = (i / 12) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let i = 0; i <= 4; i++) {
      const y = (i / 4) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (deck && deck.rooms) {
      deck.rooms.forEach((room) => {
        drawRoomUnwrapped(ctx, room, scaleX, scaleY, offsetY);
      });
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "12px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("0°", width * 0, 15);
    ctx.fillText("90°", width * 0.25, 15);
    ctx.fillText("180°", width * 0.5, 15);
    ctx.fillText("270°", width * 0.75, 15);
    ctx.fillText("360°", width, 15);
  };

  const drawRoomPolar = (ctx, room, centerX, centerY, scale) => {
    const { bounds } = room;
    const roomType = ROOM_TYPES[room.type];
    const isSelected = room.id === selectedRoomId;
    const isHovered = room.id === hoveredRoomId;

    ctx.beginPath();
    ctx.arc(
      centerX,
      centerY,
      bounds.radiusOuter * scale,
      bounds.angleStart,
      bounds.angleEnd
    );
    ctx.arc(
      centerX,
      centerY,
      bounds.radiusInner * scale,
      bounds.angleEnd,
      bounds.angleStart,
      true
    );
    ctx.closePath();

    // Fill
    const alpha = isSelected ? 0.6 : isHovered ? 0.4 : 0.3;
    ctx.fillStyle = roomType?.color
      ? `${roomType.color}${Math.floor(alpha * 255)
          .toString(16)
          .padStart(2, "0")}`
      : `rgba(74, 144, 226, ${alpha})`;
    ctx.fill();

    // Stroke
    ctx.strokeStyle = isSelected
      ? "rgba(0, 245, 255, 1)"
      : isHovered
      ? "rgba(0, 245, 255, 0.6)"
      : "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.stroke();

    // Label
    const labelAngle = (bounds.angleStart + bounds.angleEnd) / 2;
    const labelRadius = (bounds.radiusInner + bounds.radiusOuter) / 2;
    const labelX = centerX + Math.cos(labelAngle) * labelRadius * scale;
    const labelY = centerY + Math.sin(labelAngle) * labelRadius * scale;

    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "bold 11px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(roomType?.icon || "", labelX, labelY - 10);

    ctx.font = "10px 'Space Grotesk', sans-serif";
    ctx.fillText(room.type.toUpperCase(), labelX, labelY + 5);
  };

  const drawRoomUnwrapped = (ctx, room, scaleX, scaleY, offsetY) => {
    const { bounds } = room;
    const roomType = ROOM_TYPES[room.type];
    const isSelected = room.id === selectedRoomId;
    const isHovered = room.id === hoveredRoomId;

    const x1 = bounds.angleStart * cylinderRadius * scaleX;
    const x2 = bounds.angleEnd * cylinderRadius * scaleX;
    const y1 = offsetY - bounds.radiusOuter * scaleY;
    const y2 = offsetY - bounds.radiusInner * scaleY;

    const alpha = isSelected ? 0.6 : isHovered ? 0.4 : 0.3;
    ctx.fillStyle = roomType?.color
      ? `${roomType.color}${Math.floor(alpha * 255)
          .toString(16)
          .padStart(2, "0")}`
      : `rgba(74, 144, 226, ${alpha})`;
    ctx.fillRect(x1, y1, x2 - x1, y2 - y1);

    ctx.strokeStyle = isSelected
      ? "rgba(0, 245, 255, 1)"
      : isHovered
      ? "rgba(0, 245, 255, 0.6)"
      : "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

    const labelX = (x1 + x2) / 2;
    const labelY = (y1 + y2) / 2;

    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "bold 11px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(roomType?.icon || "", labelX, labelY - 8);

    ctx.font = "9px 'Space Grotesk', sans-serif";
    ctx.fillText(room.type.toUpperCase(), labelX, labelY + 6);
  };

  const handleMouseMove = (e) => {
    if (!deck || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find hovered room
    let foundRoom = null;

    if (viewMode === "2d-polar") {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const scale = Math.min(rect.width, rect.height) / (cylinderRadius * 2.5);

      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy) / scale;
      const angle = Math.atan2(dy, dx);
      const normalizedAngle = angle < 0 ? angle + Math.PI * 2 : angle;

      for (const room of deck.rooms) {
        const { bounds } = room;
        if (
          distance >= bounds.radiusInner &&
          distance <= bounds.radiusOuter &&
          normalizedAngle >= bounds.angleStart &&
          normalizedAngle <= bounds.angleEnd
        ) {
          foundRoom = room.id;
          break;
        }
      }
    }

    setHoveredRoomId(foundRoom);
    canvas.style.cursor = foundRoom ? "pointer" : "default";
  };

  const handleClick = () => {
    if (hoveredRoomId) {
      onSelectRoom(hoveredRoomId);
    } else {
      onSelectRoom(null);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (hoveredRoomId && window.confirm("Delete this room?")) {
      onRemoveRoom(hoveredRoomId);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDraggingNewRoom(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const roomTypeId = e.dataTransfer.getData("roomType");

    if (roomTypeId && onAddRoom) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      let angle = 0;
      if (viewMode === "2d-polar") {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        angle = Math.atan2(dy, dx);
        if (angle < 0) angle += Math.PI * 2;
      } else {
        angle = (x / rect.width) * Math.PI * 2;
      }

      onAddRoom(roomTypeId, angle);
    }

    setIsDraggingNewRoom(false);
    setDraggedRoomType(null);
  };

  const handleDragEnter = (e) => {
    const roomTypeId = e.dataTransfer.getData("roomType");
    if (roomTypeId) {
      setDraggedRoomType(roomTypeId);
    }
  };

  const handleDragLeave = () => {
    setIsDraggingNewRoom(false);
  };

  if (!deck) {
    return (
      <div className="interior-empty-state">
        <div className="interior-empty-icon"></div>
        <div className="interior-empty-message">
          Select a deck to view floor plan
        </div>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        cursor: isDraggingNewRoom ? "copy" : "default",
      }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    />
  );
}

FloorPlanCanvas.propTypes = {
  deck: PropTypes.shape({
    id: PropTypes.string.isRequired,
    rooms: PropTypes.array.isRequired,
  }),
  cylinderRadius: PropTypes.number.isRequired,
  viewMode: PropTypes.oneOf(["2d-polar", "2d-unwrapped"]).isRequired,
  selectedRoomId: PropTypes.string,
  onSelectRoom: PropTypes.func.isRequired,
  onRemoveRoom: PropTypes.func.isRequired,
  onAddRoom: PropTypes.func,
};

export default FloorPlanCanvas;
