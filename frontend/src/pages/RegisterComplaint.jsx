import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaTag,
  FaFileAlt,
  FaCheckCircle,
  FaCopy,
  FaArrowRight,
  FaArrowLeft,
  FaExclamationCircle,
  FaTimesCircle,
  FaPrint,
  FaPaperclip,
  FaTrash,
  FaFilePdf,
  FaFileImage,
  FaFileAudio,
  FaWhatsapp,
  FaExternalLinkAlt,
  FaBuilding,
  FaReceipt,
  FaShieldAlt,
  FaMagic,
  FaInfoCircle,
  FaEdit,
  FaCheck,
  FaClock,
  FaShoppingBag,
  FaUtensils,
  FaUniversity,
  FaMobileAlt,
  FaPlane,
  FaLaptop,
} from "react-icons/fa";
import api from "../services/api";
import {
  enhanceGrievanceDescription,
  calculateClaimScore,
  getApplicableCpaSections,
  COMMON_RELIEFS,
  AI_ASSISTANT_DISCLAIMER,
} from "../utils/aiLegalAssistant";
import { generateGrievanceNoticePdf } from "../utils/pdfGenerator";
import { getWhatsAppShareUrl } from "../utils/whatsappShare";
import VoiceInputButton from "../components/VoiceInputButton";
import InvoiceOcrModal from "../components/InvoiceOcrModal";
import EvidenceRedactorModal from "../components/EvidenceRedactorModal";
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

const CATEGORIES = [
  { id: "Product", label: "Product & Hardware", icon: FaLaptop },
  { id: "Service", label: "E-Commerce & Retail", icon: FaShoppingBag },
  { id: "Food", label: "Food & Quick Delivery", icon: FaUtensils },
  { id: "Banking", label: "Banking & Payments", icon: FaUniversity },
  { id: "Telecom", label: "Telecom & Internet", icon: FaMobileAlt },
  { id: "Travel", label: "Travel & Transport", icon: FaPlane },
  { id: "Other", label: "Other Organization", icon: FaBuilding },
];

const DRAFT_KEY = "ctp_grievance_draft_v2";

