import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  FaPrint,
  FaPaperclip,
  FaTrash,
  FaFilePdf,
  FaFileImage,
  FaWhatsapp,
  FaExternalLinkAlt,
  FaBuilding,
  FaReceipt,
  FaShieldAlt,
  FaMagic,
} from "react-icons/fa";
import api from "../services/api";
import { enhanceGrievanceDescription, COMMON_RELIEFS } from "../utils/aiLegalAssistant";
import { generateGrievanceNoticePdf } from "../utils/pdfGenerator";
import "./RegisterComplaint.css";

const ENTERPRISE_OPTIONS = [
  // E-Commerce & Retail
  { id: "amazon", name: "Amazon India", category: "Product", nodal: "grievance-officer@amazon.in", sla: "48h Ack / 7 Days Redressal" },
  { id: "flipkart", name: "Flipkart", category: "Product", nodal: "grievance.officer@flipkart.com", sla: "48h Ack / 7 Days Redressal" },
  { id: "myntra", name: "Myntra", category: "Product", nodal: "grievanceofficer@myntra.com", sla: "48h Ack / 7 Days Redressal" },
  { id: "meesho", name: "Meesho", category: "Product", nodal: "grievance-officer@meesho.com", sla: "48h Ack / 7 Days Redressal" },
  { id: "ajio", name: "Ajio (Reliance Retail)", category: "Product", nodal: "grievance.officer@ajio.com", sla: "48h Ack / 7 Days Redressal" },
  { id: "nykaa", name: "Nykaa", category: "Product", nodal: "grievanceofficer@nykaa.com", sla: "48h Ack / 7 Days Redressal" },
  { id: "tatacliq", name: "Tata CLiQ", category: "Product", nodal: "grievanceofficer@tatacliq.com", sla: "48h Ack / 7 Days Redressal" },

  // Food & Quick Commerce
  { id: "zomato", name: "Zomato", category: "Food", nodal: "grievance@zomato.com", sla: "24h Ack / 3 Days Redressal" },
  { id: "swiggy", name: "Swiggy", category: "Food", nodal: "grievances@swiggy.in", sla: "24h Ack / 3 Days Redressal" },
  { id: "blinkit", name: "Blinkit", category: "Food", nodal: "grievance@blinkit.com", sla: "24h Ack / 3 Days Redressal" },
  { id: "zepto", name: "Zepto", category: "Food", nodal: "grievance@zeptonow.com", sla: "24h Ack / 3 Days Redressal" },
  { id: "bigbasket", name: "BigBasket", category: "Food", nodal: "grievance@bigbasket.com", sla: "24h Ack / 3 Days Redressal" },
  { id: "dominos", name: "Domino's Pizza India", category: "Food", nodal: "guestcare@jublfood.com", sla: "24h Ack / 3 Days Redressal" },

  // Banking, UPI & Fintech
  { id: "sbi", name: "State Bank of India (SBI)", category: "Banking", nodal: "nodalofficer@sbi.co.in", sla: "48h Ack / 7 Days Redressal (RBI Mandate)" },
  { id: "hdfc", name: "HDFC Bank", category: "Banking", nodal: "grievance.redressal@hdfcbank.com", sla: "48h Ack / 7 Days Redressal (RBI Mandate)" },
  { id: "icici", name: "ICICI Bank", category: "Banking", nodal: "headservicequality@icicibank.com", sla: "48h Ack / 7 Days Redressal (RBI Mandate)" },
  { id: "axis", name: "Axis Bank", category: "Banking", nodal: "nodal.officer@axisbank.com", sla: "48h Ack / 7 Days Redressal (RBI Mandate)" },
  { id: "kotak", name: "Kotak Mahindra Bank", category: "Banking", nodal: "nodalofficer@kotak.com", sla: "48h Ack / 7 Days Redressal (RBI Mandate)" },
  { id: "pnb", name: "Punjab National Bank (PNB)", category: "Banking", nodal: "care@pnb.co.in", sla: "48h Ack / 7 Days Redressal (RBI Mandate)" },
  { id: "phonepe", name: "PhonePe (UPI & Payments)", category: "Banking", nodal: "grievance-officer@phonepe.com", sla: "24h Ack / 5 Days Redressal (NPCI)" },
  { id: "paytm", name: "Paytm Payments", category: "Banking", nodal: "grievanceofficer@paytm.com", sla: "24h Ack / 5 Days Redressal (NPCI)" },
  { id: "googlepay", name: "Google Pay India", category: "Banking", nodal: "gpay-grievance-india@google.com", sla: "24h Ack / 5 Days Redressal (NPCI)" },
  { id: "cred", name: "CRED", category: "Banking", nodal: "grievance@cred.club", sla: "24h Ack / 5 Days Redressal" },

  // Telecom & Utilities
  { id: "jio", name: "Reliance Jio Infocomm", category: "Telecom", nodal: "appellate.authority@jio.com", sla: "48h Ack / 7 Days Redressal (TRAI)" },
  { id: "airtel", name: "Bharti Airtel", category: "Telecom", nodal: "nodalofficer.india@airtel.com", sla: "48h Ack / 7 Days Redressal (TRAI)" },
  { id: "vi", name: "Vodafone Idea (Vi)", category: "Telecom", nodal: "nodalofficer@vodafoneidea.com", sla: "48h Ack / 7 Days Redressal (TRAI)" },
  { id: "bsnl", name: "BSNL India", category: "Telecom", nodal: "cmdbsnl@bsnl.co.in", sla: "48h Ack / 7 Days Redressal (TRAI)" },

  // Travel & Transport
  { id: "makemytrip", name: "MakeMyTrip", category: "Travel", nodal: "grievance.officer@makemytrip.com", sla: "24h Ack / 7 Days Redressal" },
  { id: "irctc", name: "IRCTC (Indian Railways)", category: "Travel", nodal: "customercare@irctc.co.in", sla: "24h Ack / 5 Days Redressal" },
  { id: "indigo", name: "IndiGo Airlines", category: "Travel", nodal: "nodalofficer@goindigo.in", sla: "24h Ack / 7 Days Redressal" },
  { id: "airindia", name: "Air India", category: "Travel", nodal: "nodalofficer@airindia.com", sla: "24h Ack / 7 Days Redressal" },
  { id: "uber", name: "Uber India", category: "Travel", nodal: "grievance-officer-india@uber.com", sla: "24h Ack / 5 Days Redressal" },
  { id: "ola", name: "Ola Cabs", category: "Travel", nodal: "grievanceofficer@olacabs.com", sla: "24h Ack / 5 Days Redressal" },
  { id: "rapido", name: "Rapido Bike Taxi", category: "Travel", nodal: "grievance@rapido.bike", sla: "24h Ack / 5 Days Redressal" },

  // Electronics & Appliances
  { id: "samsung", name: "Samsung Electronics India", category: "Product", nodal: "grievance.india@samsung.com", sla: "48h Ack / 7 Days Redressal" },
  { id: "apple", name: "Apple India", category: "Product", nodal: "india_grievance_officer@apple.com", sla: "48h Ack / 7 Days Redressal" },
  { id: "xiaomi", name: "Xiaomi / Redmi India", category: "Product", nodal: "grievance-officer@xiaomi.com", sla: "48h Ack / 7 Days Redressal" },
  { id: "oneplus", name: "OnePlus India", category: "Product", nodal: "grievance.officer@oneplus.com", sla: "48h Ack / 7 Days Redressal" },
  { id: "sony", name: "Sony India", category: "Product", nodal: "sonyindia.care@sony.com", sla: "48h Ack / 7 Days Redressal" },
  { id: "lg", name: "LG Electronics India", category: "Product", nodal: "serviceindia@lge.com", sla: "48h Ack / 7 Days Redressal" },

  // Other / Custom
  { id: "other", name: "Other / Custom Enterprise", category: "Other", nodal: "Custom Enterprise Desk", sla: "Strict 7 Days Redressal" },
];

