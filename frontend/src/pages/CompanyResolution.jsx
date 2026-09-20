import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaBuilding,
  FaCheckCircle,
  FaExclamationCircle,
  FaFileDownload,
  FaPaperclip,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaClock,
  FaMoneyBillWave,
  FaTruck,
  FaSpinner,
} from "react-icons/fa";
import api from "../services/api";
import "./CompanyResolution.css";

function CompanyResolution() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [complaint, setComplaint] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Resolution Form
  const [formData, setFormData] = useState({
    actionTaken: "Refund Processed",
    refundAmount: "",
    referenceNumber: "",
    resolvedBy: "",
    resolutionNotes: "",
  });

  useEffect(() => {
    if (!token) {
      setError("Missing resolution token. Please use the link provided in your official grievance notice email.");
      setLoading(false);
      return;
    }

    const fetchCase = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(`/company/case/${token}`);
        if (res.data?.complaint) {
          setComplaint(res.data.complaint);
          setCompanyInfo(res.data.companyInfo);
          if (res.data.complaint.companyResolution?.actionTaken) {
            setFormData({
              actionTaken: res.data.complaint.companyResolution.actionTaken,
              refundAmount: res.data.complaint.companyResolution.refundAmount || "",
              referenceNumber: res.data.complaint.companyResolution.referenceNumber || "",
              resolvedBy: res.data.complaint.companyResolution.resolvedBy || "",
              resolutionNotes: res.data.complaint.companyResolution.resolutionNotes || "",
            });
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load grievance details or token expired.");
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await api.post(`/company/resolve/${token}`, formData);
      if (res.data?.success) {
        setSuccessMsg(res.data.message || "Resolution submitted successfully!");
        setComplaint(res.data.complaint);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit resolution. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="company-resolution-page">
        <div className="resolution-container loading-box">
          <FaSpinner className="spinner-icon" />
          <h2>Loading Grievance Docket...</h2>
          <p>Verifying secure enterprise access token.</p>
        </div>
      </div>
    );
  }

  if (error && !complaint) {
    return (
      <div className="company-resolution-page">
        <div className="resolution-container error-box">
          <FaExclamationCircle className="error-icon" />
          <h2>Access Restricted or Link Expired</h2>
          <p>{error}</p>
          <Link to="/" className="home-btn">Return to Home Portal</Link>
        </div>
      </div>
    );
  }

  const isAlreadyResolved = complaint?.status === "Resolved";

  return (
    <div className="company-resolution-page">
      <div className="resolution-container">
        {/* Header */}
        <div className="resolution-header">
          <div className="badge-row">
            <span className="authority-badge">
              <FaShieldAlt /> Statutory Redressal Switch
            </span>
            <span className="case-badge">Case #{complaint.complaintId}</span>
          </div>
          <h1>{complaint.companyName} Nodal Redressal Desk</h1>
          <p>
            Official Enterprise Dispute Resolution Interface under Consumer Protection Regulations & RBI/TRAI Directives.
          </p>

          <div className="sla-deadline-card">
            <div className="sla-deadline-icon">
              <FaClock />
            </div>
            <div className="sla-deadline-text">
              <strong>Mandatory 7-Day Resolution Mandate</strong>
              <p>
                Under the Central Consumer Redressal SLA, this dispute must be formally redressed and updated with resolution/refund proof within <strong>7 days (168 hours)</strong> from registration. Past 7 days, this case docket is automatically flagged for Ombudsman escalation.
              </p>
            </div>
          </div>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="alert-success">
            <FaCheckCircle className="alert-icon" />
            <div>
              <strong>Resolution Registered Successfully!</strong>
              <p>{successMsg}</p>
            </div>
          </div>
        )}

        {/* Case Details Card */}
        <div className="case-details-card">
          <div className="card-header-bar">
            <h2>Grievance Claim & Evidence Docket</h2>
            <span className={`status-pill ${complaint.status.toLowerCase().replace(" ", "-")}`}>
              Status: {complaint.status}
            </span>
          </div>

          <div className="case-grid">
            <div className="case-info-item">
              <label>Complainant Name</label>
              <span><FaUser className="item-icon" /> {complaint.complainant.name}</span>
            </div>
            <div className="case-info-item">
              <label>Contact Phone</label>
              <span><FaPhone className="item-icon" /> {complaint.complainant.phone}</span>
            </div>
            <div className="case-info-item">
              <label>Contact Email</label>
              <span><FaEnvelope className="item-icon" /> {complaint.complainant.email}</span>
            </div>
            <div className="case-info-item">
              <label>Order / Transaction Ref ID</label>
              <span className="ref-highlight">
                {complaint.orderOrTransactionId || "Not Provided by Citizen"}
              </span>
            </div>
          </div>

          <div className="case-subject-box">
            <label>Subject of Dispute</label>
            <h3>{complaint.subject}</h3>
          </div>

          <div className="case-description-box">
            <label>Citizen's Statement of Fact</label>
            <p>{complaint.description}</p>
          </div>

          {/* Evidence Attachments */}
          {complaint.attachments && complaint.attachments.length > 0 && (
            <div className="attachments-section">
              <label>Submitted Proof / Invoices ({complaint.attachments.length})</label>
              <div className="attachments-grid">
                {complaint.attachments.map((file, idx) => (
                  <a
                    key={idx}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="attachment-pill"
                  >
                    <FaPaperclip />
                    <span>{file.originalName}</span>
                    <FaFileDownload />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Resolution Submission Section */}
        <div className="resolution-form-card">
          <div className="form-card-header">
            <h2>
              {isAlreadyResolved ? "Official Resolution on Record" : "Submit Resolution & Settlement Proof"}
            </h2>
            <p>
              {isAlreadyResolved
                ? "This case has been marked as Resolved. You may update resolution proof if needed."
                : "Submitting this form immediately marks the case as Resolved and dispatches real-time WhatsApp & Email confirmation to the citizen."}
            </p>
          </div>

          {error && (
            <div className="alert-error">
              <FaExclamationCircle />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="resolution-form">
            <div className="form-group-row">
              <div className="form-group">
                <label>Action Taken <span className="req">*</span></label>
                <select
                  name="actionTaken"
                  value={formData.actionTaken}
                  onChange={handleChange}
                  required
                >
                  <option value="Refund Processed">Refund Processed</option>
                  <option value="Replacement Dispatched">Replacement Dispatched</option>
                  <option value="Service Restored / Account Unblocked">Service Restored / Account Unblocked</option>
                  <option value="Settlement Agreed & Credited">Settlement Agreed & Credited</option>
                  <option value="Clarification & Explanation Provided">Clarification & Official Explanation Provided</option>
                </select>
              </div>

              <div className="form-group">
                <label>Refund Amount (₹) <span className="opt">(if applicable)</span></label>
                <div className="input-with-icon">
                  <FaMoneyBillWave className="input-icon" />
                  <input
                    type="number"
                    name="refundAmount"
                    placeholder="e.g. 1499"
                    value={formData.refundAmount}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>Bank UTR / Courier Tracking / Ticket No.</label>
                <div className="input-with-icon">
                  <FaTruck className="input-icon" />
                  <input
                    type="text"
                    name="referenceNumber"
                    placeholder="e.g. UTR-987654321 / TRK-BLR-0012"
                    value={formData.referenceNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Nodal Officer Name / Designation</label>
                <input
                  type="text"
                  name="resolvedBy"
                  placeholder={`e.g. ${complaint.companyName} Nodal Desk`}
                  value={formData.resolvedBy}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Official Resolution Remarks to Consumer <span className="req">*</span></label>
              <textarea
                name="resolutionNotes"
                rows="4"
                placeholder="Explain the resolution details clearly (e.g. Full refund of ₹1,499 has been credited back to original payment method under UTR #...)"
                value={formData.resolutionNotes}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button type="submit" className="submit-resolution-btn" disabled={submitting}>
              {submitting ? (
                <>
                  <FaSpinner className="spinner-inline" /> Submitting Resolution...
                </>
              ) : (
                <>
                  <FaCheckCircle /> Submit Official Resolution to Complainant
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CompanyResolution;
