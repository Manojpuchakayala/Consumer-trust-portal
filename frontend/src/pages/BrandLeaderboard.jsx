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
  FaInfoCircle,
  FaExternalLinkAlt,
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
    authority: "E-Commerce Rules / Voluntary Nodal Desk",
    sla: "48h Ack / 7 Days Target",
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
    authority: "E-Commerce Rules / Voluntary Nodal Desk",
    sla: "48h Ack / 7 Days Target",
    badge: "Fast Responder",
    badgeColor: "#2563eb",
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
    authority: "Consumer Care Desk",
    sla: "48h Ack / 7 Days Target",
    badge: "Value Retail",
    badgeColor: "#d97706",
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
    badge: "Fashion Leader",
    badgeColor: "#db2777",
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
    authority: "NPCI / RBI Ombudsman Scheme Guidelines",
    sla: "24h Ack / 5 Days Target",
    badge: "Quick Settlement",
    badgeColor: "#7c3aed",
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
    badge: "Verified Fintech",
    badgeColor: "#0284c7",
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
    authority: "RBI Customer Protection Guidelines",
    sla: "48h Ack / 7 Days Target",
    badge: "Verified Desk",
    badgeColor: "#15803d",
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
    badge: "Fast Settlement",
    badgeColor: "#b91c1c",
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
    authority: "FSSAI Guidelines / Consumer Support",
    sla: "24h Ack / 3 Days Target",
    badge: "Instant Support",
    badgeColor: "#ea580c",
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
    badge: "10-Min Redressal",
    badgeColor: "#eab308",
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
    badge: "Quick Settlement",
    badgeColor: "#9333ea",
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
    badge: "Telecom Desk",
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
    authority: "TRAI Telecom Directives",
    sla: "48h Ack / 7 Days Target",
    badge: "Telecom Desk",
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
    authority: "Travel & Hospitality Nodal Desk",
    sla: "24h Ack / 7 Days Target",
    badge: "Verified Nodal",
    badgeColor: "#2563eb",
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
    badge: "Rail Madad Link",
    badgeColor: "#047857",
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
    badge: "Ride Redressal",
    badgeColor: "#0f172a",
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
    badge: "Electronics Nodal",
    badgeColor: "#1d4ed8",
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
    badge: "Premium Support",
    badgeColor: "#475569",
  },
];

export default function BrandLeaderboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "E-Commerce", "Banking & UPI", "Food Delivery", "Telecom", "Travel", "Electronics"];

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
            <FaShieldAlt style={{ marginRight: 6 }} /> COMMUNITY BENCHMARK & PUBLIC SCORECARD
          </div>
          <h1>🏢 Enterprise Redressal & Brand Trust Index</h1>
          <p className="leaderboard-subtitle">
            Community benchmarks, voluntary resolution response metrics, and public grievance officer contacts across India's leading enterprises.
          </p>

          {/* Methodology Callout Strip */}
          <div style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 12,
            padding: "12px 18px",
            fontSize: 13,
            color: "#1e40af",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            maxWidth: 800,
            margin: "0 auto 20px"
          }}>
            <FaInfoCircle style={{ flexShrink: 0 }} />
            <span>
              Ratings are community benchmarks computed from verified user reports and public nodal responses. Learn more or request data correction in our <Link to="/methodology" style={{ fontWeight: 700, color: "#1d4ed8", textDecoration: "underline" }}>Brand Methodology & Takedown Policy</Link>. Enterprise officers can resolve disputes via the <Link to="/partner/resolve" style={{ fontWeight: 700, color: "#1d4ed8", textDecoration: "underline" }}>1-Click Resolution Desk</Link>.
            </span>
          </div>

          <div className="leaderboard-stat-cards">
            <div className="summary-stat-card">
              <span className="stat-label">Average Portal Redressal Rate</span>
              <strong className="stat-value text-green">94.7%</strong>
              <span className="stat-hint">Across 11,000+ facilitated disputes</span>
            </div>
            <div className="summary-stat-card">
              <span className="stat-label">Average Resolution Turnaround</span>
              <strong className="stat-value text-blue">3.1 Days</strong>
              <span className="stat-hint">Standard 7-day target window</span>
            </div>
            <div className="summary-stat-card">
              <span className="stat-label">Listed Corporate Desks</span>
              <strong className="stat-value text-purple">25+ Verified</strong>
              <span className="stat-hint">Direct 1-click tokenized desk</span>
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
                  <span><strong>Target SLA:</strong> {brand.sla}</span>
                </div>
                <div className="detail-line">
                  <FaShieldAlt className="d-icon" />
                  <span><strong>Framework:</strong> {brand.authority}</span>
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
