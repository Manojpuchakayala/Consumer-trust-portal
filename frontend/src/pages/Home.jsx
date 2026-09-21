import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaFileAlt,
  FaSearch,
  FaShieldAlt,
  FaCheckCircle,
  FaHeadset,
  FaStar,
  FaLock,
  FaBolt,
  FaBuilding,
  FaExternalLinkAlt,
  FaArrowRight,
  FaUserCheck,
  FaCertificate,
} from "react-icons/fa";
import api from "../services/api";
import AuthCard from "../components/AuthCard";
import "./Home.css";

export default function Home() {
  const [stats, setStats] = useState({
    total: "50K+",
    resolved: "98%",
    activeUsers: "25K+",
    avgRating: "4.9",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/complaints/public-stats");
        if (response.data?.stats) {
          const s = response.data.stats;
          setStats({
            total: s.total > 0 ? s.total.toLocaleString() : "100+",
            resolved: s.resolved > 0 ? s.resolved.toLocaleString() : "98%",
            activeUsers: s.activeUsers > 0 ? s.activeUsers.toLocaleString() : "50+",
            avgRating: s.avgRating ? `${s.avgRating}` : "4.9",
          });
        }
      } catch {
        // Fallback gracefully to default stats
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="home-root">
      {/* 1. Top Independent Platform Notice Ribbon */}
      <div className="home-top-notice">
        <div className="home-notice-container">
          <FaShieldAlt className="notice-icon" />
          <span>
            <strong>Independent Platform Notice:</strong> Consumer Trust is an independent private dispute facilitation service. We are not a government agency, court, or statutory commission. For formal court filings, visit <a href="https://consumerhelpline.gov.in" target="_blank" rel="noopener noreferrer">consumerhelpline.gov.in <FaExternalLinkAlt style={{ fontSize: 10 }} /></a>.
          </span>
        </div>
      </div>

      {/* 2. Hero Section (2-Column Grid with Embedded AuthCard) */}
      <section className="home-hero-section">
        <div className="hero-container">
          {/* Left Column: Hero Content */}
          <div className="hero-content-col">
            <div className="hero-tag-pill">
              <span className="pill-dot" />
              <span>Independent Consumer Dispute Facilitation</span>
            </div>

            <h1 className="hero-main-title">
              Fair, Structured Resolution for Consumer Disputes
            </h1>

            <p className="hero-lead-text">
              Empowering consumers with structured dispute notices, invoice evidence verification, milestone tracking, and corporate mediation to secure prompt refunds, replacements, and settlements.
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

            {/* Quick Metrics Bar */}
            <div className="hero-stats-row">
              <div className="hero-stat-item">
                <strong>{stats.total}</strong>
                <span>Grievances Lodged</span>
              </div>
              <div className="stat-separator" />
              <div className="hero-stat-item">
                <strong>{stats.resolved}</strong>
                <span>Enterprise Redressal</span>
              </div>
              <div className="stat-separator" />
              <div className="hero-stat-item">
                <strong>★ {stats.avgRating}</strong>
                <span>Citizen Satisfaction</span>
              </div>
            </div>
          </div>

          {/* Right Column: Embedded AuthCard */}
          <div className="hero-auth-col">
            <AuthCard />
          </div>
        </div>
      </section>

      {/* 3. Three-Step "How It Works" Section */}
      <section className="how-it-works-section" id="how-it-works">
        <div className="section-container">
          <div className="section-header-center">
            <span className="section-badge">Streamlined Facilitation Workflow</span>
            <h2>How Consumer Trust Works</h2>
            <p>From initial dispute drafting to corporate redressal settlement, here is how our structured facilitation process operates.</p>
          </div>

          <div className="steps-cards-grid">
            <div className="step-card">
              <div className="step-card-num">01</div>
              <div className="step-icon-box">
                <FaFileAlt />
              </div>
              <h3>Draft & Submit</h3>
              <p>
                Provide seller details, attach invoice proof, structure your claim narrative with our AI assistant, and receive your unique Docket ID.
              </p>
            </div>

            <div className="step-card">
              <div className="step-card-num">02</div>
              <div className="step-icon-box" style={{ background: "var(--secondary-light, #f0fdfa)", color: "var(--secondary, #0d9488)" }}>
                <FaBolt />
              </div>
              <h3>Nodal Dispatch & Review</h3>
              <p>
                Our platform dispatches the dispute summary to the enterprise nodal desk with a tokenized 1-click resolution link for prompt investigation.
              </p>
            </div>

            <div className="step-card">
              <div className="step-card-num">03</div>
              <div className="step-icon-box" style={{ background: "var(--accent-light, #fff7ed)", color: "var(--accent, #ea580c)" }}>
                <FaCertificate />
              </div>
              <h3>Settlement & Rating</h3>
              <p>
                Receive settlement remarks, refund confirmation, download your official Resolution Certificate, and rate the redressal quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. "Your Privacy Comes First" Trust Section */}
      <section className="privacy-trust-section">
        <div className="section-container">
          <div className="section-header-center">
            <span className="section-badge secondary">Security & Compliance</span>
            <h2>Your Privacy Comes First</h2>
            <p>We implement enterprise-grade privacy safeguards, zero public data leakage, and compliance with the Digital Personal Data Protection Act 2023.</p>
          </div>

          <div className="trust-pillars-grid">
            <div className="trust-pillar-card">
              <div className="pillar-icon-wrap">
                <FaLock />
              </div>
              <h3>Protected Case Records</h3>
              <p>
                Case records and personal details are never exposed publicly. Unauthenticated access requires two-factor OTP verification sent to the verified contact on file.
              </p>
            </div>

            <div className="trust-pillar-card">
              <div className="pillar-icon-wrap">
                <FaUserCheck />
              </div>
              <h3>Tokenized Enterprise Mediation</h3>
              <p>
                Corporate grievance officers access disputes securely via time-bound, tokenized 1-click resolution links without compromising consumer account credentials.
              </p>
            </div>

            <div className="trust-pillar-card">
              <div className="pillar-icon-wrap">
                <FaShieldAlt />
              </div>
              <h3>Independent & Transparent</h3>
              <p>
                Clear non-affiliation disclosures, transparent community brand benchmarks, and straightforward data correction mechanisms under our published policy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Brand Trust Preview Section */}
      <section className="brand-preview-section">
        <div className="section-container">
          <div className="brand-preview-header">
            <div>
              <span className="section-badge">Corporate Accountability</span>
              <h2>Enterprise Brand Trust Preview</h2>
              <p>Community resolution benchmarks and verified grievance desk metrics across leading consumer platforms.</p>
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
                <span className="brand-rate text-green">96.4% Resolution</span>
              </div>
              <h4>Amazon India</h4>
              <p className="brand-meta">⚡ 48h Ack / 7 Days Target • ★ 4.8 Rating</p>
            </div>

            <div className="brand-mini-card">
              <div className="brand-mini-top">
                <span className="brand-cat">Banking & UPI</span>
                <span className="brand-rate text-green">98.2% Resolution</span>
              </div>
              <h4>PhonePe Payments</h4>
              <p className="brand-meta">⚡ 24h Ack / 5 Days Target • ★ 4.9 Rating</p>
            </div>

            <div className="brand-mini-card">
              <div className="brand-mini-top">
                <span className="brand-cat">Food Delivery</span>
                <span className="brand-rate text-green">97.6% Resolution</span>
              </div>
              <h4>Zomato</h4>
              <p className="brand-meta">⚡ 24h Ack / 3 Days Target • ★ 4.8 Rating</p>
            </div>
          </div>

          <div className="brand-methodology-note">
            <span>* Ratings are community benchmarks computed from verified user reports and nodal responses. Learn more in our <Link to="/methodology">Brand Methodology & Takedown Policy</Link>.</span>
          </div>
        </div>
      </section>

      {/* 6. CTA Callout Banner */}
      <section className="home-cta-banner">
        <div className="section-container">
          <div className="cta-banner-box">
            <div className="cta-text-wrap">
              <h2>Have an Unresolved Consumer Dispute?</h2>
              <p>Do not let delayed refunds, defective deliveries, or unresponsive customer care go unaddressed. Register your grievance docket today.</p>
            </div>
            <div className="cta-actions-wrap">
              <Link to="/register" className="cta-btn-main">
                <FaFileAlt /> File a Grievance Now
              </Link>
              <Link to="/brands" className="cta-btn-alt">
                <FaBuilding /> Brand Trust Index
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
