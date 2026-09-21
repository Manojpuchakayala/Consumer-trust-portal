import { Link } from "react-router-dom";
import {
  FaFileAlt,
  FaSearch,
  FaShieldAlt,
  FaCheckCircle,
  FaLock,
  FaExternalLinkAlt,
  FaArrowRight,
  FaPaperclip,
  FaEnvelopeOpenText,
  FaInfoCircle,
  FaQuestionCircle,
} from "react-icons/fa";
import "./Home.css";

export default function Home() {
  const scrollToHowItWorks = (e) => {
    e.preventDefault();
    const elem = document.getElementById("how-it-works");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="home-root">
      {/* Decorative ambient background elements */}
      <div className="home-ambient-glow top-left" aria-hidden="true" />
      <div className="home-ambient-glow top-right" aria-hidden="true" />

      {/* =========================================================================
          1. HERO SECTION
          ========================================================================= */}
      <section className="home-hero-section">
        <div className="hero-container">
          <div className="hero-content">
            {/* Tag Pill */}
            <div className="hero-tag-pill">
              <span className="pill-dot" />
              <span>Independent Dispute Facilitation</span>
            </div>

            {/* Main Headline */}
            <h1 className="hero-main-title">
              A clearer path to consumer resolution.
            </h1>

            {/* Short Supporting Text */}
            <p className="hero-lead-text">
              Consumer Trust helps you prepare a structured grievance, organize supporting evidence, and communicate directly with enterprise grievance desks for voluntary resolution.
            </p>

            {/* Short Non-Affiliation Notice Card */}
            <div className="hero-non-affiliation-card">
              <div className="non-aff-badge">
                <FaShieldAlt className="non-aff-icon" />
                <strong>Non-Affiliation Notice:</strong>
              </div>
              <p className="non-aff-text">
                Consumer Trust is an independent private dispute facilitation platform. It is not a Government of India service, consumer court, or statutory grievance portal.
              </p>
              <div className="non-aff-statutory-row">
                <span>Official statutory portals:</span>
                <a
                  href="https://consumerhelpline.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="statutory-link"
                >
                  consumerhelpline.gov.in (NCH 1915) <FaExternalLinkAlt style={{ fontSize: 9 }} />
                </a>
                <span className="link-sep">•</span>
                <a
                  href="https://edaakhil.nic.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="statutory-link"
                >
                  edaakhil.nic.in <FaExternalLinkAlt style={{ fontSize: 9 }} />
                </a>
              </div>
            </div>

            {/* Only 3 CTAs */}
            <div className="hero-cta-group">
              <Link to="/register" className="hero-btn-primary">
                <FaFileAlt />
                <span>Prepare a Grievance</span>
                <FaArrowRight className="btn-arrow" />
              </Link>

              <Link to="/track" className="hero-btn-secondary">
                <FaSearch />
                <span>Track an Existing Case</span>
              </Link>

              <a
                href="#how-it-works"
                onClick={scrollToHowItWorks}
                className="hero-btn-tertiary"
              >
                <FaQuestionCircle />
                <span>How It Works</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. HOW IT WORKS — MAIN EDUCATIONAL SECTION
          ========================================================================= */}
      <section className="how-it-works-section" id="how-it-works">
        <div className="section-container">
          <div className="section-header-center">
            <span className="section-badge">Simple 4-Step Flow</span>
            <h2>How it works</h2>
            <p>
              A straightforward process to organize dispute facts and request voluntary redressal from enterprise grievance officers.
            </p>
          </div>

          <div className="steps-grid">
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-header">
                <span className="step-number">01</span>
                <div className="step-icon-wrap">
                  <FaFileAlt />
                </div>
              </div>
              <h3>1. Prepare your grievance</h3>
              <p>
                Structure your dispute chronology, transaction references, and desired remedy (refund, replacement, or rectification) in a clear format.
              </p>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-header">
                <span className="step-number">02</span>
                <div className="step-icon-wrap">
                  <FaPaperclip />
                </div>
              </div>
              <h3>2. Add relevant evidence</h3>
              <p>
                Attach purchase invoices, receipts, customer chat logs, or defect photographs while keeping sensitive secrets safe.
              </p>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-header">
                <span className="step-number">03</span>
                <div className="step-icon-wrap">
                  <FaEnvelopeOpenText />
                </div>
              </div>
              <h3>3. Share with the enterprise</h3>
              <p>
                A standardized dispute facilitation notice is delivered directly to the company&rsquo;s designated customer grievance desk.
              </p>
            </div>

            {/* Step 4 */}
            <div className="step-card">
              <div className="step-header">
                <span className="step-number">04</span>
                <div className="step-icon-wrap">
                  <FaCheckCircle />
                </div>
              </div>
              <h3>4. Track voluntary resolution</h3>
              <p>
                Monitor milestone progress in real time, review enterprise remarks, and access your resolution record upon completion.
              </p>
            </div>
          </div>

          {/* Legal Clarification Banner */}
          <div className="voluntary-clarification-banner">
            <FaInfoCircle className="clarification-icon" />
            <p>
              <strong>Legal Clarification:</strong> Consumer Trust cannot issue legal orders, compel a company, or replace consumer-court remedies. Voluntary dispute resolution does not affect your right to file statutory complaints.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. TRUST HIGHLIGHTS SECTION
          ========================================================================= */}
      <section className="trust-highlights-section">
        <div className="section-container">
          <div className="section-header-center">
            <span className="section-badge">Platform Pillars</span>
            <h2>Why use Consumer Trust</h2>
            <p>Built to make consumer dispute communication structured, private, and transparent.</p>
          </div>

          <div className="trust-cards-grid">
            {/* Trust Card 1 */}
            <div className="trust-card">
              <div className="trust-card-icon-wrap">
                <FaShieldAlt />
              </div>
              <h3>Independent private facilitation</h3>
              <p>
                Operated independently to help consumers structure claims and communicate with enterprises for amicable, voluntary settlement.
              </p>
            </div>

            {/* Trust Card 2 */}
            <div className="trust-card">
              <div className="trust-card-icon-wrap">
                <FaLock />
              </div>
              <h3>Private case access</h3>
              <p>
                Your dispute details and attached documents remain private and are accessible only through verified case credentials.
              </p>
            </div>

            {/* Trust Card 3 */}
            <div className="trust-card">
              <div className="trust-card-icon-wrap">
                <FaFileAlt />
              </div>
              <h3>Evidence-based case preparation</h3>
              <p>
                Organize purchase invoices, transaction IDs, and factual timelines into a structured dossier for faster enterprise review.
              </p>
            </div>
          </div>

          {/* Privacy Policy Link */}
          <div className="trust-footer-link">
            <Link to="/privacy" className="privacy-policy-anchor">
              Learn more about our data protection standards in our Privacy Policy <FaArrowRight style={{ fontSize: 11 }} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. FINAL CTA SECTION
          ========================================================================= */}
      <section className="final-cta-section">
        <div className="section-container">
          <div className="final-cta-card">
            <div className="cta-ambient-glow" aria-hidden="true" />
            <div className="final-cta-content">
              <h2>Ready to structure your consumer grievance?</h2>
              <p>
                Prepare your claim facts, attach evidence securely, and send a structured facilitation notice to the enterprise grievance desk.
              </p>
              <div className="final-cta-buttons">
                <Link to="/register" className="final-btn-primary">
                  <FaFileAlt /> Prepare a Grievance
                </Link>
                <Link to="/track" className="final-btn-secondary">
                  <FaSearch /> Track a Case
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
