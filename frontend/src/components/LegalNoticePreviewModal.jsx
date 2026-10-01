import { useState } from "react";
import {
  FaTimes,
  FaFilePdf,
  FaPrint,
  FaCopy,
  FaCheck,
  FaGavel,
  FaShieldAlt,
  FaCalendarAlt,
  FaBuilding,
  FaUser,
} from "react-icons/fa";
import { generatePreLitigationLegalNoticePdf } from "../utils/pdfGenerator";
import { toast } from "../utils/toast";
import "./LegalNoticePreviewModal.css";

export default function LegalNoticePreviewModal({ complaint, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!complaint) return null;

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const deadlineDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const noticeText = `STATUTORY PRE-LITIGATION DEMAND NOTICE
(Under Section 35 read with Section 2(7) of the Consumer Protection Act, 2019)

DATE OF ISSUANCE: ${today}
STATUTORY CURE PERIOD: 15 (Fifteen) Days (Expiring on ${deadlineDate})
REGISTRY DOCKET REFERENCE: ${complaint.complaintId}

TO:
The Resident Grievance Officer / Legal Directorate
${complaint.companyName}
Nodal Redressal Desk

FROM:
${complaint.name}
Email: ${complaint.email}
Phone: ${complaint.phone || "On Platform Record"}

SUBJECT: FORMAL DEMAND NOTICE FOR UNFAIR TRADE PRACTICE & DEFICIENCY OF SERVICE CONCERNING TRANSACTION/ORDER REF: ${complaint.orderOrTransactionId || "N/A"}

STATEMENT OF FACTS:
1. That the Complainant is a bona fide consumer who engaged with ${complaint.companyName} for goods/services.
2. Narrative of Dispute: ${complaint.description}
3. The aforementioned actions constitute Deficiency of Service under Section 2(11) and Unfair Trade Practice under Section 2(47) of CPA 2019.

FORMAL STATUTORY DEMANDS:
1. Immediate unconditional resolution / refund of disputed claim within 15 days of receipt of this notice.
2. Statutory interest @ 18% per annum for the period of delay and unlawful withholding.
3. Written confirmation of corrective action taken.

CONSEQUENCES OF NON-COMPLIANCE:
Take notice that upon your failure to satisfy the above demands within 15 calendar days, formal proceedings shall be instituted before the competent District Consumer Disputes Redressal Commission (DCDRC) via e-Daakhil for full claim, damages under Section 39, and litigation costs.

Digitally verified on Consumer Trust Grievance Registry (Ref: ${complaint.complaintId})`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(noticeText);
    setCopied(true);
    toast.success("Legal Notice draft copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    generatePreLitigationLegalNoticePdf(complaint);
    toast.success("Statutory Legal Notice PDF downloaded successfully!");
  };

  return (
    <div className="legal-preview-overlay" onClick={onClose}>
      <div className="legal-preview-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="legal-preview-header">
          <div className="header-title-group">
            <span className="legal-badge">
              <FaGavel /> Section 35 CPA 2019
            </span>
            <h2>Statutory Legal Demand Notice Preview</h2>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        {/* Paper Parchment Preview */}
        <div className="legal-paper-viewport">
          <div className="legal-paper-sheet">
            {/* Header Stamp Paper Banner */}
            <div className="stamp-paper-header">
              <div className="stamp-emblem">
                <FaGavel className="emblem-svg" />
              </div>
              <div className="stamp-text">
                <h3>STATUTORY PRE-LITIGATION DEMAND NOTICE</h3>
                <p>Issued Under Section 35 read with Section 2(7) of The Consumer Protection Act, 2019</p>
                <span className="statutory-sla-strip">MANDATORY 15-DAY STATUTORY CURE WINDOW</span>
              </div>
            </div>

            <div className="legal-meta-grid">
              <div className="meta-box">
                <span className="meta-label">Docket Ref:</span>
                <strong className="meta-val">{complaint.complaintId}</strong>
              </div>
              <div className="meta-box">
                <span className="meta-label">Date of Notice:</span>
                <strong className="meta-val">{today}</strong>
              </div>
              <div className="meta-box">
                <span className="meta-label">15-Day Cure Deadline:</span>
                <strong className="meta-val urgent-date">{deadlineDate}</strong>
              </div>
            </div>

            <div className="parties-split">
              <div className="party-card recipient">
                <span className="party-role">TO (RESPONDENT / ENTERPRISE):</span>
                <h4>{complaint.companyName}</h4>
                <p>Resident Grievance Officer & Legal Directorate</p>
                {complaint.nodalEmail && <code>{complaint.nodalEmail}</code>}
              </div>
              <div className="party-card complainant">
                <span className="party-role">FROM (COMPLAINANT / CONSUMER):</span>
                <h4>{complaint.name}</h4>
                <p>{complaint.email} • {complaint.phone || "Registered Citizen"}</p>
                {complaint.city && <span>Jurisdiction: {complaint.city}</span>}
              </div>
            </div>

            <div className="notice-subject-block">
              <strong>SUBJECT:</strong> Formal Statutory Notice for Deficiency of Service & Unfair Trade Practice under CPA 2019 regarding Transaction / Order Ref: <u>{complaint.orderOrTransactionId || "On Record"}</u>
            </div>

            <div className="notice-body-paragraphs">
              <p>
                <strong>1. PRELIMINARY STATEMENT:</strong> The Complainant is a recognized consumer under Section 2(7) of the Consumer Protection Act, 2019, having paid lawful consideration to the Respondent.
              </p>
              <p>
                <strong>2. PARTICULARS OF GRIEVANCE:</strong> {complaint.description}
              </p>
              <p>
                <strong>3. STATUTORY INFRACTIONS:</strong> The failure of the Respondent to deliver agreed services/goods or process lawful refunds constitutes <em>Deficiency in Service</em> under Section 2(11) and <em>Unfair Trade Practice</em> under Section 2(47) of the Consumer Protection Act, 2019.
              </p>
              <div className="statutory-demand-box">
                <h4>FORMAL STATUTORY DEMANDS:</h4>
                <ol>
                  <li>Immediate resolution and unconditional settlement of the claim within <strong>15 (fifteen) calendar days</strong> from receipt of this notice.</li>
                  <li>Payment of statutory interest @ 18% per annum for the period of unlawful retention.</li>
                  <li>Reimbursement of incidental communication and facilitation expenses.</li>
                </ol>
              </div>
              <p className="notice-warning-footer">
                <strong>LEGAL CONSEQUENCES:</strong> Take notice that should the Respondent fail to remedy the grievance within the stipulated 15-day period, the Complainant shall proceed with formal institutional adjudication before the competent District Consumer Commission (DCDRC) via e-Daakhil seeking penal damages and statutory compensation under Section 39 CPA 2019.
              </p>
            </div>

            <div className="legal-signature-row">
              <div className="signature-box">
                <span className="sig-label">Digitally Docketed Complainant:</span>
                <strong>{complaint.name}</strong>
                <span>Verified Consumer</span>
              </div>
              <div className="registry-seal-box">
                <FaShieldAlt className="seal-icon" />
                <div>
                  <strong>Official Trust Seal</strong>
                  <span>Consumer Trust Registry</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="legal-preview-actions">
          <button type="button" className="btn-copy-notice" onClick={handleCopyText}>
            {copied ? <><FaCheck /> Copied to Clipboard</> : <><FaCopy /> Copy Notice Text</>}
          </button>
          <button type="button" className="btn-print-notice" onClick={() => window.print()}>
            <FaPrint /> Print Draft
          </button>
          <button type="button" className="btn-download-pdf-notice" onClick={handleDownload}>
            <FaFilePdf /> Download Official Signed PDF
          </button>
        </div>
      </div>
    </div>
  );
}
