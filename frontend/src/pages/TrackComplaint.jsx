import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  FaSearch,
  FaClipboardCheck,
  FaExclamationCircle,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaCalendarAlt,
  FaTag,
  FaUser,
  FaCommentDots,
} from "react-icons/fa";
import api from "../services/api";
import "./TrackComplaint.css";

function TrackComplaint() {
  const [searchParams] = useSearchParams();
  const [complaintId, setComplaintId] = useState("");
  const [loading, setLoading] = useState(false);
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState("");

  const fetchComplaint = async (idToSearch) => {
    if (!idToSearch || !idToSearch.trim()) {
      setError("Please enter a valid Complaint Tracking ID");
      return;
    }

    setLoading(true);
    setError("");
    setComplaint(null);

    try {
      const response = await api.get(`/complaints/track/${idToSearch.trim()}`);
      if (response.data?.success && response.data?.complaint) {
        setComplaint(response.data.complaint);
      } else {
        throw new Error(response.data?.message || "Complaint not found");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          `No complaint found matching ID "${idToSearch}". Please check and try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const idFromUrl = searchParams.get("id");
    if (idFromUrl) {
      setComplaintId(idFromUrl);
      fetchComplaint(idFromUrl);
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchComplaint(complaintId);
  };

  const getStatusStep = (status) => {
    switch (status) {
      case "Pending":
        return 1;
      case "In Progress":
        return 2;
      case "Resolved":
        return 3;
      case "Rejected":
        return -1;
      default:
        return 1;
    }
  };

  const currentStep = complaint ? getStatusStep(complaint.status) : 0;

  return (
    <div className="track-page">
      <div className="track-container">
        <h1>Track Grievance Status</h1>
        <p className="track-subtitle">
          Enter your official Complaint Tracking ID to see live investigation milestones and resolution remarks.
        </p>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="e.g. CT-2026-89412"
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="search-btn" disabled={loading}>
            {loading ? <FaSpinner className="spin" /> : "Track Status"}
          </button>
        </form>

        {error && (
          <div className="track-error">
            <FaExclamationCircle /> <span>{error}</span>
          </div>
        )}

        {complaint && (
          <div className="result-card">
            {/* Header / ID Badge */}
            <div className="result-header">
              <div>
                <span className="badge-tracking-id">{complaint.complaintId}</span>
                <h2>{complaint.subject}</h2>
              </div>
              <div className={`status-pill ${complaint.status.toLowerCase().replace(/\s+/g, "-")}`}>
                {complaint.status}
              </div>
            </div>

            {/* Step Progress Bar */}
            {complaint.status === "Rejected" ? (
              <div className="rejected-box">
                <FaTimesCircle className="rejected-icon" />
                <div>
                  <strong>Complaint Marked as Rejected</strong>
                  <p>
                    {complaint.adminRemarks ||
                      "This complaint does not meet jurisdiction criteria or lacked necessary proof."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="progress-timeline">
                <div className={`timeline-step ${currentStep >= 1 ? "completed" : ""}`}>
                  <div className="step-circle">
                    <FaCheckCircle />
                  </div>
                  <div className="step-label">
                    <strong>Grievance Submitted</strong>
                    <span>Logged in System</span>
                  </div>
                </div>

                <div className={`timeline-line ${currentStep >= 2 ? "active" : ""}`}></div>

                <div className={`timeline-step ${currentStep >= 2 ? "completed" : currentStep === 1 ? "active" : ""}`}>
                  <div className="step-circle">
                    {currentStep >= 2 ? <FaCheckCircle /> : <FaClock />}
                  </div>
                  <div className="step-label">
                    <strong>Under Review / In Progress</strong>
                    <span>Investigation Active</span>
                  </div>
                </div>

                <div className={`timeline-line ${currentStep >= 3 ? "active" : ""}`}></div>

                <div className={`timeline-step ${currentStep >= 3 ? "completed" : ""}`}>
                  <div className="step-circle">
                    <FaClipboardCheck />
                  </div>
                  <div className="step-label">
                    <strong>Official Resolution</strong>
                    <span>Closed with Settlement</span>
                  </div>
                </div>
              </div>
            )}

            {/* Details Grid */}
            <div className="details-grid">
              <div className="detail-item">
                <FaUser className="detail-icon" />
                <div>
                  <label>Complainant Name</label>
                  <span>{complaint.name}</span>
                </div>
              </div>

              <div className="detail-item">
                <FaTag className="detail-icon" />
                <div>
                  <label>Category</label>
                  <span>{complaint.category}</span>
                </div>
              </div>

              <div className="detail-item">
                <FaCalendarAlt className="detail-icon" />
                <div>
                  <label>Date Filed</label>
                  <span>
                    {new Date(complaint.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="detail-item">
                <FaClock className="detail-icon" />
                <div>
                  <label>Last Status Update</label>
                  <span>
                    {new Date(complaint.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="description-box">
              <h4>Complaint Description</h4>
              <p>{complaint.description}</p>
            </div>

            {/* Official Admin Remarks / Resolution Notes */}
            {complaint.adminRemarks && (
              <div className="admin-remarks-box">
                <div className="remarks-title">
                  <FaCommentDots />
                  <h4>Official Redressal Authority Remarks</h4>
                </div>
                <p>{complaint.adminRemarks}</p>
                {complaint.resolvedAt && (
                  <span className="resolved-date">
                    Resolved on: {new Date(complaint.resolvedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {!complaint && !loading && !error && (
          <div className="awaiting-box">
            <FaClipboardCheck className="awaiting-icon" />
            <h3>Awaiting Tracking Request</h3>
            <p>
              Please enter your complaint tracking ID in the search box above to retrieve verified real-time case information.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrackComplaint;