export default function RegisterComplaint() {
  const [searchParams] = useSearchParams();
  const initialCompany = searchParams.get("company") || "Amazon India";

  // Multi-step Wizard State (1 to 5)
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
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
  const [isDragging, setIsDragging] = useState(false);

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
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  // AI Drafting Assistant States
  const [selectedReliefs, setSelectedReliefs] = useState([]);
  const [isAiEnhancing, setIsAiEnhancing] = useState(false);

  // Smart OCR & Privacy Redactor Modals
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [redactingFile, setRedactingFile] = useState(null);

  const handleApplyOcr = (extracted) => {
    setFormData((prev) => ({
      ...prev,
      companyName: extracted.merchantName || prev.companyName,
      orderOrTransactionId: extracted.orderId || prev.orderOrTransactionId,
      category: extracted.category || prev.category,
    }));
  };

  const handleSaveRedacted = (sanitizedFile) => {
    setFiles((prev) => [...prev, sanitizedFile]);
    setRedactingFile(null);
  };

  // Step names
  const steps = [
    { num: 1, title: "Complainant", desc: "Contact details" },
    { num: 2, title: "Enterprise", desc: "Company & order ref" },
    { num: 3, title: "Narrative", desc: "Facts & requested relief" },
    { num: 4, title: "Evidence", desc: "Supporting documents" },
    { num: 5, title: "Review", desc: "Verification & submit" },
  ];

  // Check URL query param for company
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

  // Load user details from auth if available & draft if exists
  useEffect(() => {
    const storedUser = localStorage.getItem("consumerTrustUser");
    let initialUser = {};
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        initialUser = {
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "",
        };
      } catch (e) {}
    }

    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData((prev) => ({
          ...prev,
          ...parsed,
          name: parsed.name || initialUser.name || prev.name,
          email: parsed.email || initialUser.email || prev.email,
          phone: parsed.phone || initialUser.phone || prev.phone,
        }));
        if (parsed.selectedReliefs) {
          setSelectedReliefs(parsed.selectedReliefs);
        }
        setHasRestoredDraft(true);
      } catch (e) {
        setFormData((prev) => ({ ...prev, ...initialUser }));
      }
    } else if (storedUser) {
      setFormData((prev) => ({ ...prev, ...initialUser }));
    }
  }, []);

  // Auto-save draft on form change (excluding files)
  useEffect(() => {
    if (!submittedData) {
      const timer = setTimeout(() => {
        const draftToSave = {
          ...formData,
          selectedReliefs,
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftToSave));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData, selectedReliefs, submittedData]);

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setHasRestoredDraft(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      city: "",
      category: "Product",
      companyName: "Amazon India",
      customCompanyName: "",
      orderOrTransactionId: "",
      subject: "",
      description: "",
    });
    setSelectedReliefs([]);
  };

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
    setTimeout(() => setIsAiEnhancing(false), 300);
  };

  const handleVoiceTranscript = (text) => {
    setFormData((prev) => ({
      ...prev,
      description: prev.description ? `${prev.description} ${text}` : text,
    }));
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

  const processFiles = (selectedFiles) => {
    setFileError("");
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
        setFileError(`"${file.name}" is not supported. Please upload JPG, PNG, WEBP, or PDF.`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setFileError(`"${file.name}" exceeds the 10MB limit.`);
        return;
      }
      validFiles.push(file);
    }

    setFiles((prev) => [...prev, ...validFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    processFiles(droppedFiles);
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
        setStepError("Please enter your full legal name.");
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
        setStepError("Please enter the name of the custom company or merchant.");
        return false;
      }
      if (!formData.subject.trim()) {
        setStepError("Please provide a brief subject for your grievance.");
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
      setCurrentStep((prev) => Math.min(prev + 1, 5));
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

      // Clear draft on successful submission
      localStorage.removeItem(DRAFT_KEY);

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
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCopyDirectLink = () => {
    if (submittedData?.complaintId) {
      navigator.clipboard.writeText(`${window.location.origin}/track?id=${submittedData.complaintId}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
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
      city: "",
      category: "Product",
      companyName: "Amazon India",
      customCompanyName: "",
      orderOrTransactionId: "",
      subject: "",
      description: "",
    });
    setSelectedReliefs([]);
  };

  const selectedEnterprise =
    ENTERPRISE_OPTIONS.find((opt) => opt.name === formData.companyName) ||
    ENTERPRISE_OPTIONS.find((opt) => opt.id === "other");

  return (
    <div className="register-page">
      <div className="register-container">
        {submittedData ? (
          /* ==========================================================================
             SUBMISSION SUCCESS RECEIPT
             ========================================================================== */
          <div className="success-card">
            <div className="success-header-wrap">
              <div className="success-icon-badge">
                <FaCheckCircle className="success-check-icon" />
              </div>
              <h2 className="success-title">Grievance Docket Created</h2>
              <p className="success-lead">
                Your dispute regarding <strong>{submittedData.companyName}</strong> has been docketed and prepared for corporate grievance notice dispatch.
              </p>
            </div>

            {/* Tracking ID Hero Box */}
            <div className="tracking-hero-card">
              <div className="tracking-hero-label">
                <FaShieldAlt style={{ color: "var(--brand-teal)" }} /> DOCKET TRACKING ID
              </div>
              <div className="tracking-hero-row">
                <span className="tracking-hero-code">{submittedData.complaintId}</span>
                <button
                  type="button"
                  className="hero-copy-btn"
                  onClick={handleCopyId}
                  title="Copy Tracking ID"
                >
                  <FaCopy /> {copied ? "Copied" : "Copy ID"}
                </button>
              </div>
              <p className="tracking-hero-note">
                Save this Docket ID. You can verify real-time redressal progress and nodal responses anytime.
              </p>
            </div>

            {/* Direct Link Strip */}
            <div className="direct-link-card">
              <div className="direct-link-header">
                <span>Direct Case Tracking URL</span>
                <button
                  type="button"
                  className="direct-link-copy-btn"
                  onClick={handleCopyDirectLink}
                >
                  <FaCopy /> {copiedLink ? "Copied" : "Copy Link"}
                </button>
              </div>
              <div className="direct-link-url">
                <a
                  href={`/track?id=${submittedData.complaintId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {window.location.origin}/track?id={submittedData.complaintId} <FaExternalLinkAlt style={{ fontSize: 10 }} />
                </a>
              </div>
            </div>

            {/* Case Summary Details */}
            <div className="success-details-grid">
              <div className="detail-field">
                <span className="detail-label">Disputed Enterprise</span>
                <span className="detail-value">{submittedData.companyName}</span>
              </div>
              {submittedData.orderOrTransactionId && (
                <div className="detail-field">
                  <span className="detail-label">Order / Reference ID</span>
                  <span className="detail-value">{submittedData.orderOrTransactionId}</span>
                </div>
              )}
              <div className="detail-field">
                <span className="detail-label">Complainant</span>
                <span className="detail-value">{submittedData.name}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Category</span>
                <span className="detail-value">{submittedData.category}</span>
              </div>
              <div className="detail-field full">
                <span className="detail-label">Grievance Subject</span>
                <span className="detail-value">{submittedData.subject}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Filing Timestamp</span>
                <span className="detail-value">{submittedData.date}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Supporting Evidence</span>
                <span className="detail-value">
                  {submittedData.attachmentsCount > 0 ? (
                    <span className="evidence-pill">
                      <FaPaperclip /> {submittedData.attachmentsCount} file(s) attached
                    </span>
                  ) : (
                    "No files attached"
                  )}
                </span>
              </div>
            </div>

            {/* Statutory SLA Strip */}
            <div className="statutory-sla-strip">
              <div className="sla-badge-icon">
                <FaClock />
              </div>
              <div className="sla-badge-text">
                <strong>Next Step: </strong> A structured dispute summary and tokenized resolution link have been queued for the {submittedData.companyName} grievance desk. Target acknowledgment within standard 24–48 hours.
              </div>
            </div>

            {/* Success Actions */}
            <div className="success-actions-row no-print">
              <a
                href={getWhatsAppShareUrl(submittedData)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-receipt"
                title="Share this docket record and tracking link via WhatsApp"
              >
                <FaWhatsapp className="btn-icon-wa" /> Share on WhatsApp
              </a>
              <button
                type="button"
                className="btn-pdf-download"
                onClick={() => generateGrievanceNoticePdf(submittedData)}
              >
                <FaFilePdf /> Download Case Summary (PDF)
              </button>
              <Link
                to={`/track?id=${submittedData.complaintId}`}
                className="btn-track-live"
              >
                Track Case Progress <FaArrowRight />
              </Link>
              <button
                type="button"
                className="btn-print-slip"
                onClick={handlePrintSlip}
              >
                <FaPrint /> Print Slip
              </button>
              <button
                type="button"
                className="btn-file-another"
                onClick={handleReset}
              >
                File Another Grievance
              </button>
            </div>

            {/* Printable Slip Wrapper */}
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
          /* ==========================================================================
             5-STEP GRIEVANCE WIZARD
             ========================================================================== */
          <>
            <div className="wizard-page-header">
              <div className="header-pill">
                <FaShieldAlt /> Independent Dispute Facilitation
              </div>
              <h1 className="wizard-main-title">Prepare a Consumer Grievance</h1>
              <p className="wizard-main-subtitle">
                Complete the step-by-step form to organize your claim details, share proof documents, and dispatch a formal facilitation notice to the enterprise grievance desk.
              </p>

              {hasRestoredDraft && (
                <div className="draft-restored-pill">
                  <span>Draft automatically restored</span>
                  <button type="button" onClick={clearDraft} title="Discard draft and start fresh">
                    Discard Draft
                  </button>
                </div>
              )}
            </div>

            {/* Stepper Navigation */}
            <div className="wizard-stepper">
              {steps.map((step) => {
                const isCompleted = currentStep > step.num;
                const isActive = currentStep === step.num;
                return (
                  <div
                    key={step.num}
                    className={`stepper-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                    onClick={() => {
                      if (isCompleted) setCurrentStep(step.num);
                    }}
                  >
                    <div className="stepper-bubble">
                      {isCompleted ? <FaCheck /> : step.num}
                    </div>
                    <div className="stepper-labels">
                      <span className="stepper-title">{step.title}</span>
                      <span className="stepper-desc">{step.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Error Banners */}
            {stepError && (
              <div className="wizard-alert-error">
                <FaExclamationCircle /> <span>{stepError}</span>
              </div>
            )}
            {error && (
              <div className="wizard-alert-error">
                <FaExclamationCircle /> <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="wizard-form-body">
              {/* -------------------------------------------------------------
                  STEP 1: COMPLAINANT CONTACT DETAILS
                  ------------------------------------------------------------- */}
              {currentStep === 1 && (
                <div className="step-pane">
                  <div className="step-pane-header">
                    <span className="step-badge">Step 1 of 5</span>
                    <h2>Complainant Information</h2>
                    <p>Enter your contact details so the enterprise nodal desk can verify your transaction and communicate updates.</p>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label htmlFor="name">Full Legal Name *</label>
                      <div className="input-box">
                        <FaUser className="input-icon" />
                        <input
                          id="name"
                          type="text"
                          name="name"
                          placeholder="e.g. Manoj Kumar"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email Address (For Case Updates) *</label>
                      <div className="input-box">
                        <FaEnvelope className="input-icon" />
                        <input
                          id="email"
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

                  <div className="form-grid-2" style={{ marginTop: 16 }}>
                    <div className="form-group">
                      <label htmlFor="phone">Mobile Phone Number (10 Digits) *</label>
                      <div className="input-box">
                        <FaPhone className="input-icon" />
                        <input
                          id="phone"
                          type="tel"
                          name="phone"
                          placeholder="e.g. 9876543210"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <span className="input-hint">Used for 2-factor OTP verification on case lookup.</span>
                    </div>

                    <div className="form-group">
                      <label htmlFor="city">City / State (Optional)</label>
                      <div className="input-box">
                        <FaMapMarkerAlt className="input-icon" />
                        <input
                          id="city"
                          type="text"
                          name="city"
                          placeholder="e.g. Bengaluru, Karnataka"
                          value={formData.city}
                          onChange={handleChange}
                        />
                      </div>
                      <span className="input-hint">Helps determine applicable regional consumer jurisdiction.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  STEP 2: DISPUTED ENTERPRISE & TRANSACTION DETAILS
                  ------------------------------------------------------------- */}
              {currentStep === 2 && (
                <div className="step-pane">
                  <div className="step-pane-header">
                    <span className="step-badge">Step 2 of 5</span>
                    <h2>Enterprise & Transaction Details</h2>
                    <p>Select the merchant or financial platform and provide relevant order or reference codes.</p>
                  </div>

                  {/* 1-Click OCR Auto-Fill Banner */}
                  <div className="ocr-autofill-banner">
                    <div className="ocr-banner-left">
                      <FaMagic className="ocr-banner-icon" />
                      <div>
                        <strong>Have a Bill, Invoice, or Order Confirmation?</strong>
                        <span>Auto-detect merchant, category, and order ID from your receipt.</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-trigger-ocr"
                      onClick={() => setShowOcrModal(true)}
                    >
                      <FaMagic /> Auto-Fill from Bill / Receipt
                    </button>
                  </div>

                  <div className="category-chips-row">
                    <label className="field-label">Dispute Category *</label>
                    <div className="category-chips-grid">
                      {CATEGORIES.map((cat) => {
                        const IconComponent = cat.icon;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            className={`cat-chip-btn ${formData.category === cat.id ? "active" : ""}`}
                            onClick={() => setFormData((prev) => ({ ...prev, category: cat.id }))}
                          >
                            <IconComponent className="cat-chip-svg" />
                            <span className="cat-chip-text">{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-grid-2" style={{ marginTop: 18 }}>
                    <div className="form-group">
                      <label htmlFor="companyName">Disputed Enterprise / Platform *</label>
                      <div className="input-box">
                        <FaBuilding className="input-icon" />
                        <select
                          id="companyName"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          required
                        >
                          <optgroup label="E-Commerce & Retail">
                            <option value="Amazon India">Amazon India</option>
                            <option value="Flipkart">Flipkart</option>
                            <option value="Myntra">Myntra</option>
                            <option value="Meesho">Meesho</option>
                            <option value="Ajio (Reliance Retail)">Ajio (Reliance Retail)</option>
                            <option value="Nykaa">Nykaa</option>
                            <option value="Tata CLiQ">Tata CLiQ</option>
                          </optgroup>
                          <optgroup label="Food & Quick Delivery">
                            <option value="Zomato">Zomato</option>
                            <option value="Swiggy">Swiggy</option>
                            <option value="Blinkit">Blinkit</option>
                            <option value="Zepto">Zepto</option>
                            <option value="BigBasket">BigBasket</option>
                            <option value="Domino's Pizza India">Domino's Pizza India</option>
                          </optgroup>
                          <optgroup label="Banking, FinTech & UPI">
                            <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                            <option value="HDFC Bank">HDFC Bank</option>
                            <option value="ICICI Bank">ICICI Bank</option>
                            <option value="Axis Bank">Axis Bank</option>
                            <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                            <option value="PhonePe (UPI & Payments)">PhonePe (UPI & Payments)</option>
                            <option value="Paytm Payments">Paytm Payments</option>
                            <option value="Google Pay India">Google Pay India</option>
                            <option value="CRED">CRED</option>
                          </optgroup>
                          <optgroup label="Telecom & Internet">
                            <option value="Reliance Jio Infocomm">Reliance Jio Infocomm</option>
                            <option value="Bharti Airtel">Bharti Airtel</option>
                            <option value="Vodafone Idea (Vi)">Vodafone Idea (Vi)</option>
                          </optgroup>
                          <optgroup label="Travel & Transport">
                            <option value="MakeMyTrip">MakeMyTrip</option>
                            <option value="IRCTC (Indian Railways)">IRCTC (Indian Railways)</option>
                            <option value="IndiGo Airlines">IndiGo Airlines</option>
                            <option value="Uber India">Uber India</option>
                            <option value="Ola Cabs">Ola Cabs</option>
                          </optgroup>
                          <optgroup label="Hardware & Electronics">
                            <option value="Samsung Electronics India">Samsung Electronics India</option>
                            <option value="Apple India">Apple India</option>
                            <option value="Xiaomi / Redmi India">Xiaomi / Redmi India</option>
                          </optgroup>
                          <optgroup label="Other Organization">
                            <option value="Other / Custom Enterprise">Other / Custom Enterprise</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>

                    {formData.companyName === "Other / Custom Enterprise" ? (
                      <div className="form-group">
                        <label htmlFor="customCompanyName">Custom Enterprise / Merchant Name *</label>
                        <div className="input-box">
                          <FaBuilding className="input-icon" />
                          <input
                            id="customCompanyName"
                            type="text"
                            name="customCompanyName"
                            placeholder="e.g. Regional Retailer / Merchant"
                            value={formData.customCompanyName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="form-group">
                        <label htmlFor="orderOrTransactionId">Order / Transaction Ref # (Optional)</label>
                        <div className="input-box">
                          <FaReceipt className="input-icon" />
                          <input
                            id="orderOrTransactionId"
                            type="text"
                            name="orderOrTransactionId"
                            placeholder="e.g. 408-1234567-8901234 or UTR 82910392"
                            value={formData.orderOrTransactionId}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="form-group" style={{ marginTop: 16 }}>
                    <label htmlFor="subject">Grievance Subject / Title *</label>
                    <div className="input-box">
                      <FaFileAlt className="input-icon" />
                      <input
                        id="subject"
                        type="text"
                        name="subject"
                        placeholder="e.g. Defective appliance delivered without refund or replacement"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {selectedEnterprise && (
                    <div className="enterprise-desk-card">
                      <div className="desk-card-icon">
                        <FaShieldAlt />
                      </div>
                      <div className="desk-card-content">
                        <div className="desk-card-title">
                          <strong>Registered Nodal Desk: </strong>
                          <span>{selectedEnterprise.nodal}</span>
                        </div>
                        <div className="desk-card-meta">
                          <span>Target SLA: <strong>{selectedEnterprise.sla}</strong></span>
                          <span>• Structured resolution link ready</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* -------------------------------------------------------------
                  STEP 3: GRIEVANCE STATEMENT & NARRATIVE FORMATTER
                  ------------------------------------------------------------- */}
              {currentStep === 3 && (
                <div className="step-pane">
                  <div className="step-pane-header">
                    <span className="step-badge">Step 3 of 5</span>
                    <h2>Dispute Narrative & Desired Remedies</h2>
                    <p>Describe what went wrong and use the drafting assistant to organize facts and specific relief requests.</p>
                  </div>

                  {/* Relief Selection Chips */}
                  <div className="reliefs-section">
                    <span className="reliefs-title">Select Desired Reliefs (Included in structured narrative):</span>
                    <div className="relief-chips-container">
                      {COMMON_RELIEFS.map((relief) => {
                        const isSelected = selectedReliefs.includes(relief);
                        return (
                          <button
                            key={relief}
                            type="button"
                            className={`relief-badge-btn ${isSelected ? "selected" : ""}`}
                            onClick={() => toggleRelief(relief)}
                          >
                            {isSelected ? "✓ " : "+ "}
                            {relief}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* AI Assistant Action Bar */}
                  <div className="ai-assistant-banner">
                    <div className="ai-assistant-left">
                      <FaMagic className="ai-wand-icon" />
                      <div>
                        <strong>Grievance Narrative Assistant</strong>
                        <span>Formats chronology, facts, and relief requests under CPA 2019 / RBI / TRAI norms.</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`btn-ai-enhance ${isAiEnhancing ? "loading" : ""}`}
                      onClick={handleAiEnhance}
                      disabled={isAiEnhancing}
                    >
                      <FaMagic /> {isAiEnhancing ? "Formatting..." : "Structure Narrative"}
                    </button>
                  </div>

                  <div className="ai-disclaimer-card">
                    <FaInfoCircle />
                    <span>{AI_ASSISTANT_DISCLAIMER}</span>
                  </div>

                  <div className="form-group" style={{ marginTop: 14 }}>
                    <div className="label-with-action-row">
                      <label htmlFor="description">Detailed Dispute Description *</label>
                      <VoiceInputButton onTranscript={handleVoiceTranscript} />
                    </div>
                    <textarea
                      id="description"
                      name="description"
                      rows="7"
                      placeholder="Detail the timeline of events: purchase date, product/service failure, previous customer support attempts, and unmet commitments. You can also click 'Voice Dictation' to speak in your language or 'Structure Narrative' to organize facts..."
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                    <div className="textarea-footer">
                      <span className="char-count">{formData.description.length} characters (min 20)</span>
                      <span className="tip-text">Clear dates and order references help expedite enterprise redressal.</span>
                    </div>
                  </div>

                  {/* Applicable CPA 2019 Clauses Preview */}
                  <div className="cpa-clauses-box">
                    <div className="cpa-clauses-header">
                      <FaShieldAlt className="cpa-shield-icon" />
                      <strong>Applicable Consumer Protection Act, 2019 Framework:</strong>
                    </div>
                    <div className="cpa-clauses-grid">
                      {getApplicableCpaSections(formData.category).map((cpa, idx) => (
                        <div key={idx} className="cpa-chip">
                          <span className="cpa-sec-badge">{cpa.section}</span>
                          <div>
                            <strong>{cpa.title}</strong>
                            <p>{cpa.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  STEP 4: EVIDENCE UPLOAD & ATTACHMENTS
                  ------------------------------------------------------------- */}
              {currentStep === 4 && (
                <div className="step-pane">
                  <div className="step-pane-header">
                    <span className="step-badge">Step 4 of 5</span>
                    <h2>Attach Supporting Evidence</h2>
                    <p>Upload invoices, receipts, defect photographs, or support chat logs (Optional, up to 5 files, 10MB each).</p>
                  </div>

                  {/* Before You Upload Safety Checklist */}
                  <div className="upload-safety-card">
                    <div className="upload-safety-header">
                      <FaShieldAlt className="safety-header-icon" />
                      <div>
                        <strong>Before You Upload: Document Safety & Privacy Checklist</strong>
                        <span>Ensure your documents contain clear transaction proof while keeping private credentials safe.</span>
                      </div>
                    </div>
                    <div className="upload-safety-columns">
                      <div className="safety-col allowed">
                        <div className="safety-col-title">
                          <FaCheckCircle className="safety-icon allowed" />
                          <span>Recommended & Helpful Proofs:</span>
                        </div>
                        <ul>
                          <li>Purchase invoices, tax receipts & cash memos</li>
                          <li>Order confirmations & tracking IDs</li>
                          <li>Photographs / defect proof of damaged items</li>
                          <li>Customer care email threads or chat logs</li>
                          <li>Warranty cards & repair job sheets</li>
                        </ul>
                      </div>
                      <div className="safety-col prohibited">
                        <div className="safety-col-title">
                          <FaTimesCircle className="safety-icon prohibited" />
                          <span>Strictly Prohibited & Unnecessary:</span>
                        </div>
                        <ul>
                          <li>Bank passwords, PINs, or UPI passcodes</li>
                          <li>Full credit/debit card numbers or CVVs</li>
                          <li>One-Time Passwords (OTPs) or secret tokens</li>
                          <li>Unmasked Government ID numbers (Aadhaar/PAN)</li>
                          <li>Irrelevant personal photos or private documents</li>
                        </ul>
                      </div>
                    </div>
                    <div className="upload-safety-footer">
                      <FaInfoCircle />
                      <span><strong>Privacy & Access Guarantee:</strong> Uploaded evidence is encrypted, shared strictly with the verified grievance desk of {formData.companyName === "Other / Custom Enterprise" ? (formData.customCompanyName || "the enterprise") : (formData.companyName || "the enterprise")} for verification, and automatically deleted after 180 days (or instantly via 1-click deletion in your tracking dashboard).</span>
                    </div>
                  </div>

                  {/* Drag & Drop Area */}
                  <div
                    className={`dropzone-card ${isDragging ? "dragging" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  >
                    <div className="dropzone-circle">
                      <FaPaperclip />
                    </div>
                    <div className="dropzone-copy">
                      <strong>Click to upload or drag and drop files here</strong>
                      <span>Supports JPG, PNG, WEBP, PDF, and Call Recordings (MP3, WAV, M4A) up to 10MB each</span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.mp3,.wav,.m4a,.ogg,image/jpeg,image/png,image/webp,image/gif,application/pdf,audio/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                  </div>

                  {fileError && (
                    <div className="wizard-alert-error" style={{ marginTop: 12 }}>
                      <FaExclamationCircle /> <span>{fileError}</span>
                    </div>
                  )}

                  {/* Attached Files List */}
                  {files.length > 0 && (
                    <div className="attached-files-list">
                      <h4 className="attached-heading">Attached Files ({files.length}/5)</h4>
                      <div className="files-grid">
                        {files.map((file, idx) => (
                          <div key={idx} className="file-chip">
                            <div className="file-icon-wrap">
                              {file.type === "application/pdf" ? (
                                <FaFilePdf className="file-icon pdf" />
                              ) : file.type.startsWith("audio/") ? (
                                <FaFileAudio className="file-icon audio" />
                              ) : (
                                <FaFileImage className="file-icon img" />
                              )}
                            </div>
                            <div className="file-info-wrap">
                              <span className="file-title" title={file.name}>
                                {file.name}
                              </span>
                              <span className="file-size">{formatFileSize(file.size)}</span>
                            </div>
                            <div className="file-actions-group">
                              {file.type.startsWith("image/") && (
                                <button
                                  type="button"
                                  className="file-redact-btn"
                                  onClick={() => setRedactingFile(file)}
                                  title="Brush / blackout sensitive numbers on this image (DPDP Act)"
                                >
                                  <FaShieldAlt /> Redact
                                </button>
                              )}
                              <button
                                type="button"
                                className="file-delete-btn"
                                onClick={() => removeFile(idx)}
                                title="Remove attached file"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Claim Strength Meter */}
                  {(() => {
                    const claimStrength = calculateClaimScore(formData, files);
                    return (
                      <div className="claim-strength-box">
                        <div className="strength-header">
                          <div>
                            <span className="strength-title">Evidence & Claim Strength Gauge</span>
                            <strong className="strength-level" style={{ color: claimStrength.badgeColor }}>
                              {claimStrength.level}
                            </strong>
                          </div>
                          <div className="strength-score-circle" style={{ borderColor: claimStrength.badgeColor }}>
                            <span style={{ color: claimStrength.badgeColor }}>{claimStrength.score}%</span>
                          </div>
                        </div>
                        <div className="strength-progress-track">
                          <div
                            className="strength-progress-fill"
                            style={{ width: `${claimStrength.score}%`, backgroundColor: claimStrength.badgeColor }}
                          />
                        </div>
                        <div className="strength-breakdown-list">
                          {claimStrength.breakdown.map((item, idx) => (
                            <div key={idx} className={`strength-item ${item.met ? "met" : "unmet"}`}>
                              <span className="item-icon">{item.met ? "✓" : "○"}</span>
                              <span>{item.label}</span>
                              <span className="item-points">{item.points}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* -------------------------------------------------------------
                  STEP 5: PRE-SUBMISSION REVIEW & EXPLICIT CONSENT
                  ------------------------------------------------------------- */}
              {currentStep === 5 && (
                <div className="step-pane">
                  <div className="step-pane-header">
                    <span className="step-badge">Step 5 of 5</span>
                    <h2>Review & Pre-Submission Certification</h2>
                    <p>Review your information carefully and confirm certifications before submitting the grievance docket.</p>
                  </div>

                  {/* Review Summary Card */}
                  <div className="review-summary-card">
                    <div className="review-card-header">
                      <h3>Grievance Summary</h3>
                      <button
                        type="button"
                        className="btn-edit-step"
                        onClick={() => setCurrentStep(1)}
                      >
                        <FaEdit /> Edit Details
                      </button>
                    </div>

                    <div className="review-grid">
                      <div className="review-item">
                        <span className="review-label">Complainant</span>
                        <span className="review-val">{formData.name}</span>
                      </div>
                      <div className="review-item">
                        <span className="review-label">Contact</span>
                        <span className="review-val">{formData.email} • {formData.phone}</span>
                      </div>
                      <div className="review-item">
                        <span className="review-label">Disputed Enterprise</span>
                        <span className="review-val">
                          {formData.companyName === "Other / Custom Enterprise"
                            ? formData.customCompanyName || "Custom Enterprise"
                            : formData.companyName}
                        </span>
                      </div>
                      <div className="review-item">
                        <span className="review-label">Category</span>
                        <span className="review-val">{formData.category}</span>
                      </div>
                      {formData.orderOrTransactionId && (
                        <div className="review-item">
                          <span className="review-label">Order / Ref ID</span>
                          <span className="review-val">{formData.orderOrTransactionId}</span>
                        </div>
                      )}
                      <div className="review-item">
                        <span className="review-label">Attached Files</span>
                        <span className="review-val">{files.length} document(s)</span>
                      </div>
                      <div className="review-item full">
                        <span className="review-label">Subject</span>
                        <span className="review-val">{formData.subject}</span>
                      </div>
                    </div>

                    <div className="review-desc-wrap">
                      <span className="review-label">Grievance Statement Preview:</span>
                      <div className="review-desc-box">
                        {formData.description}
                      </div>
                    </div>
                  </div>

                  {/* Explicit Unselected Consents (Required by default to be unchecked) */}
                  <div className="consents-card">
                    <div className="consent-row required">
                      <input
                        type="checkbox"
                        id="consent-accuracy"
                        checked={consentAccuracy}
                        onChange={(e) => setConsentAccuracy(e.target.checked)}
                        required
                      />
                      <label htmlFor="consent-accuracy">
                        <strong>Accuracy Certification: *</strong> I certify that the information and documents provided herein are authentic, genuine, and relate to a bona fide consumer transaction.
                      </label>
                    </div>

                    <div className="consent-row required">
                      <input
                        type="checkbox"
                        id="consent-terms"
                        checked={consentTermsPrivacy}
                        onChange={(e) => setConsentTermsPrivacy(e.target.checked)}
                        required
                      />
                      <label htmlFor="consent-terms">
                        <strong>Platform Terms & Independent Status Agreement: *</strong> I have read and agree to the <Link to="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</Link> and <Link to="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>, and understand that Consumer Trust is an independent private dispute facilitation service and not a court, statutory tribunal, or government body.
                      </label>
                    </div>

                    <div className="consent-row optional">
                      <input
                        type="checkbox"
                        id="consent-wa"
                        checked={whatsappAlertsEnabled}
                        onChange={(e) => setWhatsappAlertsEnabled(e.target.checked)}
                      />
                      <label htmlFor="consent-wa">
                        <FaWhatsapp style={{ color: "var(--status-success)", marginRight: 4 }} />
                        <strong>Optional Milestone Notifications:</strong> Send me transactional milestone alerts and redressal updates via WhatsApp / SMS.
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Navigation Footer */}
              <div className="wizard-nav-footer">
                {currentStep > 1 && (
                  <button
                    type="button"
                    className="btn-wizard-back"
                    onClick={handlePrevStep}
                    disabled={loading}
                  >
                    <FaArrowLeft /> Back
                  </button>
                )}

                {currentStep < 5 ? (
                  <button
                    type="button"
                    className="btn-wizard-next"
                    onClick={handleNextStep}
                  >
                    Continue <FaArrowRight />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn-wizard-submit"
                    disabled={loading || !consentAccuracy || !consentTermsPrivacy}
                  >
                    {loading ? "Submitting Grievance Docket..." : "Submit Grievance Docket"}
                  </button>
                )}
              </div>
            </form>
          </>
        )}

        {/* Smart Bill/Invoice OCR Auto-Filler Modal */}
        {showOcrModal && (
          <InvoiceOcrModal
            onApplyFields={handleApplyOcr}
            onClose={() => setShowOcrModal(false)}
          />
        )}

        {/* Client-Side Evidence Privacy Redactor Modal */}
        {redactingFile && (
          <EvidenceRedactorModal
            imageFile={redactingFile}
            onSaveRedactedFile={handleSaveRedacted}
            onClose={() => setRedactingFile(null)}
          />
        )}
      </div>
    </div>
  );
}
