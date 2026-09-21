import { FaBalanceScale, FaClock, FaCheckCircle, FaShieldAlt } from "react-icons/fa";
import "./LegalPages.css";

export default function CitizenCharter() {
  return (
    <div className="legal-page-container">
      <div className="legal-content-card">
        <div className="legal-header">
          <div className="legal-header-badge">
            <FaBalanceScale /> Service Standards & Public Commitments
          </div>
          <h1 className="legal-title">Citizen Service Charter</h1>
          <div className="legal-meta">
            <span>Version: <strong>2026.1</strong></span>
            <span>Applicability: <strong>All Platform Users & Partner Enterprises</strong></span>
            <span>Focus: <strong>Transparency, Accountability & Resolution Tracking</strong></span>
          </div>
        </div>

        <div className="legal-body">
          <section className="legal-section">
            <h2>1. Our Mission & Vision</h2>
            <p>
              The Citizen Service Charter sets forth our operational commitments, service delivery standards, turnaround benchmarks, and dispute escalation guidelines for every consumer using Consumer Trust.
            </p>
            <p>
              <strong>Vision:</strong> To empower consumers with transparent, accessible, and dignified grievance redressal while fostering accountability among commercial enterprises.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Key Service Standards & Commitments</h2>
            <div className="legal-table-wrap">
              <table className="legal-table">
                <thead>
                  <tr>
                    <th>Service Activity</th>
                    <th>Standard Timeline</th>
                    <th>Delivery Mechanism</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Grievance Docket Generation</td>
                    <td>Instant (&lt; 5 seconds)</td>
                    <td>Unique Tracking ID & Printable Docket Slip</td>
                  </tr>
                  <tr>
                    <td>Enterprise Nodal Notice Dispatch</td>
                    <td>Automated within 1 hour</td>
                    <td>Email Notice & 1-Click Resolution Token</td>
                  </tr>
                  <tr>
                    <td>Complainant Transactional Alerts</td>
                    <td>Instant</td>
                    <td>WhatsApp / SMS & Email Confirmation</td>
                  </tr>
                  <tr>
                    <td>Enterprise Redressal Target Window</td>
                    <td>7 Days (168 Hours)</td>
                    <td>Live Milestone Tracker & Clock</td>
                  </tr>
                  <tr>
                    <td>Support Ticket Inquiries</td>
                    <td>Within 24 Hours</td>
                    <td>Email Response via helpdesk</td>
                  </tr>
                  <tr>
                    <td>Data Correction / Deletion Requests</td>
                    <td>Within 72 Hours</td>
                    <td>DPDP Privacy Desk Confirmation</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="legal-section">
            <h2>3. Rights of the Complainant</h2>
            <ul>
              <li><strong>Right to Complete Information:</strong> Access full chronological milestone logs with timestamps and remarks for your registered cases.</li>
              <li><strong>Right to Redaction:</strong> Ensure your personal phone, email, and transaction numbers are masked on public lookup interfaces.</li>
              <li><strong>Right to Resolution Evaluation:</strong> Rate the quality and speed of enterprise settlements through our 5-star citizen satisfaction survey.</li>
              <li><strong>Right to Escalate:</strong> Access direct guidance and docket export tools to bring unresolved disputes to statutory authorities (NCH, e-Daakhil, Sectoral Ombudsmen).</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Responsibilities of the Consumer</h2>
            <ul>
              <li>Provide accurate, verifiable contact details and dispute narratives.</li>
              <li>Attach clear, legible copies of invoices, receipts, warranty cards, or photographic evidence.</li>
              <li>Refrain from filing duplicate grievances for the same transaction while an active inquiry is in progress.</li>
              <li>Update the case status or complete the satisfaction review once a merchant fulfills a refund or replacement.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Redressal Escalation Matrix</h2>
            <p>If an enterprise fails to provide a meaningful resolution within the standard 7-day window:</p>
            <ol>
              <li><strong>Tier 1 — Automated Notice Reminder:</strong> Automated reminder notice sent to the enterprise nodal desk at Day 4.</li>
              <li><strong>Tier 2 — Resolution Certificate or Notice of Impasse:</strong> Platform generates a formal Claim Summary for external filing at Day 7.</li>
              <li><strong>Tier 3 — Statutory Filing:</strong> Direct links and formatted exports provided to submit the case to <a href="https://consumerhelpline.gov.in" target="_blank" rel="noopener noreferrer">National Consumer Helpline (1915)</a> or <a href="https://edaakhil.nic.in" target="_blank" rel="noopener noreferrer">e-Daakhil Consumer Commission</a>.</li>
            </ol>
          </section>

          <section className="legal-section">
            <h2>6. Feedback & Charter Review</h2>
            <p>
              We welcome suggestions to improve our service charter. Please submit your feedback to <a href="mailto:support@consumertrust.in">support@consumertrust.in</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
