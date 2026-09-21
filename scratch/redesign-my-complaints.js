const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const myComplaintsJsx = `import { useState, useEffect } from "react";
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
      const res = await api.delete(\`/complaints/\${complaintToDelete._id}\`);
      if (res.data?.success || res.status === 200) {
        setComplaints((prev) => prev.filter((c) => c._id !== complaintToDelete._id));
        setSuccessMessage(\`Grievance docket #\${complaintToDelete.complaintId} has been deleted successfully.\`);
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
            className={\`summary-box total \${selectedStatus === "All" ? "active-filter" : ""}\`}
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
            className={\`summary-box pending \${selectedStatus === "Pending" ? "active-filter" : ""}\`}
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
            className={\`summary-box progress \${selectedStatus === "In Progress" ? "active-filter" : ""}\`}
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
            className={\`summary-box resolved \${selectedStatus === "Resolved" ? "active-filter" : ""}\`}
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
                className={\`status-tab-btn \${selectedStatus === "All" ? "active" : ""}\`}
                onClick={() => setSelectedStatus("All")}
              >
                All ({totalCount})
              </button>
              <button
                className={\`status-tab-btn pending \${selectedStatus === "Pending" ? "active" : ""}\`}
                onClick={() => setSelectedStatus("Pending")}
              >
                Pending ({pendingCount})
              </button>
              <button
                className={\`status-tab-btn progress \${selectedStatus === "In Progress" ? "active" : ""}\`}
                onClick={() => setSelectedStatus("In Progress")}
              >
                In Progress ({inProgressCount})
              </button>
              <button
                className={\`status-tab-btn resolved \${selectedStatus === "Resolved" ? "active" : ""}\`}
                onClick={() => setSelectedStatus("Resolved")}
              >
                Resolved ({resolvedCount})
              </button>
              {rejectedCount > 0 && (
                <button
                  className={\`status-tab-btn rejected \${selectedStatus === "Rejected" ? "active" : ""}\`}
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
              const statusKey = (c.status || "Pending").toLowerCase().replace(/\\s+/g, "-");
              const brandName = c.companyName || "General Enterprise";
              const dateStr = c.createdAt
                ? new Date(c.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Recent";

              return (
                <div key={c._id} className={\`complaint-box-panel \${statusKey}\`}>

                  {/* Panel Header Bar */}
                  <div className="panel-header-bar">
                    <div className="panel-header-left">
                      {/* Brand Badge */}
                      <span className="brand-badge-pill" title={\`Enterprise: \${brandName}\`}>
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
                      <span className={\`status-pill \${statusKey}\`}>
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
                      <span className="meta-badge evidence" title={\`\${c.attachments.length} proof document(s) uploaded\`}>
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
                      <span className="meta-badge rating" title={\`Citizen rating: \${c.feedback.rating}/5\`}>
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
                      <Link to={\`/track?id=\${c.complaintId}\`} className="action-btn track-btn">
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
                        href={\`https://api.whatsapp.com/send?text=\${encodeURIComponent(
                          \`🏛️ Consumer Trust Grievance Docket\\nCase ID: \${c.complaintId}\\nBrand: \${brandName}\\nStatus: \${c.status}\\nTrack Live: \${window.location.origin}/track?id=\${c.complaintId}\`
                        )}\`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn wa-share-btn"
                        title="Share tracking docket on WhatsApp"
                      >
                        <FaWhatsapp /> Share
                      </a>

                      {/* Rate Resolution Button */}
                      {c.status === "Resolved" && !c.feedback?.rating && (
                        <Link to={\`/track?id=\${c.complaintId}\`} className="action-btn rate-btn">
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
`;

