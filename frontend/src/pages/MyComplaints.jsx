import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaClipboardList,
  FaSearch,
  FaPlusCircle,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaPaperclip,
  FaWhatsapp,
  FaStar,
  FaBuilding,
  FaTrashAlt,
  FaFilePdf,
  FaReceipt,
  FaCopy,
  FaTag,
  FaCalendarAlt,
  FaHourglassHalf,
  FaTimesCircle,
  FaShieldAlt,
  FaUserCheck,
  FaFilter,
  FaRedoAlt,
  FaCompass,
  FaArrowRight,
} from "react-icons/fa";
import api from "../services/api";
import { generateGrievanceNoticePdf } from "../utils/pdfGenerator";
import "./MyComplaints.css";

export default function MyComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [copiedId, setCopiedId] = useState(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const user = JSON.parse(localStorage.getItem("consumerTrustUser") || "null");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchMyComplaints();
  }, [navigate]);

  const fetchMyComplaints = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/complaints/my");
      if (res.data?.success) {
        setComplaints(res.data.complaints || []);
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

  const handleCopyId = (complaintId) => {
    navigator.clipboard.writeText(complaintId);
    setCopiedId(complaintId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const openDeleteModal = (complaint) => {
    setComplaintToDelete(complaint);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!complaintToDelete) return;
    try {
      setIsDeleting(true);
      const res = await api.delete(`/complaints/${complaintToDelete._id}`);
      if (res.data?.success || res.status === 200) {
        setComplaints((prev) => prev.filter((c) => c._id !== complaintToDelete._id));
        setSuccessMessage(`Grievance docket #${complaintToDelete.complaintId} has been deleted.`);
        setTimeout(() => setSuccessMessage(""), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete grievance. Please try again.");
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setComplaintToDelete(null);
    }
  };

  const uniqueBrands = Array.from(
    new Set(complaints.map((c) => c.companyName).filter(Boolean))
  ).sort();

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.companyName && c.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.orderOrTransactionId && c.orderOrTransactionId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "All" ||
      c.status.toLowerCase() === selectedStatus.toLowerCase();

    const matchesBrand =
      selectedBrand === "All" ||
      (c.companyName && c.companyName.toLowerCase() === selectedBrand.toLowerCase());

    return matchesSearch && matchesStatus && matchesBrand;
  });

  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === "Pending").length;
  const inProgressCount = complaints.filter((c) => c.status === "In Progress").length;
  const resolvedCount = complaints.filter((c) => c.status === "Resolved").length;
  const rejectedCount = complaints.filter((c) => c.status === "Rejected").length;

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("All");
    setSelectedBrand("All");
  };

  return (
    <div className="dashboard-page-root">
      <div className="dashboard-container">
        {/* 1. Header Banner */}
        <div className="dashboard-header-card">
          <div className="header-user-intro">
            <div className="header-badge-row">
              <span className="hub-badge">
                <FaShieldAlt /> Citizen Redressal Hub
              </span>
              <span className="user-email-chip">
                <FaUserCheck /> {user?.name || user?.email}
              </span>
            </div>
            <h1>My Grievance Dashboard</h1>
            <p>
              Manage your dispute dockets, monitor chronological investigation milestones, download statutory legal summaries, or track live enterprise resolutions.
            </p>
          </div>

          <div className="header-btn-actions">
            <Link to="/register" className="dash-primary-btn">
              <FaPlusCircle /> Start New Grievance
            </Link>
            <Link to="/track" className="dash-secondary-btn">
              <FaCompass /> Track a Case
            </Link>
          </div>
        </div>

        {/* Alerts */}
        {successMessage && (
          <div className="dash-alert success">
            <FaCheckCircle className="alert-icon" />
            <span>{successMessage}</span>
            <button className="alert-close-btn" onClick={() => setSuccessMessage("")}>
              <FaTimesCircle />
            </button>
          </div>
        )}

        {error && (
          <div className="dash-alert error">
            <FaExclamationCircle className="alert-icon" />
            <span>{error}</span>
            <button className="dash-retry-btn" onClick={fetchMyComplaints}>
              <FaRedoAlt /> Retry
            </button>
          </div>
        )}

        {/* 2. Top Summary Metric Cards */}
        <div className="dash-metrics-grid">
          <div
            className={`metric-card total ${selectedStatus === "All" ? "active" : ""}`}
            onClick={() => setSelectedStatus("All")}
            role="button"
            tabIndex={0}
          >
            <div className="metric-icon-wrap">
              <FaClipboardList />
            </div>
            <div className="metric-data">
              <span className="metric-num">{totalCount}</span>
              <span className="metric-label">Total Lodged</span>
            </div>
          </div>

          <div
            className={`metric-card pending ${selectedStatus === "Pending" ? "active" : ""}`}
            onClick={() => setSelectedStatus("Pending")}
            role="button"
            tabIndex={0}
          >
            <div className="metric-icon-wrap">
              <FaClock />
            </div>
            <div className="metric-data">
              <span className="metric-num">{pendingCount}</span>
              <span className="metric-label">Pending Review</span>
            </div>
          </div>

          <div
            className={`metric-card progress ${selectedStatus === "In Progress" ? "active" : ""}`}
            onClick={() => setSelectedStatus("In Progress")}
            role="button"
            tabIndex={0}
          >
            <div className="metric-icon-wrap">
              <FaHourglassHalf />
            </div>
            <div className="metric-data">
              <span className="metric-num">{inProgressCount}</span>
              <span className="metric-label">In Progress</span>
            </div>
          </div>

          <div
            className={`metric-card resolved ${selectedStatus === "Resolved" ? "active" : ""}`}
            onClick={() => setSelectedStatus("Resolved")}
            role="button"
            tabIndex={0}
          >
            <div className="metric-icon-wrap">
              <FaCheckCircle />
            </div>
            <div className="metric-data">
              <span className="metric-num">{resolvedCount}</span>
              <span className="metric-label">Resolved</span>
            </div>
          </div>
        </div>

        {/* 3. Filter Controls Box */}
        <div className="dash-filter-card">
          <div className="filter-tabs-row">
            <div className="status-tabs-list">
              <button
                type="button"
                className={`status-tab ${selectedStatus === "All" ? "active" : ""}`}
                onClick={() => setSelectedStatus("All")}
              >
                All Cases ({totalCount})
              </button>
              <button
                type="button"
                className={`status-tab pending ${selectedStatus === "Pending" ? "active" : ""}`}
                onClick={() => setSelectedStatus("Pending")}
              >
                Pending ({pendingCount})
              </button>
              <button
                type="button"
                className={`status-tab progress ${selectedStatus === "In Progress" ? "active" : ""}`}
                onClick={() => setSelectedStatus("In Progress")}
              >
                In Review ({inProgressCount})
              </button>
              <button
                type="button"
                className={`status-tab resolved ${selectedStatus === "Resolved" ? "active" : ""}`}
                onClick={() => setSelectedStatus("Resolved")}
              >
                Resolved ({resolvedCount})
              </button>
              {rejectedCount > 0 && (
                <button
                  type="button"
                  className={`status-tab rejected ${selectedStatus === "Rejected" ? "active" : ""}`}
                  onClick={() => setSelectedStatus("Rejected")}
                >
                  Rejected ({rejectedCount})
                </button>
              )}
            </div>

            {uniqueBrands.length > 0 && (
              <div className="brand-filter-select-wrap">
                <FaBuilding className="select-icon" />
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="brand-filter-select"
                >
                  <option value="All">All Enterprises ({uniqueBrands.length})</option>
                  {uniqueBrands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="search-bar-wrap">
            <div className="dash-search-input-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by Docket ID, Enterprise Name, Order #, or Subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search-btn" onClick={() => setSearchTerm("")}>
                  <FaTimesCircle />
                </button>
              )}
            </div>

            {(searchTerm || selectedStatus !== "All" || selectedBrand !== "All") && (
              <button className="reset-filter-btn" onClick={resetFilters}>
                <FaFilter /> Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* 4. Modular Case Cards Grid */}
        {loading ? (
          <div className="dash-loading-box">
            <div className="dash-spinner"></div>
            <p>Loading your registered grievances...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="dash-empty-card">
            <div className="empty-icon-circle">
              <FaClipboardList />
            </div>
            <h3>No Complaints Found</h3>
            <p>
              {searchTerm || selectedStatus !== "All" || selectedBrand !== "All"
                ? "No dispute records match your search or selected filters."
                : "You haven't filed any grievances yet. Lodge your first dispute now to initiate structured mediation with the enterprise."}
            </p>
            {searchTerm || selectedStatus !== "All" || selectedBrand !== "All" ? (
              <button className="empty-action-btn" onClick={resetFilters}>
                Clear All Filters
              </button>
            ) : (
              <Link to="/register" className="empty-action-btn primary">
                <FaPlusCircle /> File Your First Grievance
              </Link>
            )}
          </div>
        ) : (
          <div className="dash-cases-grid">
            {filteredComplaints.map((c) => {
              const statusSlug = (c.status || "Pending").toLowerCase().replace(/\s+/g, "-");
              const brandName = c.companyName || "Disputed Enterprise";
              const dateStr = c.createdAt
                ? new Date(c.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Recent";

              return (
                <div key={c._id} className={`case-card ${statusSlug}`}>
                  {/* Card Header Bar */}
                  <div className="case-card-header">
                    <div className="header-left-badges">
                      <span className="brand-chip">
                        <FaBuilding /> {brandName}
                      </span>
                      <span className="category-chip">
                        <FaTag /> {c.category || "Product"}
                      </span>
                      <button
                        type="button"
                        className="docket-chip"
                        onClick={() => handleCopyId(c.complaintId)}
                        title="Click to copy Docket ID"
                      >
                        <span>#{c.complaintId}</span>
                        <FaCopy className="copy-icon" />
                        {copiedId === c.complaintId && <span className="copied-pill">Copied!</span>}
                      </button>
                    </div>

                    <div className="header-right-badges">
                      <span className={`status-badge ${statusSlug}`}>
                        <span className="status-dot" />
                        {c.status || "Pending"}
                      </span>
                      <span className="date-chip">
                        <FaCalendarAlt /> {dateStr}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="case-card-body">
                    <h3 className="case-subject">{c.subject}</h3>

                    {c.orderOrTransactionId && (
                      <div className="case-order-ref">
                        <FaReceipt className="ref-icon" />
                        <span>Order / Ref ID:</span>
                        <strong>{c.orderOrTransactionId}</strong>
                      </div>
                    )}

                    <p className="case-description">{c.description}</p>
                  </div>

                  {/* Badges Row */}
                  <div className="case-badges-row">
                    {c.attachments && c.attachments.length > 0 && (
                      <span className="feature-badge evidence">
                        <FaPaperclip /> {c.attachments.length} Evidence File{c.attachments.length > 1 ? "s" : ""}
                      </span>
                    )}
                    {c.whatsappAlertsEnabled !== false && (
                      <span className="feature-badge whatsapp">
                        <FaWhatsapp /> WhatsApp Alerts Active
                      </span>
                    )}
                    {c.companyNoticeSent && (
                      <span className="feature-badge notice">
                        <FaShieldAlt /> Nodal Notice Sent
                      </span>
                    )}
                    {c.status === "Resolved" && c.feedback?.rating && (
                      <span className="feature-badge rating">
                        <FaStar /> Rated {c.feedback.rating}.0 / 5.0
                      </span>
                    )}
                  </div>

                  {/* Remarks Box if present */}
                  {c.adminRemarks && (
                    <div className="case-remarks-box">
                      <strong>Authority & Redressal Remarks:</strong>
                      <p>{c.adminRemarks}</p>
                    </div>
                  )}

                  {/* Card Actions Footer */}
                  <div className="case-card-footer">
                    <div className="footer-actions-left">
                      <Link to={`/track?id=${c.complaintId}`} className="card-btn primary">
                        <FaCompass /> Track Live Status
                      </Link>

                      <button
                        type="button"
                        onClick={() => generateGrievanceNoticePdf(c)}
                        className="card-btn secondary"
                        title="Download official claim summary PDF"
                      >
                        <FaFilePdf /> Notice PDF
                      </button>

                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                          `🏛️ CONSUMER TRUST CASE UPDATE\nDocket: #${c.complaintId}\nStatus: ${c.status}\nSubject: ${c.subject}\nTrack: ${window.location.origin}/track?id=${c.complaintId}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card-btn whatsapp"
                        title="Share on WhatsApp"
                      >
                        <FaWhatsapp /> Share
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={() => openDeleteModal(c)}
                      className="card-delete-btn"
                      title="Delete / withdraw grievance"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && complaintToDelete && (
        <div className="modal-overlay" onClick={() => !isDeleting && setDeleteModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-wrap">
              <FaTrashAlt />
            </div>
            <h3>Delete Grievance Docket?</h3>
            <p>
              Are you sure you want to withdraw and delete grievance docket <strong>#{complaintToDelete.complaintId}</strong> against <strong>{complaintToDelete.companyName || "Enterprise"}</strong>?
            </p>
            <div className="modal-warning">
              <FaExclamationCircle />
              <span>This action will permanently delete all case records, attached evidence documents, and tracking history.</span>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-delete-btn"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Grievance"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
