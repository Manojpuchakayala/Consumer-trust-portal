import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaClipboardList,
  FaSearch,
  FaPlus,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaPaperclip,
  FaBuilding,
  FaTrashAlt,
  FaFilePdf,
  FaCopy,
  FaCalendarAlt,
  FaHourglassHalf,
  FaTimesCircle,
  FaShieldAlt,
  FaUserCheck,
  FaFilter,
  FaRedoAlt,
  FaArrowRight,
  FaTimes,
  FaReceipt,
  FaWhatsapp,
} from "react-icons/fa";
import api from "../services/api";
import { generateGrievanceNoticePdf } from "../utils/pdfGenerator";
import { getWhatsAppShareUrl } from "../utils/whatsappShare";
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
        setSuccessMessage(`Grievance docket #${complaintToDelete.complaintId} has been removed.`);
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
        {/* 1. Header Card */}
        <div className="dashboard-header-card">
          <div className="header-user-intro">
            <div className="header-badge-row">
              <span className="hub-badge">
                <FaShieldAlt /> Citizen Grievance Hub
              </span>
              <span className="user-email-chip">
                <FaUserCheck /> {user?.name || user?.email}
              </span>
            </div>
            <h1>Citizen Grievance Dashboard</h1>
            <p>
              Manage your dispute dockets, monitor investigation milestones, download claim summaries, and view voluntary corporate resolutions.
            </p>
          </div>

          <div className="header-btn-actions">
            <Link to="/register" className="dash-primary-btn">
              <FaPlus /> File New Grievance
            </Link>
            <Link to="/track" className="dash-secondary-btn">
              <FaSearch /> Track a Case
            </Link>
          </div>
        </div>

        {/* Alerts */}
        {successMessage && (
          <div className="dash-alert success">
            <FaCheckCircle className="alert-icon" />
            <span>{successMessage}</span>
            <button className="alert-close-btn" onClick={() => setSuccessMessage("")} aria-label="Dismiss">
              <FaTimes />
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

        {/* 2. Metric Cards */}
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
              <span className="metric-label">In Review</span>
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

        {/* 3. Filters & Search */}
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
                  Closed ({rejectedCount})
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
                  <FaTimes />
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
            <h3>No grievances found</h3>
            <p>
              {searchTerm || selectedStatus !== "All" || selectedBrand !== "All"
                ? "No dispute dockets match your current search and filter criteria."
                : "You have not registered any consumer grievances yet."}
            </p>
            <div className="empty-btn-group">
              {searchTerm || selectedStatus !== "All" || selectedBrand !== "All" ? (
                <button className="dash-secondary-btn" onClick={resetFilters}>
                  Clear Filters
                </button>
              ) : (
                <Link to="/register" className="dash-primary-btn">
                  <FaPlus /> File Your First Grievance
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="complaints-cards-grid">
            {filteredComplaints.map((c) => {
              const statusSlug = c.status.toLowerCase().replace(/\s+/g, "-");
              return (
                <div key={c._id} className="complaint-card">
                  {/* Top Bar */}
                  <div className="complaint-card-top">
                    <div className="docket-id-wrap">
                      <span className="docket-label">Docket</span>
                      <strong className="docket-code">#{c.complaintId}</strong>
                      <button
                        type="button"
                        className="copy-docket-btn"
                        onClick={() => handleCopyId(c.complaintId)}
                        title="Copy Docket ID"
                      >
                        <FaCopy />
                        <span>{copiedId === c.complaintId ? "Copied" : "Copy"}</span>
                      </button>
                    </div>

                    <span className={`status-pill ${statusSlug}`}>
                      {c.status}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="complaint-card-body">
                    <div className="company-category-row">
                      <span className="card-company">
                        <FaBuilding /> {c.companyName}
                      </span>
                      <span className="card-category">{c.category}</span>
                    </div>

                    <h3 className="card-subject">{c.subject}</h3>

                    {c.orderOrTransactionId && (
                      <div className="card-order-id">
                        <FaReceipt />
                        <span>Ref: {c.orderOrTransactionId}</span>
                      </div>
                    )}

                    <p className="card-desc-snippet">
                      {c.description ? (
                        c.description.length > 140
                          ? `${c.description.substring(0, 140)}...`
                          : c.description
                      ) : (
                        "No details provided."
                      )}
                    </p>
                  </div>

                  {/* Footer Meta & Actions */}
                  <div className="complaint-card-footer">
                    <div className="card-meta-left">
                      <span className="card-date">
                        <FaCalendarAlt />{" "}
                        {new Date(c.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      {c.attachments?.length > 0 && (
                        <span className="card-attachments">
                          <FaPaperclip /> {c.attachments.length} file{c.attachments.length === 1 ? "" : "s"}
                        </span>
                      )}
                    </div>

                    <div className="card-actions-right">
                      <a
                        href={getWhatsAppShareUrl(c)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-whatsapp-mini"
                        title="Share Case via WhatsApp"
                      >
                        <FaWhatsapp /> Share
                      </a>

                      <button
                        type="button"
                        className="btn-pdf-mini"
                        onClick={() => generateGrievanceNoticePdf(c)}
                        title="Download PDF claim summary"
                      >
                        <FaFilePdf /> PDF
                      </button>

                      <Link
                        to={`/track?id=${c.complaintId}`}
                        className="btn-track-mini"
                      >
                        Track <FaArrowRight style={{ fontSize: 10 }} />
                      </Link>

                      <button
                        type="button"
                        className="btn-delete-mini"
                        onClick={() => openDeleteModal(c)}
                        title="Remove grievance docket"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5. Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <div className="modal-header">
                <FaTrashAlt className="modal-icon text-red" />
                <h3>Remove Grievance Docket?</h3>
              </div>
              <p className="modal-text">
                Are you sure you want to remove grievance docket <strong>#{complaintToDelete?.complaintId}</strong> regarding <strong>{complaintToDelete?.companyName}</strong>? This action cannot be undone.
              </p>
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
                  {isDeleting ? "Removing..." : "Confirm Removal"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
