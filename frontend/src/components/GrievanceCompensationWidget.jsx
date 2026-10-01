import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCalculator,
  FaGavel,
  FaShieldAlt,
  FaArrowRight,
  FaRupeeSign,
  FaBalanceScale,
  FaInfoCircle,
  FaCheckCircle,
} from "react-icons/fa";
import "./GrievanceCompensationWidget.css";

const DISPUTE_SECTORS = [
  { id: "Product", name: "E-Commerce / Defective Product", baseHarassment: 5000, maxHarassment: 25000 },
  { id: "Banking", name: "Banking, Failed UPI & Card Fraud", baseHarassment: 10000, maxHarassment: 50000 },
  { id: "Service", name: "Electronics, Warranty & Repairs", baseHarassment: 4000, maxHarassment: 20000 },
  { id: "Airlines", name: "Flight Cancellation & Lost Baggage", baseHarassment: 10000, maxHarassment: 40000 },
  { id: "RealEstate", name: "Real Estate & Builder Possession Delay", baseHarassment: 50000, maxHarassment: 200000 },
  { id: "Food", name: "Food Quality & Quick Commerce Delay", baseHarassment: 2000, maxHarassment: 10000 },
];

export default function GrievanceCompensationWidget() {
  const [selectedSector, setSelectedSector] = useState(DISPUTE_SECTORS[0]);
  const [claimAmount, setClaimAmount] = useState(15000);
  const [delayMonths, setDelayMonths] = useState(3);

  // Calculations under CPA 2019 principles:
  // 1. Principal Claim: claimAmount
  // 2. 18% p.a. statutory interest for delay duration
  const interestAmount = Math.round((claimAmount * 0.18 * (delayMonths / 12)));
  // 3. Mental Agony & Harassment Damages (scaled with claim and sector base)
  const harassmentCompensation = Math.min(
    selectedSector.maxHarassment,
    Math.round(selectedSector.baseHarassment + claimAmount * 0.15)
  );
  // 4. Incidental Litigation Costs
  const litigationCosts = 3000;

  const totalStatutoryRelief = claimAmount + interestAmount + harassmentCompensation + litigationCosts;

  return (
    <div className="compensation-widget-card">
      <div className="widget-header">
        <div className="widget-badge">
          <FaBalanceScale /> CPA 2019 Statutory Estimator
        </div>
        <h3>Calculate Your Eligible Statutory Consumer Relief</h3>
        <p>
          Under the Consumer Protection Act, 2019, consumers can claim full principal refunds, 18% p.a. delay interest, and compensatory damages for deficiency of service.
        </p>
      </div>

      <div className="widget-controls-grid">
        {/* Sector Selection */}
        <div className="widget-control-group">
          <label className="widget-label">Select Dispute Nature:</label>
          <div className="sector-pills-row">
            {DISPUTE_SECTORS.map((sec) => (
              <button
                key={sec.id}
                type="button"
                className={`sector-pill-btn ${selectedSector.id === sec.id ? "active" : ""}`}
                onClick={() => setSelectedSector(sec)}
              >
                {sec.name}
              </button>
            ))}
          </div>
        </div>

        {/* Claim Amount Slider */}
        <div className="widget-control-group">
          <div className="slider-label-row">
            <label className="widget-label">Disputed Transaction Amount:</label>
            <strong className="slider-live-val">₹{claimAmount.toLocaleString("en-IN")}</strong>
          </div>
          <input
            type="range"
            min="500"
            max="200000"
            step="500"
            value={claimAmount}
            onChange={(e) => setClaimAmount(Number(e.target.value))}
            className="widget-range-slider"
          />
          <div className="slider-ticks">
            <span>₹500</span>
            <span>₹50,000</span>
            <span>₹1,00,000</span>
            <span>₹2,00,000</span>
          </div>
        </div>

        {/* Delay Duration */}
        <div className="widget-control-group">
          <div className="slider-label-row">
            <label className="widget-label">Delay / Unresolved Period:</label>
            <strong className="slider-live-val">{delayMonths} Month{delayMonths === 1 ? "" : "s"}</strong>
          </div>
          <input
            type="range"
            min="1"
            max="12"
            step="1"
            value={delayMonths}
            onChange={(e) => setDelayMonths(Number(e.target.value))}
            className="widget-range-slider accent-orange"
          />
          <div className="slider-ticks">
            <span>1 Month</span>
            <span>6 Months</span>
            <span>12 Months</span>
          </div>
        </div>
      </div>

      {/* Breakdown Cards & Total Display */}
      <div className="widget-results-split">
        <div className="relief-breakdown-card">
          <span className="breakdown-title">Statutory Relief Breakdown (Section 39 CPA 2019):</span>
          <div className="breakdown-rows-list">
            <div className="breakdown-row">
              <div className="breakdown-label">
                <FaCheckCircle className="check-dot green" />
                <span>100% Principal Claim Refund</span>
              </div>
              <strong>₹{claimAmount.toLocaleString("en-IN")}</strong>
            </div>
            <div className="breakdown-row">
              <div className="breakdown-label">
                <FaCheckCircle className="check-dot blue" />
                <span>Statutory Delay Interest @ 18% p.a. ({delayMonths} mos)</span>
              </div>
              <strong>+ ₹{interestAmount.toLocaleString("en-IN")}</strong>
            </div>
            <div className="breakdown-row">
              <div className="breakdown-label">
                <FaCheckCircle className="check-dot purple" />
                <span>Mental Harassment & Deficiency Damages</span>
              </div>
              <strong>+ ₹{harassmentCompensation.toLocaleString("en-IN")}</strong>
            </div>
            <div className="breakdown-row">
              <div className="breakdown-label">
                <FaCheckCircle className="check-dot amber" />
                <span>Incidental & Pre-Litigation Notice Costs</span>
              </div>
              <strong>+ ₹{litigationCosts.toLocaleString("en-IN")}</strong>
            </div>
          </div>
        </div>

        <div className="relief-total-hero-card">
          <span className="total-label">Estimated Total Claim Valuation:</span>
          <div className="total-amount-display">
            ₹{totalStatutoryRelief.toLocaleString("en-IN")}
          </div>
          <p className="total-note">
            Includes statutory damages under Sections 35 & 39 of the Consumer Protection Act, 2019.
          </p>
          <Link
            to={`/register?category=${encodeURIComponent(selectedSector.id)}&amount=${claimAmount}`}
            className="btn-claim-relief-now"
          >
            File Pre-Litigation Claim Now <FaArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
}
