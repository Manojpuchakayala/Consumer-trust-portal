import { Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaEnvelope,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBuilding,
} from "react-icons/fa";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      {/* Prominent Statutory Disclaimer Banner */}
      <div className="footer-disclaimer-strip">
        <div className="footer-disclaimer-container">
          <FaExclamationTriangle className="disclaimer-strip-icon" />
          <p>
            <strong>NON-AFFILIATION & LEGAL DISCLAIMER:</strong> Consumer Trust is an independent private dispute facilitation and consumer support platform. We are <strong>NOT</strong> affiliated with, endorsed by, or operating on behalf of the Government of India, the National Consumer Disputes Redressal Commission (NCDRC), Department of Consumer Affairs (DoCA), or any statutory ombudsman. For formal statutory court filings, visit <a href="https://consumerhelpline.gov.in" target="_blank" rel="noopener noreferrer">consumerhelpline.gov.in (1915)</a> or <a href="https://edaakhil.nic.in" target="_blank" rel="noopener noreferrer">edaakhil.nic.in</a>.
          </p>
        </div>
      </div>

      <div className="footer-top">
        <div className="footer-container">
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <FaShieldAlt className="footer-logo-icon" />
              <span>Consumer Trust</span>
            </div>
            <p className="brand-desc">
              Independent consumer support and grievance facilitation platform. Empowering
              citizens with structured dispute formatting, milestone tracking, and corporate mediation.
            </p>
            <div className="trust-badge">
              <FaCheckCircle className="badge-icon" />
              <span>Independent Grievance Facilitation Desk</span>
            </div>
          </div>

          <div className="footer-col">
            <h3>Platform Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home Portal</Link></li>
              <li><Link to="/register">Register Grievance</Link></li>
              <li><Link to="/track">Track Case Status</Link></li>
              <li><Link to="/brands">Enterprise Leaderboard</Link></li>
              <li><Link to="/partner/resolve">Enterprise Resolution Desk</Link></li>
              <li><Link to="/login">Citizen Login</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Policies & Governance</h3>
            <ul className="footer-links">
              <li><Link to="/privacy">Privacy Policy (DPDP)</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/charter">Citizen Service Charter</Link></li>
              <li><Link to="/accessibility">Accessibility Statement</Link></li>
              <li><Link to="/methodology">Brand Methodology & Takedowns</Link></li>
              <li><Link to="/contact">Contact & Helpdesk</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Contact & Support</h3>
            <div className="contact-item">
              <FaEnvelope className="contact-icon" />
              <div>
                <strong>Citizen Support Desk</strong>
                <p>support@consumertrust.org</p>
              </div>
            </div>
            <div className="contact-item">
              <FaBuilding className="contact-icon" />
              <div>
                <strong>Enterprise & Nodal Desk</strong>
                <p>enterprise@consumertrust.org</p>
              </div>
            </div>
            <div className="contact-item">
              <FaClock className="contact-icon" />
              <div>
                <strong>Operating Hours</strong>
                <p>Mon – Sat: 9:00 AM – 6:00 PM IST</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>© {new Date().getFullYear()} Consumer Trust Platform. Independent Grievance Facilitation. All Rights Reserved.</p>
          <div className="footer-terms">
            <Link to="/privacy">Privacy</Link>
            <span>•</span>
            <Link to="/terms">Terms</Link>
            <span>•</span>
            <Link to="/charter">Charter</Link>
            <span>•</span>
            <Link to="/accessibility">Accessibility</Link>
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

export default Footer;
