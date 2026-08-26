import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaClipboardList,
  FaSearch,
  FaExternalLinkAlt,
  FaPlusCircle,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import api from "../services/api";
import "./MyComplaints.css";

function MyComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const user = JSON.parse(localStorage.getItem("consumerTrustUser") || "null");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchMyComplaints = async () => {
      try {
        setLoading(true);
        const response = await api.get("/complaints/my");
        if (response.data?.success) {
          setComplaints(response.data.complaints || []);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to retrieve your submitted grievances. Please log in again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyComplaints();
  }, [navigate]);

  const filteredComplaints = complaints.filter(
    (c) =>
      c.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = complaints.filter((c) => c.status === "Pending").length;
  const inProgressCount = complaints.filter((c) => c.status === "In Progress").length;
  const resolvedCount = complaints.filter((c) => c.status === "Resolved").length;

  return (
    <div className="my-complaints-page">
      <div className="my-complaints-container">
        <div className="page-header">
          <div>
            <h1>My Registered Grievances</h1>
            <p>
              Grievances logged under account <strong>{user?.email}</strong>
            </p>
          </div>
          <Link to="/register" className="new-btn">
            <FaPlusCircle /> File New Grievance
          </Link>
        </div>

        {/* Overview Stats */}
        <div className="mini-stats">
          <div className="mini-card">
            <span className="mini-num">{complaints.length}</span>
            <span className="mini-label">Total Filed</span>
          </div>
          <div className="mini-card pending">
            <span className="mini-num">{pendingCount}</span>
            <span className="mini-label">Pending</span>
          </div>
          <div className="mini-card progress">
            <span className="mini-num">{inProgressCount}</span>
            <span className="mini-label">In Progress</span>
          </div>
          <div className="mini-card resolved">
            <span className="mini-num">{resolvedCount}</span>
            <span className="mini-label">Resolved</span>
          </div>
        </div>

        {/* Search */}
        <div className="filter-bar">
          <div className="search-input-wrap">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by Complaint ID, category or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="error-alert">
            <FaExclamationCircle /> <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="loading-state">Loading your grievances...</div>
        ) : filteredComplaints.length === 0 ? (
          <div className="empty-state">
            <FaClipboardList className="empty-icon" />
            <h3>No Complaints Found</h3>
            <p>
              {searchTerm
                ? "No grievances match your search keyword."
                : "You have not registered any consumer complaints yet."}
            </p>
            <Link to="/register" className="empty-cta">
              Register a Grievance Now
            </Link>
          </div>
        ) : (
          <div className="complaints-list">
            {filteredComplaints.map((c) => (
              <div key={c._id} className="complaint-card">
                <div className="card-top">
                  <div>
                    <span className="card-id">{c.complaintId}</span>
                    <span className="card-cat">{c.category}</span>
                  </div>
                  <span className={`status-badge ${c.status.toLowerCase().replace(/\s+/g, "-")}`}>
                    {c.status}
                  </span>
                </div>

                <h3 className="card-title">{c.subject}</h3>
                <p className="card-desc">{c.description}</p>

                {c.adminRemarks && (
                  <div className="card-remarks">
                    <strong>Authority Remarks:</strong> {c.adminRemarks}
                  </div>
                )}

                <div className="card-bottom">
                  <span className="card-date">
                    Filed on {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                  <Link to={`/track?id=${c.complaintId}`} className="track-link">
                    Live Timeline <FaExternalLinkAlt />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyComplaints;
