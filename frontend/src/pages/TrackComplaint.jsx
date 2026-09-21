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
} from "react-icons/fa";
import api from "../services/api";
import { generateGrievanceNoticePdf, generateResolutionCertificatePdf } from "../utils/pdfGenerator";
import { getWhatsAppShareUrl } from "../utils/whatsappShare";
import "./TrackComplaint.css";

export default function TrackComplaint() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Verification State - Clean empty state on load
  const [docketInput, setDocketInput] = useState("");
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(false);

  // OTP Verification Flow State
  const [otpStep, setOtpStep] = useState(false);
  const [otpTargetId, setOtpTargetId] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  const user = JSON.parse(localStorage.getItem("consumerTrustUser") || "null");

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
      </div>
    </div>
  );
}
