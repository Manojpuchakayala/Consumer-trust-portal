import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaCircle,
  FaCheckCircle,
  FaGavel,
  FaPaperPlane,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaArrowRight,
  FaClock,
  FaBuilding,
  FaBolt,
} from "react-icons/fa";
import AnimatedCounter from "./AnimatedCounter";
import "./LiveDisputeRadar.css";

const INITIAL_EVENTS = [
  {
    id: "evt-1",
    city: "Bengaluru, KA",
    company: "Amazon India",
    type: "settlement",
    title: "100% Refund Credited for Defective Appliance",
    amount: "₹18,499",
    docket: "CT-2026-9812",
    timeAgo: "2 mins ago",
    badge: "Settled & Closed",
  },
  {
    id: "evt-2",
    city: "Mumbai, MH",
    company: "State Bank of India",
    type: "nodal",
    title: "UPI Chargeback Dispute Acknowledged by Principal Nodal Desk",
    amount: "₹6,500",
    docket: "CT-2026-9811",
    timeAgo: "7 mins ago",
    badge: "Under Nodal Review",
  },
  {
    id: "evt-3",
    city: "New Delhi, DL",
    company: "IndiGo Airlines",
    type: "legal",
    title: "15-Day Statutory Legal Demand Notice Served (Flight Delay)",
    amount: "₹12,800",
    docket: "CT-2026-9809",
    timeAgo: "14 mins ago",
    badge: "Notice Served (SLA: 15d)",
  },
  {
    id: "evt-4",
    city: "Hyderabad, TS",
    company: "Flipkart",
    type: "settlement",
    title: "Replacement Device & ₹2,000 Compensation Issued",
    amount: "₹24,999",
    docket: "CT-2026-9805",
    timeAgo: "21 mins ago",
    badge: "Resolved",
  },
  {
    id: "evt-5",
    city: "Chennai, TN",
    company: "Star Health Insurance",
    type: "nodal",
    title: "Reimbursement Claim Docketed under IRDAI Guidelines",
    amount: "₹45,000",
    docket: "CT-2026-9799",
    timeAgo: "34 mins ago",
    badge: "GRO Facilitation",
  },
  {
    id: "evt-6",
    city: "Pune, MH",
    company: "PhonePe",
    type: "settlement",
    title: "Failed Merchant QR Payment Reversed to Bank Account",
    amount: "₹3,200",
    docket: "CT-2026-9792",
    timeAgo: "48 mins ago",
    badge: "Settled & Closed",
  },
];

