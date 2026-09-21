import { Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaEnvelope,
  FaCheckCircle,
  FaInfoCircle,
  FaExternalLinkAlt,
} from "react-icons/fa";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer-wrap">
      {/* Slim, Understated Statutory Disclaimer Info Strip */}
      <div className="footer-disclaimer-strip">
        <div className="footer-disclaimer-container">
          <FaInfoCircle className="disclaimer-strip-icon" />
          <p>
            <strong>NON-AFFILIATION & LEGAL DISCLAIMER:</strong> Consumer Trust is an independent private dispute facilitation platform. We are not affiliated with, endorsed by, or operating on behalf of the Government of India, the National Consumer Disputes Redressal Commission (NCDRC), Department of Consumer Affairs (DoCA), or any consumer court. For statutory judicial filings, visit <a href="https://consumerhelpline.gov.in" target="_blank" rel="noopener noreferrer">consumerhelpline.gov.in (National Consumer Helpline 1915) <FaExternalLinkAlt style={{ fontSize: 10 }} /></a> or <a href="https://edaakhil.nic.in" target="_blank" rel="noopener noreferrer">edaakhil.nic.in <FaExternalLinkAlt style={{ fontSize: 10 }} /></a>.
          </p>
        </div>
      </div>

      <div className="footer-main-content">
        <div className="footer-grid-container">
          {/* Column 1: Brand & Purpose */}
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <div className="footer-logo-badge">
                <FaShieldAlt />
              </div>
              <span>Consumer Trust</span>
            </div>
            <p className="brand-description">
              An independent dispute facilitation platform helping citizens structure claim details, share evidence securely, and communicate with enterprise grievance desks for voluntary resolution.
            </p>
            <div className="independent-status-pill">
              <FaCheckCircle className="pill-check-icon" />
              <span>Independent Private Dispute Desk</span>
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Platform</h4>
            <ul className="footer-nav-list">
              <li><Link to="/">Home Portal</Link></li>
              <li><Link to="/register">File a Grievance</Link></li>
              <li><Link to="/track">Track a Case</Link></li>
              <li><Link to="/brands">Brand Benchmark Index</Link></li>
              <li><Link to="/partner/resolve">Enterprise Resolution Desk</Link></li>
            </ul>
          </div>

          {/* Column 3: Policies & Governance */}
          <div className="footer-col">
            <h4 className="footer-col-title">Governance & Policies</h4>
            <ul className="footer-nav-list">
              <li><Link to="/privacy">Privacy Policy (DPDP 2023)</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/charter">Citizen Redressal Charter</Link></li>
              <li><Link to="/methodology">Brand Methodology & Takedown</Link></li>
              <li><Link to="/accessibility">Accessibility Statement</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Escalation */}
          <div className="footer-col">
            <h4 className="footer-col-title">Support & Contact</h4>
            <p className="footer-support-text">
              For technical inquiries or data protection requests:
            </p>
            <div className="footer-contact-box">
              <FaEnvelope className="contact-icon" />
              <a href="mailto:support@consumertrust.in">support@consumertrust.in</a>
            </div>
            <div style={{ marginTop: 12 }}>
              <Link to="/contact" className="footer-help-link">
                Contact Support Desk →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <p>© {new Date().getFullYear()} Consumer Trust Platform. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy</Link>
            <span>•</span>
            <Link to="/terms">Terms</Link>
            <span>•</span>
            <Link to="/charter">Charter</Link>
            <span>•</span>
            <Link to="/methodology">Methodology</Link>
            <span>•</span>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
