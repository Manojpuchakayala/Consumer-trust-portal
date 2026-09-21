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
  FaWhatsapp,
  FaCopy,
  FaExternalLinkAlt,
  FaHourglassHalf,
  FaExclamationTriangle,
  FaReceipt,
  FaCalendarAlt,
  FaTag,
  FaAward,
  FaSpinner,
  FaTimesCircle,
  FaHistory,
  FaLock,
  FaInfoCircle,
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

  // User's own grievances list for 1-click switcher
  const [myComplaintsList, setMyComplaintsList] = useState([]);

  // Ombudsman Modal
  const [showEscalateModal, setShowEscalateModal] = useState(false);

  // SLA State (Target Benchmark)
  const [slaTime, setSlaTime] = useState({
    days: 7,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    percentElapsed: 0,
  });

  const user = JSON.parse(localStorage.getItem("consumerTrustUser") || "null");

  // Fetch user's registered grievances for quick track list if logged in
  useEffect(() => {
    if (user) {
      const fetchUserComplaints = async () => {
        try {
          const res = await api.get("/complaints/my");
          if (res.data?.success && res.data.complaints) {
            setMyComplaintsList(res.data.complaints);
          }
        } catch (err) {
          console.warn("Could not load user quick cases:", err.message);
        }
      };
      fetchUserComplaints();
    }
  }, []);

  // Fetch Complaint details by Docket ID (Protected with PII Masking)
  const fetchComplaintDetails = async (idToFetch) => {
    if (!idToFetch || !idToFetch.trim()) {
      setError("Please enter a valid Grievance Docket Number.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await api.get(\`/complaints/track/\${encodeURIComponent(idToFetch.trim())}\`);
      if (res.data?.success && res.data?.complaint) {
        setComplaint(res.data.complaint);
      } else {
        throw new Error(res.data?.message || "Docket not found");
      }
    } catch (err) {
      setComplaint(null);
      setError(
        err.response?.data?.message ||
          \`No grievance record found matching Docket ID "\${idToFetch}". Please verify the code on your submission receipt.\`
      );
    } finally {
      setLoading(false);
    }
  };

  // Main Effect: If id query param is present, fetch it; otherwise keep clean search view
  useEffect(() => {
    const idFromQuery = searchParams.get("id");
    if (idFromQuery) {
      setComplaintIdInput(idFromQuery);
      fetchComplaintDetails(idFromQuery);
    } else if (user && myComplaintsList.length > 0) {
      // If logged in and has complaints, automatically show their first case
      const first = myComplaintsList[0];
      setComplaintIdInput(first.complaintId);
      setComplaint(first);
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

  // WhatsApp Case Update Card
  const buildWhatsAppCard = (c) => {
    return [
      \`CONSUMER TRUST GRIEVANCE STATUS UPDATE\`,
      \`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`,
      \`Tracking ID: \${c.complaintId}\`,
      \`Status: \${c.status || "Pending"}\`,
      \`Subject: \${c.subject}\`,
      \`Track Live: \${window.location.origin}/track?id=\${c.complaintId}\`,
      \`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`,
      \`Notice: Independent consumer dispute assistance platform.\`,
    ].join("\\n");
  };

  const waShareUrl = complaint
    ? \`https://api.whatsapp.com/send?text=\${encodeURIComponent(buildWhatsAppCard(complaint))}\`
    : "#";

  return (
    <div className="track-layout-clean">
      <div className="track-inner-container">

        {/* Top Disclaimer Banner */}
        <div className="platform-transparency-banner">
          <FaInfoCircle className="info-ico" />
          <span>
            <strong>Independent Platform Notice:</strong> Consumer Trust Portal is an independent dispute facilitation service. We are not a court, government regulator, or statutory authority.
          </span>
        </div>

        {/* 1. Compact Search Bar & Docket Switcher */}
        <div className="track-search-bar-box">
          <form onSubmit={handleSearchSubmit} className="track-search-form">
            <div className="search-input-wrap">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Enter Docket ID (e.g. CT-2026-89412)..."
                value={complaintIdInput}
                onChange={(e) => setComplaintIdInput(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="track-submit-btn" disabled={loading}>
              {loading ? <FaSpinner className="spin" /> : "Track Docket"}
            </button>
          </form>

          {/* User's Registered Cases Quick Chips */}
          {user && myComplaintsList.length > 0 && (
            <div className="quick-cases-row">
              <span className="quick-cases-label">
                <FaHistory /> Your Filed Cases:
              </span>
              <div className="quick-chips-list">
                {myComplaintsList.map((mc) => (
                  <button
                    key={mc._id}
                    type="button"
                    className={\`quick-case-chip \${complaint?.complaintId === mc.complaintId ? "active" : ""}\`}
                    onClick={() => handleSelectQuickDocket(mc.complaintId)}
                  >
                    <span className="case-code">#{mc.complaintId}</span>
                    <span className="case-brand">{mc.companyName}</span>
                    <span className={\`case-badge \${(mc.status || "Pending").toLowerCase().replace(/\\s+/g, "-")}\`}>
                      {mc.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="track-error-box">
            <FaExclamationTriangle className="err-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* 2. Tracking System Panel */}
        {loading ? (
          <div className="tracking-loading-panel">
            <div className="spinner-blue"></div>
            <p>Retrieving grievance tracking milestones...</p>
          </div>
        ) : complaint ? (
          <div className="pure-tracking-system-panel">

            {/* Privacy Redaction Notice */}
            {!complaint.isAuthorizedViewer && (
              <div className="privacy-redaction-notice">
                <FaLock className="lock-ico" />
                <span>
                  <strong>Privacy Protected:</strong> Personal contact information is masked on public lookups. <Link to="/login">Sign in with the filing account</Link> to view unmasked details.
                </span>
              </div>
            )}

            {/* Top Docket Card */}
            <div className="tracking-top-card">
              <div className="tracking-top-left">
                <div className="tracking-docket-row">
                  <span className="tracking-docket-id">#{complaint.complaintId}</span>
                  <button
                    type="button"
                    className="copy-docket-btn"
                    onClick={handleCopyId}
                    title="Copy Docket ID"
                  >
                    <FaCopy /> {copiedId ? "Copied!" : "Copy"}
                  </button>
                </div>
                <h2 className="tracking-subject-title">{complaint.subject}</h2>
                <div className="tracking-tags-row">
                  <span className="tracking-tag brand">
                    <FaBuilding className="tag-icon" /> <strong>{complaint.companyName || "Enterprise"}</strong>
                  </span>
                  <span className="tracking-tag cat">
                    <FaTag className="tag-icon" /> {complaint.category || "General"}
                  </span>
                  <span className="tracking-tag date">
                    <FaCalendarAlt className="tag-icon" /> Filed {new Date(complaint.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="tracking-top-right">
                <div className={\`tracking-status-pill \${statusSlug}\`}>
                  <span className="status-pulse-dot"></span>
                  {complaint.status}
                </div>
              </div>
            </div>

            {/* 4-Stage Visual Redressal Milestone Stepper */}
            <div className="tracking-stepper-box">
              <div className="stepper-title-row">
                <div className="stepper-title-left">
                  <FaClock className="stepper-icon" />
                  <h3>Grievance Facilitation Timeline</h3>
                </div>
                <span className="stepper-live-badge">● Active Tracking</span>
              </div>

              {complaint.status === "Rejected" ? (
                <div className="stepper-rejected-box">
                  <FaTimesCircle className="rejected-icon" />
                  <div>
                    <strong>Case Closed without Resolution</strong>
                    <p>{complaint.adminRemarks || "This complaint could not be processed due to missing documentation or non-responsiveness."}</p>
                  </div>
                </div>
              ) : (
                <div className="milestone-stepper-grid">
                  {/* Step 1 */}
                  <div className="stepper-node completed">
                    <div className="node-circle"><FaCheckCircle /></div>
                    <div className="node-info">
                      <strong>Claim Registered</strong>
                      <span>Logged in Platform</span>
                      <small>{new Date(complaint.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</small>
                    </div>
                  </div>

                  <div className={\`node-connector \${activeMilestone >= 2 ? "active" : ""}\`}></div>

                  {/* Step 2 */}
                  <div className={\`stepper-node \${activeMilestone >= 2 ? "completed" : "current"}\`}>
                    <div className="node-circle">
                      {activeMilestone >= 2 ? <FaCheckCircle /> : <FaClock />}
                    </div>
                    <div className="node-info">
                      <strong>Facilitation Request Sent</strong>
                      <span>Transmitted to {complaint.companyName || "Company Desk"}</span>
                      <small>{complaint.companyNoticeSent ? "Notice Sent" : "Queued"}</small>
                    </div>
                  </div>

                  <div className={\`node-connector \${activeMilestone >= 3 ? "active" : ""}\`}></div>

                  {/* Step 3 */}
                  <div className={\`stepper-node \${activeMilestone >= 3 ? "completed" : activeMilestone === 2 ? "current" : ""}\`}>
                    <div className="node-circle">
                      {activeMilestone >= 3 ? <FaCheckCircle /> : <FaHourglassHalf />}
                    </div>
                    <div className="node-info">
                      <strong>Dispute Review</strong>
                      <span>Reviewing Evidence & Terms</span>
                      <small>{activeMilestone >= 2 ? "In Review" : "Pending"}</small>
                    </div>
                  </div>

                  <div className={\`node-connector \${activeMilestone >= 4 ? "active" : ""}\`}></div>

                  {/* Step 4 */}
                  <div className={\`stepper-node \${activeMilestone >= 4 ? "completed" : ""}\`}>
                    <div className="node-circle">
                      {activeMilestone >= 4 ? <FaAward /> : <FaCheckCircle />}
                    </div>
                    <div className="node-info">
                      <strong>Outcome Reached</strong>
                      <span>Settlement Summary</span>
                      <small>{complaint.status === "Resolved" ? "Settled" : "Pending"}</small>
                    </div>
                  </div>
                </div>
              )}

              {/* 7-Day Target Resolution SLA */}
              {complaint.status !== "Resolved" && complaint.status !== "Rejected" && (
                <div className={\`sla-clock-panel \${slaTime.isExpired ? "expired" : ""}\`}>
                  <div className="sla-clock-left">
                    <FaHourglassHalf className="sla-clock-icon" />
                    <div>
                      <strong className="sla-clock-title">Platform Service Standard Target (7 Days):</strong>
                      {slaTime.isExpired ? (
                        <span className="sla-clock-expired"> ⚠️ Target timeline exceeded. You may explore formal government escalation portals below.</span>
                      ) : (
                        <div className="sla-timer-values">
                          <span className="time-box">{slaTime.days}d</span> :
                          <span className="time-box">{slaTime.hours}h</span> :
                          <span className="time-box">{slaTime.minutes}m</span> :
                          <span className="time-box">{slaTime.seconds}s</span>
                          <span className="time-sub">target window remaining</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="escalate-btn"
                    onClick={() => setShowEscalateModal(true)}
                  >
                    <FaExternalLinkAlt /> Public Redressal Options
                  </button>
                </div>
              )}
            </div>

            {/* Case Facts & Tracking Summary */}
            <div className="tracking-facts-card">
              <div className="facts-grid">
                <div className="fact-item">
                  <span className="fact-label">COMPLAINANT</span>
                  <strong className="fact-val">{complaint.name}</strong>
                  <span className="fact-sub">{complaint.email} • {complaint.phone}</span>
                </div>

                <div className="fact-item">
                  <span className="fact-label">DISPUTED COMPANY</span>
                  <strong className="fact-val">{complaint.companyName || "General Enterprise"}</strong>
                  <span className="fact-sub">Category: {complaint.category}</span>
                </div>

                {complaint.orderOrTransactionId && (
                  <div className="fact-item full">
                    <span className="fact-label">TRANSACTION / REFERENCE ID</span>
                    <div className="order-tag">
                      <FaReceipt />
                      <strong>{complaint.orderOrTransactionId}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Grievance Description Snippet */}
              <div className="tracking-desc-box">
                <span className="desc-tag">DISPUTE SUMMARY</span>
                <p>{complaint.description}</p>
              </div>

              {/* Authority / Platform Remarks if any */}
              {complaint.adminRemarks && (
                <div className="tracking-remarks-box">
                  <div className="remarks-head">
                    <FaShieldAlt /> Platform Facilitator Remarks
                  </div>
                  <p>"{complaint.adminRemarks}"</p>
                </div>
              )}

              {/* Supporting Evidence Proof if any */}
              {complaint.attachments && complaint.attachments.length > 0 && (
                <div className="tracking-evidence-box">
                  <span className="evidence-head">
                    <FaPaperclip /> Attached Evidence ({complaint.attachments.length})
                  </span>
                  <div className="evidence-chips">
                    {complaint.attachments.map((att, idx) => {
                      const isPdf = att.mimeType === "application/pdf" || (att.filename && att.filename.endsWith(".pdf"));
                      const fileUrl = att.url || (att.filename ? \`http://localhost:5000/uploads/\${att.filename}\` : "#");
                      return (
                        <div key={idx} className="evidence-chip">
                          {isPdf ? <FaFilePdf className="pdf-ico" /> : <FaFileImage className="img-ico" />}
                          <span>{att.originalName || "Evidence_Document"}</span>
                          {complaint.isAuthorizedViewer && fileUrl !== "#" && (
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="ext-link">
                              <FaExternalLinkAlt />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Tracking Action Buttons */}
            <div className="tracking-actions-bar">
              <button
                type="button"
                className="action-btn pdf-btn"
                onClick={() => generateGrievanceNoticePdf(complaint)}
              >
                <FaFilePdf /> Grievance Summary (PDF)
              </button>

              {complaint.status === "Resolved" && (
                <button
                  type="button"
                  className="action-btn cert-btn"
                  onClick={() => generateResolutionCertificatePdf(complaint)}
                >
                  <FaAward /> Resolution Summary (PDF)
                </button>
              )}

              <a
                href={waShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn wa-btn"
                title="Share status on WhatsApp"
              >
                <FaWhatsapp /> Share on WhatsApp
              </a>

              <button
                type="button"
                className="action-btn copy-btn"
                onClick={handleCopyLink}
              >
                <FaCopy /> {copiedLink ? "Link Copied!" : "Copy Tracking Link"}
              </button>
            </div>

          </div>
        ) : (
          /* Empty / Initial State */
          <div className="tracking-awaiting-card">
            <div className="awaiting-icon-circle">
              <FaSearch />
            </div>
            <h3>Track Your Grievance</h3>
            <p>
              Enter the unique Docket ID from your complaint submission receipt to check current dispute milestones and facilitation status.
            </p>
          </div>
        )}

        {/* Public Government Escalation Links Modal */}
        {showEscalateModal && (
          <div className="ombudsman-modal-overlay" onClick={() => setShowEscalateModal(false)}>
            <div className="ombudsman-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="ombudsman-modal-header">
                <div>
                  <h3>Public Government Redressal & Ombudsman Gateways</h3>
                </div>
                <button type="button" className="close-omb-btn" onClick={() => setShowEscalateModal(false)}>✕</button>
              </div>

              <div className="ombudsman-modal-body">
                <p className="omb-lead-text">
                  If private facilitation does not resolve your dispute, you can file directly with recognized public regulatory authorities:
                </p>

                <div className="ombudsman-links-grid">
                  <a
                    href="https://consumerhelpline.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="omb-link-box"
                  >
                    <div className="omb-icon-pill">🏛️</div>
                    <div className="omb-text-col">
                      <strong>National Consumer Helpline (NCH / 1915)</strong>
                      <span>Ministry of Consumer Affairs, Govt. of India</span>
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
                      <span>For Bank Accounts, Cards, and Digital UPI Disputes</span>
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
                      <strong>e-Daakhil Consumer Forum Portal</strong>
                      <span>Official Online Filing for District & State Consumer Commissions</span>
                    </div>
                    <FaExternalLinkAlt className="omb-arrow-icon" />
                  </a>
                </div>
              </div>

              <div className="ombudsman-modal-footer">
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
console.log("Hardened frontend/src/pages/TrackComplaint.jsx (PII masking, disclaimer, clean tracking view)");
