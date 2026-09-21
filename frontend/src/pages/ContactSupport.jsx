import { useState } from "react";
import { FaHeadset, FaEnvelope, FaClock, FaCheckCircle, FaExclamationCircle, FaShieldAlt } from "react-icons/fa";
import "./LegalPages.css";

export default function ContactSupport() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    inquiryType: "General Support",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setSubmitted(true);
  };

  return (
    <div className="legal-page-container">
      <div className="legal-content-card">
        <div className="legal-header">
          <div className="legal-header-badge">
            <FaHeadset /> Citizen & Enterprise Support Desk
          </div>
          <h1 className="legal-title">Contact & Helpdesk Support</h1>
          <div className="legal-meta">
            <span>Operating Hours: <strong>Monday to Saturday, 9:00 AM – 6:00 PM IST</strong></span>
            <span>Response SLA: <strong>Within 24 Hours</strong></span>
          </div>
        </div>

        <div className="legal-body">
          <div className="contact-info-cards">
            <div className="contact-info-card">
              <h4><FaEnvelope /> General Support</h4>
              <p>For help registering complaints or tracking cases.</p>
              <a href="mailto:support@consumertrust.org">support@consumertrust.org</a>
            </div>
            <div className="contact-info-card">
              <h4><FaShieldAlt /> Enterprise & Nodal Desk</h4>
              <p>For company nodal updates and enterprise inquiries.</p>
              <a href="mailto:enterprise@consumertrust.org">enterprise@consumertrust.org</a>
            </div>
            <div className="contact-info-card">
              <h4><FaHeadset /> Privacy & DPDP Desk</h4>
              <p>For data correction and personal data removal.</p>
              <a href="mailto:privacy@consumertrust.org">privacy@consumertrust.org</a>
            </div>
          </div>

          <section className="legal-section" style={{ marginTop: 32 }}>
            <h2>Send Us a Message</h2>
            <p>
              Have a question, feedback, or need assistance with an existing case? Fill out the form below and our support team will get back to you promptly.
            </p>

            {submitted ? (
              <div className="legal-callout" style={{ background: "#f0fdf4", borderLeftColor: "#16a34a" }}>
                <FaCheckCircle style={{ marginRight: 8 }} />
                <strong>Thank you! Your message has been received.</strong> Our support team will review your inquiry and reach out to {formData.email} within 24 hours.
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
                {error && (
                  <div style={{ color: "#b91c1c", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
                    <FaExclamationCircle /> {error}
                  </div>
                )}

                <div className="contact-form-grid">
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Manoj Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        fontSize: 14,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. manoj@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        fontSize: 14,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <div className="contact-form-grid" style={{ marginTop: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                      Inquiry Category
                    </label>
                    <select
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        fontSize: 14,
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="General Support">General Citizen Support</option>
                      <option value="Case Tracking Assistance">Case Tracking Assistance</option>
                      <option value="Enterprise Nodal Inquiries">Enterprise Nodal Desk / Resolution</option>
                      <option value="Privacy / Data Request">Privacy / Data Rights (DPDP)</option>
                      <option value="Feedback / Bug Report">Platform Feedback / Bug Report</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                      Subject / Case ID (if applicable)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Inquiry regarding case CT-2026-XXXXX"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        fontSize: 14,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                    Your Message *
                  </label>
                  <textarea
                    rows="5"
                    required
                    placeholder="Please describe how we can assist you..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1px solid #cbd5e1",
                      fontSize: 14,
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ marginTop: 20 }}>
                  <button type="submit" className="contact-submit-btn">
                    <FaEnvelope /> Send Inquiry
                  </button>
                </div>
              </form>
            )}
          </section>

          <section className="legal-section" style={{ marginTop: 36 }}>
            <h2>Statutory Emergency & Redressal Portals</h2>
            <p>
              If you require immediate statutory intervention, you may also file complaints directly with official Government portals:
            </p>
            <ul>
              <li><strong>National Consumer Helpline:</strong> Call <strong>1915</strong> or visit <a href="https://consumerhelpline.gov.in" target="_blank" rel="noopener noreferrer">consumerhelpline.gov.in</a></li>
              <li><strong>e-Daakhil Online Consumer Court:</strong> <a href="https://edaakhil.nic.in" target="_blank" rel="noopener noreferrer">edaakhil.nic.in</a></li>
              <li><strong>Cyber Crime Reporting Portal:</strong> Call <strong>1930</strong> or visit <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer">cybercrime.gov.in</a></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
