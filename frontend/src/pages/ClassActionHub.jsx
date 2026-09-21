import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaShieldAlt,
  FaGavel,
  FaBuilding,
  FaSearch,
  FaArrowRight,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFilePdf,
  FaHandshake,
  FaRupeeSign,
  FaFire,
} from "react-icons/fa";
import "./ClassActionHub.css";

const CLASS_ACTION_CLUSTERS = [
  {
    id: "ca-01",
    brand: "Samsung Electronics",
    category: "Electronics & Home Appliances",
    issueTitle: "Vertical Green/Pink Line AMOLED Display Defect Post-Software Update",
    affectedCount: 142,
    totalClaimAmount: "₹32,50,000",
    status: "Active Conciliation",
    urgency: "High",
    cpaClause: "Section 84 — Product Liability for Manufacturing/Design Defect",
    description: "Consumers across India experiencing sudden display failure and vertical lines post-OTA update without physical damage. Demanding free screen replacement across warranty expiries.",
    recentSettlements: "18 Free Screen Replacements Granted in Q3",
  },
  {
    id: "ca-02",
    brand: "SpiceJet",
    category: "Airlines & Travel Booking",
    issueTitle: "Indefinite Delay & Non-Refund of Cancelled Flight Bookings",
    affectedCount: 68,
    totalClaimAmount: "₹14,80,000",
    status: "Pre-Litigation Notice Served",
    urgency: "Urgent",
    cpaClause: "Section 2(11) — Deficiency in Service & DGCA Passenger Charter Violation",
    description: "Systemic delay in processing flight cancellation refunds beyond the mandatory 7-day DGCA statutory window. Demanding full refund with 18% p.a. statutory interest.",
    recentSettlements: "₹4.2 Lakhs conciliated this month",
  },
  {
    id: "ca-03",
    brand: "Ola Electric",
    category: "Automotive & Electric Vehicles",
    issueTitle: "Severe Service Center Backlogs & Unrepaired Battery Degradation",
    affectedCount: 114,
    totalClaimAmount: "₹1,12,00,000",
    status: "CCPA Notice Stage",
    urgency: "High",
    cpaClause: "Section 2(47) — Unfair Trade Practice & Non-fulfillment of Service SLA",
    description: "Extended vehicle retention at service hubs exceeding 30–60 days with unresponsive customer support. Demanding loaner vehicles and warranty extensions.",
    recentSettlements: "24 Fast-Track Battery Swaps Arranged",
  },
  {
    id: "ca-04",
    brand: "BYJU'S",
    category: "EdTech & Online Education",
    issueTitle: "Unilateral Cancellation Rejection & Third-Party NBFC Auto-Debits",
    affectedCount: 210,
    totalClaimAmount: "₹2,45,00,000",
    status: "Class Dossier Compiled",
    urgency: "Urgent",
    cpaClause: "Section 2(47) — Misleading Advertisements & Dark Patterns in Loan Debits",
    description: "Parents denied contractual 15-day refund windows while loan EMIs continue to be debited by financial partners. Demanding complete loan foreclosure and fee refunds.",
    recentSettlements: "45 Loan Mandates Cancelled via Conciliation",
  },
  {
    id: "ca-05",
    brand: "Flipkart",
    category: "E-Commerce & Online Shopping",
    issueTitle: "Wrong Item / Refurbished Goods Delivered with Return Refusal",
    affectedCount: 89,
    totalClaimAmount: "₹18,20,000",
    status: "Active Conciliation",
    urgency: "Medium",
    cpaClause: "Section 2(11) — Delivery of Non-Conforming Goods",
    description: "Consumers receiving mismatched serial numbers or open-box goods rejected by automated return inspection algorithms. Demanding manual photographic reassessment.",
    recentSettlements: "62 Replacement Orders Dispatched",
  },
  {
    id: "ca-06",
    brand: "Urban Company",
    category: "Home Services & Maintenance",
    issueTitle: "Appliance Damage during Service & Inadequate Claim Insurance",
    affectedCount: 35,
    totalClaimAmount: "₹4,50,000",
    status: "In Settlement",
    urgency: "Normal",
    cpaClause: "Section 2(11) — Damage caused by Service Partner Negligence",
    description: "Damage to AC compressors and wall units during seasonal servicing with delayed third-party claim approvals. Demanding direct merchant reimbursement.",
    recentSettlements: "29 Claims Settled within 48h",
  },
];

