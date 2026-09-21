// AI Drafting Assistant & Grievance Formatter
// Note: This utility provides automated dispute statement structuring and does not provide legal advice.

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

  let legalContext = "Consumer Protection Act, 2019 provisions regarding Deficiency in Service and Unfair Trade Practices";
  if (category === "Banking") {
    legalContext = "RBI Customer Protection Directives and Electronic Banking Dispute Guidelines";
  } else if (category === "Food") {
    legalContext = "FSSAI Food Quality Directives and Consumer Protection Act, 2019";
  } else if (category === "Telecom") {
    legalContext = "TRAI Consumer Quality of Service (QoS) Directives";
  } else if (category === "Travel") {
    legalContext = "Ministry of Civil Aviation / Passenger Charter Guidelines and Consumer Protection Norms";
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
