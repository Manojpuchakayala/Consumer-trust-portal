import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaFileAlt,
  FaSearch,
  FaShieldAlt,
  FaBolt,
  FaLock,
  FaCheckCircle,
  FaHeadset,
  FaClock,
  FaStar,
  FaWhatsapp,
  FaPaperclip,
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
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <FaShieldAlt /> Fast, Transparent & Citizen-Centric Redressal
          </div>
          <h1>Consumer Trust Redressal Portal</h1>
          <p>
            Experience seamless grievance redressal. Submit your complaints
            with evidence documents, receive instant WhatsApp status cards, monitor
            live investigation milestones, and rate official resolutions.
          </p>

          <div className="hero-buttons">
            <Link to="/register">
              <button className="primary-btn">
                <FaFileAlt style={{ marginRight: 8 }} />
                Register New Complaint
              </button>
            </Link>

            <Link to="/track">
              <button className="secondary-btn">
                <FaSearch style={{ marginRight: 8 }} />
                Track Complaint Status
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
          <p>Grievances Registered</p>
        </div>

        <div className="card">
          <div className="card-icon-wrap">
            <FaCheckCircle className="stat-icon" />
          </div>
          <h2>{stats.resolved}</h2>
          <p>Resolved Successfully</p>
        </div>

        <div className="card">
          <div className="card-icon-wrap" style={{ background: "#fef3c7" }}>
            <FaStar className="stat-icon" style={{ color: "#f59e0b" }} />
          </div>
          <h2>★ {stats.avgRating}</h2>
          <p>Citizen Satisfaction Score</p>
        </div>

        <div className="card">
          <div className="card-icon-wrap">
            <FaHeadset className="stat-icon" />
          </div>
          <h2>24×7</h2>
          <p>Active Consumer Desk</p>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="features">
        <h2>Why Choose Consumer Trust?</h2>
        <p className="section-sub">
          A modern digital platform built for accountability, consumer rights protection, and rapid dispute handling.
        </p>

        <div className="feature-grid">
          <div className="feature">
            <div className="feature-icon-box">
              <FaPaperclip />
            </div>
            <h3>Evidence Attachment</h3>
            <p>
              Upload invoices, transaction bills, and product photos directly with your complaint to speed up verification.
            </p>
          </div>

          <div className="feature">
            <div className="feature-icon-box" style={{ background: "#e8f5e9", color: "#25d366" }}>
              <FaWhatsapp />
            </div>
            <h3>Instant WhatsApp Alerts</h3>
            <p>
              Receive official grievance cards, milestone updates, and 1-tap tracking links on WhatsApp (100% Free & Unlimited).
            </p>
          </div>

          <div className="feature">
            <div className="feature-icon-box">
              <FaSearch />
            </div>
            <h3>Real-Time Tracking</h3>
            <p>
              Monitor every phase of inquiry with transparent step-by-step progress tracking, timestamps, and officer remarks.
            </p>
          </div>

          <div className="feature">
            <div className="feature-icon-box">
              <FaStar />
            </div>
            <h3>Citizen Feedback & Rating</h3>
            <p>
              Rate your resolution quality with our 5-star citizen satisfaction survey to keep redressal officers accountable.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>Simple 3-Step Process</h2>
        <p className="section-sub">
          From grievance filing to official resolution, here is how our workflow protects your rights.
        </p>

        <div className="steps">
          <div className="step">
            <div className="step-num">1</div>
            <h3>Submit Grievance</h3>
            <p>
              Provide seller/service details, attach invoice proofs, and opt into SMS alerts to receive your unique Tracking ID.
            </p>
          </div>

          <div className="step">
            <div className="step-num">2</div>
            <h3>Inquiry & Review</h3>
            <p>
              Our grievance desk reviews the claim, gathers merchant feedback, and conducts an official inquiry.
            </p>
          </div>

          <div className="step">
            <div className="step-num">3</div>
            <h3>Resolution & Closure</h3>
            <p>
              Receive official remarks, refund/repair settlements, closing summary, and submit your satisfaction review.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="cta-banner">
        <div className="cta-box">
          <h2>Have an Unresolved Consumer Issue?</h2>
          <p>
            Do not let unfair trade practices or poor service go unaddressed. Register your complaint today.
          </p>
          <div className="cta-buttons">
            <Link to="/register" className="cta-primary">
              File a Complaint Now
            </Link>
            <Link to="/track" className="cta-secondary">
              Check Existing Case
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