function RegisterComplaint() {
  const [searchParams] = useSearchParams();
  const initialCompany = searchParams.get("company") || "Amazon India";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "Product",
    companyName: initialCompany,
    customCompanyName: "",
    orderOrTransactionId: "",
    subject: "",
    description: "",
  });

  const [files, setFiles] = useState([]);
  const [whatsappAlertsEnabled, setWhatsappAlertsEnabled] = useState(true);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedData, setSubmittedData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedWa, setCopiedWa] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // AI Legal Assistant States
  const [selectedReliefs, setSelectedReliefs] = useState([]);
  const [isAiEnhancing, setIsAiEnhancing] = useState(false);

  useEffect(() => {
    // If company is in query params, pre-select it and its category
    const paramCompany = searchParams.get("company");
    if (paramCompany) {
      const match = ENTERPRISE_OPTIONS.find((opt) => opt.name.toLowerCase() === paramCompany.toLowerCase());
      if (match) {
        setFormData((prev) => ({
          ...prev,
          companyName: match.name,
          category: match.category || prev.category,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          companyName: "Other / Custom Enterprise",
          customCompanyName: paramCompany,
        }));
      }
    }
  }, [searchParams]);

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

  const toggleRelief = (relief) => {
    if (selectedReliefs.includes(relief)) {
      setSelectedReliefs(selectedReliefs.filter((r) => r !== relief));
    } else {
      setSelectedReliefs([...selectedReliefs, relief]);
    }
  };

  const handleAiEnhance = () => {
    setIsAiEnhancing(true);
    const enhanced = enhanceGrievanceDescription({
      companyName:
        formData.companyName === "Other / Custom Enterprise"
          ? formData.customCompanyName.trim() || "the Enterprise"
          : formData.companyName,
      category: formData.category,
      orderOrTransactionId: formData.orderOrTransactionId,
      rawSubject: formData.subject,
      rawDescription: formData.description,
      selectedReliefs,
    });
    setFormData((prev) => ({ ...prev, description: enhanced }));
    setTimeout(() => setIsAiEnhancing(false), 400);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "companyName") {
      const match = ENTERPRISE_OPTIONS.find((opt) => opt.name === value);
      if (match && match.category && match.id !== "other") {
        setFormData((prev) => ({
          ...prev,
          companyName: value,
          category: match.category,
        }));
        return;
      }
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFileError("");
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    if (files.length + selectedFiles.length > 5) {
      setFileError("You can attach up to a maximum of 5 evidence files.");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
    ];

    const validFiles = [];
    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        setFileError(`"${file.name}" is not a supported format. Please upload JPG, PNG, WEBP, GIF, or PDF.`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setFileError(`"${file.name}" exceeds the 10MB size limit.`);
        return;
      }
      validFiles.push(file);
    }

    setFiles((prev) => [...prev, ...validFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const effectiveCompanyName =
        formData.companyName === "Other / Custom Enterprise"
          ? formData.customCompanyName.trim() || "Custom Enterprise"
          : formData.companyName;

      const data = new FormData();
      data.append("name", formData.name.trim());
      data.append("email", formData.email.trim());
      data.append("phone", formData.phone.trim());
      data.append("category", formData.category);
      data.append("companyName", effectiveCompanyName);
      data.append("orderOrTransactionId", formData.orderOrTransactionId.trim());
      data.append("subject", formData.subject.trim());
      data.append("description", formData.description.trim());
      data.append("whatsappAlertsEnabled", whatsappAlertsEnabled);

      files.forEach((file) => {
        data.append("evidence", file);
      });

      const response = await api.post("/complaints", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to submit complaint");
      }

      setSubmittedData({
        complaintId: response.data.complaintId,
        companyName: effectiveCompanyName,
        orderOrTransactionId: formData.orderOrTransactionId,
        subject: formData.subject,
        category: formData.category,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        attachmentsCount: files.length,
        whatsappAlertsEnabled,
        whatsAppUrl: response.data.whatsAppUrl,
        whatsAppMessage: response.data.whatsAppMessage,
        date: new Date().toLocaleString(),
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

  const handleCopyWaReport = () => {
    const defaultTrack = `${window.location.origin}/track?id=${submittedData?.complaintId}`;
    const textToCopy =
      submittedData?.whatsAppMessage ||
      `🏛️ *CONSUMER TRUST GRIEVANCE CELL*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📋 *Tracking ID:* ${submittedData?.complaintId}\n🏢 *Enterprise:* ${submittedData?.companyName}\n👤 *Citizen:* ${submittedData?.name}\n📁 *Category:* ${submittedData?.category}\n📌 *Subject:* ${submittedData?.subject}\n⏳ *Status:* Pending Investigation\n\n🔗 *Track Live Investigation:*\n${defaultTrack}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedWa(true);
    setTimeout(() => setCopiedWa(false), 3000);
  };

  const handleCopyDirectLink = () => {
    if (submittedData?.complaintId) {
      navigator.clipboard.writeText(`${window.location.origin}/track?id=${submittedData.complaintId}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const handleReset = () => {
    setSubmittedData(null);
    setFiles([]);
    setFileError("");
    setFormData({
      name: "",
      email: "",
      phone: "",
      category: "Product",
      companyName: "Amazon India",
      customCompanyName: "",
      orderOrTransactionId: "",
      subject: "",
      description: "",
    });
  };

  const selectedEnterprise =
    ENTERPRISE_OPTIONS.find((opt) => opt.name === formData.companyName) ||
    ENTERPRISE_OPTIONS.find((opt) => opt.id === "other");

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
              Your grievance against <strong>{submittedData.companyName}</strong> has been safely logged in the official repository.
              A confirmation email has been dispatched to <strong>{submittedData.email}</strong>.
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

            {/* Direct Automated WhatsApp & Mobile Dispatch Confirmation */}
            {submittedData.complaintId && (
              <div className="whatsapp-action-box direct-dispatch-box">
                <div className="wa-box-header">
                  <div className="wa-title-icon">
                    <FaWhatsapp />
                  </div>
                  <div>
                    <h4>Official WhatsApp & SMS Alert Dispatched</h4>
                    <p>
                      Automated grievance card & live tracking link sent directly to mobile{" "}
                      <strong>+{submittedData.phone.replace(/[^0-9]/g, "").length === 10 ? "91 " + submittedData.phone.replace(/[^0-9]/g, "") : submittedData.phone}</strong>
                    </p>
                  </div>
                </div>

                <div className="direct-dispatch-status-banner">
                  <span className="dispatch-badge-live">
                    <FaCheckCircle /> Sent Directly to Mobile
                  </span>
                  <p className="dispatch-badge-note">
                    No manual sharing needed • Case file & live milestone tracker linked to your phone number
                  </p>
                </div>

                {/* Direct 1-Tap Tracking Link */}
                <div className="direct-link-container">
                  <span className="direct-link-label">Direct 1-Tap Tracking Link:</span>
                  <div className="direct-link-url-box">
                    <a
                      href={`/track?id=${submittedData.complaintId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="direct-link-href"
                    >
                      {window.location.origin}/track?id={submittedData.complaintId} <FaExternalLinkAlt />
                    </a>
                    <button
                      type="button"
                      className="direct-link-copy-btn"
                      onClick={handleCopyDirectLink}
                    >
                      <FaCopy /> {copiedLink ? "Copied!" : "Copy Link"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="success-summary">
              <div>
                <strong>Target Enterprise:</strong> {submittedData.companyName}
              </div>
              {submittedData.orderOrTransactionId && (
                <div>
                  <strong>Order / Ref ID:</strong> {submittedData.orderOrTransactionId}
                </div>
              )}
              <div>
                <strong>Complainant:</strong> {submittedData.name}
              </div>
              <div>
                <strong>Category:</strong> {submittedData.category}
              </div>
              <div>
                <strong>Subject:</strong> {submittedData.subject}
              </div>
              <div>
                <strong>Filing Date:</strong> {submittedData.date}
              </div>
              <div>
                <strong>Evidence Uploaded:</strong>{" "}
                {submittedData.attachmentsCount > 0 ? (
                  <span className="evidence-badge">
                    <FaPaperclip /> {submittedData.attachmentsCount} file(s) attached
                  </span>
                ) : (
                  "No files attached"
                )}
              </div>
              <div>
                <strong>WhatsApp Status Alerts:</strong>{" "}
                {submittedData.whatsappAlertsEnabled ? (
                  <span className="whatsapp-badge-active">
                    <FaWhatsapp /> Active ({submittedData.phone})
                  </span>
                ) : (
                  "Disabled"
                )}
              </div>
              <div className="statutory-notice-badge-row">
                <span className="statutory-notice-badge">
                  <FaShieldAlt /> Statutory Grievance Notice & 1-Click Resolution Token Dispatched to {submittedData.companyName} Nodal Desk
                </span>
              </div>
            </div>

            <div className="success-actions no-print">
              <button
                type="button"
                className="pdf-notice-btn"
                onClick={() => generateGrievanceNoticePdf(submittedData)}
                title="Download stamped, verifiable statutory legal notice PDF"
              >
                <FaFilePdf /> Download Official Notice (PDF)
              </button>
              <button
                type="button"
                className="print-slip-btn"
                onClick={handlePrintSlip}
              >
                <FaPrint /> Print Slip
              </button>
              <Link
                to={`/track?id=${submittedData.complaintId}`}
                className="track-now-btn"
              >
                Track Live <FaArrowRight />
              </Link>
              <button
                type="button"
                className="register-another-btn"
                onClick={handleReset}
              >
                File Another
              </button>
            </div>

            {/* Official Printable Receipt for window.print() */}
            <div className="print-slip-wrapper print-only">
              <div className="slip-header">
                <h3>Consumer Trust Grievance Redressal Cell</h3>
                <p>Official Grievance Registration Acknowledgment</p>
              </div>
              <div className="slip-body">
                <div className="slip-row">
                  <span>Tracking ID:</span>
                  <strong>{submittedData.complaintId}</strong>
                </div>
                <div className="slip-row">
                  <span>Disputed Enterprise:</span>
                  <strong>{submittedData.companyName}</strong>
                </div>
                {submittedData.orderOrTransactionId && (
                  <div className="slip-row">
                    <span>Order / Ref ID:</span>
                    <span>{submittedData.orderOrTransactionId}</span>
                  </div>
                )}
                <div className="slip-row">
                  <span>Filing Timestamp:</span>
                  <span>{submittedData.date}</span>
                </div>
                <div className="slip-row">
                  <span>Citizen Name:</span>
                  <span>{submittedData.name}</span>
                </div>
                <div className="slip-row">
                  <span>Contact Email:</span>
                  <span>{submittedData.email}</span>
                </div>
                <div className="slip-row">
                  <span>Contact Phone:</span>
                  <span>{submittedData.phone}</span>
                </div>
                <div className="slip-row">
                  <span>Category:</span>
                  <span>{submittedData.category}</span>
                </div>
                <div className="slip-row">
                  <span>Grievance Subject:</span>
                  <span>{submittedData.subject}</span>
                </div>
                <div className="slip-row">
                  <span>Attached Evidence:</span>
                  <span>{submittedData.attachmentsCount} document(s)</span>
                </div>
                <div className="slip-row">
                  <span>Initial Status:</span>
                  <span className="slip-status">Pending Investigation</span>
                </div>
              </div>
              <div className="slip-footer">
                <p>Please preserve this receipt for ombudsman appeals and verification.</p>
                <p>Verify live progress at: {window.location.origin}/track?id={submittedData.complaintId}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <h1>Register Consumer Grievance</h1>
            <p className="register-subtitle">
              Please enter accurate transaction and dispute information. Attach invoices,
              receipts, or defect photos to accelerate investigation.
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
                  <label>Phone Number (WhatsApp Active) *</label>
                  <div className="input-wrapper">
                    <FaPhone className="input-icon" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="e.g. 8074875176 or +91 98765 43210"
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
                      <option value="Telecom">Telecom / Internet Providers</option>
                      <option value="Travel">Travel / Airlines / Railways</option>
                      <option value="Other">Other Grievance</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Disputed Enterprise & Order/Transaction Ref */}
              <div className="form-row">
                <div className="input-group">
                  <label>Disputed Enterprise / Platform / Bank *</label>
                  <div className="input-wrapper">
                    <FaBuilding className="input-icon" />
                    <select
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                    >
                      <optgroup label="🛍️ E-Commerce & Retail">
                        <option value="Amazon India">Amazon India</option>
                        <option value="Flipkart">Flipkart</option>
                        <option value="Myntra">Myntra</option>
                        <option value="Meesho">Meesho</option>
                        <option value="Ajio (Reliance Retail)">Ajio (Reliance Retail)</option>
                      </optgroup>
                      <optgroup label="🍔 Quick Commerce & Food Delivery">
                        <option value="Zomato">Zomato</option>
                        <option value="Swiggy">Swiggy</option>
                        <option value="Blinkit">Blinkit</option>
                        <option value="Zepto">Zepto</option>
                      </optgroup>
                      <optgroup label="🏦 Banks, FinTech & UPI Payments">
                        <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                        <option value="HDFC Bank">HDFC Bank</option>
                        <option value="ICICI Bank">ICICI Bank</option>
                        <option value="Axis Bank">Axis Bank</option>
                        <option value="PhonePe (UPI & Payments)">PhonePe (UPI & Payments)</option>
                        <option value="Paytm Payments">Paytm Payments</option>
                        <option value="Google Pay India">Google Pay India</option>
                      </optgroup>
                      <optgroup label="📱 Telecom & Internet Service Providers">
                        <option value="Reliance Jio Infocomm">Reliance Jio Infocomm</option>
                        <option value="Bharti Airtel">Bharti Airtel</option>
                        <option value="Vodafone Idea (Vi)">Vodafone Idea (Vi)</option>
                      </optgroup>
                      <optgroup label="✈️ Travel, Railways, Flights & Cabs">
                        <option value="MakeMyTrip">MakeMyTrip</option>
                        <option value="IRCTC (Indian Railways)">IRCTC (Indian Railways)</option>
                        <option value="IndiGo Airlines">IndiGo Airlines</option>
                        <option value="Uber India">Uber India</option>
                        <option value="Ola Cabs">Ola Cabs</option>
                      </optgroup>
                      <optgroup label="📱 Electronics & Manufacturers">
                        <option value="Samsung Electronics India">Samsung Electronics India</option>
                        <option value="Apple India">Apple India</option>
                      </optgroup>
                      <optgroup label="🏢 Other Organizations">
                        <option value="Other / Custom Enterprise">Other / Custom Enterprise</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>Order # / UTR / Account / PNR (Optional)</label>
                  <div className="input-wrapper">
                    <FaReceipt className="input-icon" />
                    <input
                      type="text"
                      name="orderOrTransactionId"
                      placeholder="e.g. 408-1234567-8901234 or UTR 4291829102"
                      value={formData.orderOrTransactionId}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {formData.companyName === "Other / Custom Enterprise" && (
                <div className="input-group full-width custom-company-row">
                  <label>Custom Enterprise / Company Name *</label>
                  <div className="input-wrapper">
                    <FaBuilding className="input-icon" />
                    <input
                      type="text"
                      name="customCompanyName"
                      placeholder="Enter the official name of the company / merchant"
                      value={formData.customCompanyName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Nodal Redressal SLA Shield Banner */}
              {selectedEnterprise && (
                <div className="nodal-sla-banner">
                  <div className="nodal-sla-icon">
                    <FaShieldAlt />
                  </div>
                  <div className="nodal-sla-info">
                    <div className="nodal-sla-title">
                      <strong>Statutory Redressal Desk: </strong>
                      <span>{selectedEnterprise.nodal}</span>
                    </div>
                    <div className="nodal-sla-meta">
                      <span>⚡ Regulatory SLA: <strong>{selectedEnterprise.sla}</strong></span>
                      <span className="sla-dot">•</span>
                      <span>⚖️ Statutory Notice will be automatically dispatched upon submission</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="input-group full-width">
                <label>Complaint Subject / Title *</label>
                <div className="input-wrapper">
                  <FaFileAlt className="input-icon" />
                  <input
                    type="text"
                    name="subject"
                    placeholder="Brief summary of the issue (e.g. Defective laptop delivered with no refund)"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-group full-width description-group">
                <div className="desc-header-row">
                  <label>Comprehensive Grievance Statement & Claim *</label>
                  <button
                    type="button"
                    className={`ai-enhance-btn ${isAiEnhancing ? "enhancing" : ""}`}
                    onClick={handleAiEnhance}
                    title="Structure this grievance with Consumer Protection Act citations and formal legal wording"
                  >
                    <FaMagic /> {isAiEnhancing ? "Structuring Claim..." : "✨ AI Legal Assistant (Enhance Statement)"}
                  </button>
                </div>

                {/* Quick Relief Chips */}
                <div className="relief-chips-wrap">
                  <span className="relief-chips-label">Select Desired Reliefs (AI will include in claim):</span>
                  <div className="relief-chips-list">
                    {COMMON_RELIEFS.map((relief) => {
                      const isSelected = selectedReliefs.includes(relief);
                      return (
                        <button
                          key={relief}
                          type="button"
                          className={`relief-chip ${isSelected ? "selected" : ""}`}
                          onClick={() => toggleRelief(relief)}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {relief}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <textarea
                  name="description"
                  rows="6"
                  placeholder="Provide details of your transaction/dispute. Click '✨ AI Legal Assistant' above to automatically format into a statutory claim with legal clauses..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Evidence Upload Section */}
              <div className="input-group full-width file-upload-section">
                <label className="file-upload-label">
                  <FaPaperclip /> Supporting Evidence & Proof Documents (Optional, up to 5 files, 10MB each)
                </label>
                <div
                  className="file-dropzone"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  <FaPaperclip className="dropzone-icon" />
                  <div className="dropzone-text">
                    <strong>Click here or browse to attach proof documents</strong>
                    <span>Supports JPG, PNG, WEBP, GIF images and PDF invoices or receipts</span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,image/jpeg,image/png,image/webp,image/gif,application/pdf"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </div>

                {fileError && (
                  <div className="file-error-text">
                    <FaExclamationCircle /> {fileError}
                  </div>
                )}

                {files.length > 0 && (
                  <div className="file-preview-list">
                    {files.map((file, idx) => (
                      <div key={idx} className="file-preview-item">
                        <div className="file-preview-info">
                          {file.type === "application/pdf" ? (
                            <FaFilePdf className="file-type-icon pdf" />
                          ) : (
                            <FaFileImage className="file-type-icon img" />
                          )}
                          <div className="file-name-size">
                            <span className="file-name" title={file.name}>
                              {file.name}
                            </span>
                            <span className="file-size">{formatFileSize(file.size)}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="file-remove-btn"
                          onClick={() => removeFile(idx)}
                          title="Remove file"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* WhatsApp Notification Toggle */}
              <div className="whatsapp-toggle-card">
                <div className="whatsapp-toggle-left">
                  <div className="whatsapp-icon-wrap">
                    <FaWhatsapp />
                  </div>
                  <div>
                    <strong>Receive Instant Updates on WhatsApp</strong>
                    <p>Get official case cards, milestone updates, and 1-tap live tracking links on your WhatsApp (100% Free & Unlimited).</p>
                  </div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={whatsappAlertsEnabled}
                    onChange={(e) => setWhatsappAlertsEnabled(e.target.checked)}
                  />
                  <span className="slider round whatsapp-slider"></span>
                </label>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Submitting Grievance & Generating WhatsApp Card..." : "Submit Official Complaint"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default RegisterComplaint;
