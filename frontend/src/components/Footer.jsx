import { Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaEnvelope,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBuilding,
  FaExternalLinkAlt,
} from "react-icons/fa";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer-wrap">
      {/* Prominent Statutory Disclaimer Banner */}
      <div className="footer-disclaimer-strip">
        <div className="footer-disclaimer-container">
          <FaExclamationTriangle className="disclaimer-strip-icon" />
          <p>
            <strong>NON-AFFILIATION & LEGAL DISCLAIMER:</strong> Consumer Trust is an independent private dispute facilitation and mediation platform. We are <strong>NOT</strong> affiliated with, endorsed by, or operating on behalf of the Government of India, the National Consumer Disputes Redressal Commission (NCDRC), Department of Consumer Affairs (DoCA), or any statutory consumer court. For formal statutory judicial filings, visit <a href="https://consumerhelpline.gov.in" target="_blank" rel="noopener noreferrer">consumerhelpline.gov.in (National Consumer Helpline 1915) <FaExternalLinkAlt style={{ fontSize: 10 }} /></a> or <a href="https://edaakhil.nic.in" target="_blank" rel="noopener noreferrer">edaakhil.nic.in <FaExternalLinkAlt style={{ fontSize: 10 }} /></a>.
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
              Independent consumer dispute facilitation and corporate resolution platform. Helping citizens format evidence-backed claims, track live milestones, and secure fair corporate redressal settlements.
            </p>
            <div className="independent-status-pill">
              <FaCheckCircle className="pill-check-icon" />
              <span>Independent Private Dispute Desk</span>
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Platform Hub</h4>
            <ul className="footer-nav-list">
              <li><Link to="/">Home Portal</Link></li>
              <li><Link to="/register">File Grievance</Link></li>
              <li><Link to="/track">Track Case Status</Link></li>
              <li><Link to="/brands">Brand Trust Index</Link></li>
              <li><Link to="/partner/resolve">Enterprise 1-Click Desk</Link></li>
              <li><Link to="/login">Citizen Login</Link></li>
            </ul>
          </div>

          {/* Column 3: Policies & Governance */}
          <div className="footer-col">
            <h4 className="footer-col-title">Governance & Legal</h4>
            <ul className="footer-nav-list">
              <li><Link to="/privacy">Privacy Policy (DPDP 2023)</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/charter">Citizen Service Charter</Link></li>
              <li><Link to="/accessibility">Accessibility Commitment</Link></li>
              <li><Link to="/methodology">Brand Score Methodology</Link></li>
              <li><Link to="/contact">Helpdesk & Contact</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Hours */}
          <div className="footer-col">
            <h4 className="footer-col-title">Support & Hours</h4>
            <div className="footer-contact-item">
              <FaEnvelope className="contact-item-icon" />
              <div>
                <strong>Citizen Support Desk</strong>
                <p>support@consumertrust.org</p>
              </div>
            </div>
            <div className="footer-contact-item">
              <FaBuilding className="contact-item-icon" />
              <div>
                <strong>Enterprise Nodal Desk</strong>
                <p>nodal@consumertrust.org</p>
              </div>
            </div>
            <div className="footer-contact-item">
              <FaClock className="contact-item-icon" />
              <div>
                <strong>Facilitation Desk Hours</strong>
                <p>Mon – Sat: 9:00 AM – 6:00 PM IST</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom Strip */}
      <div className="footer-bottom-strip">
        <div className="footer-bottom-container">
          <p>© {new Date().getFullYear()} Consumer Trust Platform. Independent Dispute Facilitation. All Rights Reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy</Link>
            <span className="dot-sep">•</span>
            <Link to="/terms">Terms</Link>
            <span className="dot-sep">•</span>
            <Link to="/charter">Charter</Link>
            <span className="dot-sep">•</span>
            <Link to="/accessibility">Accessibility</Link>
            <span className="dot-sep">•</span>
            <Link to="/methodology">Methodology</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
