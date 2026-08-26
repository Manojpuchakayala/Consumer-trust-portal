import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaTag,
  FaFileAlt,
  FaCheckCircle,
  FaCopy,
  FaArrowRight,
  FaExclamationCircle,
} from "react-icons/fa";
import api from "../services/api";
import "./RegisterComplaint.css";

function RegisterComplaint() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "Product",
    subject: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedData, setSubmittedData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Pre-fill user data if logged in
    const storedUser = localStorage.getItem("consumerTrustUser");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setFormData((prev) => ({
          ...prev,
          name: u.name || prev.name,
          email: u.email || prev.email,
          phone: u.phone || prev.phone,
        }));
      } catch (e) {}
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/complaints", formData);

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to submit complaint");
      }

      setSubmittedData({
        complaintId: response.data.complaintId,
        subject: formData.subject,
        category: formData.category,
        name: formData.name,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to register complaint. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = () => {
    if (submittedData?.complaintId) {
      navigator.clipboard.writeText(submittedData.complaintId);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      category: "Product",
      subject: "",
      description: "",
    });
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {submittedData ? (
          <div className="success-card">
            <div className="success-icon-wrap">
              <FaCheckCircle className="success-icon" />
            </div>

            <h2>Complaint Registered Successfully!</h2>
            <p className="success-desc">
              Your grievance has been safely logged in the official repository.
              Please save your unique <strong>Tracking ID</strong> below to check live updates.
            </p>

            <div className="tracking-id-box">
              <span className="tracking-label">Official Complaint Tracking ID</span>
              <div className="id-row">
                <span className="id-text">{submittedData.complaintId}</span>
                <button
                  type="button"
                  className="copy-btn"
                  onClick={handleCopyId}
                  title="Copy Tracking ID"
                >
                  <FaCopy /> {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div className="success-summary">
              <div>
                <strong>Complainant:</strong> {submittedData.name}
              </div>
              <div>
                <strong>Category:</strong> {submittedData.category}
              </div>
              <div>
                <strong>Subject:</strong> {submittedData.subject}
              </div>
            </div>

            <div className="success-actions">
              <Link
                to={`/track?id=${submittedData.complaintId}`}
                className="track-now-btn"
              >
                Track This Complaint Now <FaArrowRight />
              </Link>
              <button
                type="button"
                className="register-another-btn"
                onClick={handleReset}
              >
                File Another Complaint
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1>Register Consumer Grievance</h1>
            <p className="register-subtitle">
              Please enter accurate transaction and dispute information. Our nodal
              redressal team will initiate inquiry upon submission.
            </p>

            {error && (
              <div className="error-banner">
                <FaExclamationCircle /> <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-row">
                <div className="input-group">
                  <label>Full Name *</label>
                  <div className="input-wrapper">
                    <FaUser className="input-icon" />
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Manoj Kumar"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Email Address *</label>
                  <div className="input-wrapper">
                    <FaEnvelope className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      placeholder="e.g. manoj@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Phone Number *</label>
                  <div className="input-wrapper">
                    <FaPhone className="input-icon" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Dispute Category *</label>
                  <div className="input-wrapper">
                    <FaTag className="input-icon" />
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="Product">Product / Electronics</option>
                      <option value="Service">Services / E-Commerce</option>
                      <option value="Food">Food / Restaurants / FMCG</option>
                      <option value="Banking">Banking / Payments / FinTech</option>
                      <option value="Other">Other Grievance</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="input-group full-width">
                <label>Complaint Subject / Title *</label>
                <div className="input-wrapper">
                  <FaFileAlt className="input-icon" />
                  <input
                    type="text"
                    name="subject"
                    placeholder="Brief summary of the issue (e.g. Damaged laptop delivered with no refund)"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-group full-width">
                <label>Comprehensive Description *</label>
                <textarea
                  name="description"
                  rows="6"
                  placeholder="Provide complete details including invoice numbers, seller name, dates of purchase/contact, and desired resolution..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Submitting Grievance..." : "Submit Official Complaint"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default RegisterComplaint;
