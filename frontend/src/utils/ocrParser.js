/**
 * Invoice & Receipt OCR Auto-Form Extraction Engine
 * Parses invoice images, receipts, warranty cards & order screenshots
 * to extract structured complaint metadata (Merchant, Order ID, Amount, Date).
 */

const KNOWN_MERCHANTS = [
  { name: "Amazon India", category: "E-Commerce & Online Shopping", keywords: ["amazon", "amazon.in", "cloudtail", "appario"] },
  { name: "Flipkart", category: "E-Commerce & Online Shopping", keywords: ["flipkart", "supercoins", "ekart"] },
  { name: "Swiggy", category: "Food Delivery & Dining", keywords: ["swiggy", "bundl technologies", "instamart"] },
  { name: "Zomato", category: "Food Delivery & Dining", keywords: ["zomato", "blinkit", "hyperpure"] },
  { name: "Myntra", category: "E-Commerce & Online Shopping", keywords: ["myntra", "vector e-commerce"] },
  { name: "Meesho", category: "E-Commerce & Online Shopping", keywords: ["meesho", "fashnear"] },
  { name: "Air India", category: "Airlines & Travel Booking", keywords: ["air india", "tata sia", "airindia"] },
  { name: "IndiGo", category: "Airlines & Travel Booking", keywords: ["indigo", "interglobe aviation", "6e"] },
  { name: "MakeMyTrip", category: "Airlines & Travel Booking", keywords: ["makemytrip", "mmt"] },
  { name: "Uber", category: "Ride-Hailing & Logistics", keywords: ["uber", "uber india"] },
  { name: "Ola", category: "Ride-Hailing & Logistics", keywords: ["ola", "ani technologies", "ola cabs", "ola electric"] },
  { name: "State Bank of India (SBI)", category: "Banking, Credit Cards & Insurance", keywords: ["sbi", "state bank of india", "onlinesbi"] },
  { name: "HDFC Bank", category: "Banking, Credit Cards & Insurance", keywords: ["hdfc", "hdfc bank"] },
  { name: "ICICI Bank", category: "Banking, Credit Cards & Insurance", keywords: ["icici", "icici bank"] },
  { name: "Reliance Jio", category: "Telecom, DTH & Internet", keywords: ["jio", "reliance jio", "jiocare"] },
  { name: "Bharti Airtel", category: "Telecom, DTH & Internet", keywords: ["airtel", "bharti airtel"] },
  { name: "Samsung Electronics", category: "Electronics & Home Appliances", keywords: ["samsung", "samsung india"] },
  { name: "Apple India", category: "Electronics & Home Appliances", keywords: ["apple", "apple.com/in", "apple india"] },
  { name: "BookMyShow", category: "Entertainment, OTT & Ticketing", keywords: ["bookmyshow", "bigtree entertainment"] },
  { name: "Tata Power", category: "Electricity, Gas & Utilities", keywords: ["tata power", "tpddl"] },
  { name: "Urban Company", category: "Home Services & Maintenance", keywords: ["urban company", "urban clap"] },
  { name: "BYJU'S", category: "EdTech & Online Education", keywords: ["byju", "byjus", "think and learn"] },
];

/**
 * Extracts structured fields from raw invoice text / OCR string
 * @param {string} rawText
 * @returns {object} Extracted fields
 */
export function extractInvoiceFields(rawText = "") {
  const text = rawText.toLowerCase();

  // 1. Detect Merchant
  let matchedMerchant = null;
  for (const merchant of KNOWN_MERCHANTS) {
    if (merchant.keywords.some((kw) => text.includes(kw))) {
      matchedMerchant = merchant;
      break;
    }
  }

  // 2. Detect Order / Invoice / PNR ID
  let orderId = "";
  // Amazon format: 408-1234567-1234567
  const amazonMatch = rawText.match(/\b\d{3}-\d{7}-\d{7}\b/);
  // Flipkart format: OD123456789... or OD followed by 16+ digits
  const flipkartMatch = rawText.match(/\bOD\d{14,18}\b/i);
  // Airline 6-char PNR: e.g. PNR: ABC12D or PNR ABCDEF
  const pnrMatch = rawText.match(/\b(?:pnr|booking\s*(?:id|ref|no|#)?)\s*[:#\-]?\s*([A-Z0-9]{5,7})\b/i);
  // Bank UTR / UPI Ref: 12 digit number
  const utrMatch = rawText.match(/\b(?:utr|upi\s*ref|rrn)\s*[:#\-]?\s*(\d{12})\b/i);
  // Generic Invoice/Order Ref: e.g. Order #12345, Inv-98765
  const genericMatch = rawText.match(/\b(?:order|invoice|bill|receipt|ref|docket|tx)\s*(?:no|id|number|#)?\s*[:#\-]?\s*([A-Z0-9\-_]{5,20})\b/i);

  if (amazonMatch) {
    orderId = amazonMatch[0];
  } else if (flipkartMatch) {
    orderId = flipkartMatch[0].toUpperCase();
  } else if (pnrMatch && pnrMatch[1]) {
    orderId = pnrMatch[1].toUpperCase();
  } else if (utrMatch && utrMatch[1]) {
    orderId = utrMatch[1];
  } else if (genericMatch && genericMatch[1]) {
    orderId = genericMatch[1].trim();
  }

  // 3. Detect Amount (₹)
  let amount = null;
  // Look for ₹, INR, Rs., Total: Rs 4,500.00
  const amountPatterns = [
    /(?:grand\s*total|total\s*amount|net\s*payable|amount\s*paid|paid\s*amount|total)\s*[:=]?\s*(?:₹|inr|rs\.?)?\s*([0-9,]+(?:\.[0-9]{2})?)/i,
    /(?:₹|inr|rs\.?)\s*([0-9,]+(?:\.[0-9]{2})?)/i,
    /\b([0-9]{2,6}(?:\.[0-9]{2})?)\s*(?:paid|inr|rupees)\b/i,
  ];

  for (const pattern of amountPatterns) {
    const match = rawText.match(pattern);
    if (match && match[1]) {
      const numStr = match[1].replace(/,/g, "");
      const parsedNum = parseFloat(numStr);
      if (parsedNum > 0 && parsedNum < 10000000) {
        amount = parsedNum;
        break;
      }
    }
  }

  // 4. Detect Date
  let dateStr = "";
  const datePatterns = [
    /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/,
    /\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,]+\d{2,4})\b/i,
  ];

  for (const pattern of datePatterns) {
    const match = rawText.match(pattern);
    if (match && match[1]) {
      dateStr = match[1];
      break;
    }
  }

  return {
    merchantName: matchedMerchant ? matchedMerchant.name : "",
    category: matchedMerchant ? matchedMerchant.category : "",
    orderId: orderId,
    amount: amount,
    date: dateStr,
    confidence: (matchedMerchant ? 40 : 0) + (orderId ? 35 : 0) + (amount ? 25 : 0),
  };
}
