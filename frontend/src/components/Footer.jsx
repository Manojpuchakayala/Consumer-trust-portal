import { Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaEnvelope,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaWhatsapp,
} from "react-icons/fa";
import { getPlatformWhatsAppShareUrl } from "../utils/whatsappShare";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer-wrap">
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
              An independent private dispute facilitation platform helping consumers organize claim facts, attach evidence securely, and communicate with enterprise grievance desks for voluntary settlement.
            </p>
            <div className="independent-status-pill">
              <FaCheckCircle className="pill-check-icon" />
              <span>Independent Private Facilitation Desk</span>
            </div>
            <div className="footer-share-wa-wrap" style={{ marginTop: 12 }}>
              <a
                href={getPlatformWhatsAppShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-wa-share-btn"
                title="Share Consumer Trust with others on WhatsApp"
              >
                <FaWhatsapp /> Share Platform on WhatsApp
              </a>
            </div>
          </div>

          {/* Column 2: Platform Navigation */}
          <div className="footer-col">
            <h4 className="footer-col-title">Platform</h4>
            <ul className="footer-nav-list">
              <li><Link to="/">Home Portal</Link></li>
              <li><Link to="/register">Prepare a Grievance</Link></li>
              <li><Link to="/track">Track a Case</Link></li>
              <li><Link to="/class-actions">Collective Class Actions</Link></li>
              <li><Link to="/brands">Brand Benchmark Index</Link></li>
              <li><Link to="/partner/resolve">Enterprise Resolution Desk</Link></li>
            </ul>
          </div>

          {/* Column 3: Governance & Policies */}
          <div className="footer-col">
            <h4 className="footer-col-title">Governance & Policies</h4>
            <ul className="footer-nav-list">
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/charter">Citizen Service Charter</Link></li>
              <li><Link to="/methodology">Brand Methodology & Takedown</Link></li>
              <li><Link to="/accessibility">Accessibility Statement</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Statutory Channels */}
          <div className="footer-col">
            <h4 className="footer-col-title">Contact & Statutory Portals</h4>
            <div className="footer-contact-box">
              <FaEnvelope className="contact-icon" />
              <div className="contact-box-content">
                <span className="contact-type">Support Desk</span>
                <a href="mailto:support@consumertrust.in">support@consumertrust.in</a>
              </div>
            </div>
            <div className="footer-contact-box" style={{ marginTop: 8 }}>
              <FaShieldAlt className="contact-icon" />
              <div className="contact-box-content">
                <span className="contact-type">Privacy & Data Rights</span>
                <a href="mailto:privacy@consumertrust.in">privacy@consumertrust.in</a>
              </div>
            </div>
            <div className="statutory-links-box">
              <span className="statutory-title">Official Statutory Channels:</span>
              <a href="https://consumerhelpline.gov.in" target="_blank" rel="noopener noreferrer">
                National Consumer Helpline 1915 <FaExternalLinkAlt style={{ fontSize: 9 }} />
              </a>
              <a href="https://edaakhil.nic.in" target="_blank" rel="noopener noreferrer">
                e-Daakhil Consumer Court <FaExternalLinkAlt style={{ fontSize: 9 }} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar with One-Line Disclaimer */}
        <div className="footer-bottom-bar">
          <div className="footer-bottom-info">
            <p className="footer-disclaimer-oneline">
              <strong>NON-AFFILIATION & LEGAL DISCLAIMER:</strong> Consumer Trust is an independent private dispute facilitation platform. Not affiliated with the Government of India, NCDRC, or any consumer court.
            </p>
            <p className="footer-copyright">
              © {new Date().getFullYear()} Consumer Trust. All rights reserved.
            </p>
          </div>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy</Link>
            <span>•</span>
            <Link to="/terms">Terms</Link>
            <span>•</span>
            <Link to="/charter">Charter</Link>
            <span>•</span>
            <Link to="/methodology">Methodology</Link>
            <span>•</span>
            <Link to="/accessibility">Accessibility</Link>
            <span>•</span>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
