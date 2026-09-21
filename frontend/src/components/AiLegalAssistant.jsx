import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaRobot,
  FaTimes,
  FaPaperPlane,
  FaGavel,
  FaFileSignature,
  FaMagic,
  FaUndo,
  FaChevronDown,
  FaCheckCircle,
  FaShieldAlt,
  FaMicrophone,
  FaMicrophoneSlash,
} from "react-icons/fa";
import "./AiLegalAssistant.css";

const QUICK_PROMPTS = [
  { label: "Delayed E-Commerce Refund", category: "E-Commerce", text: "I ordered an item online 3 weeks ago. The merchant cancelled the order but has not refunded my ₹4,500 despite multiple follow-ups." },
  { label: "Defective Mobile / Electronics", category: "Electronics & Appliances", text: "I bought a smartphone worth ₹24,000. Within 15 days the display stopped working. The authorized service centre refused warranty claiming liquid damage which is false." },
  { label: "Airlines / Flight Cancellation", category: "Airlines & Travel", text: "The airline cancelled my flight 6 hours prior to departure without offering alternate travel or immediate full refund of my ₹12,800 ticket." },
  { label: "Unfair Bank Charges", category: "Banking & Financial Services", text: "The bank deducted ₹1,200 hidden penalties and annual maintenance charges without prior disclosure or consent." },
  { label: "Builder / Real Estate Delay", category: "Real Estate & Housing", text: "The builder promised possession of the residential flat in December 2024. Possession is delayed by over 18 months with no interest paid." },
];

