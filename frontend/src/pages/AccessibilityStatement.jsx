import { FaUniversalAccess, FaCheckCircle, FaGlobe } from "react-icons/fa";
import "./LegalPages.css";

export default function AccessibilityStatement() {
  return (
    <div className="legal-page-container">
      <div className="legal-content-card">
        <div className="legal-header">
          <div className="legal-header-badge">
            <FaUniversalAccess /> Digital Inclusion & Universal Access
          </div>
          <h1 className="legal-title">Accessibility Statement</h1>
          <div className="legal-meta">
            <span>Standard: <strong>WCAG 2.1 Level AA Guidelines</strong></span>
            <span>Languages Supported: <strong>English, Hindi, Telugu, Tamil, Kannada, Marathi, Bengali</strong></span>
          </div>
        </div>

        <div className="legal-body">
          <section className="legal-section">
            <h2>1. Our Commitment to Accessibility</h2>
            <p>
              Consumer Trust is dedicated to ensuring digital accessibility for all citizens, including individuals with visual, auditory, cognitive, or motor impairments. We continuously optimize our portal according to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Key Accessibility Features Implemented</h2>
            <ul>
              <li><strong>Multi-Language Interface:</strong> Instant localization into 7 major Indian languages (English, हिन्दी, తెలుగు, தமிழ், ಕನ್ನಡ, मराठी, বাংলা) accessible from any page.</li>
              <li><strong>High-Contrast & Dark Mode:</strong> Dynamic contrast toggle enabling comfortable viewing in low-light and high-glare environments.</li>
              <li><strong>Keyboard Navigation:</strong> Fully operable navigation through standard keyboard inputs (Tab, Shift+Tab, Enter, Spacebar, Escape) without keyboard traps.</li>
              <li><strong>Semantic HTML & ARIA:</strong> Structured headings, explicit form labels, ARIA landmarks, and descriptive button titles to ensure seamless screen reader compatibility (NVDA, JAWS, TalkBack).</li>
              <li><strong>Responsive & Zoomable Layout:</strong> Scalable typography supporting up to 200% browser zoom without loss of content or broken horizontal layouts.</li>
              <li><strong>Form Validation Guidance:</strong> Clear error notifications and visual indicators for required fields and invalid inputs.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Assistive Technology Compatibility</h2>
            <p>
              Our platform is tested across modern browsers (Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge) and mobile operating systems (Android, iOS).
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Ongoing Improvements & Feedback</h2>
            <p>
              We recognize that accessibility is an ongoing effort. If you encounter any barriers or need assistance in an alternative format, please reach out to our accessibility team:
            </p>
            <div className="legal-callout">
              <strong>Accessibility Support Desk:</strong><br />
              Email: <a href="mailto:accessibility@consumertrust.org">accessibility@consumertrust.org</a><br />
              Please include the page URL and specific barrier encountered in your message. We aim to respond within 2 business days.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
