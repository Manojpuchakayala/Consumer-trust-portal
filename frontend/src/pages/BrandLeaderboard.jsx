import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBuilding,
  FaShieldAlt,
  FaCheckCircle,
  FaClock,
  FaSearch,
  FaStar,
  FaEnvelope,
} from "react-icons/fa";
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
    authority: "CCPA / Consumer E-Commerce Rules 2020",
    sla: "48h Ack / 7 Days Redressal",
    badge: "Top Performer",
    badgeColor: "#15803d",
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
    authority: "CCPA / Consumer E-Commerce Rules 2020",
    sla: "48h Ack / 7 Days Redressal",
    badge: "Fast Responder",
    badgeColor: "#2563eb",
  },
  {
    id: "phonepe",
    name: "PhonePe UPI & Payments",
    category: "Banking & UPI",
    resolutionRate: "98.2%",
    avgDays: "1.9 Days",
    totalCases: 890,
    nodalEmail: "grievance-officer@phonepe.com",
    rating: 4.9,
    authority: "NPCI / RBI Ombudsman Scheme",
    sla: "24h Ack / 5 Days Redressal (NPCI)",
    badge: "Quick Settlement",
    badgeColor: "#7c3aed",
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
    authority: "Reserve Bank of India (RBI CMS)",
    sla: "48h Ack / 7 Days Redressal (RBI Mandate)",
    badge: "High Volume",
    badgeColor: "#0284c7",
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
    authority: "Reserve Bank of India (RBI CMS)",
    sla: "48h Ack / 7 Days Redressal (RBI Mandate)",
    badge: "Verified Desk",
    badgeColor: "#15803d",
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
    authority: "FSSAI / Consumer Protection 2019",
    sla: "24h Ack / 3 Days Redressal",
    badge: "Rapid Redressal",
    badgeColor: "#dc2626",
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
    authority: "FSSAI / Consumer Protection 2019",
    sla: "24h Ack / 3 Days Redressal",
    badge: "Instant Support",
    badgeColor: "#ea580c",
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
    authority: "TRAI / TDSAT Appellate Authority",
    sla: "48h Ack / 7 Days Redressal (TRAI)",
    badge: "Regulated",
    badgeColor: "#0b2545",
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
    authority: "TRAI / TDSAT Appellate Authority",
    sla: "48h Ack / 7 Days Redressal (TRAI)",
    badge: "Regulated",
    badgeColor: "#b91c1c",
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
    authority: "Ministry of Civil Aviation / DGCA",
    sla: "24h Ack / 7 Days Redressal",
    badge: "Verified Nodal",
    badgeColor: "#2563eb",
  },
];

export default function BrandLeaderboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "E-Commerce", "Banking & UPI", "Food Delivery", "Telecom", "Travel"];

  const filteredBrands = BRAND_DATA.filter((brand) => {
    const matchesSearch =
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.nodalEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || brand.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="brand-leaderboard-page">
      <div className="leaderboard-container">
        <div className="leaderboard-header">
          <div className="header-badge">
            <FaShieldAlt style={{ marginRight: 6 }} /> PUBLIC TRANSPARENCY SCORECARD
          </div>
          <h1>🏢 Enterprise Redressal & Brand Trust Index</h1>
          <p className="leaderboard-subtitle">
            Real-time grievance redressal performance metrics, verified statutory nodal desks, and average resolution turnaround times across India's leading enterprises.
          </p>

          <div className="leaderboard-stat-cards">
            <div className="summary-stat-card">
              <span className="stat-label">Average Portal Redressal Rate</span>
              <strong className="stat-value text-green">94.7%</strong>
              <span className="stat-hint">Across 11,000+ filed disputes</span>
            </div>
            <div className="summary-stat-card">
              <span className="stat-label">Average Resolution Turnaround</span>
              <strong className="stat-value text-blue">3.1 Days</strong>
              <span className="stat-hint">Strict 7-day statutory maximum</span>
            </div>
            <div className="summary-stat-card">
              <span className="stat-label">Connected Nodal Desks</span>
              <strong className="stat-value text-purple">25+ Official</strong>
              <span className="stat-hint">Direct tokenized 1-click portal</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="leaderboard-controls">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by enterprise name (e.g. Amazon, SBI, Swiggy)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="category-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={"pill-btn " + (selectedCategory === cat ? "active" : "")}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Brand Grid */}
        <div className="brands-grid">
          {filteredBrands.map((brand) => (
            <div key={brand.id} className="brand-card">
              <div className="brand-card-top">
                <div>
                  <span className="brand-cat-tag">{brand.category}</span>
                  <h3 className="brand-name">{brand.name}</h3>
                </div>
                <span className="brand-badge" style={{ background: brand.badgeColor + "20", color: brand.badgeColor }}>
                  {brand.badge}
                </span>
              </div>

              <div className="brand-metrics-row">
                <div className="metric-item">
                  <span className="m-label">Redressal Rate</span>
                  <strong className="m-val text-green">{brand.resolutionRate}</strong>
                </div>
                <div className="metric-item">
                  <span className="m-label">Avg. Speed</span>
                  <strong className="m-val text-blue">{brand.avgDays}</strong>
                </div>
                <div className="metric-item">
                  <span className="m-label">User Rating</span>
                  <strong className="m-val text-gold">
                    <FaStar style={{ fontSize: 12, marginRight: 3, verticalAlign: "middle" }} />
                    {brand.rating} / 5.0
                  </strong>
                </div>
              </div>

              <div className="brand-details-box">
                <div className="detail-line">
                  <FaEnvelope className="d-icon" />
                  <span><strong>Nodal Desk:</strong> {brand.nodalEmail}</span>
                </div>
                <div className="detail-line">
                  <FaClock className="d-icon" />
                  <span><strong>Mandated SLA:</strong> {brand.sla}</span>
                </div>
                <div className="detail-line">
                  <FaShieldAlt className="d-icon" />
                  <span><strong>Regulator:</strong> {brand.authority}</span>
                </div>
              </div>

              <div className="brand-card-footer">
                <Link
                  to={"/register?company=" + encodeURIComponent(brand.name)}
                  className="file-dispute-btn"
                >
                  File Grievance Against {brand.name} →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredBrands.length === 0 && (
          <div className="no-brands-found">
            <p>No enterprises found matching your search. You can still file a grievance against any custom company.</p>
            <Link to="/register" className="file-dispute-btn" style={{ display: "inline-block", marginTop: 12 }}>
              File Custom Enterprise Grievance →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
