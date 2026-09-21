import React, { useRef, useState, useEffect } from "react";
import { FaShieldAlt, FaTimes, FaUndo, FaEraser, FaCheck, FaEyeSlash, FaInfoCircle } from "react-icons/fa";
import "./EvidenceRedactorModal.css";

export default function EvidenceRedactorModal({ imageFile, onSaveRedactedFile, onClose }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(24);
  const [history, setHistory] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!imageFile) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Set canvas dimensions proportional to display
        const maxWidth = 640;
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setImageLoaded(true);

        // Save initial state
        const initialImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([initialImageData]);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  const startDrawing = (e) => {
    if (!imageLoaded) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory((prev) => [...prev.slice(-10), currentState]);
    }
  };

  const draw = (e) => {
    if (!isDrawing && e.type !== "mousedown") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const newHistory = [...history];
    newHistory.pop(); // Remove current
    const prevState = newHistory[newHistory.length - 1];
    ctx.putImageData(prevState, 0, 0);
    setHistory(newHistory);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const originalName = imageFile ? imageFile.name.replace(/\.[^/.]+$/, "") : "evidence";
      const sanitizedFile = new File([blob], `${originalName}_sanitized.png`, {
        type: "image/png",
        lastModified: Date.now(),
      });

      if (onSaveRedactedFile) {
        onSaveRedactedFile(sanitizedFile);
      }
      if (onClose) onClose();
    }, "image/png");
  };

  return (
    <div className="redactor-modal-backdrop" onClick={onClose}>
      <div className="redactor-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="redactor-header">
          <div className="redactor-title-group">
            <FaShieldAlt className="redactor-shield-icon" />
            <div>
              <h3>Client-Side Evidence Privacy Redactor</h3>
              <p>Brush over sensitive numbers (Aadhaar, CVV, OTPs, Bank A/C) before submitting evidence under DPDP Act, 2023.</p>
            </div>
          </div>
          {onClose && (
            <button type="button" className="btn-close-redactor" onClick={onClose}>
              <FaTimes />
            </button>
          )}
        </div>

        <div className="redactor-toolbar">
          <div className="tool-group">
            <span className="tool-label"><FaEyeSlash /> Blackout Brush:</span>
            <button
              type="button"
              className={`btn-brush-size ${brushSize === 12 ? "active" : ""}`}
              onClick={() => setBrushSize(12)}
            >
              Small
            </button>
            <button
              type="button"
              className={`btn-brush-size ${brushSize === 24 ? "active" : ""}`}
              onClick={() => setBrushSize(24)}
            >
              Medium
            </button>
            <button
              type="button"
              className={`btn-brush-size ${brushSize === 40 ? "active" : ""}`}
              onClick={() => setBrushSize(40)}
            >
              Large
            </button>
          </div>

          <div className="tool-group">
            <button
              type="button"
              className="btn-tool-action"
              onClick={handleUndo}
              disabled={history.length <= 1}
            >
              <FaUndo /> Undo
            </button>
          </div>
        </div>

        <div className="redactor-canvas-container">
          <canvas
            ref={canvasRef}
            className="redactor-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        <div className="redactor-footer">
          <div className="dpdp-hint">
            <FaInfoCircle />
            <span>Redaction happens 100% in your browser. Original file is never transmitted unredacted.</span>
          </div>
          <div className="redactor-actions">
            <button type="button" className="btn-redactor-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn-redactor-save" onClick={handleSave}>
              <FaCheck /> Apply & Attach Sanitized File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
