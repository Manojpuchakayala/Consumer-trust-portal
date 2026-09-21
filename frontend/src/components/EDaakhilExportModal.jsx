import { useState } from "react";
import {
  FaGavel,
  FaTimes,
  FaPrint,
  FaDownload,
  FaShieldAlt,
  FaBuilding,
  FaUser,
  FaCheckCircle,
  FaBalanceScale,
  FaCalendarAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";
import "./EDaakhilExportModal.css";

export default function EDaakhilExportModal({ complaint, onClose }) {
  if (!complaint) return null;

  const handlePrint = () => {
    window.print();
  };

  const parsedAmount = parseFloat(complaint.claimAmount) || 0;
  let forumLevel = "DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION";
  let forumJurisdiction = "District Commission (Claims up to ₹50,00,000 under Section 34 of CPA 2019)";

  if (parsedAmount > 20000000) {
    forumLevel = "NATIONAL CONSUMER DISPUTES REDRESSAL COMMISSION (NCDRC), NEW DELHI";
    forumJurisdiction = "National Commission (Claims exceeding ₹2,00,00,000 under Section 58 of CPA 2019)";
  } else if (parsedAmount > 5000000) {
    forumLevel = "STATE CONSUMER DISPUTES REDRESSAL COMMISSION";
    forumJurisdiction = "State Commission (Claims from ₹50,00,000 to ₹2,00,00,000 under Section 47 of CPA 2019)";
  }

  const filingDate = complaint.createdAt
    ? new Date(complaint.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN");

  return (
    <div className="edaakhil-modal-backdrop" onClick={onClose}>
      <div className="edaakhil-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Toolbar (Screen Only) */}
        <div className="edaakhil-toolbar no-print">
          <div className="toolbar-left">
            <div className="toolbar-badge">
              <FaGavel />
              <span>e-Daakhil Statutory Court Packet</span>
            </div>
            <span className="toolbar-sub">NCDRC / State / District Commission Format</span>
          </div>

          <div className="toolbar-actions">
            <button type="button" className="btn-print-petition" onClick={handlePrint}>
              <FaPrint />
              <span>Print / Save as Court PDF</span>
            </button>
            <button type="button" className="btn-close-petition" onClick={onClose} aria-label="Close">
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Formal Statutory Legal Petition Sheet (Printable) */}
        <div className="edaakhil-petition-sheet" id="printable-edaakhil-petition">
          {/* Header Seal */}
          <div className="petition-header-seal">
            <div className="seal-emblem">🏛️</div>
            <div className="seal-text">
              <h3>BEFORE THE HON'BLE {forumLevel}</h3>
              <p className="forum-sub">STATUTORY CONSUMER COMPLAINT UNDER SECTION 35 / 47 / 58 OF THE CONSUMER PROTECTION ACT, 2019</p>
            </div>
          </div>

          <div className="petition-meta-strip">
            <div><strong>Case Reference:</strong> {complaint.complaintId}</div>
            <div><strong>Filing Date:</strong> {filingDate}</div>
            <div><strong>Pecuniary Tier:</strong> {forumJurisdiction}</div>
          </div>

          <hr className="petition-divider" />

          {/* Memo of Parties */}
          <div className="memo-of-parties">
            <div className="party-block complainant">
              <h4>IN THE MATTER OF:</h4>
              <p className="party-name"><strong>{complaint.name || "Consumer Complainant"}</strong></p>
              <p>Email: {complaint.email} | Mobile: {complaint.phone || "On Record"}</p>
              <p>Residing at: {complaint.address || "Jurisdiction of the Hon'ble Commission"}</p>
              <span className="party-role">... COMPLAINANT / PETITIONER</span>
            </div>

            <div className="versus-badge">VERSUS</div>

            <div className="party-block respondent">
              <p className="party-name"><strong>{complaint.companyName || "Opposite Party / Enterprise"}</strong></p>
              <p>Service Contact: {complaint.companyEmail || "Registered Grievance Officer"}</p>
              <p>Transaction / Order Ref: {complaint.orderOrTransactionId || "Document Annexed"}</p>
              <span className="party-role">... OPPOSITE PARTY / RESPONDENT</span>
            </div>
          </div>

          <hr className="petition-divider" />

          {/* Statement of Facts & Grounds */}
          <div className="petition-body-section">
            <h4>I. JURISDICTION & LIMITATION</h4>
            <p>
              1. The Complainant is a "Consumer" within the meaning of <strong>Section 2(7)</strong> of the Consumer Protection Act, 2019, having paid lawful consideration for goods/services.
            </p>
            <p>
              2. The present complaint is instituted well within the prescribed period of two years from the accrual of cause of action under <strong>Section 69</strong> of the Consumer Protection Act, 2019.
            </p>

            <h4>II. STATEMENT OF FACTS & DEFICIENCY IN SERVICE</h4>
            <p>
              3. <strong>Subject Matter:</strong> {complaint.subject}
            </p>
            <p>
              4. <strong>Factual Narrative:</strong>
            </p>
            <div className="narrative-box">
              {complaint.description || "The opposite party committed material breach of warranty and deficiency in service causing severe financial loss and mental harassment to the complainant."}
            </div>

            <h4>III. STATUTORY VIOLATIONS CHARGED</h4>
            <ul>
              <li><strong>Section 2(11) Deficiency in Service:</strong> Any fault, imperfection, shortcoming or inadequacy in the quality, nature and manner of performance.</li>
              <li><strong>Section 2(47) Unfair Trade Practice:</strong> Misleading representations, refusal of lawful refund, or imposition of arbitrary conditions.</li>
              {complaint.speedPostConsignment && (
                <li><strong>Statutory Pre-Litigation Notice:</strong> Notice was duly dispatched via India Post Speed Post (Consignment No: <code>{complaint.speedPostConsignment}</code>).</li>
              )}
            </ul>

            <h4>IV. PRAYER FOR RELIEF</h4>
            <p>In light of the aforesaid facts, the Complainant respectfully prays that the Hon'ble Commission may be pleased to:</p>
            <ol className="prayer-list">
              <li>Direct the Opposite Party to refund / pay the disputed sum of <strong>₹{parsedAmount.toLocaleString("en-IN")}</strong> in full;</li>
              <li>Award statutory interest @ 18% per annum from the date of default until actual realization;</li>
              <li>Award compensation of ₹50,000/- towards mental agony, harassment, and severe inconvenience caused to the consumer;</li>
              <li>Award ₹15,000/- towards litigation costs and drafting expenses incurred by the complainant;</li>
              <li>Pass such other and further orders as this Hon'ble Commission may deem fit in the interest of justice.</li>
            </ol>
          </div>

          <hr className="petition-divider" />

          {/* Verification Affidavit */}
          <div className="petition-verification">
            <h4>VERIFICATION</h4>
            <p>
              I, <strong>{complaint.name || "the Complainant"}</strong>, do hereby solemnly declare and verify that the contents of paragraphs I to IV are true and correct to the best of my knowledge and belief, and nothing material has been concealed therefrom.
            </p>
            <div className="verification-signatures">
              <div className="sig-line">
                <span>Verified at: India</span>
                <span>Date: {filingDate}</span>
              </div>
              <div className="sig-box">
                <div className="sig-space" />
                <strong>(SIGNATURE OF COMPLAINANT)</strong>
              </div>
            </div>
          </div>

          {/* Digital QR Authentication Seal */}
          <div className="petition-seal-footer">
            <div className="digital-verification-stamp">
              <FaShieldAlt className="stamp-icon" />
              <div>
                <strong>AUTHENTICATED CONSUMER TRUST DOCKET</strong>
                <span>Verified under CPA 2019 • Docket: {complaint.complaintId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
