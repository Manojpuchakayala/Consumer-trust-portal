import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaTag,
  FaFileAlt,
  FaCheckCircle,
  FaCopy,
  FaArrowRight,
  FaExclamationCircle,
  FaPrint,
  FaPaperclip,
  FaTrash,
  FaFilePdf,
  FaFileImage,
  FaWhatsapp,
  FaExternalLinkAlt,
} from "react-icons/fa";
import api from "../services/api";
import "./RegisterComplaint.css";

function RegisterComplaint() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "Product",
    subject: "",
    description: "",
  });

  const [files, setFiles] = useState([]);
  const [whatsappAlertsEnabled, setWhatsappAlertsEnabled] = useState(true);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedData, setSubmittedData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedWa, setCopiedWa] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    // Pre-fill user data if logged in
    const storedUser = localStorage.getItem("consumerTrustUser");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setFormData((prev) => ({
          ...prev,
          name: u.name || prev.name,
          email: u.email || prev.email,
          phone: u.phone || prev.phone,
        }));
      } catch (e) {}
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFileError("");
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    if (files.length + selectedFiles.length > 5) {
      setFileError("You can attach up to a maximum of 5 evidence files.");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
    ];

    const validFiles = [];
    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        setFileError(`"${file.name}" is not a supported format. Please upload JPG, PNG, WEBP, GIF, or PDF.`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setFileError(`"${file.name}" exceeds the 10MB size limit.`);
        return;
      }
      validFiles.push(file);
    }

    setFiles((prev) => [...prev, ...validFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = new FormData();
      data.append("name", formData.name.trim());
      data.append("email", formData.email.trim());
      data.append("phone", formData.phone.trim());
      data.append("category", formData.category);
      data.append("subject", formData.subject.trim());
      data.append("description", formData.description.trim());
      data.append("whatsappAlertsEnabled", whatsappAlertsEnabled);

      files.forEach((file) => {
        data.append("evidence", file);
      });

      const response = await api.post("/complaints", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to submit complaint");
      }

      setSubmittedData({
        complaintId: response.data.complaintId,
        subject: formData.subject,
        category: formData.category,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        attachmentsCount: files.length,
        whatsappAlertsEnabled,
        whatsAppUrl: response.data.whatsAppUrl,
        whatsAppMessage: response.data.whatsAppMessage,
        date: new Date().toLocaleString(),
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to register complaint. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = () => {
    if (submittedData?.complaintId) {
      navigator.clipboard.writeText(submittedData.complaintId);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleCopyWaReport = () => {
    const defaultTrack = `${window.location.origin}/track?id=${submittedData?.complaintId}`;
    const textToCopy =
      submittedData?.whatsAppMessage ||
      `🏛️ *CONSUMER TRUST GRIEVANCE CELL*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📋 *Tracking ID:* ${submittedData?.complaintId}\n👤 *Citizen:* ${submittedData?.name}\n📁 *Category:* ${submittedData?.category}\n📌 *Subject:* ${submittedData?.subject}\n⏳ *Status:* Pending Investigation\n\n🔗 *Track Live Investigation:*\n${defaultTrack}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedWa(true);
    setTimeout(() => setCopiedWa(false), 3000);
  };

  const handleCopyDirectLink = () => {
    if (submittedData?.complaintId) {
      navigator.clipboard.writeText(`${window.location.origin}/track?id=${submittedData.complaintId}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const handleReset = () => {
    setSubmittedData(null);
    setFiles([]);
    setFileError("");
    setFormData({
      name: "",
      email: "",
      phone: "",
      category: "Product",
      subject: "",
      description: "",
    });
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {submittedData ? (
          <div className="success-card">
            <div className="success-icon-wrap">
              <FaCheckCircle className="success-icon" />
            </div>

            <h2>Complaint Registered Successfully!</h2>
            <p className="success-desc">
              Your grievance has been safely logged in the official repository.
              A confirmation email has been dispatched to <strong>{submittedData.email}</strong>.
            </p>

            <div className="tracking-id-box">
              <span className="tracking-label">Official Complaint Tracking ID</span>
              <div className="id-row">
                <span className="id-text">{submittedData.complaintId}</span>
                <button
                  type="button"
                  className="copy-btn"
                  onClick={handleCopyId}
                  title="Copy Tracking ID"
                >
                  <FaCopy /> {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* 1-Click WhatsApp Delivery & Direct Access Hub */}
            {submittedData.complaintId && (
              <div className="whatsapp-action-box">
                <div className="wa-box-header">
                  <div className="wa-title-icon">
                    <FaWhatsapp />
                  </div>
                  <div>
                    <h4>Official WhatsApp Grievance Report</h4>
                    <p>Instant case card with 1-tap live tracking (Amazon & Flipkart style)</p>
                  </div>
                </div>

                <div className="wa-btn-stack">
                  {submittedData.whatsAppUrl && (
                    <a
                      href={submittedData.whatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whatsapp-main-btn"
                    >
                      <FaWhatsapp className="wa-icon-large" />
                      <span>Send Grievance Card to WhatsApp ({submittedData.phone})</span>
                    </a>
                  )}

                  <a
                    href={`https://web.whatsapp.com/send?phone=${((submittedData.phone || "").replace(/[^0-9]/g, "").length === 10 ? "91" + (submittedData.phone || "").replace(/[^0-9]/g, "") : (submittedData.phone || "").replace(/[^0-9]/g, ""))}&text=${encodeURIComponent(submittedData.whatsAppMessage || `🏛️ CONSUMER TRUST GRIEVANCE CELL\nTracking ID: ${submittedData.complaintId}\nStatus: Pending Investigation\nDirect Link: ${window.location.origin}/track?id=${submittedData.complaintId}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whatsapp-web-btn"
                    title="Open directly in WhatsApp Web in browser"
                  >
                    <FaExternalLinkAlt /> Open in WhatsApp Web
                  </a>

                  <button
                    type="button"
                    className="whatsapp-copy-btn"
                    onClick={handleCopyWaReport}
                    title="Copy full report and direct link to clipboard"
                  >
                    <FaCopy /> {copiedWa ? "Report Copied to Clipboard!" : "Copy Full WhatsApp Report"}
                  </button>
                </div>

                {/* Direct 1-Tap Tracking Link Box */}
                <div className="direct-link-container">
                  <span className="direct-link-label">Direct 1-Tap Tracking Link:</span>
                  <div className="direct-link-url-box">
                    <a
                      href={`/track?id=${submittedData.complaintId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="direct-link-href"
                    >
                      {window.location.origin}/track?id={submittedData.complaintId} <FaExternalLinkAlt />
                    </a>
                    <button
                      type="button"
                      className="direct-link-copy-btn"
                      onClick={handleCopyDirectLink}
                    >
                      <FaCopy /> {copiedLink ? "Copied!" : "Copy Link"}
                    </button>
                  </div>
                </div>

                <p className="whatsapp-btn-sub">
                  💡 <strong>Direct Access:</strong> If WhatsApp asks you to download or says &quot;copy it&quot;, use <strong>&quot;Open in WhatsApp Web&quot;</strong>, or click the <strong>Direct 1-Tap Tracking Link</strong> above to view your full live report immediately without logging in!
                </p>
              </div>
            )}

            <div className="success-summary">
              <div>
                <strong>Complainant:</strong> {submittedData.name}
              </div>
              <div>
                <strong>Category:</strong> {submittedData.category}
              </div>
              <div>
                <strong>Subject:</strong> {submittedData.subject}
              </div>
              <div>
                <strong>Filing Date:</strong> {submittedData.date}
              </div>
              <div>
                <strong>Evidence Uploaded:</strong>{" "}
                {submittedData.attachmentsCount > 0 ? (
                  <span className="evidence-badge">
                    <FaPaperclip /> {submittedData.attachmentsCount} file(s) attached
                  </span>
                ) : (
                  "No files attached"
                )}
              </div>
              <div>
                <strong>WhatsApp Status Alerts:</strong>{" "}
                {submittedData.whatsappAlertsEnabled ? (
                  <span className="whatsapp-badge-active">
                    <FaWhatsapp /> Active ({submittedData.phone})
                  </span>
                ) : (
                  "Disabled"
                )}
              </div>
            </div>

            <div className="success-actions no-print">
              <button
                type="button"
                className="print-slip-btn"
                onClick={handlePrintSlip}
              >
                <FaPrint /> Print / Save Acknowledgment Slip
              </button>
              <Link
                to={`/track?id=${submittedData.complaintId}`}
                className="track-now-btn"
              >
                Track This Complaint Now <FaArrowRight />
              </Link>
              <button
                type="button"
                className="register-another-btn"
                onClick={handleReset}
              >
                File Another Complaint
              </button>
            </div>

            {/* Official Printable Receipt for window.print() */}
            <div className="print-slip-wrapper print-only">
              <div className="slip-header">
                <h3>Consumer Trust Grievance Redressal Cell</h3>
                <p>Official Grievance Registration Acknowledgment</p>
              </div>
              <div className="slip-body">
                <div className="slip-row">
                  <span>Tracking ID:</span>
                  <strong>{submittedData.complaintId}</strong>
                </div>
                <div className="slip-row">
                  <span>Filing Timestamp:</span>
                  <span>{submittedData.date}</span>
                </div>
                <div className="slip-row">
                  <span>Citizen Name:</span>
                  <span>{submittedData.name}</span>
                </div>
                <div className="slip-row">
                  <span>Contact Email:</span>
                  <span>{submittedData.email}</span>
                </div>
                <div className="slip-row">
                  <span>Contact Phone:</span>
                  <span>{submittedData.phone}</span>
                </div>
                <div className="slip-row">
                  <span>Category:</span>
                  <span>{submittedData.category}</span>
                </div>
                <div className="slip-row">
                  <span>Grievance Subject:</span>
                  <span>{submittedData.subject}</span>
                </div>
                <div className="slip-row">
                  <span>Attached Evidence:</span>
                  <span>{submittedData.attachmentsCount} document(s)</span>
                </div>
                <div className="slip-row">
                  <span>Initial Status:</span>
                  <span className="slip-status">Pending Investigation</span>
                </div>
              </div>
              <div className="slip-footer">
                <p>Please preserve this receipt for ombudsman appeals and verification.</p>
                <p>Verify live progress at: http://localhost:5173/track?id={submittedData.complaintId}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <h1>Register Consumer Grievance</h1>
            <p className="register-subtitle">
              Please enter accurate transaction and dispute information. Attach invoices,
              receipts, or defect photos to accelerate investigation.
            </p>

            {error && (
              <div className="error-banner">
                <FaExclamationCircle /> <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-row">
                <div className="input-group">
                  <label>Full Name *</label>
                  <div className="input-wrapper">
                    <FaUser className="input-icon" />
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Manoj Kumar"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Email Address *</label>
                  <div className="input-wrapper">
                    <FaEnvelope className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      placeholder="e.g. manoj@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Phone Number (WhatsApp Active) *</label>
                  <div className="input-wrapper">
                    <FaPhone className="input-icon" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="e.g. 8074875176 or +91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Dispute Category *</label>
                  <div className="input-wrapper">
                    <FaTag className="input-icon" />
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="Product">Product / Electronics</option>
                      <option value="Service">Services / E-Commerce</option>
                      <option value="Food">Food / Restaurants / FMCG</option>
                      <option value="Banking">Banking / Payments / FinTech</option>
                      <option value="Other">Other Grievance</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="input-group full-width">
                <label>Complaint Subject / Title *</label>
                <div className="input-wrapper">
                  <FaFileAlt className="input-icon" />
                  <input
                    type="text"
                    name="subject"
                    placeholder="Brief summary of the issue (e.g. Defective laptop delivered with no refund)"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-group full-width">
                <label>Comprehensive Description *</label>
                <textarea
                  name="description"
                  rows="5"
                  placeholder="Provide complete details including invoice numbers, seller name, dates of purchase/contact, and desired resolution..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Evidence Upload Section */}
              <div className="input-group full-width file-upload-section">
                <label className="file-upload-label">
                  <FaPaperclip /> Supporting Evidence & Proof Documents (Optional, up to 5 files, 10MB each)
                </label>
                <div
                  className="file-dropzone"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  <FaPaperclip className="dropzone-icon" />
                  <div className="dropzone-text">
                    <strong>Click here or browse to attach proof documents</strong>
                    <span>Supports JPG, PNG, WEBP, GIF images and PDF invoices or receipts</span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,image/jpeg,image/png,image/webp,image/gif,application/pdf"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </div>

                {fileError && (
                  <div className="file-error-text">
                    <FaExclamationCircle /> {fileError}
                  </div>
                )}

                {files.length > 0 && (
                  <div className="file-preview-list">
                    {files.map((file, idx) => (
                      <div key={idx} className="file-preview-item">
                        <div className="file-preview-info">
                          {file.type === "application/pdf" ? (
                            <FaFilePdf className="file-type-icon pdf" />
                          ) : (
                            <FaFileImage className="file-type-icon img" />
                          )}
                          <div className="file-name-size">
                            <span className="file-name" title={file.name}>
                              {file.name}
                            </span>
                            <span className="file-size">{formatFileSize(file.size)}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="file-remove-btn"
                          onClick={() => removeFile(idx)}
                          title="Remove file"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* WhatsApp Notification Toggle */}
              <div className="whatsapp-toggle-card">
                <div className="whatsapp-toggle-left">
                  <div className="whatsapp-icon-wrap">
                    <FaWhatsapp />
                  </div>
                  <div>
                    <strong>Receive Instant Updates on WhatsApp</strong>
                    <p>Get official case cards, milestone updates, and 1-tap live tracking links on your WhatsApp (100% Free & Unlimited).</p>
                  </div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={whatsappAlertsEnabled}
                    onChange={(e) => setWhatsappAlertsEnabled(e.target.checked)}
                  />
                  <span className="slider round whatsapp-slider"></span>
                </label>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Submitting Grievance & Generating WhatsApp Card..." : "Submit Official Complaint"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default RegisterComplaint;
