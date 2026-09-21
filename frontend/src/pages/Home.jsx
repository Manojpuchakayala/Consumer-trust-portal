import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaFileAlt,
  FaSearch,
  FaShieldAlt,
  FaCheckCircle,
  FaHeadset,
  FaStar,
  FaWhatsapp,
  FaPaperclip,
  FaExclamationTriangle,
  FaBuilding,
  FaExternalLinkAlt,
} from "react-icons/fa";
import api from "../services/api";
import "./Home.css";

function Home() {
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
      } catch (err) {
        // Fallback gracefully to default stats
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="home-page">
      {/* Prominent Independent Platform Notice Banner */}
      <div className="home-top-disclaimer">
        <div className="home-disclaimer-content">
          <FaExclamationTriangle className="home-disclaimer-icon" />
          <span>
            <strong>Independent Platform Notice:</strong> Consumer Trust is a private consumer support and dispute facilitation desk. We are not a government agency, consumer court, or statutory ombudsman. For formal statutory filings, visit <a href="https://consumerhelpline.gov.in" target="_blank" rel="noopener noreferrer">consumerhelpline.gov.in <FaExternalLinkAlt style={{ fontSize: 10 }} /></a>.
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <FaShieldAlt /> Independent Consumer Support & Grievance Facilitation
          </div>
          <h1>Consumer Trust Grievance Portal</h1>
          <p>
            Experience structured consumer dispute facilitation. Draft grievance notices,
            attach invoice evidence, track live enterprise response milestones, and rate corporate resolution settlements.
          </p>

          <div className="hero-buttons">
            <Link to="/register">
              <button className="primary-btn">
                <FaFileAlt style={{ marginRight: 8 }} />
                Register New Grievance
              </button>
            </Link>

            <Link to="/track">
              <button className="secondary-btn">
                <FaSearch style={{ marginRight: 8 }} />
                Track Case Status
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Highlight Bar */}
      <section className="stats">
        <div className="card">
          <div className="card-icon-wrap">
            <FaFileAlt className="stat-icon" />
          </div>
          <h2>{stats.total}</h2>
          <p>Grievances Facilitated</p>
        </div>

        <div className="card">
          <div className="card-icon-wrap">
            <FaCheckCircle className="stat-icon" />
          </div>
          <h2>{stats.resolved}</h2>
          <p>Resolved by Enterprises</p>
        </div>

        <div className="card">
          <div className="card-icon-wrap" style={{ background: "#fef3c7" }}>
            <FaStar className="stat-icon" style={{ color: "#f59e0b" }} />
          </div>
          <h2>★ {stats.avgRating}</h2>
          <p>Citizen Satisfaction Benchmark</p>
        </div>

        <div className="card">
          <div className="card-icon-wrap">
            <FaHeadset className="stat-icon" />
          </div>
          <h2>Active</h2>
          <p>Facilitation Desk</p>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="features">
        <h2>Transparent Consumer Dispute Mediation</h2>
        <p className="section-sub">
          A modern digital platform built for accountability, consumer rights awareness, and structured corporate escalation.
        </p>

        <div className="feature-grid">
          <div className="feature">
            <div className="feature-icon-box">
              <FaPaperclip />
            </div>
            <h3>Evidence Verification</h3>
            <p>
              Attach invoices, warranty receipts, and product photos to substantiate your claim directly with the enterprise.
            </p>
          </div>

          <div className="feature">
            <div className="feature-icon-box" style={{ background: "#e8f5e9", color: "#25d366" }}>
              <FaWhatsapp />
            </div>
            <h3>Instant Milestone Alerts</h3>
            <p>
              Receive transactional status notifications and 1-tap live case tracking links directly to your mobile device.
            </p>
          </div>

          <div className="feature">
            <div className="feature-icon-box">
              <FaSearch />
            </div>
            <h3>Transparent Tracking</h3>
            <p>
              Monitor inquiry phases with clear chronological step-by-step progress tracking, timestamps, and enterprise remarks.
            </p>
          </div>

          <div className="feature">
            <div className="feature-icon-box">
              <FaStar />
            </div>
            <h3>Resolution Feedback</h3>
            <p>
              Rate your resolution quality with our 5-star citizen satisfaction survey to keep corporate redressal desks accountable.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>Simple 3-Step Facilitation Process</h2>
        <p className="section-sub">
          From dispute submission to corporate settlement, here is how our structured facilitation workflow works.
        </p>

        <div className="steps">
          <div className="step">
            <div className="step-num">1</div>
            <h3>Draft & Submit</h3>
            <p>
              Provide seller details, attach invoice proof, structure your claim with our AI assistant, and receive your unique Tracking ID.
            </p>
          </div>

          <div className="step">
            <div className="step-num">2</div>
            <h3>Enterprise Review</h3>
            <p>
              Our platform dispatches the dispute summary to the enterprise nodal desk with a tokenized 1-click resolution link.
            </p>
          </div>

          <div className="step">
            <div className="step-num">3</div>
            <h3>Settlement & Rating</h3>
            <p>
              Receive settlement remarks, refund/repair confirmation, download your Resolution Record, and rate the resolution.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="cta-banner">
        <div className="cta-box">
          <h2>Have an Unresolved Consumer Dispute?</h2>
          <p>
            Do not let unfair trade practices or delayed refunds go unaddressed. Register your grievance docket today.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="primary-btn">
              File a Grievance Now
            </Link>
            <Link to="/brands" className="secondary-btn">
              <FaBuilding style={{ marginRight: 8 }} />
              View Brand Trust Index
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
