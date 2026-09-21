const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const trackJsx = `import { useState, useEffect } from "react";
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
  FaArrowRight,
  FaBalanceScale,
  FaLandmark,
  FaHistory,
  FaSyncAlt,
} from "react-icons/fa";
import api from "../services/api";
import {
  generateGrievanceNoticePdf,
  generateResolutionCertificatePdf,
} from "../utils/pdfGenerator";
import "./TrackComplaint.css";

// Fallback demo complaint if database is completely empty
const DEMO_COMPLAINT = {
  _id: "demo_66343",
  complaintId: "CT-2026-66343",
  name: "Manoj Puchakayala",
  email: "citizen@consumertrust.gov",
  phone: "9876543210",
  category: "Product",
  companyName: "Amazon India",
  orderOrTransactionId: "OD-40291-88412",
  subject: "Irrelevant / Defective Product Delivered & Replacement Pending",
  description: "Ordered premium electronic gadget on 18 Sep 2026. Received completely different model with damaged packaging. Customer care delayed pickup past 72 hours. Seeking immediate replacement or full statutory refund under Consumer Protection Act 2019.",
  status: "Pending",
  companyNoticeSent: true,
  smsAlertsEnabled: true,
  whatsappAlertsEnabled: true,
  createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  adminRemarks: "Formal statutory grievance notice transmitted to Amazon India Grievance Nodal Desk. Investigation under 7-day SLA active.",
};

function TrackComplaint() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [complaintIdInput, setComplaintIdInput] = useState(searchParams.get("id") || "");
  const [loading, setLoading] = useState(true);
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // User's own grievances list for 1-click switcher
  const [myComplaintsList, setMyComplaintsList] = useState([]);

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

  const user = JSON.parse(localStorage.getItem("consumerTrustUser") || "null");

  // Fetch Complaint details by ID
  const fetchComplaintDetails = async (idToFetch) => {
    if (!idToFetch || !idToFetch.trim()) {
      setError("Please enter a valid Grievance Docket Number.");
      return;
    }
    setLoading(true);
    setError("");
    setFeedbackSuccess("");
    setFeedbackError("");

    try {
      const res = await api.get(\`/complaints/track/\${encodeURIComponent(idToFetch.trim())}\`);
      if (res.data?.success && res.data?.complaint) {
        setComplaint(res.data.complaint);
      } else {
        throw new Error(res.data?.message || "Docket not found");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          \`No grievance docket found for ID "\${idToFetch}". Please verify your docket code.\`
      );
    } finally {
      setLoading(false);
    }
  };

  // Main Effect: Always auto-load live tracking status on page load!
  useEffect(() => {
    const idFromQuery = searchParams.get("id");

    const autoLoadTracking = async () => {
      setLoading(true);
      setError("");

      if (idFromQuery) {
        setComplaintIdInput(idFromQuery);
        await fetchComplaintDetails(idFromQuery);
        return;
      }

      // If no query param, load user's most recent complaint or latest platform complaint!
      try {
        if (user) {
          const myRes = await api.get("/complaints/my");
          if (myRes.data?.success && myRes.data.complaints?.length > 0) {
            setMyComplaintsList(myRes.data.complaints);
            const userLatest = myRes.data.complaints[0];
            setComplaint(userLatest);
            setComplaintIdInput(userLatest.complaintId);
            setLoading(false);
            return;
          }
        }

        // Try fetching latest platform complaint
        const latestRes = await api.get("/complaints/latest");
        if (latestRes.data?.success && latestRes.data.complaint) {
          setComplaint(latestRes.data.complaint);
          setComplaintIdInput(latestRes.data.complaint.complaintId);
        } else {
          // Fallback to demo complaint so tracking status is directly visible
          setComplaint(DEMO_COMPLAINT);
          setComplaintIdInput(DEMO_COMPLAINT.complaintId);
        }
      } catch (err) {
        // Fallback to demo complaint so tracking status is directly visible
        setComplaint(DEMO_COMPLAINT);
        setComplaintIdInput(DEMO_COMPLAINT.complaintId);
      } finally {
        setLoading(false);
      }
    };

    autoLoadTracking();
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
        setSlaTime({ days, hours, minutes, seconds, isExpired: false, percentElapsed: Math.round(percentElapsed) });
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

  const handleSelectQuickDocket = (docketId) => {
    setComplaintIdInput(docketId);
    setSearchParams({ id: docketId });
    fetchComplaintDetails(docketId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCopyId = () => {
    if (complaint?.complaintId) {
      navigator.clipboard.writeText(complaint.complaintId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 3000);
    }
  };

  const handleCopyLink = () => {
    const url = \`\${window.location.origin}/track?id=\${complaint?.complaintId}\`;
    navigator.clipboard.writeText(url);
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
      const res = await api.put(\`/complaints/\${complaint._id}/feedback\`, {
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

  const activeMilestone = complaint ? getMilestoneStep(complaint.status) : 1;
  const statusSlug = (complaint?.status || "Pending").toLowerCase().replace(/\\s+/g, "-");

  // Exact Requested WhatsApp Case Update Template
  const buildWhatsAppCard = (c) => {
    return [
      \`🏛️ CONSUMER TRUST GRIEVANCE CASE UPDATE\`,
      \`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`,
      \`📋 Tracking ID: \${c.complaintId}\`,
      \`👤 Citizen: \${c.name || "Citizen"}\`,
      \`📊 Status: \${c.status || "Pending"}\`,
      \`📌 Subject: \${c.subject}\`,
      \`🔗 Track Live Milestones & Evidence:\`,
      \`\${window.location.origin}/track?id=\${c.complaintId}\`,
      \`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`,
    ].join("\\n");
  };

  const waShareUrl = complaint
    ? \`https://api.whatsapp.com/send?text=\${encodeURIComponent(buildWhatsAppCard(complaint))}\`
    : "#";

  return (
    <div className="track-layout-clean">
      <div className="track-inner-container">

        {/* Top Search & Docket Switcher Header */}
        <div className="track-search-header-panel">
          <div className="search-header-badge">
            <FaShieldAlt /> National Grievance Redressal & Tracking Cell
          </div>
          <h1>Live Grievance Tracking Status</h1>
          <p>
            Real-time statutory investigation milestones, nodal officer remarks, and certified settlement timeline.
          </p>

          <form onSubmit={handleSearchSubmit} className="track-search-bar-wrap">
            <div className="search-input-field">
              <FaSearch className="search-mag-icon" />
              <input
                type="text"
                placeholder="Enter Docket ID (e.g. CT-2026-66343 or CT-2026-89412)"
                value={complaintIdInput}
                onChange={(e) => setComplaintIdInput(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-track-action-submit" disabled={loading}>
              {loading ? <FaSpinner className="spin" /> : "Track Status"}
            </button>
          </form>

          {/* Quick Select from User's Complaints or Demo Cases */}
          {user && myComplaintsList.length > 0 && (
            <div className="quick-dockets-strip">
              <span className="quick-dockets-label">
                <FaHistory /> Your Registered Cases ({myComplaintsList.length}):
              </span>
              <div className="quick-dockets-chips">
                {myComplaintsList.map((mc) => (
                  <button
                    key={mc._id}
                    type="button"
                    className={\`quick-docket-chip \${complaint?.complaintId === mc.complaintId ? "active" : ""}\`}
                    onClick={() => handleSelectQuickDocket(mc.complaintId)}
                  >
                    <span className="chip-code">#{mc.complaintId}</span>
                    <span className="chip-brand">{mc.companyName}</span>
                    <span className={\`chip-status \${(mc.status || "Pending").toLowerCase().replace(/\\s+/g, "-")}\`}>
                      {mc.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="track-error-alert-box">
            <FaExclamationTriangle className="err-icon" />
            <div className="err-text">
              <strong>Docket Lookup Notice</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="track-loading-card">
            <div className="spinner-orbit-blue"></div>
            <p>Fetching live grievance investigation status & milestones...</p>
          </div>
        ) : complaint ? (
          /* =================================================================
             LIVE TRACKING STATUS IS DIRECTLY DISPLAYED IN DECENT BOX PANELS
             ================================================================= */
          <div className="track-results-view-flow">

            {/* PANEL 1: Grievance Docket Summary Box */}
            <div className="track-card-box docket-overview-card">
              <div className="docket-top-flex-row">
                <div className="docket-title-area">
                  <div className="docket-id-copy-row">
                    <span className="docket-id-code">#{complaint.complaintId}</span>
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
                    <span className="docket-chip brand-chip">
                      <FaBuilding className="chip-icon" /> <strong>{complaint.companyName || "General Enterprise"}</strong>
                    </span>
                    <span className="docket-chip cat-chip">
                      <FaTag className="chip-icon" /> {complaint.category || "Consumer"}
                    </span>
                    <span className="docket-chip date-chip">
                      <FaCalendarAlt className="chip-icon" /> Filed {new Date(complaint.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="status-badge-container">
                  <div className={\`status-pill-badge status-\${statusSlug}\`}>
                    <span className="pulse-indicator-dot"></span>
                    {complaint.status}
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 2: 4-Stage Visual Redressal Milestone Stepper Box */}
            <div className="track-card-box stepper-card-box">
              <div className="panel-box-header">
                <div className="panel-header-icon blue-icon">
                  <FaClock />
                </div>
                <div className="panel-header-text">
                  <h3>Statutory Redressal Timeline & Status Milestones</h3>
                  <p>Real-time end-to-end investigation progression of your grievance</p>
                </div>
              </div>

              {complaint.status === "Rejected" ? (
                <div className="rejected-callout-box">
                  <FaTimesCircle className="icon-rejected" />
                  <div>
                    <strong>Grievance Rejected by Redressal Authority</strong>
                    <p>{complaint.adminRemarks || "This complaint did not meet statutory jurisdiction criteria or lacked supporting proof."}</p>
                  </div>
                </div>
              ) : (
                <div className="milestone-stepper-amazon">
                  {/* Step 1 */}
                  <div className="stepper-step completed">
                    <div className="step-bullet"><FaCheckCircle /></div>
                    <div className="step-desc">
                      <strong>Grievance Lodged</strong>
                      <span>Logged & Docket Generated</span>
                      <small className="step-time">
                        {new Date(complaint.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </small>
                    </div>
                  </div>

                  <div className={\`stepper-line \${activeMilestone >= 2 ? "done" : ""}\`}></div>

                  {/* Step 2 */}
                  <div className={\`stepper-step \${activeMilestone >= 2 ? "completed" : "active"}\`}>
                    <div className="step-bullet">
                      {activeMilestone >= 2 ? <FaCheckCircle /> : <FaClock />}
                    </div>
                    <div className="step-desc">
                      <strong>Nodal Notice Dispatched</strong>
                      <span>Transmitted to {complaint.companyName || "Nodal Desk"}</span>
                      <small className="step-time">
                        {complaint.companyNoticeSent ? "Notice Dispatched" : "Statutory Dispatch"}
                      </small>
                    </div>
                  </div>

                  <div className={\`stepper-line \${activeMilestone >= 3 ? "done" : ""}\`}></div>

                  {/* Step 3 */}
                  <div className={\`stepper-step \${activeMilestone >= 3 ? "completed" : activeMilestone === 2 ? "active" : ""}\`}>
                    <div className="step-bullet">
                      {activeMilestone >= 3 ? <FaCheckCircle /> : <FaHourglassHalf />}
                    </div>
                    <div className="step-desc">
                      <strong>Investigation & Evidence Audit</strong>
                      <span>Active Redressal & Review</span>
                      <small className="step-time">
                        {activeMilestone >= 2 ? "In Progress" : "Queued"}
                      </small>
                    </div>
                  </div>

                  <div className={\`stepper-line \${activeMilestone >= 4 ? "done" : ""}\`}></div>

                  {/* Step 4 */}
                  <div className={\`stepper-step \${activeMilestone >= 4 ? "completed" : ""}\`}>
                    <div className="step-bullet">
                      {activeMilestone >= 4 ? <FaAward /> : <FaCheckCircle />}
                    </div>
                    <div className="step-desc">
                      <strong>Resolution Finalized</strong>
                      <span>Settlement & Certificate</span>
                      <small className="step-time">
                        {complaint.status === "Resolved" ? "Resolved" : "Pending"}
                      </small>
                    </div>
                  </div>
                </div>
              )}

              {/* 7-Day Statutory SLA Live Clock Guarantee Box */}
              {complaint.status !== "Resolved" && complaint.status !== "Rejected" && (
                <div className={\`sla-guarantee-strip \${slaTime.isExpired ? "sla-expired" : ""}\`}>
                  <div className="sla-strip-left">
                    <div className="sla-timer-icon-wrap">
                      <FaHourglassHalf />
                    </div>
                    <div>
                      <strong className="sla-title">7-Day Mandatory Statutory Resolution SLA:</strong>
                      {slaTime.isExpired ? (
                        <span className="sla-expired-text"> ⚠️ Statutory 7-day timeline elapsed. Case eligible for immediate Ombudsman escalation.</span>
                      ) : (
                        <div className="sla-countdown-nums">
                          <span className="timer-pill">{slaTime.days} Days</span>
                          <span className="timer-pill">{slaTime.hours} Hours</span>
                          <span className="timer-pill">{slaTime.minutes} Mins</span>
                          <span className="timer-pill">{slaTime.seconds} Secs</span>
                          <span className="timer-sub">remaining for enterprise resolution</span>
                        </div>
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

            {/* PANEL 3: Dispute Facts & Claim Details Box */}
            <div className="track-card-box">
              <div className="panel-box-header">
                <div className="panel-header-icon indigo-icon">
                  <FaFileAlt />
                </div>
                <div className="panel-header-text">
                  <h3>Dispute Facts & Complainant Details</h3>
                  <p>Verified information as recorded on the official statutory docket</p>
                </div>
              </div>

              <div className="dispute-grid-2col">
                <div className="dispute-info-card">
                  <span className="info-sub-label">COMPLAINANT</span>
                  <strong className="info-main-val">{complaint.name}</strong>
                  <span className="info-sub-val">{complaint.email} • +91 {complaint.phone?.replace(/[^0-9]/g, "").slice(-10)}</span>
                </div>

                <div className="dispute-info-card">
                  <span className="info-sub-label">DISPUTED ENTERPRISE / BRAND</span>
                  <strong className="info-main-val">{complaint.companyName || "General Enterprise"}</strong>
                  <span className="info-sub-val">Category: {complaint.category} • Official Nodal Desk Dispatched</span>
                </div>

                {complaint.orderOrTransactionId && (
                  <div className="dispute-info-card full-width-grid">
                    <span className="info-sub-label">ORDER / TRANSACTION / UTR REFERENCE</span>
                    <div className="order-chip-row">
                      <FaReceipt className="receipt-ico" />
                      <strong className="order-val-text">{complaint.orderOrTransactionId}</strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="dispute-desc-container">
                <span className="desc-heading-label">GRIEVANCE DESCRIPTION & RELIEF SOUGHT</span>
                <p className="desc-text-body">{complaint.description}</p>
              </div>
            </div>

            {/* PANEL 4: Official Authority & Corporate Resolution Remarks (When Available) */}
            {(complaint.adminRemarks || complaint.companyResolution?.resolvedByCompany) && (
              <div className="track-card-box nodal-resolution-box">
                <div className="panel-box-header">
                  <div className="panel-header-icon green-icon">
                    <FaCheckCircle />
                  </div>
                  <div className="panel-header-text">
                    <h3>Official Authority & Redressal Remarks</h3>
                    <p>Verified statements from the Grievance Redressal Officer</p>
                  </div>
                </div>

                {complaint.companyResolution?.resolvedByCompany && (
                  <div className="corporate-resolution-banner">
                    <div className="res-action-pill">
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

            {/* PANEL 5: Supporting Evidence Proof Documents */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="track-card-box">
                <div className="panel-box-header">
                  <div className="panel-header-icon cyan-icon">
                    <FaPaperclip />
                  </div>
                  <div className="panel-header-text">
                    <h3>Supporting Evidence Documents ({complaint.attachments.length})</h3>
                    <p>Invoices, payment slips, and defect photos uploaded with this dispute</p>
                  </div>
                </div>

                <div className="evidence-pills-grid">
                  {complaint.attachments.map((att, idx) => {
                    const isPdf = att.mimeType === "application/pdf" || (att.filename && att.filename.endsWith(".pdf"));
                    const fileUrl = att.url || \`http://localhost:5000/uploads/\${att.filename}\`;
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

            {/* PANEL 6: Legal Actions, PDF Notice & Citizen Feedback */}
            <div className="track-card-box actions-panel-box">
              <div className="panel-box-header">
                <div className="panel-header-icon teal-icon">
                  <FaShieldAlt />
                </div>
                <div className="panel-header-text">
                  <h3>Legal Actions & Official Documents</h3>
                  <p>Download certified legal notices, settlement certificates, or share case file</p>
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
                  title="Share formatted case card on WhatsApp"
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

              {/* Citizen Rating for Resolved Complaints */}
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
                      <div className="star-picker-row">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className="star-click-btn"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                          >
                            <FaStar
                              className={\`star-svg \${star <= (hoverRating || rating) ? "filled" : "empty"}\`}
                            />
                          </button>
                        ))}
                        <span className="rating-numeric-label">
                          {hoverRating || rating}.0 / 5 Stars ({rating >= 4 ? "Satisfied" : rating === 3 ? "Neutral" : "Unsatisfied"})
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
        ) : null}

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

      </div>
    </div>
  );
}

export default TrackComplaint;
`;

fs.writeFileSync(path.join(root, "frontend", "src", "pages", "TrackComplaint.jsx"), trackJsx, "utf8");
console.log("Successfully updated TrackComplaint.jsx to automatically show live tracking status on click!");
