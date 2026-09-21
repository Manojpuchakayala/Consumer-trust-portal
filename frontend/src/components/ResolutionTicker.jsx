import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaShieldAlt, FaCheckCircle, FaBolt, FaArrowRight } from "react-icons/fa";
import "./ResolutionTicker.css";

const LIVE_SETTLEMENTS = [
  { id: 1, brand: "Amazon India", category: "Product", amount: "₹4,299", action: "Full Refund Processed", time: "38h turnaround", status: "Resolved" },
  { id: 2, brand: "Flipkart", category: "E-Commerce", amount: "₹1,850", action: "Replacement Order Dispatched", time: "48h turnaround", status: "Resolved" },
  { id: 3, brand: "PhonePe", category: "UPI & Fintech", amount: "₹750", action: "Failed Transaction Credited", time: "18h turnaround", status: "Resolved" },
  { id: 4, brand: "Samsung Electronics", category: "Hardware", amount: "₹14,999", action: "Warranty Service Approved", time: "4 days turnaround", status: "Resolved" },
  { id: 5, brand: "MakeMyTrip", category: "Travel", amount: "₹6,400", action: "Flight Cancellation Settled", time: "3 days turnaround", status: "Resolved" },
  { id: 6, brand: "Zomato", category: "Food Delivery", amount: "₹420", action: "Instant Wallet Refund", time: "4h turnaround", status: "Resolved" },
  { id: 7, brand: "Bharti Airtel", category: "Telecom", amount: "₹1,200", action: "Billing Correction Applied", time: "24h turnaround", status: "Resolved" },
  { id: 8, brand: "HDFC Bank", category: "Banking", amount: "₹2,500", action: "Unauthorized Charge Reversed", time: "48h turnaround", status: "Resolved" },
];

export default function ResolutionTicker() {
  const [items] = useState(LIVE_SETTLEMENTS);

  return (
    <div className="resolution-ticker-wrap" aria-label="Recent voluntary consumer resolutions">
      <div className="ticker-badge-col">
        <span className="live-dot" />
        <FaBolt className="ticker-bolt-icon" />
        <span className="ticker-badge-text">Live Settlements</span>
      </div>

      <div className="ticker-track-container">
        <div className="ticker-track">
          {items.concat(items).map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="ticker-item">
              <div className="item-brand-chip">
                <FaCheckCircle className="item-check-icon" />
                <strong>{item.brand}</strong>
              </div>
              <span className="item-action">{item.action}</span>
              <span className="item-amount">{item.amount}</span>
              <span className="item-time">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="ticker-cta-col">
        <Link to="/brands" className="ticker-view-all">
          <span>Brand Index</span>
          <FaArrowRight className="ticker-arrow" />
        </Link>
      </div>
    </div>
  );
}