const myComplaintsCss = `/* ==========================================================================
   MY COMPLAINTS - VIBRANT BOX PANELS & REDRESSAL DASHBOARD
   ========================================================================== */

.my-complaints-page {
  min-height: calc(100vh - 80px);
  background: var(--bg-primary, #f4f7fb);
  padding: 32px 20px 70px;
}

.my-complaints-container {
  max-width: 1140px;
  margin: 0 auto;
}

/* ==========================================================================
   1. Header Box Panel
   ========================================================================== */
.my-complaints-header-panel {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 18px;
  padding: 26px 30px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(15, 43, 92, 0.05);
}

.header-text-group {
  flex: 1;
  min-width: 280px;
}

.header-badge-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.official-portal-tag {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  font-size: 11.5px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.user-email-tag {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.my-complaints-header-panel h1 {
  font-size: 26px;
  font-weight: 800;
  color: var(--text-heading, #0f2b5c);
  margin-bottom: 6px;
  letter-spacing: -0.3px;
}

.my-complaints-header-panel p {
  color: var(--text-muted, #64748b);
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.file-new-btn {
  background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 700;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 6px 18px rgba(234, 88, 12, 0.35);
  transition: all 0.25s ease;
  white-space: nowrap;
}

.file-new-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(234, 88, 12, 0.5);
  color: #ffffff;
}

/* ==========================================================================
   Alert Banners
   ========================================================================== */
.success-banner {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 22px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 3px 10px rgba(5, 150, 105, 0.08);
}

.success-banner .banner-icon {
  font-size: 18px;
  color: #059669;
  flex-shrink: 0;
}

.banner-close {
  margin-left: auto;
  background: none;
  border: none;
  color: #065f46;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}

.error-banner {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 22px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 600;
}

.retry-btn {
  margin-left: auto;
  background: #dc2626;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* ==========================================================================
   2. Vibrant Summary Metric Box Panels (4 Boxes)
   ========================================================================== */
.summary-boxes-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 24px;
}

@media (max-width: 900px) {
  .summary-boxes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 520px) {
  .summary-boxes-grid {
    grid-template-columns: 1fr;
  }
}

.summary-box {
  background: var(--card-bg, #ffffff);
  border: 1.5px solid var(--border-color, #e2e8f0);
  border-radius: 16px;
  padding: 20px 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.03);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.summary-box:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
}

.summary-box.active-filter {
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.12);
}

.summary-box-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.summary-box-content {
  flex: 1;
}

.summary-box-num {
  font-size: 28px;
  font-weight: 800;
  line-height: 1.1;
  display: block;
}

.summary-box-title {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-heading, #0f2b5c);
  display: block;
  margin-top: 3px;
}

.summary-box-desc {
  font-size: 11.5px;
  color: var(--text-muted, #64748b);
  display: block;
}

.summary-box-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

/* Color 1: Total Lodged - Vibrant Royal Blue */
.summary-box.total .summary-box-indicator { background: linear-gradient(90deg, #2563eb, #3b82f6); }
.summary-box.total .summary-box-icon-wrap { background: #eff6ff; color: #2563eb; }
.summary-box.total .summary-box-num { color: #2563eb; }
.summary-box.total.active-filter { border-color: #2563eb; background: #fafcff; }

/* Color 2: Pending - Vibrant Warm Amber */
.summary-box.pending .summary-box-indicator { background: linear-gradient(90deg, #d97706, #f59e0b); }
.summary-box.pending .summary-box-icon-wrap { background: #fffbeb; color: #d97706; }
.summary-box.pending .summary-box-num { color: #d97706; }
.summary-box.pending.active-filter { border-color: #d97706; background: #fffdfa; }

/* Color 3: In Progress - Vibrant Ocean Blue */
.summary-box.progress .summary-box-indicator { background: linear-gradient(90deg, #0284c7, #38bdf8); }
.summary-box.progress .summary-box-icon-wrap { background: #f0f9ff; color: #0284c7; }
.summary-box.progress .summary-box-num { color: #0284c7; }
.summary-box.progress.active-filter { border-color: #0284c7; background: #f8fcff; }

/* Color 4: Resolved - Vibrant Emerald Green */
.summary-box.resolved .summary-box-indicator { background: linear-gradient(90deg, #059669, #10b981); }
.summary-box.resolved .summary-box-icon-wrap { background: #ecfdf5; color: #059669; }
.summary-box.resolved .summary-box-num { color: #059669; }
.summary-box.resolved.active-filter { border-color: #059669; background: #f7fefb; }

/* ==========================================================================
   3. Filter & Multi-Control Box
   ========================================================================== */
.filter-controls-box {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 16px;
  padding: 18px 22px;
  margin-bottom: 24px;
  box-shadow: 0 3px 12px rgba(15, 23, 42, 0.03);
}

.filter-controls-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 14px;
}

.status-tabs-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.status-tab-btn {
  background: var(--bg-primary, #f1f5f9);
  color: var(--text-secondary, #475569);
  border: 1px solid transparent;
  padding: 7px 15px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.status-tab-btn:hover {
  background: #e2e8f0;
}

.status-tab-btn.active {
  background: #0f2b5c;
  color: #ffffff;
  border-color: #0f2b5c;
}

.status-tab-btn.pending.active {
  background: #d97706;
  border-color: #d97706;
  color: white;
}

.status-tab-btn.progress.active {
  background: #0284c7;
  border-color: #0284c7;
  color: white;
}

.status-tab-btn.resolved.active {
  background: #059669;
  border-color: #059669;
  color: white;
}

.status-tab-btn.rejected.active {
  background: #dc2626;
  border-color: #dc2626;
  color: white;
}

.brand-select-wrap {
  position: relative;
  min-width: 240px;
}

.brand-select-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 13px;
  pointer-events: none;
}

.brand-select-dropdown {
  width: 100%;
  padding: 8px 12px 8px 34px;
  border-radius: 10px;
  border: 1.5px solid var(--border-color, #cbd5e1);
  background: var(--card-bg, #ffffff);
  color: var(--text-primary, #0f172a);
  font-size: 13px;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.brand-select-dropdown:focus {
  border-color: #2563eb;
}

.search-bar-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input-box {
  flex: 1;
  position: relative;
}

.search-input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 15px;
}

.search-input-box input {
  width: 100%;
  padding: 11px 38px 11px 40px;
  border-radius: 10px;
  border: 1.5px solid var(--border-color, #cbd5e1);
  background: var(--bg-primary, #f8fafc);
  color: var(--text-primary, #0f172a);
  font-size: 13.5px;
  outline: none;
  transition: all 0.2s ease;
}

.search-input-box input:focus {
  background: #ffffff;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.search-clear-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 14px;
}

.reset-filter-btn {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.reset-filter-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* ==========================================================================
   4. Complaints Box Panels Grid & Individual Cards
   ========================================================================== */
.complaints-box-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.complaint-box-panel {
  background: var(--card-bg, #ffffff);
  border: 1.5px solid var(--border-color, #e2e8f0);
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.04);
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.complaint-box-panel:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
}

/* Vibrant Status-Coded Borders */
.complaint-box-panel.pending {
  border-left: 5px solid #d97706;
}

.complaint-box-panel.in-progress {
  border-left: 5px solid #0284c7;
}

.complaint-box-panel.resolved {
  border-left: 5px solid #059669;
}

.complaint-box-panel.rejected {
  border-left: 5px solid #dc2626;
}

/* Header Bar */
.panel-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color, #f1f5f9);
  margin-bottom: 16px;
}

.panel-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* Brand Badge Pill */
.brand-badge-pill {
  background: linear-gradient(135deg, #0f2b5c 0%, #1e3a8a 100%);
  color: #ffffff;
  font-size: 12.5px;
  font-weight: 700;
  padding: 5px 14px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  box-shadow: 0 2px 8px rgba(15, 43, 92, 0.2);
}

.brand-icon {
  color: #f59e0b;
}

/* Category Badge Pill */
.category-badge-pill {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  font-size: 11.5px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* Docket ID Pill with Copy */
.docket-id-pill {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  position: relative;
  transition: all 0.2s ease;
}

.docket-id-pill:hover {
  background: #dbeafe;
}

.copy-icon {
  font-size: 11px;
  opacity: 0.7;
}

.copied-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #0f172a;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  margin-bottom: 4px;
}

.panel-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* Status Pill */
.status-pill {
  font-size: 12px;
  font-weight: 700;
  padding: 5px 14px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}

.status-pill.pending {
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}
.status-pill.pending .status-dot { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }

.status-pill.in-progress {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}
.status-pill.in-progress .status-dot { background: #0284c7; box-shadow: 0 0 6px #0284c7; }

.status-pill.resolved {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}
.status-pill.resolved .status-dot { background: #059669; box-shadow: 0 0 6px #059669; }

.status-pill.rejected {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}
.status-pill.rejected .status-dot { background: #dc2626; }

.filing-date-pill {
  font-size: 12px;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
}

/* Body Box */
.panel-body-box {
  margin-bottom: 16px;
}

.complaint-subject-heading {
  font-size: 17px;
  font-weight: 800;
  color: var(--text-heading, #0f2b5c);
  margin-bottom: 10px;
  line-height: 1.4;
}

.order-ref-box {
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  padding: 6px 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  margin-bottom: 12px;
  color: #334155;
}

.receipt-icon {
  color: #64748b;
}

.order-label {
  color: #64748b;
  font-weight: 600;
}

.order-value {
  color: #0f172a;
  font-family: monospace;
  font-weight: 700;
}

.complaint-desc-box {
  background: var(--bg-primary, #f8fafc);
  border: 1px solid var(--border-color, #e2e8f0);
  border-left: 3px solid #cbd5e1;
  border-radius: 10px;
  padding: 12px 16px;
  color: var(--text-secondary, #334155);
  font-size: 13.5px;
  line-height: 1.6;
}

.complaint-desc-box p {
  margin: 0;
  white-space: pre-wrap;
}

/* Metadata Badges Bar */
.panel-meta-badges-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.meta-badge {
  font-size: 11.5px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.meta-badge.evidence {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.meta-badge.whatsapp {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.meta-badge.notice {
  background: #fefce8;
  color: #a16207;
  border: 1px solid #fef08a;
}

.meta-badge.rating {
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}

/* Authority Remarks Box */
.authority-remarks-box {
  background: #f0fdf4;
  border: 1.5px solid #86efac;
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 18px;
}

.remarks-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 800;
  color: #166534;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 6px;
}

.remarks-header .shield-icon {
  font-size: 14px;
}

.remarks-text {
  font-size: 13.5px;
  color: #14532d;
  line-height: 1.5;
  margin: 0;
}

/* ==========================================================================
   Panel Actions Footer Box
   ========================================================================== */
.panel-actions-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color, #f1f5f9);
}

.actions-left-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.actions-right-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-btn {
  padding: 9px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  transition: all 0.2s ease;
  border: none;
  white-space: nowrap;
}

/* Action 1: Track Live - Royal Blue */
.action-btn.track-btn {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.action-btn.track-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
  color: #ffffff;
}

/* Action 2: PDF Notice - Deep Navy / Indigo */
.action-btn.pdf-btn {
  background: #0f2b5c;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(15, 43, 92, 0.2);
}

.action-btn.pdf-btn:hover {
  background: #1e3a8a;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(15, 43, 92, 0.35);
}

/* Action 3: WhatsApp Share - Forest Green */
.action-btn.wa-share-btn {
  background: #16a34a;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
}

.action-btn.wa-share-btn:hover {
  background: #15803d;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(22, 163, 74, 0.4);
  color: #ffffff;
}

/* Action 4: Rate Resolution - Amber Gold */
.action-btn.rate-btn {
  background: #f59e0b;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
}

.action-btn.rate-btn:hover {
  background: #d97706;
  transform: translateY(-2px);
  color: #ffffff;
}

/* Action 5: Delete Grievance - Crimson Red */
.action-btn.delete-btn {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}

.action-btn.delete-btn:hover {
  background: #dc2626;
  color: #ffffff;
  border-color: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.3);
}

/* ==========================================================================
   Loading & Empty States
   ========================================================================== */
.complaints-loading-box {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 18px;
  padding: 60px 20px;
  text-align: center;
  color: var(--text-muted, #64748b);
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.03);
}

.spinner-orbit {
  width: 44px;
  height: 44px;
  border: 4px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.complaints-empty-box {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 18px;
  padding: 60px 24px;
  text-align: center;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.03);
}

.empty-icon-wrap {
  width: 72px;
  height: 72px;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 18px;
}

.complaints-empty-box h3 {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-heading, #0f2b5c);
  margin-bottom: 8px;
}

.complaints-empty-box p {
  color: var(--text-muted, #64748b);
  font-size: 14px;
  max-width: 500px;
  margin: 0 auto 22px;
  line-height: 1.5;
}

.empty-register-cta {
  background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 700;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 6px 18px rgba(234, 88, 12, 0.35);
  transition: all 0.25s ease;
}

.empty-register-cta:hover {
  transform: translateY(-2px);
  color: #ffffff;
  box-shadow: 0 10px 24px rgba(234, 88, 12, 0.5);
}

.empty-reset-btn {
  background: #f1f5f9;
  color: #0f2b5c;
  border: 1px solid #cbd5e1;
  padding: 10px 22px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.empty-reset-btn:hover {
  background: #e2e8f0;
}

/* ==========================================================================
   5. Delete Confirmation Modal
   ========================================================================== */
.delete-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.delete-modal-box {
  background: #ffffff;
  border-radius: 20px;
  padding: 28px;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.25);
  animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  text-align: center;
}

@keyframes modalPop {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.delete-modal-icon {
  width: 60px;
  height: 60px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 16px;
}

.delete-modal-box h3 {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 8px;
}

.delete-modal-desc {
  font-size: 14px;
  color: #475569;
  line-height: 1.5;
  margin-bottom: 16px;
}

.delete-modal-warning {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  text-align: left;
  font-size: 12.5px;
  color: #92400e;
  margin-bottom: 22px;
  line-height: 1.4;
}

.delete-modal-warning svg {
  font-size: 15px;
  color: #d97706;
  flex-shrink: 0;
  margin-top: 2px;
}

.delete-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.cancel-delete-btn {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 11px 22px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  flex: 1;
  transition: all 0.2s ease;
}

.cancel-delete-btn:hover:not(:disabled) {
  background: #e2e8f0;
  color: #0f172a;
}

.confirm-delete-btn {
  background: #dc2626;
  color: #ffffff;
  border: none;
  padding: 11px 22px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  flex: 1.2;
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35);
  transition: all 0.2s ease;
}

.confirm-delete-btn:hover:not(:disabled) {
  background: #b91c1c;
  box-shadow: 0 6px 18px rgba(220, 38, 38, 0.5);
}

.confirm-delete-btn:disabled,
.cancel-delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
`;

fs.writeFileSync(path.join(root, "frontend", "src", "pages", "MyComplaints.jsx"), myComplaintsJsx, "utf8");
fs.writeFileSync(path.join(root, "frontend", "src", "pages", "MyComplaints.css"), myComplaintsCss, "utf8");

console.log("Successfully overhauled MyComplaints.jsx and MyComplaints.css into vibrant box panels with delete option!");
