import { useState, useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import "./ImprovedSketchModal.css";

export default function ImprovedSketchModal({ onClose, onCreateExtrusion }) {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [lines, setLines] = useState([]);
  const [currentTool, setCurrentTool] = useState("point"); // 'point', 'line', 'rectangle', 'circle'
  const [extrudeDepth, setExtrudeDepth] = useState(1);
  const [bevelEnabled, setBevelEnabled] = useState(false);
  const [bevelSize, setBevelSize] = useState(0.1);
  const [tempLineStart, setTempLineStart] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const SNAP_DISTANCE = 15; // pixels
  const POINT_RADIUS = 6;
  const GRID_SIZE = 20;

  const findNearestPoint = useCallback(
    (x, y) => {
      for (let point of points) {
        const distance = Math.sqrt(
          Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
        );
        if (distance < SNAP_DISTANCE) {
          return point;
        }
      }
      return null;
    },
    [points]
  );

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw lines
    ctx.strokeStyle = "#4a7c59";
    ctx.lineWidth = 2;
    lines.forEach((line) => {
      ctx.beginPath();
      ctx.moveTo(line.start.x, line.start.y);
      ctx.lineTo(line.end.x, line.end.y);
      ctx.stroke();
    });

    // Draw temporary line
    if (tempLineStart) {
      ctx.strokeStyle = "#6a9c79";
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(tempLineStart.x, tempLineStart.y);
      const mouse = hoveredPoint || tempLineStart;
      ctx.lineTo(mouse.x, mouse.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw points
    points.forEach((point, index) => {
      const isHovered =
        hoveredPoint &&
        Math.abs(point.x - hoveredPoint.x) < SNAP_DISTANCE &&
        Math.abs(point.y - hoveredPoint.y) < SNAP_DISTANCE;

      ctx.fillStyle = isHovered ? "#ffff00" : "#4a7c59";
      ctx.beginPath();
      ctx.arc(point.x, point.y, POINT_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Draw point number
      ctx.fillStyle = "#fff";
      ctx.font = "12px monospace";
      ctx.fillText(index + 1, point.x + 10, point.y - 10);
    });

    // Highlight hovered/snapped point
    if (hoveredPoint) {
      const snappedPoint = findNearestPoint(hoveredPoint.x, hoveredPoint.y);
      if (snappedPoint) {
        ctx.strokeStyle = "#ffff00";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
          snappedPoint.x,
          snappedPoint.y,
          POINT_RADIUS + 4,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }
    }
  }, [points, lines, tempLineStart, hoveredPoint, findNearestPoint]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Snap to existing point if nearby
    const nearestPoint = findNearestPoint(x, y);
    if (nearestPoint) {
      x = nearestPoint.x;
      y = nearestPoint.y;
    }

    if (currentTool === "point") {
      // Only add point if not snapping to existing one
      if (!nearestPoint) {
        setPoints([...points, { x, y }]);
      }
    } else if (currentTool === "line") {
      if (!tempLineStart) {
        // Start new line
        if (!nearestPoint) {
          setPoints([...points, { x, y }]);
          setTempLineStart({ x, y });
        } else {
          setTempLineStart(nearestPoint);
        }
      } else {
        // End line
        const endPoint = nearestPoint || { x, y };
        if (!nearestPoint) {
          setPoints([...points, endPoint]);
        }
        setLines([...lines, { start: tempLineStart, end: endPoint }]);
        setTempLineStart(null);
      }
    }
  };

  const handleCanvasMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setHoveredPoint({ x, y });
  };

  const handleClear = () => {
    setPoints([]);
    setLines([]);
    setTempLineStart(null);
  };

  const handleCreate = () => {
    if (points.length < 2) {
      alert("Please draw at least 2 points or 1 line to create a shape");
      return;
    }

    // Create shape from points and lines
    const shape = new THREE.Shape();

    if (lines.length > 0) {
      // Use lines to create shape
      const sortedLines = [...lines];
      shape.moveTo(
        (sortedLines[0].start.x - 300) / 20,
        -(sortedLines[0].start.y - 250) / 20
      );

      sortedLines.forEach((line) => {
        shape.lineTo((line.end.x - 300) / 20, -(line.end.y - 250) / 20);
      });
    } else {
      // Use points to create shape (legacy mode)
      const normalizedPoints = points.map((p) => ({
        x: (p.x - 300) / 20,
        y: -(p.y - 250) / 20,
      }));

      shape.moveTo(normalizedPoints[0].x, normalizedPoints[0].y);
      for (let i = 1; i < normalizedPoints.length; i++) {
        shape.lineTo(normalizedPoints[i].x, normalizedPoints[i].y);
      }
      shape.lineTo(normalizedPoints[0].x, normalizedPoints[0].y);
    }

    onCreateExtrusion(shape, extrudeDepth, bevelEnabled, bevelSize);
    onClose();
  };

  return (
    <div className="sketch-modal-overlay" onClick={onClose}>
      <div
        className="sketch-modal improved"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sketch-header">
          <h2>✏️ Advanced Sketch</h2>
          <button onClick={onClose} className="close-btn">
            ×
          </button>
        </div>

        <div className="sketch-content">
          <div className="sketch-canvas-container">
            <canvas
              ref={canvasRef}
              width={600}
              height={500}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMove}
              className="sketch-canvas"
            />
            <div className="sketch-instructions">
              <strong>Tools:</strong> {currentTool.toUpperCase()} |
              <strong> Points:</strong> {points.length} |
              <strong> Lines:</strong> {lines.length}
              {tempLineStart && " | Drawing line..."}
            </div>
          </div>

          <div className="sketch-controls">
            <h3>Tools</h3>
            <div className="tool-buttons">
              <button
                className={`tool-btn ${
                  currentTool === "point" ? "active" : ""
                }`}
                onClick={() => {
                  setCurrentTool("point");
                  setTempLineStart(null);
                }}
              >
                📍 Point
              </button>
              <button
                className={`tool-btn ${currentTool === "line" ? "active" : ""}`}
                onClick={() => setCurrentTool("line")}
              >
                📏 Line
              </button>
            </div>

            <h3>Actions</h3>
            <div className="control-group">
              <button onClick={handleClear} className="control-btn">
                🗑️ Clear All
              </button>
              <button
                onClick={() => {
                  if (tempLineStart) setTempLineStart(null);
                  if (lines.length > 0) setLines(lines.slice(0, -1));
                  else if (points.length > 0) setPoints(points.slice(0, -1));
                }}
                className="control-btn"
              >
                ↩️ Undo Last
              </button>
            </div>

            <h3>Extrusion</h3>
            <div className="control-group">
              <label>Depth: {extrudeDepth.toFixed(1)}</label>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={extrudeDepth}
                onChange={(e) => setExtrudeDepth(parseFloat(e.target.value))}
                className="slider"
              />
            </div>

            <div className="control-group">
              <label>
                <input
                  type="checkbox"
                  checked={bevelEnabled}
                  onChange={(e) => setBevelEnabled(e.target.checked)}
                />
                Enable Bevel
              </label>
            </div>

            {bevelEnabled && (
              <div className="control-group">
                <label>Bevel Size: {bevelSize.toFixed(2)}</label>
                <input
                  type="range"
                  min="0.01"
                  max="0.5"
                  step="0.01"
                  value={bevelSize}
                  onChange={(e) => setBevelSize(parseFloat(e.target.value))}
                  className="slider"
                />
              </div>
            )}

            <div className="control-group">
              <button
                onClick={handleCreate}
                className="create-btn"
                disabled={points.length < 2 && lines.length === 0}
              >
                ✨ Create 3D Object
              </button>
            </div>

            <div className="stats">
              <p>
                <strong>💡 Tips:</strong>
              </p>
              <p>• Points snap to nearby points (magnetic!)</p>
              <p>• Line tool: Click start, then end point</p>
              <p>• Points connect automatically when near</p>
              <p>• Yellow highlight = snap zone</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
