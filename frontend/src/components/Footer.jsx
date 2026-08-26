import { Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaCheckCircle,
} from "react-icons/fa";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-container">
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <FaShieldAlt className="footer-logo-icon" />
              <span>Consumer Trust</span>
            </div>
            <p className="brand-desc">
              National online consumer grievance redressal platform. Empowering
              citizens with transparent, verified, and rapid complaint resolutions.
            </p>
            <div className="trust-badge">
              <FaCheckCircle className="badge-icon" />
              <span>Official & Secure Redressal Channel</span>
            </div>
          </div>

          <div className="footer-col">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home Portal</Link></li>
              <li><Link to="/register">Register Complaint</Link></li>
              <li><Link to="/track">Track Status</Link></li>
              <li><Link to="/my-complaints">My Grievances</Link></li>
              <li><Link to="/admin">Admin Access</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Complaint Categories</h3>
            <ul className="footer-links">
              <li><Link to="/register">Product & Electronics</Link></li>
              <li><Link to="/register">E-Commerce & Services</Link></li>
              <li><Link to="/register">Food Safety & Standards</Link></li>
              <li><Link to="/register">Banking & Financial</Link></li>
              <li><Link to="/register">Telecom & Utilities</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Contact & Support</h3>
            <div className="contact-item">
              <FaEnvelope className="contact-icon" />
              <div>
                <strong>Support Desk</strong>
                <p>support@consumertrust.gov.in</p>
              </div>
            </div>
            <div className="contact-item">
              <FaPhoneAlt className="contact-icon" />
              <div>
                <strong>Toll-Free Helpline</strong>
                <p>1800-11-4000 / 1915</p>
              </div>
            </div>
            <div className="contact-item">
              <FaMapMarkerAlt className="contact-icon" />
              <div>
                <strong>Headquarters</strong>
                <p>Consumer Grievance Bhavan, New Delhi, India</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>© {new Date().getFullYear()} Consumer Trust Redressal Portal. All Rights Reserved.</p>
          <div className="footer-terms">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Citizen Charter</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
