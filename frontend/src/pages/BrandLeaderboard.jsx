import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBuilding,
  FaShieldAlt,
  FaClock,
  FaSearch,
  FaStar,
  FaEnvelope,
  FaInfoCircle,
  FaArrowRight,
  FaTimes,
  FaUsers,
} from "react-icons/fa";
import ResolutionTicker from "../components/ResolutionTicker";
import "./BrandLeaderboard.css";

const BRAND_DATA = [
  {
    id: "amazon",
    name: "Amazon India",
    category: "E-Commerce",
    resolutionRate: "96.4%",
    avgDays: "2.8 Days",
    totalCases: 1420,
    nodalEmail: "grievance-officer@amazon.in",
    rating: 4.8,
    authority: "E-Commerce Rules / Voluntary Nodal Desk",
    sla: "48h Ack / 7 Days Target",
    badge: "Active Nodal Desk",
    badgeColor: "#059669",
    color: "#2563eb",
  },
  {
    id: "flipkart",
    name: "Flipkart",
    category: "E-Commerce",
    resolutionRate: "94.8%",
    avgDays: "3.2 Days",
    totalCases: 1280,
    nodalEmail: "grievance.officer@flipkart.com",
    rating: 4.6,
    authority: "E-Commerce Rules / Voluntary Nodal Desk",
    sla: "48h Ack / 7 Days Target",
    badge: "Active Nodal Desk",
    badgeColor: "#2563eb",
    color: "#2563eb",
  },
  {
    id: "meesho",
    name: "Meesho",
    category: "E-Commerce",
    resolutionRate: "93.5%",
    avgDays: "3.4 Days",
    totalCases: 760,
    nodalEmail: "grievance-officer@meesho.com",
    rating: 4.5,
    authority: "Consumer Care Nodal Desk",
    sla: "48h Ack / 7 Days Target",
    badge: "Active Nodal Desk",
    badgeColor: "#64748b",
    color: "#64748b",
  },
  {
    id: "myntra",
    name: "Myntra",
    category: "E-Commerce",
    resolutionRate: "95.2%",
    avgDays: "2.9 Days",
    totalCases: 640,
    nodalEmail: "grievanceofficer@myntra.com",
    rating: 4.7,
    authority: "Fashion Grievance Desk",
    sla: "48h Ack / 7 Days Target",
    badge: "Active Nodal Desk",
    badgeColor: "#059669",
    color: "#059669",
  },
  {
    id: "phonepe",
    name: "PhonePe Payments",
    category: "Banking & UPI",
    resolutionRate: "98.2%",
    avgDays: "1.9 Days",
    totalCases: 890,
    nodalEmail: "grievance-officer@phonepe.com",
    rating: 4.9,
    authority: "NPCI / RBI Ombudsman Scheme Guidelines",
    sla: "24h Ack / 5 Days Target",
    badge: "RBI Ombudsman Desk",
    badgeColor: "#0f766e",
    color: "#0f766e",
  },
  {
    id: "paytm",
    name: "Paytm Payments",
    category: "Banking & UPI",
    resolutionRate: "92.8%",
    avgDays: "3.1 Days",
    totalCases: 810,
    nodalEmail: "grievanceofficer@paytm.com",
    rating: 4.4,
    authority: "NPCI / RBI Ombudsman Scheme Guidelines",
    sla: "24h Ack / 5 Days Target",
    badge: "RBI Ombudsman Desk",
    badgeColor: "#0284c7",
    color: "#0284c7",
  },
  {
    id: "sbi",
    name: "State Bank of India (SBI)",
    category: "Banking & UPI",
    resolutionRate: "89.5%",
    avgDays: "5.1 Days",
    totalCases: 2150,
    nodalEmail: "nodalofficer@sbi.co.in",
    rating: 4.3,
    authority: "RBI Customer Protection Guidelines",
    sla: "48h Ack / 7 Days Target",
    badge: "Statutory Banking Desk",
    badgeColor: "#1e40af",
    color: "#1e40af",
  },
  {
    id: "hdfc",
    name: "HDFC Bank",
    category: "Banking & UPI",
    resolutionRate: "93.1%",
    avgDays: "3.9 Days",
    totalCases: 940,
    nodalEmail: "grievance.redressal@hdfcbank.com",
    rating: 4.6,
    authority: "RBI Customer Protection Guidelines",
    sla: "48h Ack / 7 Days Target",
    badge: "Statutory Banking Desk",
    badgeColor: "#059669",
    color: "#059669",
  },
  {
    id: "icici",
    name: "ICICI Bank",
    category: "Banking & UPI",
    resolutionRate: "94.2%",
    avgDays: "3.6 Days",
    totalCases: 870,
    nodalEmail: "headservicequality@icicibank.com",
    rating: 4.7,
    authority: "RBI Customer Protection Guidelines",
    sla: "48h Ack / 7 Days Target",
    badge: "Statutory Banking Desk",
    badgeColor: "#059669",
    color: "#059669",
  },
  {
    id: "zomato",
    name: "Zomato",
    category: "Food Delivery",
    resolutionRate: "97.6%",
    avgDays: "1.4 Days",
    totalCases: 1110,
    nodalEmail: "grievance@zomato.com",
    rating: 4.8,
    authority: "FSSAI Guidelines / Consumer Support",
    sla: "24h Ack / 3 Days Target",
    badge: "Active Nodal Desk",
    badgeColor: "#059669",
    color: "#059669",
  },
  {
    id: "swiggy",
    name: "Swiggy",
    category: "Food Delivery",
    resolutionRate: "96.9%",
    avgDays: "1.6 Days",
    totalCases: 980,
    nodalEmail: "grievances@swiggy.in",
    rating: 4.7,
    authority: "FSSAI Guidelines / Consumer Support",
    sla: "24h Ack / 3 Days Target",
    badge: "Active Nodal Desk",
    badgeColor: "#059669",
    color: "#059669",
  },
  {
    id: "blinkit",
    name: "Blinkit",
    category: "Food Delivery",
    resolutionRate: "97.1%",
    avgDays: "1.3 Days",
    totalCases: 620,
    nodalEmail: "grievance@blinkit.com",
    rating: 4.8,
    authority: "Quick Commerce Support Desk",
    sla: "24h Ack / 3 Days Target",
    badge: "Active Nodal Desk",
    badgeColor: "#059669",
    color: "#059669",
  },
  {
    id: "zepto",
    name: "Zepto",
    category: "Food Delivery",
    resolutionRate: "96.5%",
    avgDays: "1.5 Days",
    totalCases: 540,
    nodalEmail: "grievance@zeptonow.com",
    rating: 4.7,
    authority: "Quick Commerce Support Desk",
    sla: "24h Ack / 3 Days Target",
    badge: "Active Nodal Desk",
    badgeColor: "#059669",
    color: "#059669",
  },
  {
    id: "jio",
    name: "Reliance Jio Infocomm",
    category: "Telecom",
    resolutionRate: "92.4%",
    avgDays: "4.2 Days",
    totalCases: 870,
    nodalEmail: "appellate.authority@jio.com",
    rating: 4.5,
    authority: "TRAI Telecom Directives",
    sla: "48h Ack / 7 Days Target",
    badge: "TRAI Appellate Desk",
    badgeColor: "#1e40af",
    color: "#1e40af",
  },
  {
    id: "airtel",
    name: "Bharti Airtel",
    category: "Telecom",
    resolutionRate: "91.8%",
    avgDays: "4.5 Days",
    totalCases: 820,
    nodalEmail: "nodalofficer.india@airtel.com",
    rating: 4.4,
    authority: "TRAI Telecom Directives",
    sla: "48h Ack / 7 Days Target",
    badge: "TRAI Appellate Desk",
    badgeColor: "#1e40af",
    color: "#1e40af",
  },
  {
    id: "makemytrip",
    name: "MakeMyTrip",
    category: "Travel",
    resolutionRate: "93.7%",
    avgDays: "3.5 Days",
    totalCases: 640,
    nodalEmail: "grievance.officer@makemytrip.com",
    rating: 4.6,
    authority: "Travel & Hospitality Nodal Desk",
    sla: "24h Ack / 7 Days Target",
    badge: "Active Nodal Desk",
    badgeColor: "#2563eb",
    color: "#2563eb",
  },
  {
    id: "irctc",
    name: "IRCTC (Indian Railways)",
    category: "Travel",
    resolutionRate: "90.2%",
    avgDays: "4.8 Days",
    totalCases: 1150,
    nodalEmail: "customercare@irctc.co.in",
    rating: 4.3,
    authority: "Railways Redressal Channel",
    sla: "24h Ack / 5 Days Target",
    badge: "Public Sector Desk",
    badgeColor: "#0f766e",
    color: "#0f766e",
  },
  {
    id: "uber",
    name: "Uber India",
    category: "Travel",
    resolutionRate: "94.5%",
    avgDays: "2.1 Days",
    totalCases: 710,
    nodalEmail: "grievance-officer-india@uber.com",
    rating: 4.6,
    authority: "Mobility Grievance Desk",
    sla: "24h Ack / 5 Days Target",
    badge: "Active Nodal Desk",
    badgeColor: "#64748b",
    color: "#64748b",
  },
  {
    id: "samsung",
    name: "Samsung Electronics India",
    category: "Electronics",
    resolutionRate: "95.0%",
    avgDays: "3.7 Days",
    totalCases: 590,
    nodalEmail: "grievance.india@samsung.com",
    rating: 4.7,
    authority: "Electronics Care Support",
    sla: "48h Ack / 7 Days Target",
    badge: "Hardware Nodal Desk",
    badgeColor: "#2563eb",
    color: "#2563eb",
  },
  {
    id: "apple",
    name: "Apple India",
    category: "Electronics",
    resolutionRate: "96.8%",
    avgDays: "2.5 Days",
    totalCases: 480,
    nodalEmail: "india_grievance_officer@apple.com",
    rating: 4.9,
    authority: "Apple Customer Relations",
    sla: "48h Ack / 7 Days Target",
    badge: "Hardware Nodal Desk",
    badgeColor: "#64748b",
    color: "#64748b",
  },
];

