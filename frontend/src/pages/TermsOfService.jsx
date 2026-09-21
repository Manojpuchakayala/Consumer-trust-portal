import { FaFileContract, FaExclamationTriangle, FaBalanceScale } from "react-icons/fa";
import "./LegalPages.css";

export default function TermsOfService() {
  return (
    <div className="legal-page-container">
      <div className="legal-content-card">
        <div className="legal-header">
          <div className="legal-header-badge">
            <FaFileContract /> Terms of Platform Use & Legal Agreement
          </div>
          <h1 className="legal-title">Terms of Service</h1>
          <div className="legal-meta">
            <span>Effective Date: <strong>September 1, 2026</strong></span>
            <span>Last Updated: <strong>September 21, 2026</strong></span>
            <span>Governing Law: <strong>Laws of India (New Delhi Jurisdiction)</strong></span>
          </div>
        </div>

        <div className="legal-disclaimer-banner">
          <FaExclamationTriangle />
          <div>
            <strong>CRITICAL NON-AFFILIATION NOTICE:</strong> Consumer Trust is an independent private dispute facilitation and consumer support platform. It is NOT a government department, statutory commission, consumer court, or regulatory ombudsman. Using this platform does NOT substitute for statutory filings before competent consumer commissions (NCDRC/State/District) or e-Daakhil.
          </div>
        </div>

        <div className="legal-body">
          <section className="legal-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing, browsing, registering an account on, or submitting a dispute through Consumer Trust (&ldquo;the Platform&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;) and our <a href="/privacy">Privacy Policy</a>. If you do not agree to these Terms, please discontinue use of the Platform immediately.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Nature & Scope of Platform Services</h2>
            <p>
              Consumer Trust provides an online technological platform designed to assist consumers in organizing, drafting, tracking, and communicating dispute notices to enterprise grievance officers and customer care departments:
            </p>
            <ul>
              <li><strong>Dispute Facilitation Desk:</strong> We provide structured templates, automated dispatch tools, and milestone tracking mechanisms to encourage voluntary corporate redressal.</li>
              <li><strong>No Statutory Authority:</strong> Consumer Trust does not possess judicial, quasi-judicial, or statutory enforcement powers. We cannot issue summons, levy statutory fines, or enforce legal injunctions.</li>
              <li><strong>No Legal Representation:</strong> The Platform, its drafting tools, AI assistants, and generated notice templates do NOT constitute legal advice or formal attorney representation.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. User Responsibilities & Prohibited Conduct</h2>
            <p>As a condition of using the Platform, you warrant and agree that:</p>
            <ul>
              <li>You are at least 18 years of age and possess legal capacity to enter into binding agreements.</li>
              <li>All information, transaction references, dates, and statements submitted in your grievance are truthful, accurate, and relate to a genuine consumer transaction.</li>
              <li>You will not upload forged invoices, malicious attachments, defamatory content, hate speech, or content infringing on third-party intellectual property.</li>
              <li>You will not attempt to gain unauthorized access to our systems, scrape platform data, reverse-engineer platform APIs, or bypass rate limits.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. AI Drafting Assistant & Notice Disclaimers</h2>
            <p>
              The Platform provides an AI-assisted drafting tool (&ldquo;AI Drafting Assistant&rdquo;) to assist users in structuring their grievance statements. You acknowledge that:
            </p>
            <ul>
              <li>The AI tool provides automated natural language formatting based on user inputs and generic consumer protection citations.</li>
              <li>You are solely responsible for reviewing, verifying, and editing the generated grievance statement prior to submission.</li>
              <li>Consumer Trust accepts no liability for errors, omissions, or inaccuracies in AI-formatted narratives.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Enterprise Interactions & Resolution Turnaround</h2>
            <p>
              While Consumer Trust facilitates rapid communication with corporate grievance desks and tracks standard 7-day industry turnaround targets:
            </p>
            <ul>
              <li>Turnaround targets (e.g., 7 days) are voluntary industry benchmarks and do not guarantee a favorable outcome or a refund settlement.</li>
              <li>Resolution decisions (refunds, replacements, repairs) remain entirely at the discretion of the disputed enterprise or subject to applicable statutory forum adjudication.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, Consumer Trust, its operators, directors, and affiliates shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from your use of or inability to use the platform, including unrecovered monetary claims, merchant delays, or data inaccuracies.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Statutory Forum Alternative</h2>
            <p>
              Nothing in these Terms restricts your fundamental right to approach statutory bodies at any time, including:
            </p>
            <ul>
              <li><strong>National Consumer Helpline:</strong> Toll-Free 1915 or <a href="https://consumerhelpline.gov.in" target="_blank" rel="noopener noreferrer">consumerhelpline.gov.in</a></li>
              <li><strong>e-Daakhil Online Consumer Court:</strong> <a href="https://edaakhil.nic.in" target="_blank" rel="noopener noreferrer">edaakhil.nic.in</a></li>
              <li><strong>Sectoral Regulators:</strong> RBI Ombudsman (Banking), TRAI (Telecom), FSSAI (Food), IRDAI (Insurance).</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>8. Modifications & Governing Jurisdiction</h2>
            <p>
              We reserve the right to update these Terms at any time. Material changes will be posted on this page with an updated effective date. These Terms are governed by and construed in accordance with the laws of India, and any disputes arising hereunder shall be subject to the exclusive jurisdiction of the courts located in New Delhi, India.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Inquiries & Legal Notices</h2>
            <p>
              For legal inquiries, formal notices, or corporate dispute escalation, please contact:
            </p>
            <div className="legal-callout">
              <strong>Legal & Compliance Desk:</strong><br />
              Consumer Trust Platform<br />
              Email: <a href="mailto:legal@consumertrust.org">legal@consumertrust.org</a> / <a href="mailto:support@consumertrust.org">support@consumertrust.org</a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
