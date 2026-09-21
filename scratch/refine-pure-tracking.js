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
  FaReceipt,
  FaCalendarAlt,
  FaTag,
  FaAward,
  FaSpinner,
  FaTimesCircle,
  FaHistory,
} from "react-icons/fa";
import api from "../services/api";
import {
  generateGrievanceNoticePdf,
  generateResolutionCertificatePdf,
} from "../utils/pdfGenerator";
import "./TrackComplaint.css";

// Fallback demo complaint
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

        {/* 1. Compact Search Bar & Docket Switcher */}
        <div className="track-search-bar-box">
          <form onSubmit={handleSearchSubmit} className="track-search-form">
            <div className="search-input-wrap">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Enter Docket ID (e.g. CT-2026-66343 or CT-2026-89412)..."
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
                <FaHistory /> Your Cases:
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

        {/* 2. Pure Tracking System Panel */}
        {loading ? (
          <div className="tracking-loading-panel">
            <div className="spinner-blue"></div>
            <p>Loading live grievance tracking milestones...</p>
          </div>
        ) : complaint ? (
          <div className="pure-tracking-system-panel">

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
                    <FaTag className="tag-icon" /> {complaint.category || "Consumer"}
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
                  <h3>Live Redressal Progress</h3>
                </div>
                <span className="stepper-live-badge">● Live Timeline</span>
              </div>

              {complaint.status === "Rejected" ? (
                <div className="stepper-rejected-box">
                  <FaTimesCircle className="rejected-icon" />
                  <div>
                    <strong>Grievance Rejected by Redressal Desk</strong>
                    <p>{complaint.adminRemarks || "This complaint did not meet jurisdiction criteria or lacked supporting proof."}</p>
                  </div>
                </div>
              ) : (
                <div className="milestone-stepper-grid">
                  {/* Step 1 */}
                  <div className="stepper-node completed">
                    <div className="node-circle"><FaCheckCircle /></div>
                    <div className="node-info">
                      <strong>Grievance Lodged</strong>
                      <span>Logged & Sealed</span>
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
                      <strong>Notice Dispatched</strong>
                      <span>Sent to {complaint.companyName || "Nodal Desk"}</span>
                      <small>{complaint.companyNoticeSent ? "Dispatched" : "In Queue"}</small>
                    </div>
                  </div>

                  <div className={\`node-connector \${activeMilestone >= 3 ? "active" : ""}\`}></div>

                  {/* Step 3 */}
                  <div className={\`stepper-node \${activeMilestone >= 3 ? "completed" : activeMilestone === 2 ? "current" : ""}\`}>
                    <div className="node-circle">
                      {activeMilestone >= 3 ? <FaCheckCircle /> : <FaHourglassHalf />}
                    </div>
                    <div className="node-info">
                      <strong>Nodal Investigation</strong>
                      <span>Evidence & Fact Audit</span>
                      <small>{activeMilestone >= 2 ? "In Progress" : "Queued"}</small>
                    </div>
                  </div>

                  <div className={\`node-connector \${activeMilestone >= 4 ? "active" : ""}\`}></div>

                  {/* Step 4 */}
                  <div className={\`stepper-node \${activeMilestone >= 4 ? "completed" : ""}\`}>
                    <div className="node-circle">
                      {activeMilestone >= 4 ? <FaAward /> : <FaCheckCircle />}
                    </div>
                    <div className="node-info">
                      <strong>Resolution Finalized</strong>
                      <span>Settlement & Certificate</span>
                      <small>{complaint.status === "Resolved" ? "Settled" : "Pending"}</small>
                    </div>
                  </div>
                </div>
              )}

              {/* 7-Day Statutory SLA Live Clock */}
              {complaint.status !== "Resolved" && complaint.status !== "Rejected" && (
                <div className={\`sla-clock-panel \${slaTime.isExpired ? "expired" : ""}\`}>
                  <div className="sla-clock-left">
                    <FaHourglassHalf className="sla-clock-icon" />
                    <div>
                      <strong className="sla-clock-title">7-Day Statutory SLA Guarantee:</strong>
                      {slaTime.isExpired ? (
                        <span className="sla-clock-expired"> ⚠️ Statutory 7-day period exceeded. Eligible for immediate Ombudsman escalation.</span>
                      ) : (
                        <div className="sla-timer-values">
                          <span className="time-box">{slaTime.days}d</span> :
                          <span className="time-box">{slaTime.hours}h</span> :
                          <span className="time-box">{slaTime.minutes}m</span> :
                          <span className="time-box">{slaTime.seconds}s</span>
                          <span className="time-sub">remaining</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="escalate-btn"
                    onClick={() => setShowEscalateModal(true)}
                  >
                    <FaExclamationTriangle /> Ombudsman Escalation
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
                  <span className="fact-sub">{complaint.email} • +91 {complaint.phone?.replace(/[^0-9]/g, "").slice(-10)}</span>
                </div>

                <div className="fact-item">
                  <span className="fact-label">DISPUTED ENTERPRISE</span>
                  <strong className="fact-val">{complaint.companyName || "General Enterprise"}</strong>
                  <span className="fact-sub">Sector: {complaint.category} • Statutory Nodal Desk Active</span>
                </div>

                {complaint.orderOrTransactionId && (
                  <div className="fact-item full">
                    <span className="fact-label">ORDER / TRANSACTION REFERENCE</span>
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

              {/* Authority Remarks if any */}
              {complaint.adminRemarks && (
                <div className="tracking-remarks-box">
                  <div className="remarks-head">
                    <FaShieldAlt /> Official Authority Remarks
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
                      const fileUrl = att.url || \`http://localhost:5000/uploads/\${att.filename}\`;
                      return (
                        <a
                          key={idx}
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="evidence-chip"
                        >
                          {isPdf ? <FaFilePdf className="pdf-ico" /> : <FaFileImage className="img-ico" />}
                          <span>{att.originalName || att.filename || "Proof Document"}</span>
                          <FaExternalLinkAlt className="ext-ico" />
                        </a>
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
                <FaFilePdf /> Official Notice (PDF)
              </button>

              {complaint.status === "Resolved" && (
                <button
                  type="button"
                  className="action-btn cert-btn"
                  onClick={() => generateResolutionCertificatePdf(complaint)}
                >
                  <FaAward /> Resolution Certificate (PDF)
                </button>
              )}

              <a
                href={waShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn wa-btn"
                title="Share case update card on WhatsApp"
              >
                <FaWhatsapp /> Share on WhatsApp
              </a>

              <button
                type="button"
                className="action-btn copy-btn"
                onClick={handleCopyLink}
              >
                <FaCopy /> {copiedLink ? "Link Copied!" : "Copy Live Link"}
              </button>
            </div>

          </div>
        ) : null}

        {/* Ombudsman Modal */}
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

const trackCss = `/* ==========================================================================
   TRACK COMPLAINT - PURE TRACKING SYSTEM WITH ZERO CLUTTER
   ========================================================================== */

.track-layout-clean {
  min-height: calc(100vh - 80px);
  background: var(--bg-primary, #f4f7fb);
  padding: 32px 20px 80px;
  width: 100%;
  box-sizing: border-box;
}

.track-inner-container {
  max-width: 920px;
  margin: 0 auto;
}

/* ==========================================================================
   1. Search Bar & Quick Cases Switcher
   ========================================================================== */
.track-search-bar-box {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 16px;
  padding: 18px 24px;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.03);
  margin-bottom: 20px;
}

.track-search-form {
  display: flex;
  gap: 12px;
}

@media (max-width: 600px) {
  .track-search-form {
    flex-direction: column;
  }
}

.search-input-wrap {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: #2563eb;
  font-size: 15px;
}

.search-input-wrap input {
  width: 100%;
  height: 46px;
  padding: 0 16px 0 46px;
  border: 1.5px solid var(--border-color, #cbd5e1);
  border-radius: 10px;
  font-size: 14.5px;
  background: var(--bg-primary, #f8fafc);
  color: var(--text-primary, #0f172a);
  outline: none;
  transition: all 0.2s ease;
}

.search-input-wrap input:focus {
  background: #ffffff;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.track-submit-btn {
  background: #0f2b5c;
  color: white;
  border: none;
  padding: 0 24px;
  height: 46px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.track-submit-btn:hover:not(:disabled) {
  background: #1e3a8a;
  transform: translateY(-1px);
}

/* Quick Cases Chips */
.quick-cases-row {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color, #f1f5f9);
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.quick-cases-label {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.quick-chips-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-case-chip {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 18px;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.quick-case-chip:hover {
  background: #eff6ff;
  border-color: #93c5fd;
}

.quick-case-chip.active {
  background: #0f2b5c;
  color: white;
  border-color: #0f2b5c;
}

.case-code { font-weight: 700; font-family: monospace; }
.case-brand { font-weight: 600; }
.case-badge {
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.case-badge.pending { background: #fffbeb; color: #b45309; }
.case-badge.in-progress { background: #eff6ff; color: #1d4ed8; }
.case-badge.resolved { background: #ecfdf5; color: #059669; }
.case-badge.rejected { background: #fef2f2; color: #dc2626; }

/* Error Box */
.track-error-box {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  border-radius: 12px;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13.5px;
  font-weight: 600;
  margin-bottom: 20px;
}

.err-icon { font-size: 16px; color: #dc2626; }

/* Loading State */
.tracking-loading-panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 60px 20px;
  text-align: center;
  color: #64748b;
}

.spinner-blue {
  width: 40px;
  height: 40px;
  border: 3.5px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 14px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ==========================================================================
   2. Pure Tracking System Layout Flow
   ========================================================================== */
.pure-tracking-system-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* Top Docket Card */
.tracking-top-card {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-top: 4px solid #2563eb;
  border-radius: 16px;
  padding: 22px 26px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03);
}

.tracking-top-left {
  flex: 1;
  min-width: 260px;
}

.tracking-docket-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.tracking-docket-id {
  font-family: monospace;
  font-size: 15px;
  font-weight: 800;
  color: #1d4ed8;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 3px 9px;
  border-radius: 6px;
}

.copy-docket-btn {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.copy-docket-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.tracking-subject-title {
  font-size: 18px;
  font-weight: 800;
  color: #0f2b5c;
  margin: 0 0 10px;
  line-height: 1.35;
}

.tracking-tags-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tracking-tag {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 12px;
  color: #475569;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.tracking-tag.brand {
  background: #0f2b5c;
  color: white;
  border-color: #0f2b5c;
}

.tracking-tag.brand .tag-icon { color: #f59e0b; }

.tracking-status-pill {
  font-size: 12.5px;
  font-weight: 800;
  padding: 7px 16px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.status-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}

.tracking-status-pill.pending { background: #fffbeb; color: #b45309; border: 1.5px solid #fde68a; }
.tracking-status-pill.pending .status-pulse-dot { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }

.tracking-status-pill.in-progress { background: #eff6ff; color: #1d4ed8; border: 1.5px solid #bfdbfe; }
.tracking-status-pill.in-progress .status-pulse-dot { background: #0284c7; box-shadow: 0 0 6px #0284c7; }

.tracking-status-pill.resolved { background: #ecfdf5; color: #047857; border: 1.5px solid #a7f3d0; }
.tracking-status-pill.resolved .status-pulse-dot { background: #059669; box-shadow: 0 0 6px #059669; }

.tracking-status-pill.rejected { background: #fef2f2; color: #b91c1c; border: 1.5px solid #fecaca; }
.tracking-status-pill.rejected .status-pulse-dot { background: #dc2626; }

/* Stepper Box */
.tracking-stepper-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 22px 26px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03);
}

.stepper-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.stepper-title-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stepper-icon { color: #2563eb; font-size: 16px; }

.stepper-title-left h3 {
  font-size: 15.5px;
  font-weight: 800;
  color: #0f2b5c;
  margin: 0;
}

.stepper-live-badge {
  font-size: 11.5px;
  font-weight: 700;
  color: #059669;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  padding: 3px 10px;
  border-radius: 12px;
}

.milestone-stepper-grid {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin: 16px 0 20px;
}

@media (max-width: 640px) {
  .milestone-stepper-grid {
    flex-direction: column;
    gap: 14px;
  }
}

.stepper-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
}

@media (max-width: 640px) {
  .stepper-node {
    flex-direction: row;
    gap: 12px;
    text-align: left;
  }
}

.node-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #94a3b8;
  border: 2px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  margin-bottom: 6px;
  transition: all 0.2s ease;
}

.stepper-node.completed .node-circle {
  background: #059669;
  color: white;
  border-color: #059669;
}

.stepper-node.current .node-circle {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.node-info strong {
  display: block;
  font-size: 12.5px;
  color: #0f2b5c;
}

.node-info span {
  display: block;
  font-size: 11px;
  color: #64748b;
}

.node-info small {
  display: block;
  font-size: 10px;
  color: #2563eb;
  font-weight: 700;
  margin-top: 2px;
}

.node-connector {
  flex: 1;
  height: 3px;
  background: #e2e8f0;
  margin-top: 17px;
}

@media (max-width: 640px) {
  .node-connector {
    display: none;
  }
}

.node-connector.active {
  background: #059669;
}

/* SLA Clock Panel */
.sla-clock-panel {
  background: #fffdf5;
  border: 1.5px solid #fde68a;
  border-radius: 12px;
  padding: 12px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.sla-clock-panel.expired {
  background: #fff5f5;
  border-color: #fecaca;
}

.sla-clock-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sla-clock-icon {
  font-size: 18px;
  color: #d97706;
}

.sla-clock-title {
  font-size: 13px;
  color: #92400e;
  display: block;
  margin-bottom: 2px;
}

.sla-timer-values {
  display: flex;
  align-items: center;
  gap: 4px;
}

.time-box {
  background: white;
  border: 1px solid #fde68a;
  color: #b45309;
  font-weight: 800;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.time-sub {
  font-size: 11.5px;
  color: #78350f;
  margin-left: 4px;
}

.escalate-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.escalate-btn:hover {
  background: #b91c1c;
}

/* Tracking Facts Card */
.tracking-facts-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 22px 26px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03);
}

.facts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}

@media (max-width: 600px) {
  .facts-grid {
    grid-template-columns: 1fr;
  }
}

.fact-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 14px;
}

.fact-item.full {
  grid-column: 1 / -1;
}

.fact-label {
  display: block;
  font-size: 10.5px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.fact-val {
  display: block;
  font-size: 14.5px;
  font-weight: 800;
  color: #0f2b5c;
}

.fact-sub {
  display: block;
  font-size: 12px;
  color: #64748b;
}

.order-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: monospace;
  font-size: 14px;
  color: #0f172a;
  margin-top: 2px;
}

.tracking-desc-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-left: 3px solid #2563eb;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 14px;
}

.desc-tag {
  display: block;
  font-size: 10.5px;
  font-weight: 800;
  color: #1d4ed8;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.tracking-desc-box p {
  margin: 0;
  font-size: 13.5px;
  color: #334155;
  line-height: 1.55;
}

.tracking-remarks-box {
  background: #f0fdf4;
  border: 1.5px solid #86efac;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 14px;
}

.remarks-head {
  font-size: 12px;
  font-weight: 800;
  color: #166534;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.tracking-remarks-box p {
  margin: 0;
  font-size: 13.5px;
  color: #14532d;
}

/* Evidence Chips */
.tracking-evidence-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 16px;
}

.evidence-head {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.evidence-chips {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.evidence-chip {
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #0f2b5c;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.evidence-chip:hover {
  background: #eff6ff;
  border-color: #93c5fd;
}

.pdf-ico { color: #dc2626; }
.img-ico { color: #2563eb; }
.ext-ico { color: #94a3b8; font-size: 10px; }

/* Tracking Actions Bar */
.tracking-actions-bar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  text-decoration: none;
  border: none;
  transition: all 0.2s ease;
}

.action-btn.pdf-btn {
  background: #0f2b5c;
  color: white;
}

.action-btn.pdf-btn:hover { background: #1e3a8a; }

.action-btn.cert-btn {
  background: #059669;
  color: white;
}

.action-btn.cert-btn:hover { background: #047857; }

.action-btn.wa-btn {
  background: #16a34a;
  color: white;
}

.action-btn.wa-btn:hover { background: #15803d; }

.action-btn.copy-btn {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.action-btn.copy-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* ==========================================================================
   3. Ombudsman Modal
   ========================================================================== */
.ombudsman-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.ombudsman-modal-card {
  background: white;
  border-radius: 20px;
  padding: 28px;
  max-width: 580px;
  width: 100%;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.25);
  animation: modalIn 0.2s ease;
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.ombudsman-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-case-tag {
  background: #fee2e2;
  color: #991b1b;
  font-family: monospace;
  font-size: 11.5px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
  display: inline-block;
  margin-bottom: 4px;
}

.ombudsman-modal-header h3 {
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.close-omb-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #64748b;
  cursor: pointer;
}

.omb-lead-text {
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
  margin-bottom: 16px;
}

.ombudsman-links-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.omb-link-box {
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: all 0.2s ease;
}

.omb-link-box:hover {
  background: #eff6ff;
  border-color: #93c5fd;
  transform: translateX(3px);
}

.omb-icon-pill { font-size: 22px; }
.omb-text-col { flex: 1; }
.omb-text-col strong {
  display: block;
  font-size: 13px;
  color: #0f2b5c;
  margin-bottom: 2px;
}
.omb-text-col span {
  display: block;
  font-size: 11.5px;
  color: #64748b;
}

.omb-arrow-icon { color: #94a3b8; font-size: 12px; }

.ombudsman-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

.btn-modal-download-pdf {
  background: #0f2b5c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-modal-close {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}
`;

fs.writeFileSync(path.join(root, "frontend", "src", "pages", "TrackComplaint.jsx"), trackJsx, "utf8");
fs.writeFileSync(path.join(root, "frontend", "src", "pages", "TrackComplaint.css"), trackCss, "utf8");

console.log("Successfully refined TrackComplaint to purely show the tracking system without unwanted clutter!");
