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
  FaTag,
  FaCalendarAlt,
  FaCopy,
  FaExclamationTriangle,
  FaSpinner,
  FaLock,
  FaInfoCircle,
  FaArrowLeft,
  FaKey,
  FaEnvelope,
} from "react-icons/fa";
import api from "../services/api";
import { generateGrievanceNoticePdf, generateResolutionCertificatePdf } from "../utils/pdfGenerator";
import "./TrackComplaint.css";

function TrackComplaint() {
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

  // If URL has ?id=, prefill docket input (do NOT auto-reveal data without auth/OTP)
  useEffect(() => {
    const idFromQuery = searchParams.get("id");
    if (idFromQuery) {
      setDocketInput(idFromQuery.trim().toUpperCase());
      // If user is logged in, attempt seamless lookup
      if (user) {
        initiateTracking(idFromQuery.trim().toUpperCase());
      }
    }
  }, [searchParams]);

  // Initiate Tracking Request
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
      const response = await api.post("/complaints/track/request-access", {
        complaintId: target,
      });

      if (response.data?.success) {
        if (response.data.authorized && response.data.complaint) {
          // Direct authorized access (signed-in owner or admin)
          setComplaint(response.data.complaint);
          if (response.data.trackToken) {
            sessionStorage.setItem("caseTrackToken", response.data.trackToken);
          }
        } else if (response.data.requiresOtp) {
          // Requires 2-factor OTP verification
          setOtpStep(true);
          setOtpTargetId(target);
          setMaskedEmail(response.data.maskedEmail || "your registered email");
          setOtpInput("");
        }
      } else {
        throw new Error(response.data?.message || "We could not find a matching case.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "We could not find a matching case. Please check your Docket ID or sign in to view your cases."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    initiateTracking(docketInput);
  };

  // Verify OTP to reveal Case Details
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpInput || otpInput.trim().length < 6) {
      setOtpError("Please enter the complete 6-digit verification code.");
      return;
    }

    setOtpLoading(true);
    setOtpError("");

    try {
      const response = await api.post("/complaints/track/verify-otp", {
        complaintId: otpTargetId,
        otp: otpInput.trim(),
      });

      if (response.data?.success && response.data.complaint) {
        setComplaint(response.data.complaint);
        setOtpStep(false);
        if (response.data.trackToken) {
          sessionStorage.setItem("caseTrackToken", response.data.trackToken);
        }
      } else {
        throw new Error(response.data?.message || "Invalid verification code.");
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
      setOtpError("");
      alert(`A fresh verification code has been dispatched to ${maskedEmail}.`);
    } catch (err) {
      setOtpError("Failed to resend verification code. Please try again in a moment.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleCopyId = () => {
    if (complaint?.complaintId) {
      navigator.clipboard.writeText(complaint.complaintId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 3000);
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
    <div className="track-page-wrapper">
      <div className="track-content-card">
        {/* Top Disclaimer Strip */}
        <div className="track-disclaimer-strip">
          <FaInfoCircle className="disclaimer-icon" />
          <span>
            <strong>Independent Platform Notice:</strong> Consumer Trust Portal is an independent dispute facilitation service. We are not a government court or statutory regulator.
          </span>
        </div>

        {/* 1. INITIAL CLEAN SEARCH STATE */}
        {!complaint && !otpStep && (
          <div className="track-initial-state">
            <div className="track-header-badge">
              <FaLock /> Protected Case Tracking
            </div>
            <h1 className="track-title">Track Grievance Status</h1>
            <p className="track-subtitle">
              Enter your unique Grievance Docket Number to view live investigation milestones, enterprise responses, and resolution records.
            </p>

            {error && (
              <div className="track-alert-banner">
                <FaExclamationTriangle className="alert-icon" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSearchSubmit} className="track-search-box">
              <div className="track-input-group">
                <FaSearch className="search-input-icon" />
                <input
                  type="text"
                  placeholder="Enter Docket ID (e.g. CT-2026-89412)..."
                  value={docketInput}
                  onChange={(e) => {
                    setDocketInput(e.target.value);
                    setError("");
                  }}
                  required
                  autoFocus
                />
              </div>
              <button type="submit" className="track-submit-btn" disabled={loading}>
                {loading ? <FaSpinner className="spin" /> : "Track Case"}
              </button>
            </form>

            {/* Guidance & Privacy Info */}
            <div className="track-guidance-grid">
              <div className="guidance-card">
                <h4>📌 Where to find your Docket ID?</h4>
                <ul>
                  <li>On your printed Grievance Acknowledgment slip.</li>
                  <li>In the confirmation email sent to your registered inbox.</li>
                  <li>In your SMS notification (Format: <code>CT-2026-XXXXX</code>).</li>
                </ul>
              </div>

              <div className="guidance-card privacy">
                <h4>🛡️ Multi-Factor Privacy Safeguard</h4>
                <p>
                  To protect citizen privacy, case records and personal details are accessible only through authenticated accounts or two-factor verification sent to the registered contact on file.
                </p>
                {!user && (
                  <p className="sign-in-prompt">
                    Have an account? <Link to="/login">Sign In</Link> to view all your registered cases directly.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. OTP VERIFICATION STEP */}
        {otpStep && !complaint && (
          <div className="track-otp-card">
            <div className="track-header-badge">
              <FaKey /> Identity Verification Required
            </div>
            <h2 className="otp-heading">Verify Case Access</h2>
            <p className="otp-desc">
              A 6-digit verification code has been dispatched to <strong>{maskedEmail}</strong> to protect case privacy. Enter the code below to reveal your grievance milestones.
            </p>

            {otpError && (
              <div className="track-alert-banner">
                <FaExclamationTriangle className="alert-icon" />
                <span>{otpError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="otp-form">
              <div className="otp-input-wrap">
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

              <div className="otp-actions-row">
                <button type="submit" className="otp-verify-btn" disabled={otpLoading}>
                  {otpLoading ? <FaSpinner className="spin" /> : "Verify & Reveal Case"}
                </button>
                <button
                  type="button"
                  className="otp-resend-btn"
                  onClick={handleResendOtp}
                  disabled={otpLoading}
                >
                  Resend Code
                </button>
                <button
                  type="button"
                  className="otp-cancel-btn"
                  onClick={handleResetSearch}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 3. AUTHORIZED CASE TIMELINE DISPLAY */}
        {complaint && (
          <div className="track-authorized-view">
            {/* Top Bar with Back Action */}
            <div className="case-top-bar">
              <button type="button" className="back-to-search-btn" onClick={handleResetSearch}>
                <FaArrowLeft /> Track Another Case
              </button>
              <div className="case-id-tag">
                <span>Docket: </span>
                <strong>#{complaint.complaintId}</strong>
                <button
                  type="button"
                  className="copy-mini-btn"
                  onClick={handleCopyId}
                  title="Copy Docket ID"
                >
                  <FaCopy /> {copiedId ? "Copied!" : ""}
                </button>
              </div>
            </div>

            {/* Main Docket Summary Header */}
            <div className="case-header-card">
              <div className="case-header-left">
                <span className="case-category-tag">{complaint.category || "General Dispute"}</span>
                <h2 className="case-subject-title">{complaint.subject}</h2>
                <div className="case-meta-tags">
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

              <div className="case-header-right">
                <div className={`case-status-badge ${statusSlug}`}>
                  <span className="status-dot"></span>
                  {complaint.status}
                </div>
              </div>
            </div>

            {/* 4-Stage Visual Redressal Milestone Stepper */}
            <div className="milestone-stepper-card">
              <div className="stepper-header">
                <h3><FaClock /> Grievance Facilitation Timeline</h3>
                <span className="stepper-active-indicator">● Active Milestone</span>
              </div>

              {complaint.status === "Rejected" ? (
                <div className="rejected-state-box">
                  <FaTimesCircle className="rejected-icon" />
                  <div>
                    <strong>Case Closed without Settlement</strong>
                    <p>{complaint.adminRemarks || "The claim could not be substantiated or was closed by the enterprise."}</p>
                  </div>
                </div>
              ) : (
                <div className="stepper-stages-grid">
                  <div className={`stepper-stage ${activeMilestone >= 1 ? "done" : ""}`}>
                    <div className="stage-icon-wrap">
                      {activeMilestone > 1 ? <FaCheckCircle /> : "1"}
                    </div>
                    <div className="stage-text">
                      <strong>Grievance Logged</strong>
                      <span>Timestamped & Docketed</span>
                    </div>
                  </div>

                  <div className={`stepper-stage ${activeMilestone >= 2 ? "done" : ""}`}>
                    <div className="stage-icon-wrap">
                      {activeMilestone > 2 ? <FaCheckCircle /> : "2"}
                    </div>
                    <div className="stage-text">
                      <strong>Nodal Dispatch</strong>
                      <span>Routed to {complaint.companyName}</span>
                    </div>
                  </div>

                  <div className={`stepper-stage ${activeMilestone >= 3 ? "done" : ""}`}>
                    <div className="stage-icon-wrap">
                      {activeMilestone > 3 ? <FaCheckCircle /> : "3"}
                    </div>
                    <div className="stage-text">
                      <strong>Inquiry & Review</strong>
                      <span>Enterprise mediation</span>
                    </div>
                  </div>

                  <div className={`stepper-stage ${activeMilestone >= 4 ? "done" : ""}`}>
                    <div className="stage-icon-wrap">
                      {activeMilestone >= 4 ? <FaCheckCircle /> : "4"}
                    </div>
                    <div className="stage-text">
                      <strong>Resolution</strong>
                      <span>{complaint.status === "Resolved" ? "Settled & Closed" : "Pending Action"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Case Narrative & Evidence */}
            <div className="case-details-grid">
              <div className="case-narrative-card">
                <h4>Claim Narrative</h4>
                <div className="narrative-content">
                  {complaint.description}
                </div>
              </div>

              <div className="case-sidebar-card">
                <h4>Case Overview</h4>
                <div className="overview-item">
                  <span className="label">Complainant:</span>
                  <span className="val">{complaint.name}</span>
                </div>
                <div className="overview-item">
                  <span className="label">Contact Email:</span>
                  <span className="val">{complaint.email}</span>
                </div>
                <div className="overview-item">
                  <span className="label">Disputed Enterprise:</span>
                  <span className="val">{complaint.companyName}</span>
                </div>
                {complaint.orderOrTransactionId && (
                  <div className="overview-item">
                    <span className="label">Order / Ref #:</span>
                    <span className="val">{complaint.orderOrTransactionId}</span>
                  </div>
                )}
                <div className="overview-item">
                  <span className="label">Evidence Files:</span>
                  <span className="val">
                    {complaint.attachments?.length > 0 ? (
                      <span className="evidence-chip">
                        <FaPaperclip /> {complaint.attachments.length} attached
                      </span>
                    ) : (
                      "None"
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Enterprise Settlement Record (if resolved) */}
            {complaint.companyResolution && (
              <div className="resolution-settlement-card">
                <div className="resolution-card-header">
                  <FaCheckCircle className="res-icon" />
                  <div>
                    <h4>Enterprise Settlement Record</h4>
                    <p>Resolution submitted by {complaint.companyName} Grievance Desk</p>
                  </div>
                </div>

                <div className="settlement-details-row">
                  <div>
                    <span className="s-label">Action Taken:</span>
                    <strong className="s-val text-green">{complaint.companyResolution.actionTaken}</strong>
                  </div>
                  {complaint.companyResolution.refundAmount && (
                    <div>
                      <span className="s-label">Refund / Settlement:</span>
                      <strong className="s-val text-green">₹{complaint.companyResolution.refundAmount}</strong>
                    </div>
                  )}
                  {complaint.companyResolution.referenceNumber && (
                    <div>
                      <span className="s-label">Bank UTR / Tracking:</span>
                      <strong className="s-val">{complaint.companyResolution.referenceNumber}</strong>
                    </div>
                  )}
                </div>

                {complaint.companyResolution.resolutionNotes && (
                  <div className="settlement-notes-box">
                    <strong>Settlement Remarks:</strong>
                    <p>&ldquo;{complaint.companyResolution.resolutionNotes}&rdquo;</p>
                  </div>
                )}

                <div style={{ marginTop: 14 }}>
                  <button
                    type="button"
                    className="download-cert-btn"
                    onClick={() => generateResolutionCertificatePdf(complaint)}
                  >
                    <FaFilePdf /> Download Settlement Certificate (PDF)
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="case-actions-footer">
              <button
                type="button"
                className="pdf-btn"
                onClick={() => generateGrievanceNoticePdf(complaint)}
              >
                <FaFilePdf /> Download Claim Summary (PDF)
              </button>
              <button
                type="button"
                className="print-btn"
                onClick={() => window.print()}
              >
                <FaPrint /> Print Slip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrackComplaint;
