// AI Drafting Assistant, Legal Clause Recommender & Evidence Strength Scorer
// Note: This utility provides automated dispute statement structuring and claim evaluation pursuant to the Consumer Protection Act, 2019. It does not constitute formal legal representation.

export const enhanceGrievanceDescription = ({
  companyName = "the Enterprise",
  category = "Product",
  orderOrTransactionId = "",
  rawSubject = "",
  rawDescription = "",
  selectedReliefs = [],
}) => {
  const effectiveRef = orderOrTransactionId
    ? "bearing Order / Transaction Reference ID: " + orderOrTransactionId
    : "for the recent transaction / service interaction";

  let legalContext = "Consumer Protection Act, 2019 provisions regarding Deficiency in Service (Section 2(11)) and Unfair Trade Practices (Section 2(47))";
  if (category === "Banking") {
    legalContext = "RBI Customer Protection Directives, Limited Liability in Unauthorized Electronic Transactions, and Consumer Protection Act, 2019";
  } else if (category === "Food") {
    legalContext = "FSSAI Food Quality & Safety Norms, and Consumer Protection Act, 2019";
  } else if (category === "Telecom") {
    legalContext = "TRAI Consumer Quality of Service (QoS) Directives and Consumer Protection Act, 2019";
  } else if (category === "Travel") {
    legalContext = "Ministry of Civil Aviation Passenger Charter Guidelines, DGCA CAR Regulations, and Consumer Protection Norms";
  }

  const reliefBullets = selectedReliefs.length > 0
    ? selectedReliefs.map((r) => "• " + r).join("\n")
    : "• Prompt full refund of the amount paid for unfulfilled or deficient goods/services.\n• Formal written explanation and rectification of the dispute.";

  return "1. STATEMENT OF FACTS & CHRONOLOGY:\n" +
"I am submitting this grievance regarding " + companyName + " " + effectiveRef + ".\n" +
(rawDescription ? rawDescription.trim() : "The transaction resulted in deficiency of service / product defects that were not resolved through initial customer care interactions.") + "\n\n" +
"2. DISPUTE CONTEXT & CONSUMER RIGHTS:\n" +
"This matter falls under " + legalContext + ". The complainant seeks fair commercial resolution and accountability for the inconvenience and financial impact caused.\n\n" +
"3. SPECIFIC RELIEF SOUGHT:\n" +
reliefBullets + "\n\n" +
"4. REQUEST TO GRIEVANCE OFFICER:\n" +
"The grievance officer is kindly requested to review this dispute for prompt amicable redressal within the standard 7-day resolution window. If unresolved, the consumer reserves the option to escalate via statutory mechanisms including the National Consumer Helpline (1915) or e-Daakhil.";
};

/**
 * Calculates real-time evidence strength score (0-100%) and actionable tips
 */
export const calculateClaimScore = (formData = {}, files = []) => {
  let score = 25; // Base starting score for filing
  const breakdown = [];

  // Order / Transaction Ref ID
  if (formData.orderOrTransactionId && formData.orderOrTransactionId.trim().length >= 3) {
    score += 20;
    breakdown.push({ label: "Order / Ref ID provided", points: "+20%", met: true });
  } else {
    breakdown.push({ label: "Add Order / Transaction ID", points: "+20%", met: false });
  }

  // Description Detail
  const descLength = (formData.description || "").trim().length;
  if (descLength >= 120) {
    score += 25;
    breakdown.push({ label: "Detailed factual narrative (120+ chars)", points: "+25%", met: true });
  } else if (descLength >= 40) {
    score += 15;
    breakdown.push({ label: "Moderate narrative (expand for higher score)", points: "+15%", met: true });
  } else {
    breakdown.push({ label: "Add specific dates & timeline facts", points: "+25%", met: false });
  }

  // Evidence Files
  if (files && files.length >= 2) {
    score += 30;
    breakdown.push({ label: `${files.length} evidence document(s) attached`, points: "+30%", met: true });
  } else if (files && files.length === 1) {
    score += 20;
    breakdown.push({ label: "1 evidence document attached", points: "+20%", met: true });
  } else {
    breakdown.push({ label: "Attach invoice, receipt, or email screenshot", points: "+30%", met: false });
  }

  score = Math.min(100, Math.max(0, score));

  let level = "Basic Claim";
  let badgeColor = "#b45309";
  if (score >= 80) {
    level = "High-Strength Claim (Ready for Corporate Redressal)";
    badgeColor = "#15803d";
  } else if (score >= 50) {
    level = "Moderate Strength (Solid Case)";
    badgeColor = "#2563eb";
  }

  return {
    score,
    level,
    badgeColor,
    breakdown,
  };
};

/**
 * Recommends relevant Consumer Protection Act 2019 legal sections based on dispute category
 */
export const getApplicableCpaSections = (category = "Product") => {
  switch (category) {
    case "Banking":
      return [
        { section: "Section 2(11)", title: "Deficiency of Service", desc: "Covers failure, negligence, or unauthorized financial transactions." },
        { section: "RBI Directive 2017", title: "Zero Liability in Unauthorized Electronic Banking", desc: "Protection against unauthorized electronic funds transfer." },
      ];
    case "Food":
      return [
        { section: "Section 2(47)", title: "Unfair Trade Practice", desc: "Deceptive delivery, spoilt goods, or refusal to refund unfulfilled items." },
        { section: "Section 2(34)", title: "Product Liability", desc: "Liability for harm or defect in delivered consumer goods." },
      ];
    case "Telecom":
      return [
        { section: "Section 2(11)", title: "Deficiency in Telecom Service", desc: "Failure to maintain mandated Quality of Service (QoS) standards." },
        { section: "TRAI Directives", title: "Billing Discrepancies & Porting Rights", desc: "Redressal of unwarranted deductions and tariff violations." },
      ];
    case "Travel":
      return [
        { section: "DGCA CAR Section 3", title: "Passenger Rights & Cancellation Refund", desc: "Mandatory refunds for canceled/delayed flights and lost baggage." },
        { section: "Section 2(47)", title: "Misleading Booking & Hidden Charges", desc: "Unfair commercial practices in travel facilitation." },
      ];
    default:
      return [
        { section: "Section 2(47)", title: "Unfair Trade Practice", desc: "False representations regarding quality, delivery, or warranty terms." },
        { section: "Section 2(11)", title: "Deficiency in Service", desc: "Inadequate redressal or refusal of legitimate replacement/refund." },
        { section: "Section 84", title: "Product Seller / Manufacturer Liability", desc: "Statutory obligation to deliver conforming goods." },
      ];
  }
};

export const COMMON_RELIEFS = [
  "Full Refund of Amount Paid (₹)",
  "Immediate Replacement of Defective Unit",
  "Compensation for Delay & Inconvenience",
  "Rectification of Billing / Incorrect Charges",
  "Unblocking of Account / Wallet Balance",
  "Written Resolution & Settlement Confirmation",
];

export const AI_ASSISTANT_DISCLAIMER =
  "AI Drafting Assistant provides automated formatting to structure dispute facts and relief requests clearly. It does not provide formal legal advice or representation. Please verify and edit all generated text before submission.";
