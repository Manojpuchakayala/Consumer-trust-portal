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
  FaArrowLeft,
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
  FaInfoCircle,
} from "react-icons/fa";
import api from "../services/api";
import { enhanceGrievanceDescription, COMMON_RELIEFS, AI_ASSISTANT_DISCLAIMER } from "../utils/aiLegalAssistant";
import { generateGrievanceNoticePdf } from "../utils/pdfGenerator";
import "./RegisterComplaint.css";

const ENTERPRISE_OPTIONS = [
  // E-Commerce & Retail
  { id: "amazon", name: "Amazon India", category: "Product", nodal: "grievance-officer@amazon.in", sla: "48h Ack / 7 Days Target" },
  { id: "flipkart", name: "Flipkart", category: "Product", nodal: "grievance.officer@flipkart.com", sla: "48h Ack / 7 Days Target" },
  { id: "myntra", name: "Myntra", category: "Product", nodal: "grievanceofficer@myntra.com", sla: "48h Ack / 7 Days Target" },
  { id: "meesho", name: "Meesho", category: "Product", nodal: "grievance-officer@meesho.com", sla: "48h Ack / 7 Days Target" },
  { id: "ajio", name: "Ajio (Reliance Retail)", category: "Product", nodal: "grievance.officer@ajio.com", sla: "48h Ack / 7 Days Target" },
  { id: "nykaa", name: "Nykaa", category: "Product", nodal: "grievanceofficer@nykaa.com", sla: "48h Ack / 7 Days Target" },
  { id: "tatacliq", name: "Tata CLiQ", category: "Product", nodal: "grievanceofficer@tatacliq.com", sla: "48h Ack / 7 Days Target" },

  // Food & Quick Commerce
  { id: "zomato", name: "Zomato", category: "Food", nodal: "grievance@zomato.com", sla: "24h Ack / 3 Days Target" },
  { id: "swiggy", name: "Swiggy", category: "Food", nodal: "grievances@swiggy.in", sla: "24h Ack / 3 Days Target" },
  { id: "blinkit", name: "Blinkit", category: "Food", nodal: "grievance@blinkit.com", sla: "24h Ack / 3 Days Target" },
  { id: "zepto", name: "Zepto", category: "Food", nodal: "grievance@zeptonow.com", sla: "24h Ack / 3 Days Target" },
  { id: "bigbasket", name: "BigBasket", category: "Food", nodal: "grievance@bigbasket.com", sla: "24h Ack / 3 Days Target" },
  { id: "dominos", name: "Domino's Pizza India", category: "Food", nodal: "guestcare@jublfood.com", sla: "24h Ack / 3 Days Target" },

  // Banking, UPI & Fintech
  { id: "sbi", name: "State Bank of India (SBI)", category: "Banking", nodal: "nodalofficer@sbi.co.in", sla: "48h Ack / 7 Days Target" },
  { id: "hdfc", name: "HDFC Bank", category: "Banking", nodal: "grievance.redressal@hdfcbank.com", sla: "48h Ack / 7 Days Target" },
  { id: "icici", name: "ICICI Bank", category: "Banking", nodal: "headservicequality@icicibank.com", sla: "48h Ack / 7 Days Target" },
  { id: "axis", name: "Axis Bank", category: "Banking", nodal: "nodal.officer@axisbank.com", sla: "48h Ack / 7 Days Target" },
  { id: "kotak", name: "Kotak Mahindra Bank", category: "Banking", nodal: "nodalofficer@kotak.com", sla: "48h Ack / 7 Days Target" },
  { id: "pnb", name: "Punjab National Bank (PNB)", category: "Banking", nodal: "care@pnb.co.in", sla: "48h Ack / 7 Days Target" },
  { id: "phonepe", name: "PhonePe (UPI & Payments)", category: "Banking", nodal: "grievance-officer@phonepe.com", sla: "24h Ack / 5 Days Target" },
  { id: "paytm", name: "Paytm Payments", category: "Banking", nodal: "grievanceofficer@paytm.com", sla: "24h Ack / 5 Days Target" },
  { id: "googlepay", name: "Google Pay India", category: "Banking", nodal: "gpay-grievance-india@google.com", sla: "24h Ack / 5 Days Target" },
  { id: "cred", name: "CRED", category: "Banking", nodal: "grievance@cred.club", sla: "24h Ack / 5 Days Target" },

  // Telecom & Utilities
  { id: "jio", name: "Reliance Jio Infocomm", category: "Telecom", nodal: "appellate.authority@jio.com", sla: "48h Ack / 7 Days Target" },
  { id: "airtel", name: "Bharti Airtel", category: "Telecom", nodal: "nodalofficer.india@airtel.com", sla: "48h Ack / 7 Days Target" },
  { id: "vi", name: "Vodafone Idea (Vi)", category: "Telecom", nodal: "nodalofficer@vodafoneidea.com", sla: "48h Ack / 7 Days Target" },
  { id: "bsnl", name: "BSNL India", category: "Telecom", nodal: "cmdbsnl@bsnl.co.in", sla: "48h Ack / 7 Days Target" },

  // Travel & Transport
  { id: "makemytrip", name: "MakeMyTrip", category: "Travel", nodal: "grievance.officer@makemytrip.com", sla: "24h Ack / 7 Days Target" },
  { id: "irctc", name: "IRCTC (Indian Railways)", category: "Travel", nodal: "customercare@irctc.co.in", sla: "24h Ack / 5 Days Target" },
  { id: "indigo", name: "IndiGo Airlines", category: "Travel", nodal: "nodalofficer@goindigo.in", sla: "24h Ack / 7 Days Target" },
  { id: "airindia", name: "Air India", category: "Travel", nodal: "nodalofficer@airindia.com", sla: "24h Ack / 7 Days Target" },
  { id: "uber", name: "Uber India", category: "Travel", nodal: "grievance-officer-india@uber.com", sla: "24h Ack / 5 Days Target" },
  { id: "ola", name: "Ola Cabs", category: "Travel", nodal: "grievanceofficer@olacabs.com", sla: "24h Ack / 5 Days Target" },
  { id: "rapido", name: "Rapido Bike Taxi", category: "Travel", nodal: "grievance@rapido.bike", sla: "24h Ack / 5 Days Target" },

  // Electronics & Appliances
  { id: "samsung", name: "Samsung Electronics India", category: "Product", nodal: "grievance.india@samsung.com", sla: "48h Ack / 7 Days Target" },
  { id: "apple", name: "Apple India", category: "Product", nodal: "india_grievance_officer@apple.com", sla: "48h Ack / 7 Days Target" },
  { id: "xiaomi", name: "Xiaomi / Redmi India", category: "Product", nodal: "grievance-officer@xiaomi.com", sla: "48h Ack / 7 Days Target" },
  { id: "oneplus", name: "OnePlus India", category: "Product", nodal: "grievance.officer@oneplus.com", sla: "48h Ack / 7 Days Target" },
  { id: "sony", name: "Sony India", category: "Product", nodal: "sonyindia.care@sony.com", sla: "48h Ack / 7 Days Target" },
  { id: "lg", name: "LG Electronics India", category: "Product", nodal: "serviceindia@lge.com", sla: "48h Ack / 7 Days Target" },

  // Other / Custom
  { id: "other", name: "Other / Custom Enterprise", category: "Other", nodal: "Custom Enterprise Desk", sla: "Standard 7 Days Target" },
];

