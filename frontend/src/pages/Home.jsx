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
  FaBalanceScale,
  FaUsers,
  FaMagic,
  FaGavel,
  FaBuilding,
} from "react-icons/fa";
import ResolutionTicker from "../components/ResolutionTicker";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-root">
      {/* Decorative ambient background elements */}
      <div className="home-ambient-glow top-left" aria-hidden="true" />
      <div className="home-ambient-glow top-right" aria-hidden="true" />

      {/* =========================================================================
          1. HERO SECTION (Conversion-Focused, Clean & Spacious)
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

            {/* Two Primary CTAs */}
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
            </div>

            {/* Short Hero Trust Line */}
            <div className="hero-trust-line">
              <span>Private case access</span>
              <span className="trust-dot">•</span>
              <span>Independent platform</span>
              <span className="trust-dot">•</span>
              <span>Voluntary facilitation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Settlements Marquee Ticker */}
      <ResolutionTicker />

      {/* =========================================================================
          2. HOW IT WORKS — SINGLE 4-STEP WORKFLOW SECTION
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
        </div>
      </section>

      {/* =========================================================================
          2.5. COLLECTIVE ACTIONS & RECURRING DISPUTES SPOTLIGHT
          ========================================================================= */}
      <section className="home-class-spotlight-section">
        <div className="section-container">
          <div className="spotlight-card-wrapper">
            <div className="spotlight-header-row">
              <div>
                <span className="spotlight-tag">
                  <FaUsers /> Collective Citizen Legal Power • CPA 2019 Sec 35(1)(c)
                </span>
                <h2>Active Collective Class Actions</h2>
                <p>Join grouped consumer petitions for systemic defects, mass cancellations, and unrefunded charges.</p>
              </div>
              <Link to="/class-actions" className="spotlight-view-all-btn">
                View All Petitions <FaArrowRight />
              </Link>
            </div>

            <div className="spotlight-cards-grid">
              <div className="spotlight-mini-card">
                <div className="mini-card-top">
                  <span className="mini-brand"><FaBuilding /> Samsung</span>
                  <span className="mini-urgency high">142 Citizens</span>
                </div>
                <h4>AMOLED Green Line Screen Defect</h4>
                <p>Mass petition seeking free replacement for out-of-warranty screen line failures.</p>
                <Link to="/class-actions" className="mini-card-link">Join Petition <FaArrowRight /></Link>
              </div>

              <div className="spotlight-mini-card">
                <div className="mini-card-top">
                  <span className="mini-brand"><FaBuilding /> SpiceJet</span>
                  <span className="mini-urgency urgent">68 Citizens</span>
                </div>
                <h4>Flight Cancellation Refund Delays</h4>
                <p>Demanding refund disbursement + 18% statutory interest for flight cancellations.</p>
                <Link to="/class-actions" className="mini-card-link">Join Petition <FaArrowRight /></Link>
              </div>

              <div className="spotlight-mini-card">
                <div className="mini-card-top">
                  <span className="mini-brand"><FaBuilding /> Ola Electric</span>
                  <span className="mini-urgency high">114 Citizens</span>
                </div>
                <h4>Service Delays & Battery Range</h4>
                <p>Joint redressal for long repair turnaround times and battery replacement queues.</p>
                <Link to="/class-actions" className="mini-card-link">Join Petition <FaArrowRight /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. TRUST HIGHLIGHTS SECTION (Platform Pillars)
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
          4. FINAL CTA SECTION (Rich Navy Gradient)
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

      {/* =========================================================================
          5. BOTTOM LEGAL INFORMATION SECTION (Discreet, Concise Pre-Footer Area)
          ========================================================================= */}
      <section className="home-legal-info-section" aria-label="Legal information and statutory notices">
        <div className="section-container">
          <div className="legal-info-wrapper">
            <div className="legal-info-header">
              <span className="legal-info-tag">
                <FaInfoCircle /> Legal Clarity &amp; Official Channels
              </span>
            </div>

            <div className="legal-info-grid">
              {/* Card 1: Independent Platform Notice */}
              <div className="legal-info-card">
                <div className="legal-card-title-row">
                  <div className="legal-card-icon">
                    <FaShieldAlt />
                  </div>
                  <h4>Independent Platform Notice</h4>
                </div>
                <p className="legal-card-body">
                  Consumer Trust is an independent private dispute facilitation platform. It is not affiliated with the Government of India, National Consumer Helpline, NCDRC, or any consumer court.
                </p>
                <div className="legal-statutory-links">
                  <span className="legal-statutory-label">Official statutory portals:</span>
                  <div className="legal-statutory-group">
                    <a
                      href="https://consumerhelpline.gov.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="legal-external-link"
                    >
                      National Consumer Helpline (consumerhelpline.gov.in / 1915) <FaExternalLinkAlt style={{ fontSize: 9 }} />
                    </a>
                    <span className="legal-link-divider">•</span>
                    <a
                      href="https://edaakhil.nic.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="legal-external-link"
                    >
                      e-Daakhil (edaakhil.nic.in) <FaExternalLinkAlt style={{ fontSize: 9 }} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Card 2: Voluntary Facilitation Scope */}
              <div className="legal-info-card">
                <div className="legal-card-title-row">
                  <div className="legal-card-icon">
                    <FaBalanceScale />
                  </div>
                  <h4>Voluntary Facilitation Scope</h4>
                </div>
                <p className="legal-card-body">
                  Consumer Trust cannot issue legal orders, compel a company, impose statutory fines, or replace consumer-court remedies. Voluntary dispute resolution does not restrict your statutory filing rights.
                </p>
                <div className="legal-statutory-links">
                  <span className="legal-statutory-label">Platform governance:</span>
                  <div className="legal-statutory-group">
                    <Link to="/terms" className="legal-internal-link">
                      Terms of Service <FaArrowRight style={{ fontSize: 9 }} />
                    </Link>
                    <span className="legal-link-divider">•</span>
                    <Link to="/charter" className="legal-internal-link">
                      Citizen Charter <FaArrowRight style={{ fontSize: 9 }} />
                    </Link>
                    <span className="legal-link-divider">•</span>
                    <Link to="/methodology" className="legal-internal-link">
                      Methodology <FaArrowRight style={{ fontSize: 9 }} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. STICKY MOBILE ACTION BAR (Only visible on mobile devices)
          ========================================================================= */}
      <div className="mobile-sticky-action-bar" aria-label="Quick actions">
        <Link to="/register" className="mobile-bar-btn-primary">
          <FaFileAlt /> Prepare Grievance
        </Link>
        <Link to="/track" className="mobile-bar-btn-secondary">
          <FaSearch /> Track Case
        </Link>
      </div>
    </div>
  );
}
