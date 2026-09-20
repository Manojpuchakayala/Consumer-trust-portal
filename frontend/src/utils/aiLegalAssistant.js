// AI Legal Grievance Enhancer & Statutory Clause Mapper

export const enhanceGrievanceDescription = ({
  companyName = "the Enterprise",
  category = "Product",
  orderOrTransactionId = "",
  rawSubject = "",
  rawDescription = "",
  selectedReliefs = [],
}) => {
  const effectiveRef = orderOrTransactionId
    ? "bearing Order/Transaction Reference ID: " + orderOrTransactionId
    : "for the recent transaction/service interaction";

  let legalSection = "Section 2(47) (Unfair Trade Practice) and Section 2(11) (Deficiency in Service) of the Consumer Protection Act, 2019";
  if (category === "Banking") {
    legalSection = "RBI Master Directions on Digital Payment Transactions and Customer Protection (Limiting Liability of Customers in Unauthorized Electronic Banking Transactions)";
  } else if (category === "Food") {
    legalSection = "FSSAI Food Safety Norms & Section 2(11) (Deficiency in Consumer Goods/Services) of the Consumer Protection Act, 2019";
  } else if (category === "Telecom") {
    legalSection = "TRAI Quality of Service (QoS) Regulations & Telecom Consumer Protection Directives";
  }

  const reliefBullets = selectedReliefs.length > 0
    ? selectedReliefs.map((r) => "• " + r).join("\n")
    : "• Immediate full refund of the amount paid with statutory interest.\n• Formal written acknowledgment and compensation for undue mental agony and inconvenience.";

  return "1. STATEMENT OF FACTS & CHRONOLOGY:\n" +
"I am filing this formal consumer grievance against " + companyName + " " + effectiveRef + ".\n" +
(rawDescription ? rawDescription.trim() : "The consumer transaction resulted in severe deficiency in service, breach of warranty/terms, and failure by the merchant/service provider to provide legitimate resolution.") + "\n\n" +
"2. STATUTORY VIOLATION & LEGAL GROUNDS:\n" +
"The conduct of the enterprise violates " + legalSection + ". Despite genuine attempts to resolve this issue through customer support channels, the grievance remains unaddressed, causing financial loss and harassment.\n\n" +
"3. SPECIFIC RELIEF SOUGHT:\n" +
"In accordance with consumer protection mandates, I hereby seek:\n" +
reliefBullets + "\n\n" +
"4. NOTICE TO NODAL OFFICER:\n" +
"Please treat this as formal notice under the 7-Day Statutory Grievance Redressal SLA. In the event of non-redressal within 168 hours, this docket shall be escalated to the Statutory Ombudsman / e-Daakhil Consumer Court with timestamped logs.";
};

export const COMMON_RELIEFS = [
  "Full Refund of Amount Paid (₹)",
  "Immediate Replacement of Defective Unit",
  "Compensation for Mental Harassment & Delay",
  "Rectification of Billing / Incorrect Charges",
  "Unblocking of Account / Wallet Balance",
  "Written Apology & Compliance Confirmation",
];
