import { FaShieldAlt, FaLock, FaExclamationTriangle } from "react-icons/fa";
import "./LegalPages.css";

export default function PrivacyPolicy() {
  return (
    <div className="legal-page-container">
      <div className="legal-content-card">
        <div className="legal-header">
          <div className="legal-header-badge">
            <FaShieldAlt /> Data Protection & Privacy Governance
          </div>
          <h1 className="legal-title">Privacy Policy</h1>
          <div className="legal-meta">
            <span>Effective Date: <strong>September 1, 2026</strong></span>
            <span>Last Updated: <strong>September 21, 2026</strong></span>
            <span>Compliance: <strong>Digital Personal Data Protection (DPDP) Act, 2023 & IT Rules</strong></span>
          </div>
        </div>

        <div className="legal-disclaimer-banner">
          <FaExclamationTriangle />
          <div>
            <strong>Independent Platform Notice:</strong> Consumer Trust is an independent consumer support and dispute facilitation platform. We process personal data solely to facilitate grievance submission, communication with enterprise grievance desks, and user case management.
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
              <li><strong>Contact & Identity Data:</strong> Full name, email address, phone number, and optional residential/postal details provided during grievance submission or account creation.</li>
              <li><strong>Dispute & Transaction Details:</strong> Target enterprise name, dispute category, order number, transaction ID, invoice date, monetary claim amount, and grievance narrative.</li>
              <li><strong>Supporting Evidence Files:</strong> Invoices, payment receipts, courier slips, chat transcripts, or photographs uploaded by the consumer to substantiate the claim.</li>
              <li><strong>Technical & Usage Data:</strong> IP address, browser type, device information, access timestamps, and session logs collected automatically for rate limiting, CSRF protection, and fraud prevention.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Purpose and Legal Basis of Processing</h2>
            <p>We process your data on the following lawful bases:</p>
            <ul>
              <li><strong>Consent & Facilitation Request:</strong> To compile, format, and transmit your grievance summary to the designated nodal officer or customer support desk of the disputed enterprise.</li>
              <li><strong>User Account Management:</strong> To maintain your private citizen dashboard, track history, and verify ownership of registered cases.</li>
              <li><strong>Status Notifications:</strong> To deliver real-time progress alerts via email, SMS, or WhatsApp where you have explicitly opted in.</li>
              <li><strong>Platform Security & Legal Compliance:</strong> To prevent fraudulent submissions, abusive bots, impersonation, and to comply with applicable statutory reporting mandates.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Public Redaction & PII Protection</h2>
            <p>
              To protect consumer privacy on publicly accessible tracking endpoints:
            </p>
            <ul>
              <li><strong>Masked Public Lookups:</strong> When a tracking ID is queried without an authenticated session, personal identifiers (such as full name, email, phone number, and transaction ID) are automatically masked (e.g., <code>M**** P.</code>, <code>u***@example.com</code>).</li>
              <li><strong>Access Control:</strong> Unredacted case details and attached evidence files can only be viewed by the authenticated complainant or authorized administrative personnel.</li>
              <li><strong>No Public Search Indexing:</strong> Case files and evidence URLs are protected by robots.txt directives and security headers to prevent search engine indexing.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Data Sharing & Third-Party Disclosures</h2>
            <p>We do not sell, rent, or trade your personal data to third parties. Data is shared strictly as follows:</p>
            <ul>
              <li><strong>Disputed Enterprise Nodal Desks:</strong> Your complaint details and uploaded evidence are transmitted to the registered grievance officer of the company you have named in your complaint.</li>
              <li><strong>Communication Infrastructure:</strong> Secure cloud email (SMTP) and WhatsApp notification gateways solely for automated transactional alerts.</li>
              <li><strong>Legal & Regulatory Authorities:</strong> We may disclose data if required by a valid court order, government subpoena, or statutory enforcement directive under Indian law.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. Data Retention & Deletion</h2>
            <p>
              Case records and attached evidence files are retained for a maximum of 12 months following formal case closure or resolution to allow for appeals and audit trails. Consumers may request the permanent deletion or redaction of their personal records at any time by emailing our Data Protection Officer at <a href="mailto:privacy@consumertrust.org">privacy@consumertrust.org</a>.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Security Measures</h2>
            <p>
              We implement industry-standard administrative, physical, and technical safeguards:
            </p>
            <ul>
              <li>TLS 1.3 encryption for all data in transit across browser and API endpoints.</li>
              <li>bcrypt hashing (12 salt rounds) for user passwords; no plaintext credentials are ever stored or logged.</li>
              <li>Strict HTTP security headers including Content-Security-Policy, HSTS, X-Content-Type-Options, and X-Frame-Options.</li>
              <li>Automated brute-force lockout mechanisms and IP rate limiting on all authentication and lookup endpoints.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>8. Your Rights Under DPDP Act 2023</h2>
            <p>As a data principal under Indian law, you hold the following rights:</p>
            <ul>
              <li><strong>Right to Access:</strong> Review a summary of personal data processed by the platform.</li>
              <li><strong>Right to Correction & Erasure:</strong> Request rectification of inaccurate data or deletion of your account and case history.</li>
              <li><strong>Right to Grievance Redressal:</strong> Direct questions or concerns regarding your privacy to our designated Grievance Officer.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>9. Contact Our Grievance & Privacy Officer</h2>
            <div className="legal-callout">
              <strong>Data Protection & Grievance Officer:</strong><br />
              Consumer Trust Platform Governance Cell<br />
              Email: <a href="mailto:privacy@consumertrust.org">privacy@consumertrust.org</a><br />
              Support Hours: Monday to Saturday, 9:00 AM – 6:00 PM IST
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
