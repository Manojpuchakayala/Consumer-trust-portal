import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaFileAlt,
  FaSearch,
  FaShieldAlt,
  FaCheckCircle,
  FaLock,
  FaBuilding,
  FaExternalLinkAlt,
  FaArrowRight,
  FaUserCheck,
  FaClock,
  FaBalanceScale,
  FaEnvelopeOpenText,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaPaperclip,
  FaFilePdf,
  FaReceipt,
  FaCheck,
  FaQuestionCircle,
} from "react-icons/fa";
import AuthCard from "../components/AuthCard";
import "./Home.css";

export default function Home() {
  const [activePreviewTab, setActivePreviewTab] = useState("notice");

  const scrollToHowItWorks = (e) => {
    e.preventDefault();
    const elem = document.getElementById("how-it-works");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="home-root">
      {/* 1. Slim, Understated Platform Notice */}
      <div className="home-top-notice">
        <div className="home-notice-container">
          <FaShieldAlt className="notice-icon" />
          <span>
            <strong>Independent Platform Notice:</strong> Consumer Trust is an independent dispute facilitation service (non-governmental). For statutory judicial filings, visit <a href="https://consumerhelpline.gov.in" target="_blank" rel="noopener noreferrer">consumerhelpline.gov.in (NCH 1915) <FaExternalLinkAlt style={{ fontSize: 9 }} /></a> or <a href="https://edaakhil.nic.in" target="_blank" rel="noopener noreferrer">edaakhil.nic.in <FaExternalLinkAlt style={{ fontSize: 9 }} /></a>.
          </span>
        </div>
      </div>

      {/* 2. Editorial-Style Hero Section */}
      <section className="home-hero-section">
        <div className="hero-container">
          {/* Left Column: Value Proposition & Non-Affiliation */}
          <div className="hero-content-col">
            <div className="hero-tag-pill">
              <span className="pill-dot" />
              <span>Independent Consumer Dispute Facilitation</span>
            </div>

            <h1 className="hero-main-title">
              A clearer path to consumer resolution.
            </h1>

            {/* Prominent Non-Affiliation Callout directly below the main heading */}
            <div className="hero-non-affiliation-card">
              <div className="non-aff-header">
                <FaShieldAlt className="non-aff-icon" />
                <strong>Non-Affiliation & Legal Notice</strong>
              </div>
              <p className="non-aff-text">
                Consumer Trust is an independent private dispute facilitation platform. It is not affiliated with or operated by the Government of India, National Consumer Helpline, NCDRC, or any consumer court.
              </p>
              <div className="non-aff-links-row">
                <span className="links-label">Statutory complaints & court filings:</span>
                <a
                  href="https://consumerhelpline.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="statutory-link"
                >
                  consumerhelpline.gov.in <FaExternalLinkAlt style={{ fontSize: 9 }} />
                </a>
                <span className="link-divider">•</span>
                <a
                  href="https://edaakhil.nic.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="statutory-link"
                >
                  edaakhil.nic.in <FaExternalLinkAlt style={{ fontSize: 9 }} />
                </a>
              </div>
            </div>

            <p className="hero-lead-text">
              Consumer Trust helps citizens structure dispute details, securely share evidence, and communicate with enterprise grievance desks for voluntary settlement.
            </p>

            <div className="hero-cta-group">
              <Link to="/register" className="hero-btn-primary">
                <FaFileAlt />
                <span>Prepare a Grievance</span>
                <FaArrowRight className="btn-arrow" />
              </Link>

              <Link to="/track" className="hero-btn-secondary">
                <FaSearch />
                <span>Track an Existing Case</span>
              </Link>

              <a href="#how-it-works" onClick={scrollToHowItWorks} className="hero-btn-tertiary">
                <FaQuestionCircle />
                <span>How It Works</span>
              </a>
            </div>

            {/* Platform Proof Points */}
            <div className="hero-benchmarks-row">
              <div className="benchmark-item">
                <FaClock className="benchmark-icon" />
                <div>
                  <strong>Typical response target</strong>
                  <span>Timelines vary by enterprise</span>
                </div>
              </div>
              <div className="benchmark-divider" />
              <div className="benchmark-item">
                <FaLock className="benchmark-icon" />
                <div>
                  <strong>Private case access</strong>
                  <span>Verification required</span>
                </div>
              </div>
              <div className="benchmark-divider" />
              <div className="benchmark-item">
                <FaBuilding className="benchmark-icon" />
                <div>
                  <strong>Enterprise contact channels</strong>
                  <span>Supported grievance desks</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Compact Account Access Panel */}
          <div className="hero-auth-col">
            <AuthCard />
          </div>
        </div>
      </section>

      {/* 3. "What Happens After You File?" — 4-Step Process */}
      <section className="how-it-works-section" id="how-it-works">
        <div className="section-container">
          <div className="section-header-center">
            <span className="section-badge">Facilitation Process</span>
            <h2>What happens after you file?</h2>
            <p>A transparent four-step workflow connecting consumers with verified corporate grievance officers.</p>
          </div>

          <div className="steps-cards-grid four-col">
            <div className="step-card">
              <div className="step-card-num">01</div>
              <div className="step-icon-box">
                <FaFileAlt />
              </div>
              <h3>1. Prepare & Review</h3>
              <p>
                Structure key facts, dates, transaction references, and desired remedy (refund, replacement, or rectification) with clear chronology.
              </p>
            </div>

            <div className="step-card">
              <div className="step-card-num">02</div>
              <div className="step-icon-box">
                <FaPaperclip />
              </div>
              <h3>2. Secure Evidence</h3>
              <p>
                Attach relevant invoices, receipts, and customer support transcripts. Sensitive secrets like OTPs or passwords must be omitted.
              </p>
            </div>

            <div className="step-card">
              <div className="step-card-num">03</div>
              <div className="step-icon-box">
                <FaEnvelopeOpenText />
              </div>
              <h3>3. Nodal Notice Dispatch</h3>
              <p>
                A structured grievance summary with a tokenized 1-click response link is delivered directly to the corporate nodal officer.
              </p>
            </div>

            <div className="step-card">
              <div className="step-card-num">04</div>
              <div className="step-icon-box">
                <FaCheckCircle />
              </div>
              <h3>4. Track Voluntary Resolution</h3>
              <p>
                Monitor milestone progress in real time, review enterprise settlement remarks, and receive your verifiable Resolution Record.
              </p>
            </div>
          </div>

          {/* Voluntary Resolution Notice Banner */}
          <div className="voluntary-resolution-notice">
            <FaInfoCircle className="notice-banner-icon" />
            <div>
              <strong>Voluntary Dispute Resolution Notice:</strong> Consumer Trust facilitates communication for voluntary settlement between consumers and enterprises. We cannot issue legal orders, compel a company, impose statutory fines, or replace judicial remedies through consumer commissions.
            </div>
          </div>
        </div>
      </section>

      {/* 4. "Before You Upload" Safety Checklist & Privacy-by-Design */}
      <section className="safety-privacy-section" id="safety-checklist">
        <div className="section-container">
          <div className="section-header-center">
            <span className="section-badge secondary">Safety & Privacy</span>
            <h2>Data protection and user safety</h2>
            <p>Built with privacy-by-design practices to safeguard your personal and financial information.</p>
          </div>

          <div className="safety-grid-container">
            {/* Left Card: Before You Upload Checklist */}
            <div className="safety-card checklist-card">
              <div className="safety-card-top">
                <div className="safety-icon-wrap">
                  <FaShieldAlt />
                </div>
                <div>
                  <h3>Before you upload: Document checklist</h3>
                  <span className="safety-card-sub">Follow safety rules to protect your personal privacy</span>
                </div>
              </div>

              <div className="checklist-columns">
                <div className="checklist-subcol allowed">
                  <div className="checklist-col-title">
                    <FaCheckCircle className="icon-check-green" />
                    <strong>Include supporting documents:</strong>
                  </div>
                  <ul>
                    <li><FaCheck className="bullet-icon" /> Invoices, cash receipts, and order confirmation slips</li>
                    <li><FaCheck className="bullet-icon" /> Order ID, delivery tracking, or transaction numbers</li>
                    <li><FaCheck className="bullet-icon" /> Prior customer support emails, chat transcripts, and ticket IDs</li>
                    <li><FaCheck className="bullet-icon" /> Photographs or videos of damaged/defective products</li>
                  </ul>
                </div>

                <div className="checklist-subcol prohibited">
                  <div className="checklist-col-title">
                    <FaTimesCircle className="icon-times-red" />
                    <strong>Do NOT upload sensitive secrets:</strong>
                  </div>
                  <ul>
                    <li><FaTimesCircle className="bullet-icon red" /> Account passwords, PINs, or one-time passwords (OTPs)</li>
                    <li><FaTimesCircle className="bullet-icon red" /> Full debit/credit card numbers or 3-digit CVV codes</li>
                    <li><FaTimesCircle className="bullet-icon red" /> Aadhaar cards, PAN numbers, or government identity scans</li>
                    <li><FaTimesCircle className="bullet-icon red" /> Unrelated personal bank statements or private correspondence</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Card: Transparent Privacy Principles */}
            <div className="safety-card privacy-rules-card">
              <div className="safety-card-top">
                <div className="safety-icon-wrap teal">
                  <FaLock />
                </div>
                <div>
                  <h3>Data access & retention clarity</h3>
                  <span className="safety-card-sub">Specific, readable privacy safeguards</span>
                </div>
              </div>

              <div className="privacy-specs-list">
                <div className="spec-item">
                  <FaUserCheck className="spec-icon" />
                  <div>
                    <strong>Who can access submitted case data</strong>
                    <p>Only you (the complainant), authenticated technical staff, and designated corporate nodal officers receiving the tokenized dispute link.</p>
                  </div>
                </div>

                <div className="spec-item">
                  <FaClock className="spec-icon" />
                  <div>
                    <strong>How long data is retained</strong>
                    <p>Data is retained during active facilitation and up to 180 days post-resolution, after which dockets may be archived or permanently purged.</p>
                  </div>
                </div>

                <div className="spec-item">
                  <FaBalanceScale className="spec-icon" />
                  <div>
                    <strong>How to request correction or deletion</strong>
                    <p>You can delete case dockets directly from your Citizen Dashboard at any time or email our privacy desk at <a href="mailto:privacy@consumertrust.in">privacy@consumertrust.in</a>.</p>
                  </div>
                </div>

                <div className="spec-item">
                  <FaBuilding className="spec-icon" />
                  <div>
                    <strong>Enterprise evidence handling</strong>
                    <p>Designated enterprise grievance officers may review and download attached invoices solely to investigate and process your voluntary claim.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Redacted Sample Previews — What You Will Receive */}
      <section className="samples-preview-section">
        <div className="section-container">
          <div className="section-header-center">
            <span className="section-badge">Facilitation Records</span>
            <h2>What you will receive</h2>
            <p>Review sample redacted documents generated during the voluntary dispute facilitation process.</p>
          </div>

          <div className="preview-tabs-nav">
            <button
              type="button"
              className={`preview-tab-btn ${activePreviewTab === "notice" ? "active" : ""}`}
              onClick={() => setActivePreviewTab("notice")}
            >
              <FaFileAlt /> Sample Grievance Summary Notice
            </button>
            <button
              type="button"
              className={`preview-tab-btn ${activePreviewTab === "certificate" ? "active" : ""}`}
              onClick={() => setActivePreviewTab("certificate")}
            >
              <FaCheckCircle /> Sample Resolution Record
            </button>
          </div>

          <div className="preview-display-card">
            {activePreviewTab === "notice" ? (
              <div className="sample-document grievance-notice-sample">
                <div className="doc-top-bar">
                  <div className="doc-brand-title">
                    <FaShieldAlt className="doc-shield" />
                    <div>
                      <strong>Consumer Trust Facilitation Summary</strong>
                      <span>Dispute Notice Dispatched to Corporate Nodal Desk</span>
                    </div>
                  </div>
                  <div className="doc-docket-badge">
                    <span>Docket ID:</span>
                    <strong>CT-2026-89412</strong>
                  </div>
                </div>

                <div className="doc-grid-meta">
                  <div className="meta-box">
                    <span className="meta-label">Complainant</span>
                    <strong className="meta-val">M**** K. (Bangalore, KA)</strong>
                  </div>
                  <div className="meta-box">
                    <span className="meta-label">Disputed Enterprise</span>
                    <strong className="meta-val">Amazon India (Nodal Desk)</strong>
                  </div>
                  <div className="meta-box">
                    <span className="meta-label">Category</span>
                    <strong className="meta-val">Product & Hardware</strong>
                  </div>
                  <div className="meta-box">
                    <span className="meta-label">Reference ID</span>
                    <strong className="meta-val">Order #408-9842104-1892</strong>
                  </div>
                </div>

                <div className="doc-section-block">
                  <span className="block-title">Structured Claim Narrative</span>
                  <p className="block-text">
                    &ldquo;Item (Mechanical Keyboard, ₹4,299) was delivered defective with non-functional keys on 14-Sep-2026. A return pickup request was raised on the same day within the return window, but pickup attempts failed twice due to courier non-attendance. Multiple customer care chats resulted in automated responses without resolution.&rdquo;
                  </p>
                </div>

                <div className="doc-section-block highlight-relief">
                  <span className="block-title">Remedy / Relief Requested</span>
                  <p className="block-text">
                    <strong>Full Refund of ₹4,299</strong> to the original payment method upon return pickup or return waiver.
                  </p>
                </div>

                <div className="doc-evidence-chip-row">
                  <span className="evidence-chip"><FaPaperclip /> invoice_408_amazon.pdf (Verified)</span>
                  <span className="evidence-chip"><FaPaperclip /> defect_photo_keys.jpg (Attached)</span>
                  <span className="evidence-chip"><FaPaperclip /> courier_chat_transcript.pdf (Attached)</span>
                </div>

                <div className="doc-footer-disclaimer">
                  <span>* Redacted sample for illustration. Consumer Trust is an independent dispute facilitation service and not a government body or court.</span>
                </div>
              </div>
            ) : (
              <div className="sample-document resolution-cert-sample">
                <div className="doc-top-bar success">
                  <div className="doc-brand-title">
                    <FaCheckCircle className="doc-shield text-green" />
                    <div>
                      <strong>Voluntary Resolution Record</strong>
                      <span>Corporate Redressal Confirmation</span>
                    </div>
                  </div>
                  <div className="doc-docket-badge success">
                    <span>Status:</span>
                    <strong>Voluntary Settlement Complete</strong>
                  </div>
                </div>

                <div className="doc-grid-meta">
                  <div className="meta-box">
                    <span className="meta-label">Docket Reference</span>
                    <strong className="meta-val">CT-2026-89412</strong>
                  </div>
                  <div className="meta-box">
                    <span className="meta-label">Enterprise Desk</span>
                    <strong className="meta-val">Amazon India Grievance Cell</strong>
                  </div>
                  <div className="meta-box">
                    <span className="meta-label">Facilitation Speed</span>
                    <strong className="meta-val">2.8 Days (Target 7 Days)</strong>
                  </div>
                  <div className="meta-box">
                    <span className="meta-label">Resolution Mode</span>
                    <strong className="meta-val">Full Monetary Refund</strong>
                  </div>
                </div>

                <div className="doc-section-block enterprise-remark-block">
                  <span className="block-title">Enterprise Grievance Officer Remarks</span>
                  <p className="block-text">
                    &ldquo;We reviewed the docket and customer invoice proof. Return courier delay was verified. A full refund of ₹4,299 has been initiated to the consumer&rsquo;s bank account via transaction reference TXN-9842104 on 17-Sep-2026. Dispute marked resolved.&rdquo;
                  </p>
                </div>

                <div className="resolution-security-strip">
                  <FaLock className="sec-icon" />
                  <span>Verified via tokenized enterprise resolution link • Case archived under DPDP privacy standards.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. Brand Resolution Benchmarks Preview */}
      <section className="brand-preview-section">
        <div className="section-container">
          <div className="brand-preview-header">
            <div>
              <span className="section-badge">Corporate Benchmarks</span>
              <h2>Enterprise Resolution Benchmarks</h2>
              <p>Community response rates, turnaround times, and verified grievance contacts across major platforms (Q3 2026 data).</p>
            </div>
            <Link to="/brands" className="view-all-brands-link">
              <span>View Full Brand Index</span>
              <FaArrowRight />
            </Link>
          </div>

          <div className="brand-cards-row">
            <div className="brand-mini-card">
              <div className="brand-mini-top">
                <span className="brand-cat">E-Commerce</span>
                <span className="brand-rate text-teal">Community Benchmark</span>
              </div>
              <h4>Amazon India</h4>
              <p className="brand-meta">Typical Target: 48h Ack / 7 Days • Verified Nodal Channel</p>
            </div>

            <div className="brand-mini-card">
              <div className="brand-mini-top">
                <span className="brand-cat">Banking & UPI</span>
                <span className="brand-rate text-teal">Community Benchmark</span>
              </div>
              <h4>PhonePe Payments</h4>
              <p className="brand-meta">Typical Target: 24h Ack / 5 Days • Verified Nodal Channel</p>
            </div>

            <div className="brand-mini-card">
              <div className="brand-mini-top">
                <span className="brand-cat">Food Delivery</span>
                <span className="brand-rate text-teal">Community Benchmark</span>
              </div>
              <h4>Zomato</h4>
              <p className="brand-meta">Typical Target: 24h Ack / 3 Days • Verified Nodal Channel</p>
            </div>
          </div>

          <div className="brand-methodology-note">
            <span>* Community benchmarks compiled from voluntary user submissions and publicly stated nodal response targets (Q3 2026). For details or enterprise corrections, read our <Link to="/methodology">Methodology & Takedown Policy</Link>.</span>
          </div>
        </div>
      </section>

      {/* 7. CTA Action Strip */}
      <section className="home-cta-banner">
        <div className="section-container">
          <div className="cta-banner-box">
            <div className="cta-text-wrap">
              <h2>Have an unresolved consumer dispute?</h2>
              <p>Structure your grievance details and dispatch an evidence-backed resolution notice to the enterprise desk.</p>
            </div>
            <div className="cta-actions-wrap">
              <Link to="/register" className="cta-btn-main">
                <FaFileAlt /> Prepare a Grievance
              </Link>
              <Link to="/track" className="cta-btn-alt">
                <FaSearch /> Track a Case
              </Link>
              <Link to="/brands" className="cta-btn-alt">
                <FaBuilding /> Brand Index
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
