import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  FaSearch,
  FaClipboardCheck,
  FaExclamationCircle,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaCalendarAlt,
  FaTag,
  FaUser,
  FaCommentDots,
  FaPrint,
  FaStar,
  FaRegStar,
  FaPaperclip,
  FaFilePdf,
  FaFileImage,
  FaExternalLinkAlt,
  FaEye,
  FaWhatsapp,
  FaShareAlt,
  FaCopy,
} from "react-icons/fa";
import api from "../services/api";
import "./TrackComplaint.css";

function TrackComplaint() {
  const [searchParams] = useSearchParams();
  const [complaintId, setComplaintId] = useState("");
  const [loading, setLoading] = useState(false);
  const [complaint, setComplaint] = useState(null);
  const [whatsAppUrl, setWhatsAppUrl] = useState("");
  const [error, setError] = useState("");
  const [copiedWa, setCopiedWa] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Citizen Feedback State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState("");
  const [feedbackError, setFeedbackError] = useState("");

  const fetchComplaint = async (idToSearch) => {
    if (!idToSearch || !idToSearch.trim()) {
      setError("Please enter a valid Complaint Tracking ID");
      return;
    }

    setLoading(true);
    setError("");
    setComplaint(null);
    setWhatsAppUrl("");
    setFeedbackSuccess("");
    setFeedbackError("");

    try {
      const response = await api.get(`/complaints/track/${idToSearch.trim()}`);
      if (response.data?.success && response.data?.complaint) {
        setComplaint(response.data.complaint);
        setWhatsAppUrl(response.data.whatsAppUrl || "");
      } else {
        throw new Error(response.data?.message || "Complaint not found");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          `No complaint found matching ID "${idToSearch}". Please check and try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const idFromUrl = searchParams.get("id");
    if (idFromUrl) {
      setComplaintId(idFromUrl);
      fetchComplaint(idFromUrl);
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchComplaint(complaintId);
  };

  const getStatusStep = (status) => {
    switch (status) {
      case "Pending":
        return 1;
      case "In Progress":
        return 2;
      case "Resolved":
        return 3;
      case "Rejected":
        return -1;
      default:
        return 1;
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!complaint) return;

    setSubmittingFeedback(true);
    setFeedbackError("");
    setFeedbackSuccess("");

    try {
      const response = await api.put(`/complaints/${complaint._id}/feedback`, {
        rating,
        comments,
      });

      if (response.data?.success) {
        setFeedbackSuccess("Thank you! Your satisfaction feedback has been recorded successfully.");
        setComplaint((prev) => ({
          ...prev,
          feedback: response.data.feedback || {
            rating,
            comments,
            submittedAt: new Date(),
          },
        }));
      } else {
        throw new Error(response.data?.message || "Failed to submit feedback");
      }
    } catch (err) {
      setFeedbackError(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit feedback. Please try again."
      );
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const currentStep = complaint ? getStatusStep(complaint.status) : 0;

  // Build fallback WhatsApp message if needed
  const directLinkUrl = complaint ? `${window.location.origin}/track?id=${complaint.complaintId}` : "";
  const fallbackWaMessage = complaint
    ? [
        `🏛️ *CONSUMER TRUST GRIEVANCE CASE UPDATE*`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `📋 *Tracking ID:* ${complaint.complaintId}`,
        `👤 *Citizen:* ${complaint.name}`,
        `📊 *Status:* *${complaint.status}*`,
        `📌 *Subject:* ${complaint.subject}`,
        complaint.adminRemarks ? `📝 *Officer Remarks:* "${complaint.adminRemarks}"` : "",
        ``,
        `🔗 *Track Live Milestones & Evidence:*`,
        directLinkUrl,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ].filter(Boolean).join("\n")
    : "";

  const directWaUrl = whatsAppUrl || (complaint ? `https://wa.me/91${complaint.phone.replace(/[^0-9]/g, "").slice(-10)}?text=${encodeURIComponent(fallbackWaMessage)}` : "");
  const webWaUrl = complaint ? `https://web.whatsapp.com/send?phone=${complaint.phone.replace(/[^0-9]/g, "").length === 10 ? "91" + complaint.phone.replace(/[^0-9]/g, "") : complaint.phone.replace(/[^0-9]/g, "")}&text=${encodeURIComponent(fallbackWaMessage)}` : "";
  const shareWaUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fallbackWaMessage)}`;

  const handleCopyWaReport = () => {
    if (!fallbackWaMessage) return;
    navigator.clipboard.writeText(fallbackWaMessage);
    setCopiedWa(true);
    setTimeout(() => setCopiedWa(false), 3000);
  };

  const handleCopyDirectLink = () => {
    if (directLinkUrl) {
      navigator.clipboard.writeText(directLinkUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  return (
    <div className="track-page">
      <div className="track-container">
        <h1>Track Grievance Status</h1>
        <p className="track-subtitle">
          Enter your official Complaint Tracking ID to see live investigation milestones, evidence documents, and 1-tap WhatsApp sync.
        </p>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="e.g. CT-2026-89412"
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="search-btn" disabled={loading}>
            {loading ? <FaSpinner className="spin" /> : "Track Status"}
          </button>
        </form>

        {error && (
          <div className="track-error">
            <FaExclamationCircle /> <span>{error}</span>
          </div>
        )}

        {complaint && (
          <div className="result-card">
            {/* Header / ID Badge */}
            <div className="result-header">
              <div>
                <span className="badge-tracking-id">{complaint.complaintId}</span>
                <h2>{complaint.subject}</h2>
              </div>
              <div className={`status-pill ${complaint.status.toLowerCase().replace(/\s+/g, "-")}`}>
                {complaint.status}
              </div>
            </div>

            {/* Step Progress Bar */}
            {complaint.status === "Rejected" ? (
              <div className="rejected-box">
                <FaTimesCircle className="rejected-icon" />
                <div>
                  <strong>Complaint Marked as Rejected</strong>
                  <p>
                    {complaint.adminRemarks ||
                      "This complaint does not meet jurisdiction criteria or lacked necessary proof."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="progress-timeline">
                <div className={`timeline-step ${currentStep >= 1 ? "completed" : ""}`}>
                  <div className="step-circle">
                    <FaCheckCircle />
                  </div>
                  <div className="step-label">
                    <strong>Grievance Submitted</strong>
                    <span>Logged in System</span>
                  </div>
                </div>

                <div className={`timeline-line ${currentStep >= 2 ? "active" : ""}`}></div>

                <div className={`timeline-step ${currentStep >= 2 ? "completed" : currentStep === 1 ? "active" : ""}`}>
                  <div className="step-circle">
                    {currentStep >= 2 ? <FaCheckCircle /> : <FaClock />}
                  </div>
                  <div className="step-label">
                    <strong>Under Review / In Progress</strong>
                    <span>Investigation Active</span>
                  </div>
                </div>

                <div className={`timeline-line ${currentStep >= 3 ? "active" : ""}`}></div>

                <div className={`timeline-step ${currentStep >= 3 ? "completed" : ""}`}>
                  <div className="step-circle">
                    <FaClipboardCheck />
                  </div>
                  <div className="step-label">
                    <strong>Official Resolution</strong>
                    <span>Closed with Settlement</span>
                  </div>
                </div>
              </div>
            )}

            {/* Details Grid */}
            <div className="details-grid">
              <div className="detail-item">
                <FaUser className="detail-icon" />
                <div>
                  <label>Complainant Name</label>
                  <span>{complaint.name}</span>
                </div>
              </div>

              <div className="detail-item">
                <FaTag className="detail-icon" />
                <div>
                  <label>Category</label>
                  <span>{complaint.category}</span>
                </div>
              </div>

              <div className="detail-item">
                <FaCalendarAlt className="detail-icon" />
                <div>
                  <label>Date Filed</label>
                  <span>
                    {new Date(complaint.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="detail-item">
                <FaClock className="detail-icon" />
                <div>
                  <label>Last Status Update</label>
                  <span>
                    {new Date(complaint.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* WhatsApp Grievance Live Sync Card (Like Amazon / Flipkart) */}
            <div className="whatsapp-track-card">
              <div className="whatsapp-track-header">
                <div className="whatsapp-track-info">
                  <div className="whatsapp-circle-icon">
                    <FaWhatsapp />
                  </div>
                  <div>
                    <h4>WhatsApp Grievance Live Sync</h4>
                    <p>
                      Receive instant case milestone updates, official remarks, and 1-tap tracking cards directly on WhatsApp (100% Free & Unlimited).
                    </p>
                  </div>
                </div>
                <span className="wa-active-pill">
                  <FaCheckCircle /> WhatsApp Active
                </span>
              </div>

              <div className="whatsapp-track-buttons">
                <a
                  href={directWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wa-track-btn-primary"
                >
                  <FaWhatsapp /> Send Updated Case Card to My WhatsApp ({complaint.phone})
                </a>

                <a
                  href={webWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wa-track-btn-web"
                  title="Open directly in WhatsApp Web in browser"
                >
                  <FaExternalLinkAlt /> Open in WhatsApp Web
                </a>

                <button
                  type="button"
                  className="wa-track-btn-copy"
                  onClick={handleCopyWaReport}
                  title="Copy full case report and direct link to clipboard"
                >
                  <FaCopy /> {copiedWa ? "Report Copied to Clipboard!" : "Copy Full WhatsApp Report"}
                </button>

                <a
                  href={shareWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wa-track-btn-secondary"
                >
                  <FaShareAlt /> Share Case File via WhatsApp
                </a>
              </div>

              {/* Direct 1-Tap Tracking Link Box */}
              <div className="wa-direct-link-box">
                <span className="wa-direct-link-title">Direct 1-Tap Tracking Link:</span>
                <div className="wa-direct-link-input-group">
                  <input
                    type="text"
                    readOnly
                    value={directLinkUrl}
                    className="wa-direct-link-input"
                  />
                  <button
                    type="button"
                    onClick={handleCopyDirectLink}
                    className="wa-copy-link-btn"
                  >
                    <FaCopy /> {copiedLink ? "Link Copied!" : "Copy Direct Link"}
                  </button>
                </div>
              </div>

              <div className="whatsapp-track-tips">
                <span>
                  💡 <strong>Direct Access:</strong> If WhatsApp on desktop asks you to download or says &quot;copy it&quot;, use <strong>&quot;Open in WhatsApp Web&quot;</strong> or copy/open the <strong>Direct 1-Tap Tracking Link</strong> above to view your full live report immediately!
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="description-box">
              <h4>Complaint Description</h4>
              <p>{complaint.description}</p>
            </div>

            {/* Evidence & Attachments Section */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="evidence-section">
                <div className="evidence-header">
                  <FaPaperclip className="evidence-icon" />
                  <h4>Supporting Evidence & Proof Documents ({complaint.attachments.length})</h4>
                </div>
                <div className="evidence-grid">
                  {complaint.attachments.map((att, index) => {
                    const isPdf = att.mimeType === "application/pdf" || (att.filename && att.filename.endsWith(".pdf"));
                    const fileUrl = att.url || `http://localhost:5000/uploads/${att.filename}`;

                    return (
                      <div key={index} className="evidence-card">
                        <div className="evidence-preview">
                          {isPdf ? (
                            <div className="pdf-preview-box">
                              <FaFilePdf className="pdf-large-icon" />
                              <span>PDF Document</span>
                            </div>
                          ) : (
                            <div className="img-preview-box">
                              <img
                                src={fileUrl}
                                alt={att.originalName || "Evidence document"}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            </div>
                          )}
                        </div>

                        <div className="evidence-meta">
                          <span className="evidence-name" title={att.originalName}>
                            {att.originalName || att.filename}
                          </span>
                          {att.size && (
                            <span className="evidence-size">{formatFileSize(att.size)}</span>
                          )}
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="evidence-view-link"
                          >
                            <FaEye /> View Full Document <FaExternalLinkAlt style={{ fontSize: 10 }} />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Official Admin Remarks / Resolution Notes */}
            {complaint.adminRemarks && (
              <div className="admin-remarks-box">
                <div className="remarks-title">
                  <FaCommentDots />
                  <h4>Official Redressal Authority Remarks</h4>
                </div>
                <p>{complaint.adminRemarks}</p>
                {complaint.resolvedAt && (
                  <span className="resolved-date">
                    Resolved on: {new Date(complaint.resolvedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}

            {/* Citizen 5-Star Feedback Section (When Resolved) */}
            {complaint.status === "Resolved" && (
              <div className="citizen-feedback-section">
                {complaint.feedback && complaint.feedback.rating ? (
                  <div className="feedback-recorded-card">
                    <div className="feedback-recorded-top">
                      <FaCheckCircle className="feedback-check-icon" />
                      <div>
                        <h4>Citizen Redressal Feedback Recorded</h4>
                        <p>Thank you for rating the grievance redressal quality!</p>
                      </div>
                    </div>

                    <div className="recorded-rating-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={star <= complaint.feedback.rating ? "star-gold" : "star-gray"}
                        />
                      ))}
                      <span className="recorded-score">
                        {complaint.feedback.rating}.0 / 5.0 Star Rating
                      </span>
                    </div>

                    {complaint.feedback.comments && (
                      <div className="recorded-comments">
                        <strong>Complainant Remarks:</strong>
                        <p>"{complaint.feedback.comments}"</p>
                      </div>
                    )}

                    {complaint.feedback.submittedAt && (
                      <span className="feedback-date">
                        Submitted on: {new Date(complaint.feedback.submittedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="feedback-form-card">
                    <div className="feedback-form-header">
                      <FaStar className="star-icon-header" />
                      <div>
                        <h3>Citizen Satisfaction & Redressal Rating</h3>
                        <p>
                          Your complaint has been marked as Resolved. How satisfied are you with the resolution provided by our nodal team?
                        </p>
                      </div>
                    </div>

                    {feedbackSuccess && (
                      <div className="feedback-success-msg">
                        <FaCheckCircle /> {feedbackSuccess}
                      </div>
                    )}

                    {feedbackError && (
                      <div className="feedback-error-msg">
                        <FaExclamationCircle /> {feedbackError}
                      </div>
                    )}

                    <form onSubmit={handleFeedbackSubmit} className="feedback-form">
                      <div className="star-rating-selector">
                        <label>Rate Resolution Quality (1 to 5 Stars) *</label>
                        <div className="stars-row">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              className="star-btn"
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              title={`${star} Star${star > 1 ? "s" : ""}`}
                            >
                              <FaStar
                                className={
                                  star <= (hoverRating || rating)
                                    ? "star-gold-interactive"
                                    : "star-gray-interactive"
                                }
                              />
                            </button>
                          ))}
                          <span className="rating-label">
                            {hoverRating || rating} of 5 Stars (
                            {(hoverRating || rating) === 5
                              ? "Excellent & Swift"
                              : (hoverRating || rating) === 4
                              ? "Very Good"
                              : (hoverRating || rating) === 3
                              ? "Satisfactory"
                              : (hoverRating || rating) === 2
                              ? "Needs Improvement"
                              : "Poor"}
                            )
                          </span>
                        </div>
                      </div>

                      <div className="feedback-comments-input">
                        <label>Your Feedback Remarks (Optional)</label>
                        <textarea
                          rows="3"
                          placeholder="Share your thoughts on the officer's resolution, refund speed, or overall experience..."
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                        />
                      </div>

                      <button
                        type="submit"
                        className="submit-feedback-btn"
                        disabled={submittingFeedback}
                      >
                        {submittingFeedback ? (
                          <>
                            <FaSpinner className="spin" /> Submitting Review...
                          </>
                        ) : (
                          "Submit Citizen Satisfaction Rating"
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Case Actions */}
            <div className="track-case-actions no-print">
              <button
                type="button"
                className="print-case-btn"
                onClick={() => window.print()}
              >
                <FaPrint /> Print Official Case Status
              </button>
            </div>
          </div>
        )}

        {!complaint && !loading && !error && (
          <div className="awaiting-box">
            <FaClipboardCheck className="awaiting-icon" />
            <h3>Awaiting Tracking Request</h3>
            <p>
              Please enter your complaint tracking ID in the search box above to retrieve verified real-time case information.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrackComplaint;