export default function ClassActionHub() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();

  const filteredClusters = CLASS_ACTION_CLUSTERS.filter((cluster) => {
    const matchesSearch =
      cluster.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cluster.issueTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cluster.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = selectedCategory === "All" || cluster.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ["All", ...new Set(CLASS_ACTION_CLUSTERS.map((c) => c.category))];

  const handleJoinClass = (cluster) => {
    navigate(`/register?brand=${encodeURIComponent(cluster.brand)}&category=${encodeURIComponent(cluster.category)}&subject=${encodeURIComponent(cluster.issueTitle)}`);
  };

  return (
    <div className="class-hub-root">
      <div className="class-hub-container">
        {/* Hub Header */}
        <div className="class-hub-header">
          <div className="hub-badge">
            <FaUsers /> Collective Citizen Legal Power
          </div>
          <h1>Class-Action & Collective Grievance Hub</h1>
          <p className="hub-subtitle">
            Group multiple individual disputes against the same enterprise into unified statutory class representations under Section 35(1)(c) of the Consumer Protection Act, 2019.
          </p>

          {/* Aggregate Metrics Bar */}
          <div className="hub-metrics-grid">
            <div className="metric-box">
              <span className="metric-val">658+</span>
              <span className="metric-lbl">Aggrieved Citizens Grouped</span>
            </div>
            <div className="metric-box">
              <span className="metric-val">₹4.27 Cr</span>
              <span className="metric-lbl">Collective Restitution Pursued</span>
            </div>
            <div className="metric-box">
              <span className="metric-val">178</span>
              <span className="metric-lbl">Joint Settlements Executed</span>
            </div>
            <div className="metric-box highlight">
              <span className="metric-val"><FaGavel /> CPA 2019</span>
              <span className="metric-lbl">Sec 35(1)(c) Joint Petitions</span>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="hub-filter-bar">
          <div className="hub-search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by enterprise or systemic issue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="hub-cat-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`cat-pill ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Class Action Clusters Grid */}
        <div className="clusters-grid">
          {filteredClusters.map((cluster) => (
            <div key={cluster.id} className="cluster-card">
              <div className="cluster-card-header">
                <div>
                  <span className="cluster-brand"><FaBuilding /> {cluster.brand}</span>
                  <span className="cluster-category">{cluster.category}</span>
                </div>
                <span className={`urgency-tag ${cluster.urgency.toLowerCase()}`}>
                  <FaFire /> {cluster.urgency} Urgency
                </span>
              </div>

              <h3 className="cluster-title">{cluster.issueTitle}</h3>
              <p className="cluster-desc">{cluster.description}</p>

              <div className="cluster-clause-box">
                <strong>Statutory Basis:</strong>
                <span>{cluster.cpaClause}</span>
              </div>

              <div className="cluster-stats-row">
                <div>
                  <span className="stat-label">Complainants Grouped</span>
                  <strong className="stat-val"><FaUsers /> {cluster.affectedCount} Consumers</strong>
                </div>
                <div>
                  <span className="stat-label">Restitution Sought</span>
                  <strong className="stat-val text-green">{cluster.totalClaimAmount}</strong>
                </div>
              </div>

              <div className="cluster-settlement-snippet">
                <FaCheckCircle className="snippet-icon" />
                <span>{cluster.recentSettlements}</span>
              </div>

              <div className="cluster-actions">
                <button
                  type="button"
                  className="btn-join-class"
                  onClick={() => handleJoinClass(cluster)}
                >
                  Join This Class Petition <FaArrowRight />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Start New Class Action Banner */}
        <div className="start-class-banner">
          <div className="banner-text">
            <h3>Facing a recurring issue with another brand?</h3>
            <p>File an individual grievance and our automated clustering engine will group other affected citizens to build a joint petition.</p>
          </div>
          <Link to="/register" className="btn-start-class">
            File New Collective Grievance
          </Link>
        </div>
      </div>
    </div>
  );
}
