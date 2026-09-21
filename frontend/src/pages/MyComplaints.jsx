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
  FaEnvelope,
  FaCompass,
} from "react-icons/fa";
import api from "../services/api";
import { generateGrievanceNoticePdf } from "../utils/pdfGenerator";
import "./MyComplaints.css";

function MyComplaints() {
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

  // 1-Click Copy Tracking ID
  const handleCopyId = (complaintId) => {
    navigator.clipboard.writeText(complaintId);
    setCopiedId(complaintId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Delete Confirmation Modal
  const openDeleteModal = (complaint) => {
    setComplaintToDelete(complaint);
    setDeleteModalOpen(true);
  };

  // Confirm Delete Grievance
  const handleConfirmDelete = async () => {
    if (!complaintToDelete) return;
    try {
      setIsDeleting(true);
      const res = await api.delete(`/complaints/${complaintToDelete._id}`);
      if (res.data?.success || res.status === 200) {
        setComplaints((prev) => prev.filter((c) => c._id !== complaintToDelete._id));
        setSuccessMessage(`Grievance docket #${complaintToDelete.complaintId} has been deleted successfully.`);
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

  // Extract unique brands list from user's complaints
  const uniqueBrands = Array.from(
    new Set(complaints.map((c) => c.companyName).filter(Boolean))
  ).sort();

  // Filter complaints based on Search, Status, and Brand
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
    <div className="my-complaints-page">
      <div className="my-complaints-container">

        {/* 1. Header Box Panel */}
        <div className="my-complaints-header-panel">
          <div className="header-text-group">
            <div className="header-badge-row">
              <span className="official-portal-tag">
                <FaShieldAlt /> Citizen Redressal Hub
              </span>
              <span className="user-email-tag">
                <FaUserCheck /> {user?.name || user?.email}
              </span>
            </div>
            <h1>My Registered Grievances</h1>
            <p>
              Manage, track timeline updates, download official statutory notices, or withdraw your consumer claims.
            </p>
          </div>
          <div className="header-actions">
            <Link to="/register" className="file-new-btn">
              <FaPlusCircle /> File New Grievance
            </Link>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="success-banner">
            <FaCheckCircle className="banner-icon" />
            <span>{successMessage}</span>
            <button className="banner-close" onClick={() => setSuccessMessage("")}>
              <FaTimesCircle />
            </button>
          </div>
        )}

        {/* Error Alert Banner */}
        {error && (
          <div className="error-banner">
            <FaExclamationCircle className="banner-icon" />
            <span>{error}</span>
            <button className="retry-btn" onClick={fetchMyComplaints}>
              <FaRedoAlt /> Retry
            </button>
          </div>
        )}

        {/* 2. Top Summary Metric Box Panels (4 Vibrant Box Panels) */}
        <div className="summary-boxes-grid">
          {/* Total Lodged Box */}
          <div
            className={`summary-box total ${selectedStatus === "All" ? "active-filter" : ""}`}
            onClick={() => setSelectedStatus("All")}
            role="button"
            tabIndex={0}
          >
            <div className="summary-box-icon-wrap">
              <FaClipboardList />
            </div>
            <div className="summary-box-content">
              <span className="summary-box-num">{totalCount}</span>
              <span className="summary-box-title">Total Lodged</span>
              <span className="summary-box-desc">All registered cases</span>
            </div>
            <div className="summary-box-indicator"></div>
          </div>

          {/* Pending Review Box */}
          <div
            className={`summary-box pending ${selectedStatus === "Pending" ? "active-filter" : ""}`}
            onClick={() => setSelectedStatus("Pending")}
            role="button"
            tabIndex={0}
          >
            <div className="summary-box-icon-wrap">
              <FaClock />
            </div>
            <div className="summary-box-content">
              <span className="summary-box-num">{pendingCount}</span>
              <span className="summary-box-title">Pending Review</span>
              <span className="summary-box-desc">Awaiting nodal action</span>
            </div>
            <div className="summary-box-indicator"></div>
          </div>

          {/* In Progress Box */}
          <div
            className={`summary-box progress ${selectedStatus === "In Progress" ? "active-filter" : ""}`}
            onClick={() => setSelectedStatus("In Progress")}
            role="button"
            tabIndex={0}
          >
            <div className="summary-box-icon-wrap">
              <FaHourglassHalf />
            </div>
            <div className="summary-box-content">
              <span className="summary-box-num">{inProgressCount}</span>
              <span className="summary-box-title">In Progress</span>
              <span className="summary-box-desc">Under active redressal</span>
            </div>
            <div className="summary-box-indicator"></div>
          </div>

          {/* Resolved Box */}
          <div
            className={`summary-box resolved ${selectedStatus === "Resolved" ? "active-filter" : ""}`}
            onClick={() => setSelectedStatus("Resolved")}
            role="button"
            tabIndex={0}
          >
            <div className="summary-box-icon-wrap">
              <FaCheckCircle />
            </div>
            <div className="summary-box-content">
              <span className="summary-box-num">{resolvedCount}</span>
              <span className="summary-box-title">Resolved</span>
              <span className="summary-box-desc">Successfully settled</span>
            </div>
            <div className="summary-box-indicator"></div>
          </div>
        </div>

        {/* 3. Search & Multi-Filter Control Box */}
        <div className="filter-controls-box">
          <div className="filter-controls-top">
            {/* Status Filter Tabs */}
            <div className="status-tabs-group">
              <button
                className={`status-tab-btn ${selectedStatus === "All" ? "active" : ""}`}
                onClick={() => setSelectedStatus("All")}
              >
                All ({totalCount})
              </button>
              <button
                className={`status-tab-btn pending ${selectedStatus === "Pending" ? "active" : ""}`}
                onClick={() => setSelectedStatus("Pending")}
              >
                Pending ({pendingCount})
              </button>
              <button
                className={`status-tab-btn progress ${selectedStatus === "In Progress" ? "active" : ""}`}
                onClick={() => setSelectedStatus("In Progress")}
              >
                In Progress ({inProgressCount})
              </button>
              <button
                className={`status-tab-btn resolved ${selectedStatus === "Resolved" ? "active" : ""}`}
                onClick={() => setSelectedStatus("Resolved")}
              >
                Resolved ({resolvedCount})
              </button>
              {rejectedCount > 0 && (
                <button
                  className={`status-tab-btn rejected ${selectedStatus === "Rejected" ? "active" : ""}`}
                  onClick={() => setSelectedStatus("Rejected")}
                >
                  Rejected ({rejectedCount})
                </button>
              )}
            </div>

            {/* Brand Dropdown Filter */}
            {uniqueBrands.length > 0 && (
              <div className="brand-select-wrap">
                <FaBuilding className="brand-select-icon" />
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="brand-select-dropdown"
                >
                  <option value="All">All Disputed Brands ({uniqueBrands.length})</option>
                  {uniqueBrands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Search Input Bar */}
          <div className="search-bar-row">
            <div className="search-input-box">
              <FaSearch className="search-input-icon" />
              <input
                type="text"
                placeholder="Search by Docket ID, Brand Name (Amazon, SBI, etc.), Order #, or Subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="search-clear-btn" onClick={() => setSearchTerm("")}>
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

        {/* 4. Complaints Modular Box Panels List */}
        {loading ? (
          <div className="complaints-loading-box">
            <div className="spinner-orbit"></div>
            <p>Loading your grievances and statutory dockets...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="complaints-empty-box">
            <div className="empty-icon-wrap">
              <FaClipboardList />
            </div>
            <h3>No Complaints Found</h3>
            <p>
              {searchTerm || selectedStatus !== "All" || selectedBrand !== "All"
                ? "No grievances match the selected filters or keyword. Try resetting filters."
                : "You have not registered any consumer complaints yet. Lodge your first grievance now to trigger statutory resolution."}
            </p>
            {searchTerm || selectedStatus !== "All" || selectedBrand !== "All" ? (
              <button className="empty-reset-btn" onClick={resetFilters}>
                Clear All Filters
              </button>
            ) : (
              <Link to="/register" className="empty-register-cta">
                <FaPlusCircle /> Register a Grievance Now
              </Link>
            )}
          </div>
        ) : (
          <div className="complaints-box-grid">
            {filteredComplaints.map((c) => {
              const statusKey = (c.status || "Pending").toLowerCase().replace(/\s+/g, "-");
              const brandName = c.companyName || "General Enterprise";
              const dateStr = c.createdAt
                ? new Date(c.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Recent";

              return (
                <div key={c._id} className={`complaint-box-panel ${statusKey}`}>

                  {/* Panel Header Bar */}
                  <div className="panel-header-bar">
                    <div className="panel-header-left">
                      {/* Brand Badge */}
                      <span className="brand-badge-pill" title={`Enterprise: ${brandName}`}>
                        <FaBuilding className="brand-icon" /> {brandName}
                      </span>

                      {/* Category Badge */}
                      <span className="category-badge-pill">
                        <FaTag /> {c.category || "Consumer"}
                      </span>

                      {/* Docket ID with 1-Click Copy */}
                      <button
                        className="docket-id-pill"
                        onClick={() => handleCopyId(c.complaintId)}
                        title="Click to copy Tracking ID"
                      >
                        <span className="docket-code">#{c.complaintId}</span>
                        <FaCopy className="copy-icon" />
                        {copiedId === c.complaintId && <span className="copied-tooltip">Copied!</span>}
                      </button>
                    </div>

                    <div className="panel-header-right">
                      {/* Status Badge */}
                      <span className={`status-pill ${statusKey}`}>
                        <span className="status-dot"></span>
                        {c.status || "Pending"}
                      </span>

                      {/* Date */}
                      <span className="filing-date-pill">
                        <FaCalendarAlt /> {dateStr}
                      </span>
                    </div>
                  </div>

                  {/* Panel Content Body */}
                  <div className="panel-body-box">
                    <h3 className="complaint-subject-heading">{c.subject}</h3>

                    {/* Order / Transaction ID Callout */}
                    {c.orderOrTransactionId && (
                      <div className="order-ref-box">
                        <FaReceipt className="receipt-icon" />
                        <span className="order-label">Order / Transaction Ref:</span>
                        <strong className="order-value">{c.orderOrTransactionId}</strong>
                      </div>
                    )}

                    {/* Complaint Description Snippet */}
                    <div className="complaint-desc-box">
                      <p>{c.description}</p>
                    </div>
                  </div>

                  {/* Evidence & Feature Badges Bar */}
                  <div className="panel-meta-badges-row">
                    {c.attachments && c.attachments.length > 0 && (
                      <span className="meta-badge evidence" title={`${c.attachments.length} proof document(s) uploaded`}>
                        <FaPaperclip /> {c.attachments.length} Evidence Doc{c.attachments.length > 1 ? "s" : ""}
                      </span>
                    )}

                    {c.whatsappAlertsEnabled !== false && (
                      <span className="meta-badge whatsapp" title="WhatsApp real-time alert updates enabled">
                        <FaWhatsapp /> WhatsApp Alerts Active
                      </span>
                    )}

                    {c.companyNoticeSent && (
                      <span className="meta-badge notice" title="Formal statutory legal notice dispatched to enterprise nodal desk">
                        <FaShieldAlt /> Nodal Notice Dispatched
                      </span>
                    )}

                    {c.status === "Resolved" && c.feedback?.rating && (
                      <span className="meta-badge rating" title={`Citizen rating: ${c.feedback.rating}/5`}>
                        <FaStar /> Rated {c.feedback.rating}.0 / 5.0
                      </span>
                    )}
                  </div>

                  {/* Authority / Nodal Remarks Box */}
                  {c.adminRemarks && (
                    <div className="authority-remarks-box">
                      <div className="remarks-header">
                        <FaShieldAlt className="shield-icon" />
                        <span>Official Authority & Redressal Remarks</span>
                      </div>
                      <p className="remarks-text">{c.adminRemarks}</p>
                    </div>
                  )}

                  {/* Panel Actions Footer Box */}
                  <div className="panel-actions-footer">
                    <div className="actions-left-group">
                      {/* Track Live Timeline */}
                      <Link to={`/track?id=${c.complaintId}`} className="action-btn track-btn">
                        <FaCompass /> Track Live Status
                      </Link>

                      {/* Download Official Notice PDF */}
                      <button
                        onClick={() => generateGrievanceNoticePdf(c)}
                        className="action-btn pdf-btn"
                        title="Download official statutory notice with seal & QR"
                      >
                        <FaFilePdf /> Notice PDF
                      </button>

                      {/* WhatsApp Share */}
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                          `🏛️ Consumer Trust Grievance Docket\nCase ID: ${c.complaintId}\nBrand: ${brandName}\nStatus: ${c.status}\nTrack Live: ${window.location.origin}/track?id=${c.complaintId}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn wa-share-btn"
                        title="Share tracking docket on WhatsApp"
                      >
                        <FaWhatsapp /> Share
                      </a>

                      {/* Rate Resolution Button */}
                      {c.status === "Resolved" && !c.feedback?.rating && (
                        <Link to={`/track?id=${c.complaintId}`} className="action-btn rate-btn">
                          <FaStar /> Rate Resolution
                        </Link>
                      )}
                    </div>

                    <div className="actions-right-group">
                      {/* Delete Grievance Button */}
                      <button
                        onClick={() => openDeleteModal(c)}
                        className="action-btn delete-btn"
                        title="Withdraw or delete this grievance"
                      >
                        <FaTrashAlt /> Delete
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* 5. Delete Confirmation Modal */}
      {deleteModalOpen && complaintToDelete && (
        <div className="delete-modal-overlay" onClick={() => !isDeleting && setDeleteModalOpen(false)}>
          <div className="delete-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon">
              <FaTrashAlt />
            </div>
            <h3>Delete Grievance Docket?</h3>
            <p className="delete-modal-desc">
              Are you sure you want to delete grievance docket{" "}
              <strong>#{complaintToDelete.complaintId}</strong> against{" "}
              <strong>{complaintToDelete.companyName || "Enterprise"}</strong>?
            </p>
            <div className="delete-modal-warning">
              <FaExclamationCircle />
              <span>
                This will permanently remove the complaint, associated evidence documents, and tracking history from the system.
              </span>
            </div>

            <div className="delete-modal-actions">
              <button
                type="button"
                className="cancel-delete-btn"
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-delete-btn"
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

export default MyComplaints;
