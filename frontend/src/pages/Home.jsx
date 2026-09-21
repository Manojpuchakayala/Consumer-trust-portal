import { Link } from "react-router-dom";
import {
  FaFileAlt,
  FaSearch,
  FaShieldAlt,
  FaCheckCircle,
  FaLock,
  FaBuilding,
  FaExternalLinkAlt,
  FaArrowRight,
  FaUserCheck,
  FaClock,
  FaBalanceScale,
  FaEnvelopeOpenText,
} from "react-icons/fa";
import AuthCard from "../components/AuthCard";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-root">
      {/* 1. Slim, Understated Platform Notice */}
      <div className="home-top-notice">
        <div className="home-notice-container">
          <FaShieldAlt className="notice-icon" />
          <span>
            <strong>Independent Platform Notice:</strong> Consumer Trust is an independent dispute facilitation service (non-governmental). For statutory judicial filings, visit <a href="https://consumerhelpline.gov.in" target="_blank" rel="noopener noreferrer">consumerhelpline.gov.in <FaExternalLinkAlt style={{ fontSize: 9 }} /></a>.
          </span>
        </div>
      </div>

      {/* 2. Editorial-Style Hero Section */}
      <section className="home-hero-section">
        <div className="hero-container">
          {/* Left Column: Calm, Confident Value Proposition */}
          <div className="hero-content-col">
            <div className="hero-tag-pill">
              <span className="pill-dot" />
              <span>Independent Consumer Dispute Facilitation</span>
            </div>

            <h1 className="hero-main-title">
              A clearer path to consumer resolution.
            </h1>

            <p className="hero-lead-text">
              Consumer Trust helps citizens structure dispute details, securely share evidence, and communicate with enterprise grievance desks for voluntary settlement.
            </p>

            <div className="hero-cta-group">
              <Link to="/register" className="hero-btn-primary">
                <FaFileAlt />
                <span>Start a Grievance</span>
                <FaArrowRight className="btn-arrow" />
              </Link>

              <Link to="/track" className="hero-btn-secondary">
                <FaSearch />
                <span>Track a Case</span>
              </Link>
            </div>

            {/* Platform Proof Points */}
            <div className="hero-benchmarks-row">
              <div className="benchmark-item">
                <FaClock className="benchmark-icon" />
                <div>
                  <strong>Typical response target</strong>
                  <span>Timelines vary by enterprise</span>
                </div>
              </div>
              <div className="benchmark-divider" />
              <div className="benchmark-item">
                <FaLock className="benchmark-icon" />
                <div>
                  <strong>Private case access</strong>
                  <span>Verification required</span>
                </div>
              </div>
              <div className="benchmark-divider" />
              <div className="benchmark-item">
                <FaBuilding className="benchmark-icon" />
                <div>
                  <strong>Enterprise contact channels</strong>
                  <span>Supported grievance desks</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Integrated Compact Account Panel */}
          <div className="hero-auth-col">
            <AuthCard />
          </div>
        </div>
      </section>

      {/* 3. Three-Step Structured Workflow */}
      <section className="how-it-works-section" id="how-it-works">
        <div className="section-container">
          <div className="section-header-center">
            <span className="section-badge">Facilitation Process</span>
            <h2>How Consumer Trust Works</h2>
            <p>A structured, evidence-backed workflow connecting consumers with corporate grievance officers.</p>
          </div>

          <div className="steps-cards-grid">
            <div className="step-card">
              <div className="step-card-num">01</div>
              <div className="step-icon-box">
                <FaFileAlt />
              </div>
              <h3>Structure Your Dispute</h3>
              <p>
                Organize transaction facts, attach invoice proof, format your narrative clearly, and generate a unique Docket ID.
              </p>
            </div>

            <div className="step-card">
              <div className="step-card-num">02</div>
              <div className="step-icon-box">
                <FaEnvelopeOpenText />
              </div>
              <h3>Direct Nodal Communication</h3>
              <p>
                A structured dispute notice and tokenized 1-click resolution link are prepared for the enterprise grievance desk.
              </p>
            </div>

            <div className="step-card">
              <div className="step-card-num">03</div>
              <div className="step-icon-box">
                <FaCheckCircle />
              </div>
              <h3>Track Milestones & Resolution</h3>
              <p>
                Monitor voluntary redressal progress in real time, review settlement remarks, and receive your Resolution Record.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Privacy & Compliance Principles */}
      <section className="privacy-trust-section">
        <div className="section-container">
          <div className="section-header-center">
            <span className="section-badge secondary">Data Protection</span>
            <h2>Your privacy comes first.</h2>
            <p>Designed in compliance with the Digital Personal Data Protection Act, 2023 with strict access safeguards.</p>
          </div>

          <div className="trust-pillars-grid">
            <div className="trust-pillar-card">
              <div className="pillar-icon-wrap">
                <FaLock />
              </div>
              <h3>Protected Case Records</h3>
              <p>
                Case records and personal details are never publicly visible. Unauthenticated tracking requires two-factor OTP verification sent to the complainant contact.
              </p>
            </div>

            <div className="trust-pillar-card">
              <div className="pillar-icon-wrap">
                <FaUserCheck />
              </div>
              <h3>Secure Enterprise Access</h3>
              <p>
                Corporate grievance officers access dispute materials via secure, tokenized links without accessing or storing user credentials.
              </p>
            </div>

            <div className="trust-pillar-card">
              <div className="pillar-icon-wrap">
                <FaBalanceScale />
              </div>
              <h3>Independent & Transparent</h3>
              <p>
                Clear non-affiliation disclosures, voluntary mediation facilitation, and published data correction policies under DPDP 2023.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Brand Redressal Benchmarks Preview */}
      <section className="brand-preview-section">
        <div className="section-container">
          <div className="brand-preview-header">
            <div>
              <span className="section-badge">Corporate Benchmarks</span>
              <h2>Enterprise Resolution Benchmarks</h2>
              <p>Community response rates, turnaround times, and verified grievance contacts across major platforms (Q3 2026 data).</p>
            </div>
            <Link to="/brands" className="view-all-brands-link">
              <span>View Full Brand Index</span>
              <FaArrowRight />
            </Link>
          </div>

          <div className="brand-cards-row">
            <div className="brand-mini-card">
              <div className="brand-mini-top">
                <span className="brand-cat">E-Commerce</span>
                <span className="brand-rate text-teal">Community Benchmark</span>
              </div>
              <h4>Amazon India</h4>
              <p className="brand-meta">Typical Target: 48h Ack / 7 Days • Verified Nodal Channel</p>
            </div>

            <div className="brand-mini-card">
              <div className="brand-mini-top">
                <span className="brand-cat">Banking & UPI</span>
                <span className="brand-rate text-teal">Community Benchmark</span>
              </div>
              <h4>PhonePe Payments</h4>
              <p className="brand-meta">Typical Target: 24h Ack / 5 Days • Verified Nodal Channel</p>
            </div>

            <div className="brand-mini-card">
              <div className="brand-mini-top">
                <span className="brand-cat">Food Delivery</span>
                <span className="brand-rate text-teal">Community Benchmark</span>
              </div>
              <h4>Zomato</h4>
              <p className="brand-meta">Typical Target: 24h Ack / 3 Days • Verified Nodal Channel</p>
            </div>
          </div>

          <div className="brand-methodology-note">
            <span>* Community benchmarks compiled from voluntary user submissions and publicly stated nodal response targets (Q3 2026). For details or enterprise corrections, read our <Link to="/methodology">Methodology & Takedown Policy</Link>.</span>
          </div>
        </div>
      </section>

      {/* 6. CTA Action Strip */}
      <section className="home-cta-banner">
        <div className="section-container">
          <div className="cta-banner-box">
            <div className="cta-text-wrap">
              <h2>Have an unresolved consumer dispute?</h2>
              <p>Structure your grievance details and dispatch an evidence-backed resolution notice to the enterprise desk.</p>
            </div>
            <div className="cta-actions-wrap">
              <Link to="/register" className="cta-btn-main">
                <FaFileAlt /> File a Grievance
              </Link>
              <Link to="/brands" className="cta-btn-alt">
                <FaBuilding /> Brand Index
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
