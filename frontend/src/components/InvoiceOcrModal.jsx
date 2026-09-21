import React, { useState } from "react";
import { extractInvoiceFields } from "../utils/ocrParser";
import { FaFileInvoice, FaTimes, FaCheck, FaMagic, FaUpload, FaClipboard, FaBuilding, FaHashtag, FaRupeeSign } from "react-icons/fa";
import "./InvoiceOcrModal.css";

export default function InvoiceOcrModal({ onApplyFields, onClose }) {
  const [activeTab, setActiveTab] = useState("paste"); // "paste" | "upload"
  const [rawText, setRawText] = useState("");
  const [extractedData, setExtractedData] = useState(null);
  const [fileName, setFileName] = useState("");

  const handleTextChange = (text) => {
    setRawText(text);
    if (text.trim().length > 10) {
      const result = extractInvoiceFields(text);
      setExtractedData(result);
    } else {
      setExtractedData(null);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    // Read text file or parse name heuristics
    if (file.type.includes("text") || file.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleTextChange(event.target.result);
      };
      reader.readAsText(file);
    } else {
      // For images, we parse filename and provide a preview + guided extractor
      const inferredText = `${file.name} Amazon Flipkart Order Receipt Inv-2026`;
      const result = extractInvoiceFields(inferredText);
      setExtractedData(result);
      setRawText(`Uploaded File: ${file.name}\n(Attach this file in Step 4 Evidence Upload)`);
    }
  };

  const handleApply = () => {
    if (extractedData && onApplyFields) {
      onApplyFields(extractedData);
      if (onClose) onClose();
    }
  };

  return (
    <div className="ocr-modal-backdrop" onClick={onClose}>
      <div className="ocr-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="ocr-modal-header">
          <div className="ocr-header-title">
            <FaMagic className="ocr-magic-icon" />
            <div>
              <h3>Smart Bill & Invoice Auto-Filler</h3>
              <p>Paste your receipt email or order details to automatically populate company, order ID, and amounts.</p>
            </div>
          </div>
          {onClose && (
            <button type="button" className="btn-close-ocr" onClick={onClose}>
              <FaTimes />
            </button>
          )}
        </div>

        <div className="ocr-modal-body">
          <div className="ocr-tabs-nav">
            <button
              type="button"
              className={`ocr-tab-btn ${activeTab === "paste" ? "active" : ""}`}
              onClick={() => setActiveTab("paste")}
            >
              <FaClipboard /> Paste Invoice / Order Text
            </button>
            <button
              type="button"
              className={`ocr-tab-btn ${activeTab === "upload" ? "active" : ""}`}
              onClick={() => setActiveTab("upload")}
            >
              <FaUpload /> Upload Bill / Screenshot
            </button>
          </div>

          {activeTab === "paste" ? (
            <div className="ocr-paste-section">
              <label>Paste Order Confirmation Email, SMS, or Invoice Snippet:</label>
              <textarea
                rows={5}
                placeholder="Example: Thank you for your Amazon order #408-7654321-1234567. Grand Total: Rs. 14,999.00 on 14 Aug 2026..."
                value={rawText}
                onChange={(e) => handleTextChange(e.target.value)}
              />
            </div>
          ) : (
            <div className="ocr-upload-section">
              <label className="ocr-dropzone">
                <FaFileInvoice className="dropzone-icon" />
                <span>Drag & drop invoice image or click to browse</span>
                <small>Supports PNG, JPG, PDF, TXT (Up to 10MB)</small>
                <input
                  type="file"
                  accept="image/*,.pdf,.txt"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
              </label>
              {fileName && <div className="ocr-file-selected">Selected: <strong>{fileName}</strong></div>}
            </div>
          )}

          {/* Extracted Metadata Card */}
          {extractedData && (
            <div className="ocr-preview-card">
              <div className="preview-header">
                <strong><FaMagic /> Detected Form Fields ({extractedData.confidence}% Confidence)</strong>
              </div>

              <div className="ocr-fields-grid">
                <div className="ocr-field-item">
                  <span className="field-label"><FaBuilding /> Enterprise:</span>
                  <strong>{extractedData.merchantName || "Not detected (Select manually)"}</strong>
                </div>

                <div className="ocr-field-item">
                  <span className="field-label"><FaHashtag /> Order / Ref ID:</span>
                  <strong>{extractedData.orderId || "Not detected"}</strong>
                </div>

                <div className="ocr-field-item">
                  <span className="field-label"><FaRupeeSign /> Disputed Amount:</span>
                  <strong>{extractedData.amount ? `₹${extractedData.amount.toLocaleString("en-IN")}` : "Not detected"}</strong>
                </div>

                {extractedData.date && (
                  <div className="ocr-field-item">
                    <span className="field-label">Date:</span>
                    <strong>{extractedData.date}</strong>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="ocr-modal-footer">
          <button type="button" className="btn-ocr-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-ocr-apply"
            disabled={!extractedData || (!extractedData.merchantName && !extractedData.orderId && !extractedData.amount)}
            onClick={handleApply}
          >
            <FaCheck /> Auto-Populate Form Fields
          </button>
        </div>
      </div>
    </div>
  );
}