export default function AiLegalAssistant() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I am your AI Legal Assistant under the Consumer Protection Act, 2019 (CPA 2019).\n\nDescribe your dispute in plain English, and I will structure your legal claims, identify statutory violations, calculate compensation, and draft your grievance.",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [draftedCase, setDraftedCase] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Voice Dictation
  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSendMessage = (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg = { id: `user_${Date.now()}`, sender: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      // Analyze facts and synthesize statutory consumer complaint
      const lower = query.toLowerCase();
      let category = "E-Commerce & Digital Services";
      let company = "Respondent Enterprise";
      let sections = ["Section 2(11) - Deficiency in Service", "Section 2(47) - Unfair Trade Practice"];
      let claimEst = "₹5,000 - ₹25,000";

      if (lower.includes("mobile") || lower.includes("phone") || lower.includes("laptop") || lower.includes("tv") || lower.includes("warranty")) {
        category = "Electronics & Appliances";
        company = "Manufacturer / Authorized Service Desk";
        sections.push("Section 84 - Product Liability Action against Manufacturer");
        claimEst = "Product Replacement / Full Refund + ₹10,000 Compensation";
      } else if (lower.includes("flight") || lower.includes("airline") || lower.includes("ticket") || lower.includes("train")) {
        category = "Airlines & Travel";
        company = "Airline / Travel Aggregator";
        sections.push("Section 2(6) - Unfair Contract Terms");
        claimEst = "100% Ticket Refund + ₹15,000 Inconvenience Damages";
      } else if (lower.includes("bank") || lower.includes("emi") || lower.includes("loan") || lower.includes("charge")) {
        category = "Banking & Financial Services";
        company = "Scheduled Commercial Bank / NBFC";
        sections.push("RBI Master Circular on Customer Service");
        claimEst = "Reversal of Charges + Statutory Interest @ 18% p.a.";
      } else if (lower.includes("flat") || lower.includes("builder") || lower.includes("possession")) {
        category = "Real Estate & Housing";
        company = "Developer / Builder";
        sections.push("RERA Sec 18 & CPA 2019 Deficiency in Housing Construction");
        claimEst = "Delay Compensation @ MCLR + 2% per month";
      }

      const generatedDraft = {
        category,
        companyName: company,
        subject: `Deficiency in Service & Statutory Claim under CPA 2019: ${query.slice(0, 70)}...`,
        description: `1. FACTUAL MATRIX:\nThe complainant entered into a valid consumer transaction with the respondent. Despite receipt of consideration, the respondent failed to fulfill contractual and statutory obligations.\n\n2. PARTICULARS OF GRIEVANCE:\n${query}\n\n3. STATUTORY INFRINGEMENTS:\n- ${sections.join("\n- ")}\n\n4. PRAYER FOR RELIEF:\n- Direct replacement/reversal of amount in full.\n- Award compensation towards mental agony, harassment, and litigation expenses.`,
        sections,
        claimEst,
      };

      setDraftedCase(generatedDraft);

      const aiResponse = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: `⚖️ **Legal Analysis Complete**\n\n**Dispute Category:** ${category}\n**Statutory Violations:**\n${sections.map((s) => `• ${s}`).join("\n")}\n\n**Recommended Prayer for Relief:**\n${claimEst}\n\nI have generated a structured formal complaint for you. Click **"Autofill Grievance Form"** below to transfer these legal details directly into your official filing!`,
        hasDraft: true,
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleTransferToForm = () => {
    if (!draftedCase) return;
    localStorage.setItem("ctp_prefill_draft", JSON.stringify(draftedCase));
    setIsOpen(false);
    navigate("/register?prefill=true");
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        type="button"
        className={`ai-floating-trigger ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open AI Legal Drafting Assistant"
        title="AI Consumer Protection Assistant"
      >
        <span className="trigger-icon-wrap">
          <FaRobot className="robot-icon" />
          <FaMagic className="sparkle-icon" />
        </span>
        <span className="trigger-label">AI Legal Drafter</span>
      </button>

      {/* Interactive AI Drawer / Modal */}
      {isOpen && (
        <div className="ai-assistant-card">
          <div className="ai-card-header">
            <div className="header-left">
              <div className="ai-avatar-wrap">
                <FaRobot className="ai-avatar-icon" />
                <span className="ai-status-dot" />
              </div>
              <div>
                <h4 className="ai-title">AI Legal Drafting Assistant</h4>
                <span className="ai-subtitle">Consumer Protection Act, 2019 Engine</span>
              </div>
            </div>
            <button
              type="button"
              className="ai-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              <FaTimes />
            </button>
          </div>

          {/* Quick Issue Chips */}
          <div className="ai-quick-chips">
            <span className="chips-title">Quick Templates:</span>
            <div className="chips-scroll">
              {QUICK_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="quick-chip"
                  onClick={() => handleSendMessage(p.text)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Log */}
          <div className="ai-chat-body">
            {messages.map((m) => (
              <div key={m.id} className={`ai-message-row ${m.sender}`}>
                {m.sender === "ai" && (
                  <div className="ai-msg-avatar">
                    <FaGavel />
                  </div>
                )}
                <div className="ai-msg-bubble">
                  <div className="msg-content">{m.text}</div>
                  {m.hasDraft && draftedCase && (
                    <div className="ai-draft-cta-box">
                      <div className="draft-meta">
                        <FaShieldAlt className="shield-icon" />
                        <span>Ready to file under CPA 2019</span>
                      </div>
                      <button
                        type="button"
                        className="btn-autofill-form"
                        onClick={handleTransferToForm}
                      >
                        <FaFileSignature />
                        <span>Autofill Grievance Form</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="ai-message-row ai">
                <div className="ai-msg-avatar">
                  <FaGavel />
                </div>
                <div className="ai-msg-bubble typing">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="ai-input-footer"
          >
            <button
              type="button"
              className={`btn-voice-dictation ${isListening ? "listening" : ""}`}
              onClick={toggleVoice}
              title={isListening ? "Listening... Click to stop" : "Speak your dispute"}
            >
              {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
            </button>
            <input
              type="text"
              placeholder={isListening ? "Listening... speak now" : "Describe what happened (e.g. refund delayed, broken item)..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className="btn-send-ai"
              disabled={!inputText.trim()}
              aria-label="Send"
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