function RegisterComplaint() {
  const [searchParams] = useSearchParams();
  const initialCompany = searchParams.get("company") || "Amazon India";

  // Multi-step Wizard State (1 to 4)
  const [currentStep, setCurrentStep] = useState(1);

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
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);

  // Unselected Consent Checkboxes (Must be false by default)
  const [consentAccuracy, setConsentAccuracy] = useState(false);
  const [consentTermsPrivacy, setConsentTermsPrivacy] = useState(false);
  const [whatsappAlertsEnabled, setWhatsappAlertsEnabled] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stepError, setStepError] = useState("");
  const [submittedData, setSubmittedData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // AI Drafting Assistant States
  const [selectedReliefs, setSelectedReliefs] = useState([]);
  const [isAiEnhancing, setIsAiEnhancing] = useState(false);

  useEffect(() => {
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

  // Step Validation Logic
  const validateStep = (step) => {
    setStepError("");
    if (step === 1) {
      if (!formData.name.trim()) {
        setStepError("Please enter your full name.");
        return false;
      }
      if (!formData.email.trim() || !formData.email.includes("@")) {
        setStepError("Please enter a valid email address.");
        return false;
      }
      const digitsOnly = formData.phone.replace(/[^0-9]/g, "");
      if (digitsOnly.length < 10) {
        setStepError("Please enter a valid 10-digit mobile phone number.");
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!formData.companyName) {
        setStepError("Please select the disputed enterprise.");
        return false;
      }
      if (formData.companyName === "Other / Custom Enterprise" && !formData.customCompanyName.trim()) {
        setStepError("Please enter the name of the custom company/merchant.");
        return false;
      }
      if (!formData.subject.trim()) {
        setStepError("Please provide a brief subject/title for your grievance.");
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (!formData.description.trim() || formData.description.trim().length < 20) {
        setStepError("Please provide a detailed description of your dispute (minimum 20 characters).");
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    setStepError("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consentAccuracy) {
      setError("You must certify that the grievance details provided are genuine and accurate.");
      return;
    }
    if (!consentTermsPrivacy) {
      setError("You must read and agree to the Terms of Service and Privacy Policy before submitting.");
      return;
    }

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
        throw new Error(response.data?.message || "Failed to submit grievance");
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
        description: formData.description,
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
          "Failed to register grievance. Please check your connection."
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
    setCurrentStep(1);
    setFiles([]);
    setFileError("");
    setConsentAccuracy(false);
    setConsentTermsPrivacy(false);
    setWhatsappAlertsEnabled(false);
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

            <h2>Grievance Registered Successfully!</h2>
            <p className="success-desc">
              Your dispute regarding <strong>{submittedData.companyName}</strong> has been logged.
              A summary confirmation has been sent to <strong>{submittedData.email}</strong>.
            </p>

            <div className="tracking-id-box">
              <span className="tracking-label">Official Grievance Tracking ID</span>
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

            {/* Direct Link Box */}
            <div className="direct-dispatch-box" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: 16, borderRadius: 10, margin: "16px 0", textAlign: "left" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>
                Direct Case Tracking Link:
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "white", padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1" }}>
                <a
                  href={`/track?id=${submittedData.complaintId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#1d4ed8", fontSize: 13, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}
                >
                  {window.location.origin}/track?id={submittedData.complaintId} <FaExternalLinkAlt style={{ fontSize: 10 }} />
                </a>
                <button
                  type="button"
                  onClick={handleCopyDirectLink}
                  style={{ background: "#2563eb", color: "white", border: "none", padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                >
                  <FaCopy /> {copiedLink ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

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
                <strong>Filing Timestamp:</strong> {submittedData.date}
              </div>
              <div>
                <strong>Attached Evidence:</strong>{" "}
                {submittedData.attachmentsCount > 0 ? (
                  <span className="evidence-badge">
                    <FaPaperclip /> {submittedData.attachmentsCount} file(s) attached
                  </span>
                ) : (
                  "No files attached"
                )}
              </div>
              <div className="statutory-notice-badge-row">
                <span className="statutory-notice-badge">
                  <FaShieldAlt /> Grievance Notice & 1-Click Resolution Token Prepared for {submittedData.companyName} Nodal Desk
                </span>
              </div>
            </div>

            <div className="success-actions no-print">
              <button
                type="button"
                className="pdf-notice-btn"
                onClick={() => generateGrievanceNoticePdf(submittedData)}
                title="Download formatted Claim Summary & Grievance Notice PDF"
              >
                <FaFilePdf /> Download Grievance Summary (PDF)
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
                File Another Grievance
              </button>
            </div>

            {/* Printable Receipt */}
            <div className="print-slip-wrapper print-only">
              <div className="slip-header">
                <h3>Consumer Trust Platform</h3>
                <p>Consumer Grievance Registration Summary</p>
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
                  <span>Complainant:</span>
                  <span>{submittedData.name}</span>
                </div>
                <div className="slip-row">
                  <span>Category:</span>
                  <span>{submittedData.category}</span>
                </div>
                <div className="slip-row">
                  <span>Subject:</span>
                  <span>{submittedData.subject}</span>
                </div>
              </div>
              <div className="slip-footer">
                <p>Verify live progress at: {window.location.origin}/track?id={submittedData.complaintId}</p>
                <p>Consumer Trust is an independent private dispute facilitation platform.</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <h1>Register Consumer Grievance</h1>
            <p className="register-subtitle">
              Follow our structured 4-step wizard to file your dispute, format your claim narrative, and attach evidence.
            </p>

            {/* Step Progress Indicators */}
            <div className="wizard-progress-bar">
              <div className={`wizard-step-item ${currentStep === 1 ? "active" : currentStep > 1 ? "completed" : ""}`}>
                <div className="step-circle">{currentStep > 1 ? "✓" : "1"}</div>
                <span>Citizen Info</span>
              </div>
              <div className="wizard-step-connector" />
              <div className={`wizard-step-item ${currentStep === 2 ? "active" : currentStep > 2 ? "completed" : ""}`}>
                <div className="step-circle">{currentStep > 2 ? "✓" : "2"}</div>
                <span>Dispute Details</span>
              </div>
              <div className="wizard-step-connector" />
              <div className={`wizard-step-item ${currentStep === 3 ? "active" : currentStep > 3 ? "completed" : ""}`}>
                <div className="step-circle">{currentStep > 3 ? "✓" : "3"}</div>
                <span>Claim & Proof</span>
              </div>
              <div className="wizard-step-connector" />
              <div className={`wizard-step-item ${currentStep === 4 ? "active" : ""}`}>
                <div className="step-circle">4</div>
                <span>Review & Submit</span>
              </div>
            </div>

            {stepError && (
              <div className="error-banner">
                <FaExclamationCircle /> <span>{stepError}</span>
              </div>
            )}

            {error && (
              <div className="error-banner">
                <FaExclamationCircle /> <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="register-form">
              {/* STEP 1: CITIZEN DETAILS */}
              {currentStep === 1 && (
                <div className="wizard-step-content">
                  <h3 className="wizard-step-heading">Step 1: Complainant / Citizen Information</h3>
                  <div className="form-row">
                    <div className="input-group">
                      <label>Full Legal Name *</label>
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
                      <label>Email Address (For Case Updates) *</label>
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

                  <div className="form-row" style={{ marginTop: 14 }}>
                    <div className="input-group">
                      <label>Mobile Phone Number (10 Digits) *</label>
                      <div className="input-wrapper">
                        <FaPhone className="input-icon" />
                        <input
                          type="tel"
                          name="phone"
                          placeholder="e.g. 9876543210"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: DISPUTE & ENTERPRISE DETAILS */}
              {currentStep === 2 && (
                <div className="wizard-step-content">
                  <h3 className="wizard-step-heading">Step 2: Disputed Enterprise & Transaction Details</h3>
                  <div className="form-row">
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
                          <option value="Food">Food / Quick Commerce / Restaurants</option>
                          <option value="Banking">Banking / UPI / FinTech</option>
                          <option value="Telecom">Telecom / Internet Providers</option>
                          <option value="Travel">Travel / Airlines / Railways</option>
                          <option value="Other">Other Grievance</option>
                        </select>
                      </div>
                    </div>

                    <div className="input-group">
                      <label>Disputed Enterprise / Bank / Platform *</label>
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
                          <optgroup label="📱 Telecom & Internet Providers">
                            <option value="Reliance Jio Infocomm">Reliance Jio Infocomm</option>
                            <option value="Bharti Airtel">Bharti Airtel</option>
                            <option value="Vodafone Idea (Vi)">Vodafone Idea (Vi)</option>
                          </optgroup>
                          <optgroup label="✈️ Travel, Railways & Cabs">
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
                          <optgroup label="🏢 Other Organization">
                            <option value="Other / Custom Enterprise">Other / Custom Enterprise</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>
                  </div>

                  {formData.companyName === "Other / Custom Enterprise" && (
                    <div className="input-group full-width" style={{ marginTop: 14 }}>
                      <label>Custom Enterprise / Company Name *</label>
                      <div className="input-wrapper">
                        <FaBuilding className="input-icon" />
                        <input
                          type="text"
                          name="customCompanyName"
                          placeholder="Enter the official commercial name of the merchant/platform"
                          value={formData.customCompanyName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="form-row" style={{ marginTop: 14 }}>
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

                    <div className="input-group">
                      <label>Grievance Subject / Title *</label>
                      <div className="input-wrapper">
                        <FaFileAlt className="input-icon" />
                        <input
                          type="text"
                          name="subject"
                          placeholder="Brief summary (e.g. Defective laptop delivered without refund)"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {selectedEnterprise && (
                    <div className="nodal-sla-banner" style={{ marginTop: 18 }}>
                      <div className="nodal-sla-icon">
                        <FaShieldAlt />
                      </div>
                      <div className="nodal-sla-info">
                        <div className="nodal-sla-title">
                          <strong>Enterprise Grievance Desk: </strong>
                          <span>{selectedEnterprise.nodal}</span>
                        </div>
                        <div className="nodal-sla-meta">
                          <span>⚡ Target SLA: <strong>{selectedEnterprise.sla}</strong></span>
                          <span className="sla-dot">•</span>
                          <span>Dispute summary and tokenized 1-click link prepared upon submission</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: GRIEVANCE STATEMENT & EVIDENCE */}
              {currentStep === 3 && (
                <div className="wizard-step-content">
                  <h3 className="wizard-step-heading">Step 3: Grievance Statement & Supporting Evidence</h3>

                  {/* AI Drafting Assistant Disclaimer & Button */}
                  <div className="ai-assistant-card">
                    <div className="desc-header-row">
                      <label style={{ fontWeight: 700, color: "#1e293b", fontSize: 14 }}>
                        Grievance Narrative & Statement *
                      </label>
                      <button
                        type="button"
                        className={`ai-enhance-btn ${isAiEnhancing ? "enhancing" : ""}`}
                        onClick={handleAiEnhance}
                        title="Format statement into structured chronology and relief requests"
                      >
                        <FaMagic /> {isAiEnhancing ? "Structuring Narrative..." : "✨ AI Drafting Assistant"}
                      </button>
                    </div>

                    <div className="ai-disclaimer-strip">
                      <FaInfoCircle />
                      <span>{AI_ASSISTANT_DISCLAIMER}</span>
                    </div>

                    {/* Desired Reliefs */}
                    <div className="relief-chips-wrap" style={{ marginTop: 12 }}>
                      <span className="relief-chips-label">Select Desired Reliefs (Assistant will include in narrative):</span>
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
                      placeholder="Describe the transaction details, what went wrong, and how previous customer service attempts failed. Click '✨ AI Drafting Assistant' above to structure your claim clearly..."
                      value={formData.description}
                      onChange={handleChange}
                      required
                      style={{ marginTop: 10 }}
                    />
                  </div>

                  {/* Evidence Upload Section */}
                  <div className="input-group full-width file-upload-section" style={{ marginTop: 20 }}>
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
                </div>
              )}

              {/* STEP 4: PRE-SUBMISSION REVIEW & CONSENT */}
              {currentStep === 4 && (
                <div className="wizard-step-content">
                  <h3 className="wizard-step-heading">Step 4: Pre-Submission Review & Explicit Consent</h3>

                  <div className="review-card">
                    <h4 style={{ margin: "0 0 12px", color: "#0f2b5c", fontSize: 16 }}>📋 Grievance Summary</h4>
                    <div className="review-grid">
                      <div><strong>Complainant:</strong> {formData.name}</div>
                      <div><strong>Contact:</strong> {formData.email} | {formData.phone}</div>
                      <div>
                        <strong>Target Enterprise:</strong>{" "}
                        {formData.companyName === "Other / Custom Enterprise"
                          ? formData.customCompanyName || "Custom Enterprise"
                          : formData.companyName}
                      </div>
                      <div><strong>Category:</strong> {formData.category}</div>
                      {formData.orderOrTransactionId && (
                        <div><strong>Order / Ref ID:</strong> {formData.orderOrTransactionId}</div>
                      )}
                      <div><strong>Subject:</strong> {formData.subject}</div>
                      <div><strong>Attached Files:</strong> {files.length} document(s)</div>
                    </div>

                    <div style={{ marginTop: 14, borderTop: "1px solid #e2e8f0", paddingTop: 10 }}>
                      <strong style={{ fontSize: 13, color: "#475569" }}>Grievance Statement Preview:</strong>
                      <div className="review-description-box">
                        {formData.description}
                      </div>
                    </div>
                  </div>

                  {/* Explicit Unselected Consent Checkboxes */}
                  <div className="consents-container" style={{ marginTop: 20 }}>
                    <div className="consent-checkbox-row">
                      <input
                        type="checkbox"
                        id="consent-accuracy"
                        checked={consentAccuracy}
                        onChange={(e) => setConsentAccuracy(e.target.checked)}
                        required
                      />
                      <label htmlFor="consent-accuracy">
                        <strong>Accuracy Certification: *</strong> I certify that all statements and documents submitted in this grievance are genuine, accurate, and relate to a bona fide consumer transaction.
                      </label>
                    </div>

                    <div className="consent-checkbox-row">
                      <input
                        type="checkbox"
                        id="consent-terms"
                        checked={consentTermsPrivacy}
                        onChange={(e) => setConsentTermsPrivacy(e.target.checked)}
                        required
                      />
                      <label htmlFor="consent-terms">
                        <strong>Terms & Independent Platform Agreement: *</strong> I have read and agree to the <Link to="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</Link> and <Link to="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>, and acknowledge that Consumer Trust is an independent dispute facilitation desk and not a government agency, court, or statutory commission.
                      </label>
                    </div>

                    <div className="consent-checkbox-row optional">
                      <input
                        type="checkbox"
                        id="consent-wa"
                        checked={whatsappAlertsEnabled}
                        onChange={(e) => setWhatsappAlertsEnabled(e.target.checked)}
                      />
                      <label htmlFor="consent-wa">
                        <FaWhatsapp style={{ color: "#22c55e", marginRight: 4 }} />
                        <strong>Optional Alerts:</strong> Send me transactional milestone alerts and live case tracking updates via WhatsApp / SMS.
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Navigation Controls */}
              <div className="wizard-nav-controls">
                {currentStep > 1 && (
                  <button
                    type="button"
                    className="wizard-back-btn"
                    onClick={handlePrevStep}
                    disabled={loading}
                  >
                    <FaArrowLeft /> Back
                  </button>
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    className="wizard-next-btn"
                    onClick={handleNextStep}
                  >
                    Continue to Next Step <FaArrowRight />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading || !consentAccuracy || !consentTermsPrivacy}
                  >
                    {loading ? "Submitting Grievance..." : "Submit Grievance Docket"}
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default RegisterComplaint;