export default function LiveDisputeRadar() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    // Simulated live real-time ingestion every 18 seconds
    const interval = setInterval(() => {
      const mockCities = ["Kolkata, WB", "Ahmedabad, GJ", "Jaipur, RJ", "Chandigarh, PB", "Kochi, KL", "Lucknow, UP"];
      const mockBrands = ["Zomato", "Samsung", "Tata CLiQ", "Swiggy", "HDFC Bank", "Jio Telecom", "Blinkit"];
      const mockTypes = ["settlement", "nodal", "legal"];
      const randomType = mockTypes[Math.floor(Math.random() * mockTypes.length)];
      const randomCity = mockCities[Math.floor(Math.random() * mockCities.length)];
      const randomBrand = mockBrands[Math.floor(Math.random() * mockBrands.length)];
      const randomAmount = `₹${(Math.floor(Math.random() * 25) + 2) * 500}`;
      const randomDocket = `CT-2026-${Math.floor(Math.random() * 8999 + 1000)}`;

      const newEvent = {
        id: `evt-${Date.now()}`,
        city: randomCity,
        company: randomBrand,
        type: randomType,
        title:
          randomType === "settlement"
            ? `Dispute Resolved with Full Refund via Grievance Desk`
            : randomType === "legal"
            ? `Section 35 CPA 2019 Pre-Litigation Notice Served`
            : `Grievance Escalation Dispatched to Nodal Officer`,
        amount: randomAmount,
        docket: randomDocket,
        timeAgo: "Just now",
        badge: randomType === "settlement" ? "Settled Live" : randomType === "legal" ? "Statutory Notice" : "Nodal Dispatched",
      };

      setEvents((prev) => [newEvent, ...prev.slice(0, 7)]);
    }, 14000);

    return () => clearInterval(interval);
  }, []);

  const filteredEvents = events.filter((e) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "settlement") return e.type === "settlement";
    if (activeFilter === "legal") return e.type === "legal";
    if (activeFilter === "nodal") return e.type === "nodal";
    return true;
  });

  return (
    <div className="live-radar-container">
      {/* Top Header Card */}
      <div className="radar-header-row">
        <div className="radar-title-group">
          <div className="live-beacon-pill">
            <span className="beacon-dot" />
            <span className="beacon-text">LIVE ACTIVITY RADAR</span>
          </div>
          <h3>Real-Time Nationwide Dispute Facilitation Stream</h3>
          <p>Live anonymized redressal updates, nodal dispatches, and statutory notice servings across India.</p>
        </div>

        {/* Live Counters */}
        <div className="radar-stats-strip">
          <div className="radar-stat-box">
            <span className="stat-label">Facilitated Today</span>
            <strong className="stat-num text-emerald">
              <AnimatedCounter end={184} suffix=" Cases" />
            </strong>
          </div>
          <div className="radar-stat-box">
            <span className="stat-label">Avg. Resolution Time</span>
            <strong className="stat-num text-blue">
              <AnimatedCounter end={2.8} decimals={1} suffix=" Days" />
            </strong>
          </div>
          <div className="radar-stat-box">
            <span className="stat-label">Settled Volume</span>
            <strong className="stat-num text-amber">
              ₹<AnimatedCounter end={4.8} decimals={1} suffix=" Cr" />
            </strong>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="radar-filter-bar">
        <div className="filter-pills-list">
          <button
            type="button"
            className={`radar-pill-btn ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            All Live Events ({events.length})
          </button>
          <button
            type="button"
            className={`radar-pill-btn ${activeFilter === "settlement" ? "active" : ""}`}
            onClick={() => setActiveFilter("settlement")}
          >
            <FaCheckCircle className="pill-ico text-emerald" /> Settlements & Refunds
          </button>
          <button
            type="button"
            className={`radar-pill-btn ${activeFilter === "legal" ? "active" : ""}`}
            onClick={() => setActiveFilter("legal")}
          >
            <FaGavel className="pill-ico text-rose" /> Legal Demand Notices
          </button>
          <button
            type="button"
            className={`radar-pill-btn ${activeFilter === "nodal" ? "active" : ""}`}
            onClick={() => setActiveFilter("nodal")}
          >
            <FaPaperPlane className="pill-ico text-blue" /> Nodal Dispatches
          </button>
        </div>
      </div>

      {/* Live Stream List */}
      <div className="radar-stream-grid">
        {filteredEvents.map((item, index) => (
          <div
            key={item.id}
            className={`radar-event-card ${item.type} ${index === 0 ? "new-incoming-card" : ""}`}
          >
            <div className="event-top-line">
              <span className="event-city">
                <FaMapMarkerAlt /> {item.city}
              </span>
              <span className="event-time">
                <FaClock /> {item.timeAgo}
              </span>
            </div>

            <div className="event-body-row">
              <div className="event-company-badge">
                <FaBuilding /> {item.company}
              </div>
              <span className="event-amount">{item.amount}</span>
            </div>

            <h4 className="event-headline">{item.title}</h4>

            <div className="event-bottom-line">
              <span className={`event-status-tag ${item.type}`}>
                {item.type === "settlement" && <FaCheckCircle />}
                {item.type === "legal" && <FaGavel />}
                {item.type === "nodal" && <FaPaperPlane />}
                {item.badge}
              </span>
              <Link to={`/track?id=${item.docket}`} className="event-docket-link">
                Docket #{item.docket} <FaArrowRight style={{ fontSize: 9 }} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
