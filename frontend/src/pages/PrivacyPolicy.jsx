import { FaShieldAlt, FaLock, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaInfoCircle } from "react-icons/fa";
import "./LegalPages.css";

export default function PrivacyPolicy() {
  return (
    <div className="legal-page-container">
      <div className="legal-content-card">
        <div className="legal-header">
          <div className="legal-header-badge">
            <FaShieldAlt /> Data Protection & Privacy Governance
          </div>
          <h1 className="legal-title">Privacy Policy & Data Protection Policy</h1>
          <div className="legal-meta">
            <span>Effective Date: <strong>September 1, 2026</strong></span>
            <span>Last Updated: <strong>September 21, 2026</strong></span>
            <span>Compliance: <strong>Digital Personal Data Protection (DPDP) Act, 2023 & IT Rules</strong></span>
          </div>
        </div>

        <div className="legal-disclaimer-banner">
          <FaExclamationTriangle />
          <div>
            <strong>Independent Platform Notice:</strong> Consumer Trust is an independent consumer dispute facilitation platform. We process personal data solely to assist users in preparing grievance dockets, communicating with enterprise customer grievance desks, and tracking voluntary case milestones.
          </div>
        </div>

        <div className="legal-body">
          <section className="legal-section">
            <h2>1. Introduction & Overview</h2>
            <p>
              Consumer Trust (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;the Platform&rdquo;) is committed to protecting your privacy and personal data. This Privacy Policy explains what information we collect when you visit our website, register a grievance, track case progress, or interact with our platform, and how that information is used, stored, protected, and shared.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Information We Collect</h2>
            <p>We collect only the information necessary to facilitate consumer grievance resolution:</p>
            <ul>
              <li><strong>Contact & Identity Data:</strong> Full name, email address, phone number, and optional state/city provided during grievance submission or account creation.</li>
              <li><strong>Dispute & Transaction Details:</strong> Disputed enterprise name, category, order number, transaction ID, date, monetary claim amount, and grievance narrative.</li>
              <li><strong>Supporting Evidence Files:</strong> Purchase invoices, payment receipts, courier slips, chat transcripts, or photographs uploaded to substantiate the claim.</li>
              <li><strong>Technical & Usage Data:</strong> IP address, browser type, device information, access timestamps, and session logs collected automatically for rate limiting, CSRF protection, and abuse prevention.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Document Safety & Upload Guidelines</h2>
            <p>
              To ensure data protection and minimize privacy risk, please follow these guidelines when uploading evidence:
            </p>
            <div className="privacy-safety-columns">
              <div className="privacy-safety-col allowed">
                <h4><FaCheckCircle className="icon-check-green" /> Recommended Supporting Proofs:</h4>
                <ul>
                  <li>Itemized purchase invoices, cash receipts, and order confirmation emails</li>
                  <li>Order IDs, consignment numbers, and delivery tracking screenshots</li>
                  <li>Photographs or video frames clearly showing defective or damaged items</li>
                  <li>Customer service chat transcripts, email threads, and warranty cards</li>
                </ul>
              </div>
              <div className="privacy-safety-col prohibited">
                <h4><FaTimesCircle className="icon-times-red" /> Strictly Prohibited & Unnecessary:</h4>
                <ul>
                  <li>Banking passwords, PINs, or UPI passcodes</li>
                  <li>Full debit/credit card numbers or 3-digit CVV codes</li>
                  <li>One-Time Passwords (OTPs) or secret verification codes</li>
                  <li>Unmasked government IDs (Aadhaar/PAN cards)</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="legal-section">
            <h2>4. Purpose and Legal Basis of Processing</h2>
            <p>We process your data on the following lawful bases under DPDP Act 2023:</p>
            <ul>
              <li><strong>Consent & Facilitation Request:</strong> To compile, format, and transmit your grievance summary to the designated customer grievance desk of the disputed enterprise.</li>
              <li><strong>Case Management:</strong> To maintain your private citizen dashboard, track history, and verify ownership of registered cases.</li>
              <li><strong>Status Notifications:</strong> To deliver real-time progress alerts via email, SMS, or WhatsApp where you have opted in.</li>
              <li><strong>Platform Security:</strong> To prevent fraudulent submissions, abusive bots, and ensure system integrity.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Public Redaction & PII Protection</h2>
            <p>
              To protect consumer privacy on publicly accessible tracking endpoints:
            </p>
            <ul>
              <li><strong>Masked Public Lookups:</strong> When a tracking ID is queried without an authenticated session, personal identifiers (such as full name, email, phone number, and transaction ID) are automatically masked (e.g., <code>M**** P.</code>, <code>u***@example.com</code>).</li>
              <li><strong>2-Factor OTP Verification:</strong> Full unredacted case details and evidence files require 2-factor OTP verification sent to the registered email or phone.</li>
              <li><strong>No Public Search Indexing:</strong> Case files and evidence URLs are protected by robots.txt directives and security headers to prevent search engine indexing.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. Data Sharing & Third-Party Disclosures</h2>
            <p>We do not sell, rent, or trade your personal data. Data is shared strictly as follows:</p>
            <ul>
              <li><strong>Disputed Enterprise Grievance Desks:</strong> Your complaint details and uploaded evidence are transmitted to the grievance officer of the company you have named in your complaint.</li>
              <li><strong>Notification Infrastructure:</strong> Secure cloud email (SMTP) and SMS gateways solely for automated transactional alerts.</li>
              <li><strong>Statutory & Legal Requirements:</strong> We may disclose data if required by a valid court order or statutory enforcement directive under Indian law.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>7. Data Retention & Deletion</h2>
            <p>
              Case records and attached evidence files are retained during active dispute facilitation and for up to 180 days post-resolution, after which dockets may be archived or permanently purged.
            </p>
            <p>
              <strong>1-Click Case Deletion:</strong> You can delete case dockets and attached documents directly from your Citizen Dashboard at any time, or email our privacy desk at <a href="mailto:privacy@consumertrust.in">privacy@consumertrust.in</a> to request complete erasure.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Security Safeguards</h2>
            <p>
              We implement industry-standard administrative and technical safeguards:
            </p>
            <ul>
              <li>TLS 1.3 encryption for all data in transit across browser and API endpoints.</li>
              <li>bcrypt hashing (12 salt rounds) for user passwords; no plaintext credentials are ever stored or logged.</li>
              <li>Strict HTTP security headers including Content-Security-Policy, HSTS, and X-Frame-Options.</li>
              <li>Automated brute-force lockout mechanisms and IP rate limiting on all authentication and lookup endpoints.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>9. Your Rights Under DPDP Act 2023</h2>
            <p>As a data principal under Indian law, you hold the following rights:</p>
            <ul>
              <li><strong>Right to Access:</strong> Review a summary of personal data processed by the platform.</li>
              <li><strong>Right to Correction & Erasure:</strong> Request rectification of inaccurate data or deletion of your account and case history.</li>
              <li><strong>Right to Grievance Redressal:</strong> Direct questions or concerns regarding your privacy to our privacy desk.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>10. Contact Our Privacy Desk</h2>
            <div className="legal-callout">
              <strong>Data Privacy & Protection Desk:</strong><br />
              Consumer Trust Platform<br />
              Email: <a href="mailto:privacy@consumertrust.in">privacy@consumertrust.in</a><br />
              General Support: <a href="mailto:support@consumertrust.in">support@consumertrust.in</a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
