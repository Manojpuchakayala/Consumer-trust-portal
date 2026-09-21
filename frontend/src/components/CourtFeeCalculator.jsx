import React, { useState } from "react";
import { calculateCourtFeeAndJurisdiction } from "../utils/jurisdictionCalculator";
import { FaCalculator, FaTimes, FaGavel, FaCheckCircle, FaExternalLinkAlt, FaInfoCircle } from "react-icons/fa";
import "./CourtFeeCalculator.css";

export default function CourtFeeCalculator({ initialAmount = 5000, onClose }) {
  const [claimValue, setClaimValue] = useState(initialAmount);
  const [compensationValue, setCompensationValue] = useState(0);

  const totalValue = (Number(claimValue) || 0) + (Number(compensationValue) || 0);
  const result = calculateCourtFeeAndJurisdiction(totalValue);

  return (
    <div className="court-calc-modal-backdrop" onClick={onClose}>
      <div className="court-calc-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="court-calc-header">
          <div className="calc-title-group">
            <FaGavel className="calc-header-icon" />
            <div>
              <h3>CPA 2019 Jurisdiction & Court Fee Calculator</h3>
              <p>Official statutory pecuniary limits & filing fees under Consumer Protection Rules, 2020</p>
            </div>
          </div>
          {onClose && (
            <button type="button" className="btn-close-calc" onClick={onClose} aria-label="Close calculator">
              <FaTimes />
            </button>
          )}
        </div>

        <div className="court-calc-body">
          <div className="calc-inputs-grid">
            <div className="calc-input-group">
              <label>1. Value of Goods / Services / Disputed Transaction (₹):</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={claimValue}
                onChange={(e) => setClaimValue(Math.max(0, Number(e.target.value)))}
                placeholder="e.g. 25000"
              />
            </div>

            <div className="calc-input-group">
              <label>2. Compensation Claimed for Mental Agony / Loss (₹):</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={compensationValue}
                onChange={(e) => setCompensationValue(Math.max(0, Number(e.target.value)))}
                placeholder="e.g. 10000"
              />
            </div>
          </div>

          <div className="calc-total-pill">
            <span>Total Pecuniary Consideration (Pecuniary Value):</span>
            <strong>₹{totalValue.toLocaleString("en-IN")}</strong>
          </div>

          {/* Results Display */}
          <div className="calc-results-card">
            <div className="results-tier-banner">
              <span className="tier-tag">Appropriate Legal Forum</span>
              <h4>{result.tier.name}</h4>
              <p className="tier-jurisdiction">{result.tier.jurisdiction}</p>
            </div>

            <div className="fee-breakdown-box">
              <div className="fee-row">
                <span>Statutory e-Daakhil Court Fee:</span>
                <strong className={result.isFree ? "text-free" : "text-fee"}>
                  {result.isFree ? "₹0 (FREE / Exempted)" : `₹${result.statutoryFee}`}
                </strong>
              </div>
              <div className="fee-desc-sub">{result.feeCategory}</div>
            </div>

            <div className="calc-rules-list">
              <div className="rule-item">
                <FaCheckCircle className="rule-icon" />
                <div>
                  <strong>Limitation Period (Section 69):</strong>
                  <span>2 Years from the incident date to file formal complaint.</span>
                </div>
              </div>
              <div className="rule-item">
                <FaCheckCircle className="rule-icon" />
                <div>
                  <strong>Appellate Forum:</strong>
                  <span>Appeals lie to {result.tier.appealTo} within {result.tier.appealTimeframe}.</span>
                </div>
              </div>
              <div className="rule-item">
                <FaInfoCircle className="rule-icon info" />
                <div>
                  <strong>Appellate Pre-Deposit:</strong>
                  <span>{result.appealDepositRequirement}.</span>
                </div>
              </div>
            </div>

            <div className="calc-cta-row">
              <a
                href={result.eDaakhilFilingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-edaakhil-direct"
              >
                Launch e-Daakhil Filing Portal <FaExternalLinkAlt style={{ fontSize: 10 }} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
