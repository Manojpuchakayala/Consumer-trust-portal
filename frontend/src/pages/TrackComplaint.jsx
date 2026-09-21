import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  FaSearch,
  FaShieldAlt,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaFilePdf,
  FaPrint,
  FaPaperclip,
  FaBuilding,
  FaCalendarAlt,
  FaCopy,
  FaExclamationTriangle,
  FaSpinner,
  FaLock,
  FaInfoCircle,
  FaArrowLeft,
  FaKey,
  FaCheck,
  FaUserCheck,
  FaWhatsapp,
  FaStar,
  FaGavel,
  FaQrcode,
  FaExternalLinkAlt,
  FaCalculator,
  FaHourglassHalf,
} from "react-icons/fa";
import QRCode from "qrcode";
import api from "../services/api";
import {
  generateGrievanceNoticePdf,
  generateResolutionCertificatePdf,
  generateStatutoryEscalationPdf,
  generatePreLitigationLegalNoticePdf,
} from "../utils/pdfGenerator";
import { getWhatsAppShareUrl } from "../utils/whatsappShare";
import CourtFeeCalculator from "../components/CourtFeeCalculator";
import EDaakhilExportModal from "../components/EDaakhilExportModal";
import "./TrackComplaint.css";

export default function TrackComplaint() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Verification State - Clean empty state on load
  const [docketInput, setDocketInput] = useState("");
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [showCourtCalculator, setShowCourtCalculator] = useState(false);
  const [showEDaakhilModal, setShowEDaakhilModal] = useState(false);
  const [speedPostNo, setSpeedPostNo] = useState("");

  // Resolution Rating State
  const [userRating, setUserRating] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  // OTP Verification Flow State
  const [otpStep, setOtpStep] = useState(false);
  const [otpTargetId, setOtpTargetId] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  const user = JSON.parse(localStorage.getItem("consumerTrustUser") || "null");

  useEffect(() => {
    if (complaint?.complaintId) {
      const url = `${window.location.origin}/track?id=${complaint.complaintId}`;
      QRCode.toDataURL(url, {
        width: 140,
        margin: 1,
        color: { dark: "#0f2b5c", light: "#ffffff" },
      })
        .then(setQrCodeDataUrl)
        .catch((e) => console.warn(e));

      const savedRating = localStorage.getItem(`ctp_rating_${complaint.complaintId}`);
      if (savedRating) {
        setRatingSubmitted(true);
        setUserRating(parseInt(savedRating, 10));
      } else {
        setRatingSubmitted(false);
      }
    }
  }, [complaint]);

  useEffect(() => {
    const idFromQuery = searchParams.get("id");
    if (idFromQuery) {
      const cleanId = idFromQuery.trim().toUpperCase();
      setDocketInput(cleanId);
      initiateTracking(cleanId);
    }
  }, [searchParams]);

  const initiateTracking = async (idToTrack) => {
    const target = (idToTrack || docketInput).trim().toUpperCase();
    if (!target) {
      setError("Please enter a valid Docket ID.");
      return;
    }

    setLoading(true);
    setError("");
    setComplaint(null);
    setOtpStep(false);
    setOtpError("");

    try {
      let res;
      let usedPost = true;

      // 1. Attempt protected 2FA / OTP access request
      try {
        res = await api.post("/complaints/track/request-access", {
          complaintId: target,
        });
      } catch (postErr) {
        // If POST /track/request-access endpoint is not found (404/not deployed on remote API), fallback to GET /track/:id
        const isNotFound =
          postErr.response?.status === 404 ||
          postErr.response?.data?.message?.includes("not found");
        
        if (isNotFound) {
          usedPost = false;
          res = await api.get(`/complaints/track/${encodeURIComponent(target)}`);
        } else {
          throw postErr;
        }
      }

      if (res.data?.success) {
        if (res.data.complaint) {
          setComplaint(res.data.complaint);
          if (res.data.trackToken) {
            sessionStorage.setItem("caseTrackToken", res.data.trackToken);
          }
        } else if (res.data.requiresOtp) {
          setOtpStep(true);
          setOtpTargetId(target);
          setMaskedEmail(res.data.maskedEmail || "your registered email");
          setOtpInput("");
        }
      } else {
        throw new Error(res.data?.message || `We could not find a matching case for Docket #${target}.`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `We could not find a matching case for Docket ID "${target}". Please check your Docket ID or sign in to view your cases.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    initiateTracking(docketInput);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpInput || otpInput.trim().length < 6) {
      setOtpError("Please enter the complete 6-digit verification code.");
      return;
    }

    setOtpLoading(true);
    setOtpError("");

    try {
      const res = await api.post("/complaints/track/verify-otp", {
        complaintId: otpTargetId,
        otp: otpInput.trim(),
      });

      if (res.data?.success && res.data.complaint) {
        setComplaint(res.data.complaint);
        setOtpStep(false);
        if (res.data.trackToken) {
          sessionStorage.setItem("caseTrackToken", res.data.trackToken);
        }
      } else {
        throw new Error(res.data?.message || "Invalid verification code.");
      }
    } catch (err) {
      setOtpError(
        err.response?.data?.message ||
          "Invalid or expired verification code. Please check your email and try again."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpLoading(true);
    setOtpError("");
    try {
      await api.post("/complaints/track/request-access", { complaintId: otpTargetId });
      alert(`A fresh verification code has been dispatched to ${maskedEmail}.`);
    } catch {
      setOtpError("Failed to resend verification code. Please try again in a moment.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleCopyId = () => {
    if (complaint?.complaintId) {
      navigator.clipboard.writeText(complaint.complaintId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  const handleResetSearch = () => {
    setComplaint(null);
    setOtpStep(false);
    setDocketInput("");
    setError("");
    setOtpError("");
    setSearchParams({});
  };

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    if (!complaint?.complaintId) return;
    setRatingSubmitting(true);
    localStorage.setItem(`ctp_rating_${complaint.complaintId}`, userRating.toString());
    setTimeout(() => {
      setRatingSubmitting(false);
      setRatingSubmitted(true);
    }, 400);
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
        return 4;
      default:
        return 1;
    }
  };

  const activeMilestone = complaint ? getMilestoneStep(complaint.status) : 1;
  const statusSlug = (complaint?.status || "Pending").toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="track-page-root">
      <div className="track-container">
        {/* Top Disclaimer */}
        <div className="track-notice-ribbon">
          <FaInfoCircle className="ribbon-icon" />
          <span>
            <strong>Independent Platform Notice:</strong> Consumer Trust is an independent dispute facilitation service and not a government agency, court, or statutory commission.
          </span>
        </div>

        {/* 1. INITIAL CLEAN SEARCH STATE */}
        {!complaint && !otpStep && (
          <div className="track-initial-box">
            <div className="track-badge">
              <FaLock /> Protected Case Tracking
            </div>
            <h1 className="track-title">Track Case Status</h1>
            <p className="track-desc">
              Enter your Docket ID to view facilitation progress, nodal responses, and resolution records.
            </p>

            {error && (
              <div className="track-alert">
                <FaExclamationTriangle className="alert-icon" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSearchSubmit} className="track-search-form">
              <div className="track-search-input-wrap">
                <FaSearch className="input-search-icon" />
                <input
                  type="text"
                  placeholder="Enter Docket ID (e.g. CT-2026-89412)"
                  value={docketInput}
                  onChange={(e) => {
                    setDocketInput(e.target.value);
                    setError("");
                  }}
                  required
                  autoFocus
                />
              </div>
              <button type="submit" className="track-submit-action" disabled={loading}>
                {loading ? <FaSpinner className="spin-icon" /> : "Track Case"}
              </button>
            </form>

            {/* Guidance Grid */}
            <div className="track-guidance-cards">
              <div className="guidance-box">
                <h4>Locating your Docket ID</h4>
                <ul>
                  <li>On your Grievance Acknowledgment summary.</li>
                  <li>In the confirmation email sent upon submission.</li>
                  <li>In your SMS notification (Format: <code>CT-2026-XXXXX</code>).</li>
                </ul>
              </div>

              <div className="guidance-box privacy">
                <h4>Confidential Case Access</h4>
                <p>
                  To protect personal privacy, case information is accessible only through authenticated accounts or two-factor verification sent to the verified contact on file.
                </p>
                {!user && (
                  <p className="guidance-signin-link">
                    Have an account? <Link to="/login">Sign In</Link> to view all your registered cases directly.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. OTP VERIFICATION STEP */}
        {otpStep && !complaint && (
          <div className="track-otp-box">
            <div className="track-badge">
              <FaKey /> Two-Factor Verification
            </div>
            <h2>Verify Case Access</h2>
            <p className="otp-subtitle">
              A 6-digit verification code has been dispatched to <strong>{maskedEmail}</strong>. Enter the code below to review your case records.
            </p>

            {otpError && (
              <div className="track-alert">
                <FaExclamationTriangle className="alert-icon" />
                <span>{otpError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="otp-form-wrap">
              <div className="otp-code-input-box">
                <FaLock className="otp-lock-icon" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ""))}
                  required
                  autoFocus
                />
              </div>

              <div className="otp-actions-group">
                <button type="submit" className="otp-verify-action" disabled={otpLoading}>
                  {otpLoading ? <FaSpinner className="spin-icon" /> : "Verify Code"}
                </button>
                <button
                  type="button"
                  className="otp-btn-secondary"
                  onClick={handleResendOtp}
                  disabled={otpLoading}
                >
                  Resend Code
                </button>
                <button
                  type="button"
                  className="otp-btn-secondary"
                  onClick={handleResetSearch}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 3. AUTHORIZED CASE TIMELINE VIEW */}
        {complaint && (
          <div className="track-authorized-content">
            {/* Top Bar */}
            <div className="case-back-bar">
              <button type="button" className="btn-back-link" onClick={handleResetSearch}>
                <FaArrowLeft /> Track Another Case
              </button>
              <div className="case-docket-tag">
                <span>Docket:</span>
                <strong>#{complaint.complaintId}</strong>
                <button
                  type="button"
                  className="btn-copy-mini"
                  onClick={handleCopyId}
                  title="Copy Docket ID"
                >
                  <FaCopy /> {copiedId ? "Copied" : ""}
                </button>
                <a
                  href={getWhatsAppShareUrl(complaint)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp-mini-track"
                  title="Share Case Record via WhatsApp"
                >
                  <FaWhatsapp /> Share
                </a>
              </div>
            </div>

            {/* Case Header Card */}
            <div className="case-summary-card">
              <div className="case-header-main">
                <span className="case-cat-badge">{complaint.category || "General Dispute"}</span>
                <h2>{complaint.subject}</h2>
                <div className="case-meta-chips">
                  <span><FaBuilding /> <strong>{complaint.companyName || "Enterprise"}</strong></span>
                  <span>
                    <FaCalendarAlt /> Filed{" "}
                    {new Date(complaint.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {complaint.orderOrTransactionId && (
                    <span>Ref: <strong>{complaint.orderOrTransactionId}</strong></span>
                  )}
                </div>
              </div>

              <div className="case-header-status">
                <span className={`status-pill ${statusSlug}`}>
                  {complaint.status}
                </span>
              </div>
            </div>

            {/* 15-Day Statutory SLA Conciliation Window Card */}
            {complaint.status !== "Resolved" && complaint.status !== "Rejected" && (() => {
              const createdDate = new Date(complaint.createdAt || Date.now());
              const daysElapsed = Math.min(15, Math.max(1, Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24))));
              const daysLeft = Math.max(0, 15 - daysElapsed);
              const progressPct = Math.min(100, Math.round((daysElapsed / 15) * 100));

              return (
                <div className="sla-countdown-card">
                  <div className="sla-countdown-header">
                    <div className="sla-title-row">
                      <FaHourglassHalf className={`sla-timer-icon ${daysLeft <= 3 ? "urgent" : ""}`} />
                      <div>
                        <strong>Statutory 15-Day Voluntary Conciliation Window</strong>
                        <span>
                          {daysLeft > 0
                            ? `${daysLeft} Day${daysLeft !== 1 ? "s" : ""} remaining before automatic government legal escalation unlocks`
                            : "15-Day Conciliation Period Expired — Recommended for e-Daakhil filing"}
                        </span>
                      </div>
                    </div>
                    <span className={`sla-badge ${daysLeft <= 3 ? "badge-urgent" : "badge-normal"}`}>
                      Day {daysElapsed} / 15
                    </span>
                  </div>

                  <div className="sla-progress-track">
                    <div
                      className={`sla-progress-bar ${daysLeft <= 3 ? "bar-urgent" : ""}`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* 4-Stage Visual Redressal Milestone Stepper */}
            <div className="timeline-stepper-card">
              <div className="stepper-title-row">
                <h3>Case Facilitation Timeline</h3>
                <span className="active-milestone-tag">Active Milestone</span>
              </div>

              {complaint.status === "Rejected" ? (
                <div className="rejected-box">
                  <FaTimesCircle className="rejected-icon" />
                  <div>
                    <strong>Case Closed without Settlement</strong>
                    <p>{complaint.adminRemarks || "The claim could not be substantiated or was closed by the enterprise."}</p>
                  </div>
                </div>
              ) : (
                <div className="timeline-stages-grid">
                  <div className={`timeline-stage ${activeMilestone >= 1 ? "completed" : ""}`}>
                    <div className="stage-num-badge">
                      {activeMilestone > 1 ? <FaCheck /> : "1"}
                    </div>
                    <div className="stage-info">
                      <strong>Grievance Docketed</strong>
                      <span>Timestamped & logged</span>
                    </div>
                  </div>

                  <div className={`timeline-stage ${activeMilestone >= 2 ? "completed" : ""}`}>
                    <div className="stage-num-badge">
                      {activeMilestone > 2 ? <FaCheck /> : "2"}
                    </div>
                    <div className="stage-info">
                      <strong>Nodal Dispatch</strong>
                      <span>Dispatched to {complaint.companyName}</span>
                    </div>
                  </div>

                  <div className={`timeline-stage ${activeMilestone >= 3 ? "completed" : ""}`}>
                    <div className="stage-num-badge">
                      {activeMilestone > 3 ? <FaCheck /> : "3"}
                    </div>
                    <div className="stage-info">
                      <strong>Review & Inquiry</strong>
                      <span>Enterprise grievance desk</span>
                    </div>
                  </div>

                  <div className={`timeline-stage ${activeMilestone >= 4 ? "completed" : ""}`}>
                    <div className="stage-num-badge">
                      {activeMilestone >= 4 ? <FaCheck /> : "4"}
                    </div>
                    <div className="stage-info">
                      <strong>Resolution</strong>
                      <span>{complaint.status === "Resolved" ? "Settled & Closed" : "In Progress"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Details Split */}
            <div className="case-details-split">
              <div className="narrative-box">
                <h4>Claim Narrative</h4>
                <div className="narrative-text">
                  {complaint.description}
                </div>
              </div>

              <div className="sidebar-overview-box">
                <h4>Case Overview</h4>
                <div className="overview-row">
                  <span>Complainant:</span>
                  <strong>{complaint.name}</strong>
                </div>
                <div className="overview-row">
                  <span>Contact:</span>
                  <strong>{complaint.email}</strong>
                </div>
                <div className="overview-row">
                  <span>Target Enterprise:</span>
                  <strong>{complaint.companyName}</strong>
                </div>
                {complaint.orderOrTransactionId && (
                  <div className="overview-row">
                    <span>Order / Ref ID:</span>
                    <strong>{complaint.orderOrTransactionId}</strong>
                  </div>
                )}
                <div className="overview-row">
                  <span>Evidence Files:</span>
                  <strong>
                    {complaint.attachments?.length > 0 ? (
                      <span className="evidence-tag">
                        <FaPaperclip /> {complaint.attachments.length} attached
                      </span>
                    ) : (
                      "None"
                    )}
                  </strong>
                </div>

                {/* QR Code Verification Badge */}
                {qrCodeDataUrl && (
                  <div className="overview-qr-card">
                    <img src={qrCodeDataUrl} alt="Case QR Code" className="overview-qr-img" />
                    <div className="overview-qr-text">
                      <strong><FaQrcode /> Scan to Verify</strong>
                      <span>Digitally validated docket record</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enterprise Settlement Record (if resolved) */}
            {complaint.companyResolution && (
              <div className="settlement-record-card">
                <div className="settlement-header">
                  <FaCheckCircle className="settlement-icon" />
                  <div>
                    <h4>Enterprise Settlement Record</h4>
                    <p>Submitted by {complaint.companyName} Grievance Desk</p>
                  </div>
                </div>

                <div className="settlement-data-grid">
                  <div>
                    <span className="data-label">Action Taken:</span>
                    <strong className="data-val text-teal">{complaint.companyResolution.actionTaken}</strong>
                  </div>
                  {complaint.companyResolution.refundAmount && (
                    <div>
                      <span className="data-label">Refund / Settlement:</span>
                      <strong className="data-val text-teal">₹{complaint.companyResolution.refundAmount}</strong>
                    </div>
                  )}
                  {complaint.companyResolution.referenceNumber && (
                    <div>
                      <span className="data-label">Bank UTR / Ref:</span>
                      <strong className="data-val">{complaint.companyResolution.referenceNumber}</strong>
                    </div>
                  )}
                </div>

                {complaint.companyResolution.resolutionNotes && (
                  <div className="settlement-notes">
                    <strong>Settlement Remarks:</strong>
                    <p>&ldquo;{complaint.companyResolution.resolutionNotes}&rdquo;</p>
                  </div>
                )}

                <div style={{ marginTop: 14 }}>
                  <button
                    type="button"
                    className="btn-cert-download"
                    onClick={() => generateResolutionCertificatePdf(complaint)}
                  >
                    <FaFilePdf /> Download Resolution Record (PDF)
                  </button>
                </div>
              </div>
            )}

            {/* 5-Star Citizen Rating Widget for Resolved cases */}
            {complaint.status === "Resolved" && (
              <div className="citizen-rating-card">
                <div className="rating-header">
                  <FaStar className="rating-star-icon" />
                  <div>
                    <h4>Rate Enterprise Redressal Experience</h4>
                    <p>Your rating contributes to the quarterly public Brand Benchmark Index for {complaint.companyName}.</p>
                  </div>
                </div>
                {ratingSubmitted ? (
                  <div className="rating-success-msg">
                    <FaCheckCircle className="rating-check" />
                    <div>
                      <strong>Feedback Recorded ({userRating} ★)</strong>
                      <p>Thank you. Your feedback has been included in the community redressal score for {complaint.companyName}.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleRatingSubmit} className="rating-form">
                    <div className="star-rating-row">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`star-btn ${star <= userRating ? "active" : ""}`}
                          onClick={() => setUserRating(star)}
                        >
                          <FaStar />
                        </button>
                      ))}
                      <span className="rating-score-label">
                        {userRating === 5 ? "5/5 — Excellent & Fast" : userRating === 4 ? "4/5 — Good Resolution" : userRating === 3 ? "3/5 — Satisfactory" : userRating === 2 ? "2/5 — Delayed" : "1/5 — Poor Experience"}
                      </span>
                    </div>
                    <div className="rating-input-row">
                      <input
                        type="text"
                        placeholder="Optional remarks on resolution speed, refund clarity, or officer assistance..."
                        value={ratingFeedback}
                        onChange={(e) => setRatingFeedback(e.target.value)}
                      />
                      <button type="submit" className="btn-submit-rating" disabled={ratingSubmitting}>
                        {ratingSubmitting ? "Submitting..." : "Submit Rating"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Statutory Legal Escalation Card */}
            <div className="statutory-escalation-card">
              <div className="escalation-header">
                <FaGavel className="gavel-icon" />
                <div>
                  <h4>Statutory Legal Escalation & Formal Pre-Filing Dossier</h4>
                  <p>Compile a formal legal affidavit and complaint packet under the Consumer Protection Act, 2019 for official Government redressal.</p>
                </div>
              </div>
              <div className="escalation-body">
                <div className="escalation-channels">
                  <div className="esc-channel">
                    <strong>1. National Consumer Helpline (NCH 1915)</strong>
                    <span>Toll-Free 1915 • Official fast-track conciliation portal</span>
                    <a href="https://consumerhelpline.gov.in" target="_blank" rel="noopener noreferrer">
                      consumerhelpline.gov.in <FaExternalLinkAlt style={{ fontSize: 9 }} />
                    </a>
                  </div>
                  <div className="esc-channel court">
                    <strong>2. e-Daakhil Online Consumer Court</strong>
                    <span>Online filing before District & State Consumer Commission under CPA 2019</span>
                    <a href="https://edaakhil.nic.in" target="_blank" rel="noopener noreferrer">
                      edaakhil.nic.in <FaExternalLinkAlt style={{ fontSize: 9 }} />
                    </a>
                  </div>
                </div>

                {/* India Post Speed Post Tracking Endorsement */}
                <div className="speed-post-box">
                  <div className="speed-post-title">
                    <FaEnvelope /> <strong>India Post Speed Post Tracking Endorsement:</strong>
                  </div>
                  <div className="speed-post-input-row">
                    <input
                      type="text"
                      placeholder="e.g. EM123456789IN (Speed Post Consignment #)"
                      value={speedPostNo}
                      onChange={(e) => setSpeedPostNo(e.target.value.toUpperCase())}
                      maxLength={15}
                    />
                    <a
                      href={`https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-track-postal"
                    >
                      Track on India Post <FaExternalLinkAlt style={{ fontSize: 9 }} />
                    </a>
                  </div>
                  <small className="speed-post-hint">Record postal consignment numbers to prove statutory notice delivery before consumer commissions.</small>
                </div>

                <div className="escalation-action-row">
                  <button
                    type="button"
                    className="btn-edaakhil-export"
                    onClick={() => setShowEDaakhilModal(true)}
                  >
                    <FaGavel /> 1-Click e-Daakhil Court Petition (PDF)
                  </button>
                  <button
                    type="button"
                    className="btn-statutory-download"
                    onClick={() => generateStatutoryEscalationPdf(complaint)}
                  >
                    <FaFilePdf /> Export Statutory Escalation Packet (PDF)
                  </button>
                  <button
                    type="button"
                    className="btn-legal-notice-download"
                    onClick={() => generatePreLitigationLegalNoticePdf(complaint)}
                  >
                    <FaFilePdf /> 15-Day Pre-Litigation Demand Notice (PDF)
                  </button>
                  <button
                    type="button"
                    className="btn-open-court-calc"
                    onClick={() => setShowCourtCalculator(true)}
                  >
                    <FaCalculator /> Check Court Fee & Jurisdiction
                  </button>
                </div>
              </div>
            </div>

            {/* Digital Verification QR Authentication Card */}
            {qrCodeDataUrl && (
              <div className="digital-qr-card">
                <div className="qr-image-wrap">
                  <img src={qrCodeDataUrl} alt="Digital Verification QR" className="docket-qr-img" />
                </div>
                <div className="qr-info-wrap">
                  <div className="qr-secure-tag">
                    <FaShieldAlt /> 100% Tamper-Proof Digital Verification
                  </div>
                  <h4>Statutory Docket Authentication Seal</h4>
                  <p>
                    Scan this QR code with any smartphone camera to instantly verify live case milestones, nodal dispatch logs, and statutory notices on the official Consumer Trust Registry.
                  </p>
                  <code className="qr-target-url">
                    {window.location.origin}/track?id={complaint.complaintId}
                  </code>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="case-actions-bar">
              <a
                href={getWhatsAppShareUrl(complaint)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-action-whatsapp"
                title="Share case details and tracking link via WhatsApp"
              >
                <FaWhatsapp className="btn-icon-wa" /> Share Case via WhatsApp
              </a>
              <button
                type="button"
                className="btn-action-edaakhil"
                onClick={() => setShowEDaakhilModal(true)}
              >
                <FaGavel /> e-Daakhil Court Petition
              </button>
              <button
                type="button"
                className="btn-action-primary"
                onClick={() => generateGrievanceNoticePdf(complaint)}
              >
                <FaFilePdf /> Download Case Summary (PDF)
              </button>
              <button
                type="button"
                className="btn-action-secondary"
                onClick={() => window.print()}
              >
                <FaPrint /> Print Summary
              </button>
            </div>
          </div>
        )}

        {/* Modal: CPA 2019 Pecuniary Jurisdiction & Court Fee Calculator */}
        {showCourtCalculator && (
          <CourtFeeCalculator
            initialAmount={complaint?.claimAmount || 15000}
            onClose={() => setShowCourtCalculator(false)}
          />
        )}

        {/* Modal: 1-Click e-Daakhil Statutory Petition Export */}
        {showEDaakhilModal && complaint && (
          <EDaakhilExportModal
            complaint={complaint}
            onClose={() => setShowEDaakhilModal(false)}
          />
        )}
      </div>
    </div>
  );
}
