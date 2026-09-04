import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaClipboardList,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaUsers,
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrashAlt,
  FaTimes,
  FaSpinner,
  FaShieldAlt,
  FaUserShield,
  FaExclamationTriangle,
  FaFileDownload,
  FaPaperclip,
  FaStar,
  FaExternalLinkAlt,
  FaFilePdf,
  FaFileImage,
  FaWhatsapp,
} from "react-icons/fa";
import api from "../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    inProgress: 0,
    rejected: 0,
    activeUsers: 0,
    avgRating: 4.9,
    feedbackCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Edit Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalStatus, setModalStatus] = useState("");
  const [modalRemarks, setModalRemarks] = useState("");
  const [modalPriority, setModalPriority] = useState("Medium");
  const [updating, setUpdating] = useState(false);
  const [modalError, setModalError] = useState("");

  const user = JSON.parse(localStorage.getItem("consumerTrustUser") || "null");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, complaintsRes] = await Promise.all([
        api.get("/complaints/stats"),
        api.get(`/complaints?status=${statusFilter}&category=${categoryFilter}&search=${searchTerm}`),
      ]);

      if (statsRes.data?.stats) {
        setStats(statsRes.data.stats);
      }
      if (complaintsRes.data?.complaints) {
        setComplaints(complaintsRes.data.complaints);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load admin records. Please ensure you are logged in as an Administrator."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const openUpdateModal = (complaint) => {
    setSelectedComplaint(complaint);
    setModalStatus(complaint.status);
    setModalRemarks(complaint.adminRemarks || "");
    setModalPriority(complaint.priority || "Medium");
    setModalError("");
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setUpdating(true);
    setModalError("");

    try {
      const response = await api.put(`/complaints/${selectedComplaint._id}/status`, {
        status: modalStatus,
        adminRemarks: modalRemarks,
        priority: modalPriority,
      });

      if (response.data?.success) {
        setSelectedComplaint(null);
        fetchData();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to update complaint");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteComplaint = async (id) => {
    if (!window.confirm("Are you sure you want to delete this complaint permanently?")) {
      return;
    }

    try {
      await api.delete(`/complaints/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete complaint");
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Build official WhatsApp dispatch link
  const getWhatsAppDispatchUrl = (complaint, customRemarks = null, customStatus = null) => {
    if (!complaint || !complaint.phone) return "#";
    const status = customStatus || complaint.status;
    const remarks = customRemarks !== null ? customRemarks : (complaint.adminRemarks || "Grievance review active.");
    const cleanPhone = complaint.phone.replace(/[^0-9]/g, "").slice(-10);
    const text = [
      `🏛️ *CONSUMER TRUST GRIEVANCE REDRESSAL CELL*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Dear ${complaint.name},`,
      `Official resolution update regarding your case *${complaint.complaintId}*:`,
      ``,
      `📊 *Status:* *${status}*`,
      `📝 *Authority Remarks:* "${remarks}"`,
      ``,
      `🔗 *View Official Case File & Resolution Details:*`,
      `${window.location.origin}/track?id=${complaint.complaintId}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `_Official Nodal Desk Notice._`,
    ].join("\n");
    return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const handleExportCSV = () => {
    if (complaints.length === 0) return;

    const headers = [
      "Complaint ID",
      "Filing Date",
      "Citizen Name",
      "Email",
      "Phone",
      "Category",
      "Priority",
      "Status",
      "Subject",
      "Description",
      "Evidence Files Count",
      "WhatsApp Alerts",
      "Officer Remarks",
      "Resolved Date",
      "Citizen Rating (1-5)",
      "Citizen Feedback Comments",
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = complaints.map((c) => [
      escapeCsv(c.complaintId),
      escapeCsv(new Date(c.createdAt).toLocaleString()),
      escapeCsv(c.name),
      escapeCsv(c.email),
      escapeCsv(c.phone),
      escapeCsv(c.category),
      escapeCsv(c.priority),
      escapeCsv(c.status),
      escapeCsv(c.subject),
      escapeCsv(c.description),
      escapeCsv(c.attachments ? c.attachments.length : 0),
      escapeCsv(c.whatsappAlertsEnabled !== false ? "Active" : "Disabled"),
      escapeCsv(c.adminRemarks || "None"),
      escapeCsv(c.resolvedAt ? new Date(c.resolvedAt).toLocaleString() : "Pending"),
      escapeCsv(c.feedback?.rating ? `${c.feedback.rating}/5` : "Not Rated"),
      escapeCsv(c.feedback?.comments || "None"),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Grievance_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-dashboard-page">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <div>
            <div className="admin-badge">
              <FaUserShield /> Grievance Administration Portal
            </div>
            <h1>Admin Control Center</h1>
            <p>Review filed complaints, inspect evidence files, dispatch WhatsApp resolutions, and monitor satisfaction.</p>
          </div>
          {user?.role !== "admin" && (
            <div className="admin-notice">
              <FaExclamationTriangle />
              <span>
                Tip: If not logged in as Admin, please{" "}
                <Link to="/login?role=admin">sign in with an Admin account</Link>.
              </span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="dashboard-cards">
          <div className="dashboard-card total">
            <div className="card-top-row">
              <FaClipboardList className="card-icon" />
              <span>Total Grievances</span>
            </div>
            <h2>{stats.total}</h2>
            <p>All time registered cases</p>
          </div>

          <div className="dashboard-card pending">
            <div className="card-top-row">
              <FaClock className="card-icon" />
              <span>Pending Review</span>
            </div>
            <h2>{stats.pending}</h2>
            <p>Awaiting assignment</p>
          </div>

          <div className="dashboard-card progress">
            <div className="card-top-row">
              <FaSpinner className="card-icon" />
              <span>In Progress</span>
            </div>
            <h2>{stats.inProgress}</h2>
            <p>Active inquiries</p>
          </div>

          <div className="dashboard-card resolved">
            <div className="card-top-row">
              <FaCheckCircle className="card-icon" />
              <span>Resolved</span>
            </div>
            <h2>{stats.resolved}</h2>
            <p>Successfully closed</p>
          </div>

          <div className="dashboard-card satisfaction">
            <div className="card-top-row">
              <FaStar className="card-icon gold" />
              <span>Citizen Satisfaction</span>
            </div>
            <h2>{stats.avgRating ? `${stats.avgRating} / 5.0` : "4.9 / 5.0"}</h2>
            <p>{stats.feedbackCount || 0} reviews recorded</p>
          </div>

          <div className="dashboard-card users">
            <div className="card-top-row">
              <FaUsers className="card-icon" />
              <span>Active Users</span>
            </div>
            <h2>{stats.activeUsers}</h2>
            <p>Registered citizens</p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="admin-controls-card">
          <form onSubmit={handleSearchSubmit} className="controls-form">
            <div className="search-wrap">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by Complaint ID, Consumer Name, Subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-selects">
              <div className="select-wrap">
                <label>Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="select-wrap">
                <label>Category:</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option value="Product">Product</option>
                  <option value="Service">Service</option>
                  <option value="Food">Food</option>
                  <option value="Banking">Banking</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button type="submit" className="search-btn">
                Filter
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="admin-error-box">
            <FaExclamationTriangle />
            <div>
              <strong>Access Notice</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Complaints Table */}
        <div className="table-wrapper">
          <div className="table-header">
            <h3>Registered Grievance Records ({complaints.length})</h3>
            <button
              type="button"
              className="export-csv-btn"
              onClick={handleExportCSV}
              disabled={complaints.length === 0}
              title="Download all listed grievances as a CSV spreadsheet"
            >
              <FaFileDownload /> Export to CSV
            </button>
          </div>

          {loading ? (
            <div className="table-loading">Loading complaint records...</div>
          ) : complaints.length === 0 ? (
            <div className="table-empty">
              <FaClipboardList style={{ fontSize: 36, color: "#90a4ae", marginBottom: 10 }} />
              <p>No complaints found matching the selected filters.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tracking ID</th>
                    <th>Complainant</th>
                    <th>Category</th>
                    <th>Subject</th>
                    <th>Evidence</th>
                    <th>Status</th>
                    <th>Satisfaction</th>
                    <th>Date Filed</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <span className="table-id">{c.complaintId}</span>
                      </td>
                      <td>
                        <div className="complainant-cell">
                          <strong>{c.name}</strong>
                          <span>{c.email}</span>
                          <span>{c.phone}</span>
                        </div>
                      </td>
                      <td>
                        <span className="category-pill">{c.category}</span>
                      </td>
                      <td>
                        <div className="subject-cell" title={c.subject}>
                          {c.subject}
                        </div>
                      </td>
                      <td>
                        {c.attachments && c.attachments.length > 0 ? (
                          <span className="table-evidence-pill" title={`${c.attachments.length} files attached`}>
                            <FaPaperclip /> {c.attachments.length} file{c.attachments.length > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="table-none-text">—</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`status-pill ${c.status
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td>
                        {c.feedback && c.feedback.rating ? (
                          <span className="table-rating-pill" title={`Citizen remark: "${c.feedback.comments || 'No comment'}"`}>
                            <FaStar /> {c.feedback.rating}.0
                          </span>
                        ) : c.status === "Resolved" ? (
                          <span className="table-pending-rating">Pending rating</span>
                        ) : (
                          <span className="table-none-text">—</span>
                        )}
                      </td>
                      <td>
                        <span className="date-cell">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            type="button"
                            className="action-btn edit"
                            onClick={() => openUpdateModal(c)}
                            title="Update Status & Remarks"
                          >
                            <FaEdit /> Manage
                          </button>
                          <a
                            href={getWhatsAppDispatchUrl(c)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="action-btn whatsapp-table-btn"
                            title="Dispatch Update via WhatsApp"
                          >
                            <FaWhatsapp /> WhatsApp
                          </a>
                          <button
                            type="button"
                            className="action-btn delete"
                            onClick={() => handleDeleteComplaint(c._id)}
                            title="Delete Record"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Status Update & Resolution Modal */}
        {selectedComplaint && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <span className="modal-tag">{selectedComplaint.complaintId}</span>
                  <h2>Manage Grievance Resolution</h2>
                </div>
                <button
                  type="button"
                  className="close-modal-btn"
                  onClick={() => setSelectedComplaint(null)}
                >
                  <FaTimes />
                </button>
              </div>

              {modalError && <div className="modal-error">{modalError}</div>}

              <form onSubmit={handleSaveUpdate} className="modal-form">
                <div className="modal-info-box">
                  <div>
                    <strong>Subject:</strong> {selectedComplaint.subject}
                  </div>
                  <div>
                    <strong>Complainant:</strong> {selectedComplaint.name} ({selectedComplaint.email} / {selectedComplaint.phone})
                  </div>
                  <div>
                    <strong>Category:</strong> {selectedComplaint.category}
                  </div>
                  <div>
                    <strong>WhatsApp Case Updates:</strong>{" "}
                    <span className="modal-wa-active">
                      <FaWhatsapp /> Active ({selectedComplaint.phone})
                    </span>
                  </div>
                  <div>
                    <strong>Filed Description:</strong>
                    <p className="full-desc">{selectedComplaint.description}</p>
                  </div>

                  {/* Citizen Feedback in Modal if present */}
                  {selectedComplaint.feedback && selectedComplaint.feedback.rating && (
                    <div className="modal-feedback-card">
                      <strong>Citizen Satisfaction Review:</strong>
                      <div className="modal-stars-row">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            className={star <= selectedComplaint.feedback.rating ? "star-gold" : "star-gray"}
                          />
                        ))}
                        <span className="modal-score">
                          {selectedComplaint.feedback.rating}.0 / 5.0 Stars
                        </span>
                      </div>
                      {selectedComplaint.feedback.comments && (
                        <p className="modal-feedback-quote">
                          "{selectedComplaint.feedback.comments}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Evidence Attachments in Modal */}
                  {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                    <div className="modal-attachments-box">
                      <strong>Attached Evidence & Proof Documents ({selectedComplaint.attachments.length}):</strong>
                      <div className="modal-attachments-list">
                        {selectedComplaint.attachments.map((att, idx) => {
                          const isPdf = att.mimeType === "application/pdf" || (att.filename && att.filename.endsWith(".pdf"));
                          const fileUrl = att.url || `http://localhost:5000/uploads/${att.filename}`;
                          return (
                            <div key={idx} className="modal-att-item">
                              <div className="modal-att-left">
                                {isPdf ? (
                                  <FaFilePdf className="modal-att-icon pdf" />
                                ) : (
                                  <FaFileImage className="modal-att-icon img" />
                                )}
                                <div className="modal-att-details">
                                  <span className="modal-att-name" title={att.originalName}>
                                    {att.originalName || att.filename}
                                  </span>
                                  {att.size && (
                                    <span className="modal-att-size">{formatFileSize(att.size)}</span>
                                  )}
                                </div>
                              </div>
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="modal-view-doc-btn"
                              >
                                View / Download <FaExternalLinkAlt style={{ fontSize: 11 }} />
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-row-modal">
                  <div className="input-group">
                    <label>Update Grievance Status *</label>
                    <select
                      value={modalStatus}
                      onChange={(e) => setModalStatus(e.target.value)}
                      required
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Case Priority</label>
                    <select
                      value={modalPriority}
                      onChange={(e) => setModalPriority(e.target.value)}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="input-group full-width">
                  <label>Official Resolution / Admin Remarks</label>
                  <textarea
                    rows="4"
                    placeholder="Enter official investigation summary, settlement details, or reason for status update (dispatched via WhatsApp/email and visible on tracking portal)..."
                    value={modalRemarks}
                    onChange={(e) => setModalRemarks(e.target.value)}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setSelectedComplaint(null)}
                  >
                    Cancel
                  </button>

                  {/* 1-Click WhatsApp Resolution Dispatch Button */}
                  <a
                    href={getWhatsAppDispatchUrl(selectedComplaint, modalRemarks, modalStatus)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modal-wa-btn"
                    title="Open WhatsApp with pre-composed official resolution notice"
                  >
                    <FaWhatsapp /> Dispatch Notice on WhatsApp
                  </a>

                  <button type="submit" className="save-btn" disabled={updating}>
                    {updating ? "Saving Changes..." : "Save & Publish Resolution"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
