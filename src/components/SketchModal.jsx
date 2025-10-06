import { useState, useRef, useEffect } from "react";
import "./SketchModal.css";

export default function SketchModal({ onClose, onCreateExtrusion }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [extrudeDepth, setExtrudeDepth] = useState(1);
  const [bevelEnabled, setBevelEnabled] = useState(false);
  const [bevelSize, setBevelSize] = useState(0.1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    if (points.length > 0) {
      ctx.strokeStyle = "#4a7c59";
      ctx.fillStyle = "#4a7c59";
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();

      points.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.font = "12px monospace";
        ctx.fillText(index + 1, point.x + 10, point.y - 10);
        ctx.fillStyle = "#4a7c59";
      });

      if (isDrawing && points.length > 0) {
        ctx.strokeStyle = "#6a9c79";
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
        ctx.lineTo(
          points[points.length - 1].x + 50,
          points[points.length - 1].y
        );
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, [points, isDrawing]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPoints([...points, { x, y }]);
    setIsDrawing(true);
  };

  const handleClear = () => {
    setPoints([]);
    setIsDrawing(false);
  };

  const handleClosePath = () => {
    if (points.length > 2) {
      setPoints([...points, points[0]]);
      setIsDrawing(false);
    }
  };

  const handleCreate = () => {
    if (points.length < 3) {
      alert("Please draw at least 3 points to create a shape");
      return;
    }

    const canvas = canvasRef.current;
    const normalizedPoints = points.map((p) => ({
      x: (p.x - canvas.width / 2) / 20, 
      y: -(p.y - canvas.height / 2) / 20, 
    }));

    onCreateExtrusion(normalizedPoints, extrudeDepth, bevelEnabled, bevelSize);
    onClose();
  };

  return (
    <div className="sketch-modal-overlay" onClick={onClose}>
      <div className="sketch-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sketch-header">
          <h2>2D Sketch</h2>
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
              className="sketch-canvas"
            />
            <div className="sketch-instructions">
              Click on the canvas to add points. Close the path and extrude to
              3D.
            </div>
          </div>

          <div className="sketch-controls">
            <h3>Controls</h3>

            <div className="control-group">
              <button onClick={handleClear} className="control-btn">
                Clear All
              </button>
              <button
                onClick={handleClosePath}
                className="control-btn"
                disabled={points.length < 3}
              >
                Close Path
              </button>
            </div>

            <div className="control-group">
              <label>Extrude Depth: {extrudeDepth.toFixed(1)}</label>
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
                disabled={points.length < 3}
              >
                Create 3D Object
              </button>
            </div>

            <div className="stats">
              <p>Points: {points.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