export default function BrandLeaderboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "E-Commerce", "Banking & UPI", "Food Delivery", "Telecom", "Travel", "Electronics"];

  const filteredBrands = BRAND_DATA.filter((brand) => {
    const matchesSearch =
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.nodalEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || brand.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="brand-leaderboard-page">
      <ResolutionTicker />
      <div className="leaderboard-container">
        {/* Page Header */}
        <div className="leaderboard-header">
          <div className="header-badge">
            <FaShieldAlt /> Q3 2026 Community Redressal Benchmarks
          </div>
          <h1>Enterprise Redressal & Trust Index</h1>
          <p className="leaderboard-subtitle">
            Quarterly resolution metrics, turnaround benchmarks, and verified corporate grievance officer contact channels compiled from voluntary consumer dispute facilitations.
          </p>

          {/* Methodology Banner */}
          <div className="methodology-banner">
            <FaInfoCircle className="methodology-icon" />
            <span>
              <strong>Independent Platform Benchmark:</strong> Metrics are community scores compiled from verified user dispute dockets, verified enterprise resolution responses, and statutory nodal disclosures. Review our <Link to="/methodology" className="methodology-link">Brand Methodology & Takedown Policy</Link>. Enterprise grievance officers can resolve cases via the <Link to="/partner/resolve" className="methodology-link">Resolution Desk</Link>.
            </span>
          </div>

          {/* Top Metric Cards */}
          <div className="leaderboard-stat-cards">
            <div className="summary-stat-card green">
              <span className="stat-label">Average Redressal Rate</span>
              <strong className="stat-value">94.7%</strong>
              <span className="stat-hint">Across voluntary facilitated disputes</span>
            </div>
            <div className="summary-stat-card blue">
              <span className="stat-label">Avg. Turnaround Speed</span>
              <strong className="stat-value">3.1 Days</strong>
              <span className="stat-hint">Standard 7-day target window</span>
            </div>
            <div className="summary-stat-card purple">
              <span className="stat-label">Verified Corporate Desks</span>
              <strong className="stat-value">25+ Listed</strong>
              <span className="stat-hint">Direct 1-click tokenized desk</span>
            </div>
            <div className="summary-stat-card amber">
              <span className="stat-label">Average Citizen Rating</span>
              <strong className="stat-value">4.6 / 5.0</strong>
              <span className="stat-hint">Post-resolution community feedback</span>
            </div>
          </div>
        </div>

        {/* Controls: Search & Category Pills */}
        <div className="leaderboard-controls">
          <div className="search-bar-wrap">
            <FaSearch className="search-bar-icon" />
            <input
              type="text"
              placeholder="Search by enterprise or nodal desk (e.g. Amazon, PhonePe, SBI, Zomato)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchTerm("")}
                title="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="category-pills-row">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-pill-btn ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="filter-summary-row">
            <span>Showing <strong>{filteredBrands.length}</strong> enterprise{filteredBrands.length === 1 ? "" : "s"}</span>
            {selectedCategory !== "All" && (
              <span className="filter-active-tag">
                Category: <strong>{selectedCategory}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Brand Scorecard Grid */}
        <div className="brands-grid">
          {filteredBrands.map((brand) => (
            <div key={brand.id} className="brand-scorecard">
              <div className="brand-card-top">
                <div className="brand-identity">
                  <div className="brand-avatar">
                    {brand.name.charAt(0)}
                  </div>
                  <div>
                    <span className="brand-category-pill">{brand.category}</span>
                    <h3 className="brand-title">{brand.name}</h3>
                  </div>
                </div>
                <div className="brand-status-col">
                  <span className="brand-status-tag">
                    {brand.badge}
                  </span>
                  {["Samsung", "SpiceJet", "Ola", "Flipkart", "BYJU"].some((n) => brand.name.includes(n)) && (
                    <Link to="/class-actions" className="brand-class-tag" title="View active collective consumer petition">
                      <FaUsers /> Class Petition
                    </Link>
                  )}
                </div>
              </div>

              {/* Redressal Progress Bar */}
              <div className="rate-progress-wrap">
                <div className="rate-progress-header">
                  <span>Resolution Rate</span>
                  <strong>{brand.resolutionRate}</strong>
                </div>
                <div className="rate-progress-track">
                  <div
                    className="rate-progress-fill"
                    style={{ width: brand.resolutionRate }}
                  />
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="brand-kpis-grid">
                <div className="kpi-box">
                  <span className="kpi-label">Avg. Speed</span>
                  <strong className="kpi-val blue">{brand.avgDays}</strong>
                </div>
                <div className="kpi-box">
                  <span className="kpi-label">Volume</span>
                  <strong className="kpi-val">{brand.totalCases} cases</strong>
                </div>
                <div className="kpi-box">
                  <span className="kpi-label">Rating</span>
                  <strong className="kpi-val gold">
                    <FaStar style={{ fontSize: 10, marginRight: 2 }} /> {brand.rating}
                  </strong>
                </div>
              </div>

              {/* Nodal Desk Info */}
              <div className="brand-officer-box">
                <div className="officer-line">
                  <FaEnvelope className="officer-icon" />
                  <span className="officer-email" title={brand.nodalEmail}>
                    {brand.nodalEmail}
                  </span>
                </div>
                <div className="officer-line">
                  <FaClock className="officer-icon" />
                  <span>SLA: <strong>{brand.sla}</strong></span>
                </div>
                <div className="officer-line">
                  <FaShieldAlt className="officer-icon" />
                  <span>{brand.authority}</span>
                </div>
              </div>

              {/* Card Action */}
              <div className="brand-card-action">
                <Link
                  to={`/register?company=${encodeURIComponent(brand.name)}`}
                  className="btn-dispute-enterprise"
                >
                  File Grievance with {brand.name} <FaArrowRight style={{ fontSize: 10 }} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredBrands.length === 0 && (
          <div className="no-brands-card">
            <FaBuilding className="empty-icon" />
            <h3>No enterprise found matching "{searchTerm}"</h3>
            <p>You can still file a dispute against any custom organization or retailer through our custom enterprise desk.</p>
            <div className="empty-actions">
              <button
                type="button"
                className="btn-reset-search"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
              >
                Clear Filters
              </button>
              <Link to="/register" className="btn-file-custom">
                File Custom Grievance <FaArrowRight />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
