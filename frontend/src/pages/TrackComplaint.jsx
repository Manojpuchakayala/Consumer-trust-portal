import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  FaSearch,
  FaShieldAlt,
  FaCheckCircle,
  FaClock,
  FaBuilding,
  FaFileAlt,
  FaPaperclip,
  FaFilePdf,
  FaFileImage,
  FaStar,
  FaWhatsapp,
  FaCopy,
  FaExternalLinkAlt,
  FaHourglassHalf,
  FaExclamationTriangle,
  FaUserCheck,
  FaReceipt,
  FaCalendarAlt,
  FaUser,
  FaTag,
  FaPrint,
  FaAward,
  FaSpinner,
  FaTimesCircle,
  FaClipboardList,
} from "react-icons/fa";
import api from "../services/api";
import {
  generateGrievanceNoticePdf,
  generateResolutionCertificatePdf,
} from "../utils/pdfGenerator";
import "./TrackComplaint.css";

function TrackComplaint() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [complaintIdInput, setComplaintIdInput] = useState(searchParams.get("id") || "");
  const [loading, setLoading] = useState(false);
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Citizen Rating State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState("");
  const [feedbackError, setFeedbackError] = useState("");

  // Ombudsman Modal
  const [showEscalateModal, setShowEscalateModal] = useState(false);

  // 7-Day SLA State
  const [slaTime, setSlaTime] = useState({
    days: 7,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    percentElapsed: 0,
  });

  const fetchComplaintDetails = async (idToFetch) => {
    if (!idToFetch || !idToFetch.trim()) {
      setError("Please enter a valid Grievance Docket Number.");
      return;
    }
    setLoading(true);
    setError("");
    setComplaint(null);
    setFeedbackSuccess("");
    setFeedbackError("");

    try {
      const res = await api.get(`/complaints/track/${encodeURIComponent(idToFetch.trim())}`);
      if (res.data?.success && res.data?.complaint) {
        setComplaint(res.data.complaint);
      } else {
        throw new Error(res.data?.message || "Docket not found");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `No grievance docket found for ID "${idToFetch}". Please check and try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const idFromQuery = searchParams.get("id");
    if (idFromQuery) {
      setComplaintIdInput(idFromQuery);
      fetchComplaintDetails(idFromQuery);
    }
  }, [searchParams]);

  // SLA Calculation
  useEffect(() => {
    if (!complaint || !complaint.createdAt) return;

    const updateSla = () => {
      const createdTime = new Date(complaint.createdAt).getTime();
      const slaDuration = 7 * 24 * 60 * 60 * 1000;
      const deadline = createdTime + slaDuration;
      const now = Date.now();
      const remaining = deadline - now;
      const elapsed = now - createdTime;
      const percentElapsed = Math.min(100, Math.max(0, (elapsed / slaDuration) * 100));

      if (remaining <= 0) {
        setSlaTime({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, percentElapsed: 100 });
      } else {
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        setSlaTime({ days, hours, minutes, seconds, isExpired: false, percentElapsed });
      }
    };

    updateSla();
    const interval = setInterval(updateSla, 1000);
    return () => clearInterval(interval);
  }, [complaint]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!complaintIdInput.trim()) return;
    setSearchParams({ id: complaintIdInput.trim() });
    fetchComplaintDetails(complaintIdInput.trim());
  };

  const handleCopyId = () => {
    if (complaint?.complaintId) {
      navigator.clipboard.writeText(complaint.complaintId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 3000);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!complaint?._id) return;
    setSubmittingFeedback(true);
    setFeedbackError("");
    setFeedbackSuccess("");

    try {
      const res = await api.put(`/complaints/${complaint._id}/feedback`, {
        rating,
        comments: comments.trim(),
      });
      if (res.data?.success) {
        setFeedbackSuccess("Thank you! Your resolution rating has been recorded.");
        setComplaint((prev) => ({
          ...prev,
          feedback: res.data.feedback || { rating, comments, submittedAt: new Date() },
        }));
      }
    } catch (err) {
      setFeedbackError(err.response?.data?.message || "Failed to submit feedback.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const getMilestoneStep = (status) => {
    switch (status) {
      case "Pending":
        return 1;
      case "In Progress":
        return 2;
      case "Resolved":
        return 4;
      case "Rejected":
        return -1;
      default:
        return 1;
    }
  };

  const activeMilestone = complaint ? getMilestoneStep(complaint.status) : 0;
  const statusSlug = (complaint?.status || "Pending").toLowerCase().replace(/\s+/g, "-");

  // WhatsApp Dispatch Message
  const waShareUrl = complaint
    ? `https://api.whatsapp.com/send?text=${encodeURIComponent(
        [
          `🏛️ CONSUMER TRUST GRIEVANCE CASE UPDATE`,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          `📋 Tracking ID: ${complaint.complaintId}`,
          `👤 Citizen: ${complaint.name || "Citizen"}`,
          `📊 Status: ${complaint.status || "Pending"}`,
          `📌 Subject: ${complaint.subject}`,
          `🔗 Track Live Milestones & Evidence:`,
          `${window.location.origin}/track?id=${complaint.complaintId}`,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        ].join("\n")
      )}`
    : "#";

  return (
    <div className="track-layout-clean">
      <div className="track-inner-container">
        {/* Amazon-style Search Header */}
        <div className="track-search-header-panel">
          <div className="search-header-badge">
            <FaShieldAlt /> National Grievance Tracking Portal
          </div>
          <h1>Track Your Grievance</h1>
          <p>Enter your Docket Number to inspect real-time investigation milestones, nodal remarks, and settlement notices.</p>

          <form onSubmit={handleSearchSubmit} className="track-search-bar-wrap">
            <div className="search-input-field">
              <FaSearch className="search-mag-icon" />
              <input
                type="text"
                placeholder="Enter Docket Number (e.g. CT-2026-89412)"
                value={complaintIdInput}
                onChange={(e) => setComplaintIdInput(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-track-action-submit" disabled={loading}>
              {loading ? <FaSpinner className="spin" /> : "Track Status"}
            </button>
          </form>
        </div>

        {error && (
          <div className="track-error-alert-box">
            <FaExclamationTriangle /> <span>{error}</span>
          </div>
        )}

        {/* When Complaint Found: Amazon-Grade Clean Structured Panels */}
        {complaint && (
          <div className="track-results-view-flow">
            {/* PANEL 1: Grievance Summary Header Card */}
            <div className="track-card-box docket-overview-card">
              <div className="docket-top-flex-row">
                <div className="docket-title-area">
                  <div className="docket-id-copy-row">
                    <span className="docket-id-code">{complaint.complaintId}</span>
                    <button
                      type="button"
                      className="btn-copy-tag"
                      onClick={handleCopyId}
                      title="Copy Docket ID"
                    >
                      <FaCopy /> {copiedId ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <h2 className="docket-main-subject">{complaint.subject}</h2>
                  <div className="docket-chips-row">
                    <span className="docket-chip">
                      <FaBuilding className="chip-icon" /> <strong>{complaint.companyName}</strong>
                    </span>
                    <span className="docket-chip">
                      <FaTag className="chip-icon" /> {complaint.category}
                    </span>
                    <span className="docket-chip">
                      <FaCalendarAlt className="chip-icon" /> Filed {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className={`status-pill-badge status-${statusSlug}`}>
                  {complaint.status}
                </div>
              </div>
            </div>

            {/* PANEL 2: Amazon-Style 4-Stage Milestone Progression Stepper */}
            <div className="track-card-box stepper-card-box">
              <div className="panel-box-header">
                <div className="panel-header-icon blue-icon">
                  <FaClock />
                </div>
                <div className="panel-header-text">
                  <h3>Investigation Progress</h3>
                  <p>Real-time lifecycle of your consumer grievance docket</p>
                </div>
              </div>

              {complaint.status === "Rejected" ? (
                <div className="rejected-callout-box">
                  <FaTimesCircle className="icon-rejected" />
                  <div>
                    <strong>Grievance Rejected by Redressal Desk</strong>
                    <p>{complaint.adminRemarks || "This complaint did not meet jurisdiction criteria or lacked verifiable proof."}</p>
                  </div>
                </div>
              ) : (
                <div className="milestone-stepper-amazon">
                  {/* Step 1 */}
                  <div className="stepper-step completed">
                    <div className="step-bullet"><FaCheckCircle /></div>
                    <div className="step-desc">
                      <strong>Grievance Lodged</strong>
                      <span>Logged in repository</span>
                    </div>
                  </div>

                  <div className={`stepper-line ${activeMilestone >= 2 ? "done" : ""}`}></div>

                  {/* Step 2 */}
                  <div className={`stepper-step ${activeMilestone >= 2 ? "completed" : "active"}`}>
                    <div className="step-bullet">
                      {activeMilestone >= 2 ? <FaCheckCircle /> : <FaClock />}
                    </div>
                    <div className="step-desc">
                      <strong>Nodal Desk Assigned</strong>
                      <span>Dispatched to {complaint.companyName}</span>
                    </div>
                  </div>

                  <div className={`stepper-line ${activeMilestone >= 3 ? "done" : ""}`}></div>

                  {/* Step 3 */}
                  <div className={`stepper-step ${activeMilestone >= 3 ? "completed" : activeMilestone === 2 ? "active" : ""}`}>
                    <div className="step-bullet">
                      {activeMilestone >= 3 ? <FaCheckCircle /> : <FaHourglassHalf />}
                    </div>
                    <div className="step-desc">
                      <strong>Investigation & Evidence</strong>
                      <span>Under active officer review</span>
                    </div>
                  </div>

                  <div className={`stepper-line ${activeMilestone >= 4 ? "done" : ""}`}></div>

                  {/* Step 4 */}
                  <div className={`stepper-step ${activeMilestone >= 4 ? "completed" : ""}`}>
                    <div className="step-bullet">
                      {activeMilestone >= 4 ? <FaAward /> : <FaCheckCircle />}
                    </div>
                    <div className="step-desc">
                      <strong>Resolution Finalized</strong>
                      <span>Official settlement issued</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 7-Day Statutory SLA Guarantee Bar */}
              {complaint.status !== "Resolved" && complaint.status !== "Rejected" && (
                <div className={`sla-guarantee-strip ${slaTime.isExpired ? "sla-expired" : ""}`}>
                  <div className="sla-strip-left">
                    <FaHourglassHalf className="sla-strip-icon" />
                    <div>
                      <strong>7-Day Mandatory Resolution SLA:</strong>
                      {slaTime.isExpired ? (
                        <span className="sla-expired-text"> ⚠️ Statutory 7-day period exceeded. Case eligible for Ombudsman escalation.</span>
                      ) : (
                        <span> <strong>{slaTime.days}d {slaTime.hours}h {slaTime.minutes}m {slaTime.seconds}s</strong> remaining</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-escalate-trigger"
                    onClick={() => setShowEscalateModal(true)}
                  >
                    <FaExclamationTriangle /> Ombudsman Escalation
                  </button>
                </div>
              )}
            </div>

            {/* PANEL 3: Clean Dispute Details (Like Amazon Order Details) */}
            <div className="track-card-box">
              <div className="panel-box-header">
                <div className="panel-header-icon indigo-icon">
                  <FaFileAlt />
                </div>
                <div className="panel-header-text">
                  <h3>Dispute Facts & Complainant Details</h3>
                  <p>Verified information as recorded on the official docket</p>
                </div>
              </div>

              <div className="dispute-grid-2col">
                <div className="dispute-info-card">
                  <span className="info-sub-label">COMPLAINANT</span>
                  <strong className="info-main-val">{complaint.name}</strong>
                  <span className="info-sub-val">{complaint.email} • {complaint.phone}</span>
                </div>

                <div className="dispute-info-card">
                  <span className="info-sub-label">DISPUTED ENTERPRISE</span>
                  <strong className="info-main-val">{complaint.companyName || "General Entity"}</strong>
                  <span className="info-sub-val">Sector: {complaint.category}</span>
                </div>

                {complaint.orderOrTransactionId && (
                  <div className="dispute-info-card full-width-grid">
                    <span className="info-sub-label">ORDER / TRANSACTION REFERENCE ID</span>
                    <strong className="info-main-val font-mono">{complaint.orderOrTransactionId}</strong>
                  </div>
                )}
              </div>

              {/* Grievance Statement */}
              <div className="dispute-narrative-clean-box">
                <span className="narrative-clean-label">OFFICIAL STATEMENT OF FACTS</span>
                <p>{complaint.description}</p>
              </div>
            </div>

            {/* PANEL 4: Official Resolution & Nodal Findings (When available) */}
            {(complaint.adminRemarks || (complaint.companyResolution && complaint.companyResolution.resolvedByCompany)) && (
              <div className="track-card-box resolution-box-panel">
                <div className="panel-box-header">
                  <div className="panel-header-icon green-icon">
                    <FaCheckCircle />
                  </div>
                  <div className="panel-header-text">
                    <h3>Official Redressal & Settlement Findings</h3>
                    <p>Verified response from the Designated Grievance Officer</p>
                  </div>
                </div>

                {complaint.companyResolution && complaint.companyResolution.resolvedByCompany && (
                  <div className="company-settlement-row">
                    <div className="settlement-badge-pill">
                      Action: <strong>{complaint.companyResolution.resolutionType || "Settled"}</strong>
                    </div>
                    {complaint.companyResolution.settlementReference && (
                      <div className="settlement-ref-pill">
                        Ref / UTR: <strong>{complaint.companyResolution.settlementReference}</strong>
                      </div>
                    )}
                  </div>
                )}

                {complaint.adminRemarks && (
                  <div className="nodal-remarks-content">
                    <p>"{complaint.adminRemarks}"</p>
                  </div>
                )}
              </div>
            )}

            {/* PANEL 5: Attached Evidence Documents (When available) */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="track-card-box">
                <div className="panel-box-header">
                  <div className="panel-header-icon cyan-icon">
                    <FaPaperclip />
                  </div>
                  <div className="panel-header-text">
                    <h3>Supporting Evidence ({complaint.attachments.length})</h3>
                    <p>Invoices, receipts, and defect photos uploaded with this dispute</p>
                  </div>
                </div>

                <div className="evidence-pills-grid">
                  {complaint.attachments.map((att, idx) => {
                    const isPdf = att.mimeType === "application/pdf" || (att.filename && att.filename.endsWith(".pdf"));
                    const fileUrl = att.url || `http://localhost:5000/uploads/${att.filename}`;
                    return (
                      <a
                        key={idx}
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="evidence-item-pill"
                      >
                        {isPdf ? <FaFilePdf className="att-pdf-icon" /> : <FaFileImage className="att-img-icon" />}
                        <span className="att-file-name" title={att.originalName || att.filename}>
                          {att.originalName || att.filename || "Evidence Document"}
                        </span>
                        <FaExternalLinkAlt className="att-open-icon" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PANEL 6: Clean Action Center & Amazon-Style Citizen Feedback */}
            <div className="track-card-box actions-panel-box">
              <div className="panel-box-header">
                <div className="panel-header-icon teal-icon">
                  <FaShieldAlt />
                </div>
                <div className="panel-header-text">
                  <h3>Legal Actions & Official Documents</h3>
                  <p>Download certified legal notices or share case file</p>
                </div>
              </div>

              <div className="clean-actions-buttons-row">
                <button
                  type="button"
                  className="btn-clean-pdf-notice"
                  onClick={() => generateGrievanceNoticePdf(complaint)}
                >
                  <FaFilePdf /> Download Official Notice (PDF)
                </button>

                {complaint.status === "Resolved" && (
                  <button
                    type="button"
                    className="btn-clean-pdf-cert"
                    onClick={() => generateResolutionCertificatePdf(complaint)}
                  >
                    <FaAward /> Download Settlement Certificate (PDF)
                  </button>
                )}

                <a
                  href={waShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-clean-whatsapp-share"
                >
                  <FaWhatsapp /> Share on WhatsApp
                </a>

                <button
                  type="button"
                  className="btn-clean-copy-link"
                  onClick={handleCopyLink}
                >
                  <FaCopy /> {copiedLink ? "Link Copied!" : "Copy Live Link"}
                </button>
              </div>

              {/* Citizen Rating for Resolved Complaints (Amazon-Style 5-Star Widget) */}
              {complaint.status === "Resolved" && (
                <div className="amazon-feedback-box">
                  <div className="amazon-feedback-header">
                    <FaStar className="star-gold-header" />
                    <div>
                      <h4>Rate Resolution Quality</h4>
                      <p>How satisfied are you with the turnaround time and settlement provided?</p>
                    </div>
                  </div>

                  {complaint.feedback?.rating ? (
                    <div className="feedback-done-banner">
                      <FaCheckCircle className="check-green" />
                      <div>
                        <strong>You rated this resolution: {complaint.feedback.rating} / 5 Stars</strong>
                        {complaint.feedback.comments && <p>"{complaint.feedback.comments}"</p>}
                      </div>
                    </div>
                  ) : feedbackSuccess ? (
                    <div className="feedback-done-banner">
                      <FaCheckCircle className="check-green" />
                      <span>{feedbackSuccess}</span>
                    </div>
                  ) : (
                    <form onSubmit={handleFeedbackSubmit} className="amazon-rating-form">
                      {feedbackError && <div className="feedback-err-text">{feedbackError}</div>}
                      <div className="stars-interactive-row">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className="star-click-btn"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                          >
                            <FaStar
                              className={
                                star <= (hoverRating || rating)
                                  ? "star-active-gold"
                                  : "star-inactive-gray"
                              }
                            />
                          </button>
                        ))}
                        <span className="rating-text-hint">
                          {(hoverRating || rating) === 5
                            ? "5 - Excellent & Fast"
                            : (hoverRating || rating) === 4
                            ? "4 - Very Good"
                            : (hoverRating || rating) === 3
                            ? "3 - Satisfactory"
                            : (hoverRating || rating) === 2
                            ? "2 - Needs Improvement"
                            : "1 - Unsatisfactory"}
                        </span>
                      </div>

                      <div className="rating-comment-input-wrap">
                        <input
                          type="text"
                          placeholder="Add optional remarks regarding your experience..."
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                        />
                        <button
                          type="submit"
                          className="btn-submit-rating-clean"
                          disabled={submittingFeedback}
                        >
                          {submittingFeedback ? "Submitting..." : "Submit Rating"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ombudsman Escalation Modal */}
        {showEscalateModal && complaint && (
          <div className="ombudsman-modal-overlay" onClick={() => setShowEscalateModal(false)}>
            <div className="ombudsman-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="ombudsman-modal-header">
                <div>
                  <span className="modal-case-tag">{complaint.complaintId}</span>
                  <h3>Statutory Ombudsman Escalation Gateway</h3>
                </div>
                <button type="button" className="close-omb-btn" onClick={() => setShowEscalateModal(false)}>✕</button>
              </div>

              <div className="ombudsman-modal-body">
                <p className="omb-lead-text">
                  If <strong>{complaint.companyName}</strong> fails to redress your grievance within the statutory 7-day SLA, you are entitled to escalate directly to the designated National Authority:
                </p>

                <div className="ombudsman-links-grid">
                  <a
                    href="https://consumerhelpline.gov.in/user/login.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="omb-link-box"
                  >
                    <div className="omb-icon-pill">🏛️</div>
                    <div className="omb-text-col">
                      <strong>National Consumer Helpline (NCH / 1915)</strong>
                      <span>Direct Central Government Consumer Portal</span>
                    </div>
                    <FaExternalLinkAlt className="omb-arrow-icon" />
                  </a>

                  <a
                    href="https://cms.rbi.org.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="omb-link-box"
                  >
                    <div className="omb-icon-pill">🏦</div>
                    <div className="omb-text-col">
                      <strong>RBI Banking Ombudsman (CMS)</strong>
                      <span>For Bank Accounts, UPI, and Payment Failures</span>
                    </div>
                    <FaExternalLinkAlt className="omb-arrow-icon" />
                  </a>

                  <a
                    href="https://edaakhil.nic.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="omb-link-box"
                  >
                    <div className="omb-icon-pill">⚖️</div>
                    <div className="omb-text-col">
                      <strong>e-Daakhil (National Consumer Commission)</strong>
                      <span>Online Filing in Consumer Dispute Forum</span>
                    </div>
                    <FaExternalLinkAlt className="omb-arrow-icon" />
                  </a>
                </div>
              </div>

              <div className="ombudsman-modal-footer">
                <button
                  type="button"
                  className="btn-modal-download-pdf"
                  onClick={() => {
                    generateGrievanceNoticePdf(complaint);
                    setShowEscalateModal(false);
                  }}
                >
                  <FaFilePdf /> Download Official Notice (PDF)
                </button>
                <button
                  type="button"
                  className="btn-modal-close"
                  onClick={() => setShowEscalateModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {!complaint && !loading && !error && (
          <div className="awaiting-search-clean-box">
            <FaClipboardList className="awaiting-clean-icon" />
            <h3>Track Your Grievance Status</h3>
            <p>Enter your Docket Tracking ID above to view live investigation progress, official remarks, and resolution certificate.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrackComplaint;
