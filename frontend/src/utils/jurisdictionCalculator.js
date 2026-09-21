/**
 * CPA 2019 Pecuniary Jurisdiction & Court Fee Calculator
 * Compliant with Consumer Protection Act, 2019 and Consumer Protection
 * (Consumer Disputes Redressal Commission) Rules, 2020.
 */

export const COURT_TIERS = {
  DISTRICT: {
    name: "District Consumer Disputes Redressal Commission (DCDRC)",
    jurisdiction: "Claims up to ₹50 Lakhs (Section 34)",
    maxAmount: 5000000,
    appealTo: "State Consumer Disputes Redressal Commission",
    appealTimeframe: "45 days from date of order",
  },
  STATE: {
    name: "State Consumer Disputes Redressal Commission (SCDRC)",
    jurisdiction: "Claims from ₹50 Lakhs up to ₹2 Crores (Section 47)",
    minAmount: 5000000,
    maxAmount: 20000000,
    appealTo: "National Consumer Disputes Redressal Commission (NCDRC)",
    appealTimeframe: "30 days from date of order",
  },
  NATIONAL: {
    name: "National Consumer Disputes Redressal Commission (NCDRC)",
    jurisdiction: "Claims exceeding ₹2 Crores (Section 58)",
    minAmount: 20000000,
    maxAmount: Infinity,
    appealTo: "Supreme Court of India (Section 67)",
    appealTimeframe: "30 days from date of order",
  },
};

/**
 * Calculates statutory court fees payable under CPA 2019 Rules
 * @param {number} totalClaimValue - Value of goods/services + compensation claimed
 * @returns {object} Calculated fee details, tier, and breakdown
 */
export function calculateCourtFeeAndJurisdiction(totalClaimValue = 0) {
  const amount = Math.max(0, Number(totalClaimValue) || 0);

  let tier = COURT_TIERS.DISTRICT;
  let statutoryFee = 0;
  let feeCategory = "";

  if (amount <= 500000) {
    // Up to 5 Lakhs: Exemption for small consumers
    statutoryFee = 0;
    feeCategory = "Exempted / Nil (Empowerment of small consumers)";
    tier = COURT_TIERS.DISTRICT;
  } else if (amount <= 1000000) {
    // Above 5L up to 10L
    statutoryFee = 200;
    feeCategory = "₹5,00,000 to ₹10,00,000 (Standard District Fee)";
    tier = COURT_TIERS.DISTRICT;
  } else if (amount <= 2000000) {
    // Above 10L up to 20L
    statutoryFee = 400;
    feeCategory = "₹10,00,000 to ₹20,00,000 (District Commission Fee)";
    tier = COURT_TIERS.DISTRICT;
  } else if (amount <= 5000000) {
    // Above 20L up to 50L
    statutoryFee = 1000;
    feeCategory = "₹20,00,000 to ₹50,00,000 (Upper District Commission Fee)";
    tier = COURT_TIERS.DISTRICT;
  } else if (amount <= 10000000) {
    // Above 50L up to 1 Crore
    statutoryFee = 2000;
    feeCategory = "₹50,00,000 to ₹1,00,00,000 (State Commission Fee)";
    tier = COURT_TIERS.STATE;
  } else if (amount <= 20000000) {
    // Above 1 Cr up to 2 Crores
    statutoryFee = 2500;
    feeCategory = "₹1,00,00,000 to ₹2,00,00,000 (Upper State Commission Fee)";
    tier = COURT_TIERS.STATE;
  } else {
    // Above 2 Crores
    statutoryFee = 7500;
    feeCategory = "Exceeding ₹2,00,00,000 (National Commission / NCDRC Fee)";
    tier = COURT_TIERS.NATIONAL;
  }

  // Pre-deposit for Appeal requirement
  const appealDepositRequirement = tier === COURT_TIERS.DISTRICT
    ? "50% of ordered amount before State Commission"
    : tier === COURT_TIERS.STATE
    ? "50% of ordered amount before National Commission"
    : "50% of ordered amount before Supreme Court of India";

  return {
    amount,
    tier,
    statutoryFee,
    feeCategory,
    isFree: statutoryFee === 0,
    appealDepositRequirement,
    statutoryNoticePeriod: "15 Days mandatory notice under standard civil procedure",
    eDaakhilFilingUrl: "https://edaakhil.nic.in",
    limitationPeriod: "2 Years from the date on which the cause of action arose (Section 69)",
  };
}
