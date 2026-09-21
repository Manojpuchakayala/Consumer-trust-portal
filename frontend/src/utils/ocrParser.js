/**
 * Invoice & Receipt OCR Auto-Form Extraction Engine
 * Parses invoice images, receipts, warranty cards & order screenshots
 * to extract structured complaint metadata (Merchant, Order ID, Amount, Date).
 */

const KNOWN_MERCHANTS = [
  // E-Commerce & Retail
  { name: "Amazon India", category: "Product", keywords: ["amazon", "amazon.in", "cloudtail", "appario", "amazon pay", "prime"] },
  { name: "Flipkart", category: "Product", keywords: ["flipkart", "supercoins", "ekart", "shopsy", "cleartrip private limited"] },
  { name: "Myntra", category: "Product", keywords: ["myntra", "vector e-commerce"] },
  { name: "Meesho", category: "Product", keywords: ["meesho", "fashnear"] },
  { name: "Ajio (Reliance Retail)", category: "Product", keywords: ["ajio", "reliance retail", "relianceretail"] },
  { name: "Nykaa", category: "Product", keywords: ["nykaa", "fsn e-commerce"] },
  { name: "Tata CLiQ", category: "Product", keywords: ["tata cliq", "tatacliq", "tata unistore"] },
  { name: "JioMart (Reliance)", category: "Product", keywords: ["jiomart", "jio mart"] },
  { name: "Croma Electronics", category: "Product", keywords: ["croma", "infiniti retail"] },
  { name: "Reliance Digital", category: "Product", keywords: ["reliance digital", "reliancedigital"] },
  { name: "Vijay Sales", category: "Product", keywords: ["vijay sales", "vijaysales"] },
  { name: "Lenskart", category: "Product", keywords: ["lenskart", "valyoo"] },
  { name: "FirstCry", category: "Product", keywords: ["firstcry", "brainbees"] },
  { name: "Snapdeal", category: "Product", keywords: ["snapdeal", "jasper infotech"] },

  // Food, Dining & Quick Commerce
  { name: "Zomato", category: "Food", keywords: ["zomato", "hyperpure", "eternal"] },
  { name: "Swiggy", category: "Food", keywords: ["swiggy", "bundl technologies", "instamart", "swiggy dineout", "dineout"] },
  { name: "Blinkit", category: "Food", keywords: ["blinkit", "grofers", "blink commerce"] },
  { name: "Zepto", category: "Food", keywords: ["zepto", "kiranakart"] },
  { name: "BigBasket", category: "Food", keywords: ["bigbasket", "supermarket grocery", "bb now", "bbdaily"] },
  { name: "Domino's Pizza India", category: "Food", keywords: ["domino", "dominos", "jubilant foodworks"] },
  { name: "McDonald's India", category: "Food", keywords: ["mcdonald", "mcdonalds", "westlife", "hardcastle", "connaught plaza"] },
  { name: "KFC India (Yum! Brands)", category: "Food", keywords: ["kfc", "yum brands", "sapphire foods", "devyani international"] },
  { name: "Pizza Hut India", category: "Food", keywords: ["pizza hut", "pizzahut"] },
  { name: "Burger King India", category: "Food", keywords: ["burger king", "burgerking", "restaurant brands asia"] },
  { name: "Tata Starbucks India", category: "Food", keywords: ["starbucks", "tata starbucks"] },

  // Banking, Cards, UPI & Fintech
  { name: "State Bank of India (SBI)", category: "Banking", keywords: ["sbi", "state bank of india", "onlinesbi", "sbi card"] },
  { name: "HDFC Bank", category: "Banking", keywords: ["hdfc", "hdfc bank", "hdfcbank", "hdfc ergo"] },
  { name: "ICICI Bank", category: "Banking", keywords: ["icici", "icici bank", "icicibank", "icici lombard", "icici prudential"] },
  { name: "Axis Bank", category: "Banking", keywords: ["axis bank", "axisbank"] },
  { name: "Kotak Mahindra Bank", category: "Banking", keywords: ["kotak", "kotak mahindra", "811"] },
  { name: "Punjab National Bank (PNB)", category: "Banking", keywords: ["pnb", "punjab national bank"] },
  { name: "Bank of Baroda", category: "Banking", keywords: ["bank of baroda", "bob world"] },
  { name: "IDFC FIRST Bank", category: "Banking", keywords: ["idfc", "idfc first"] },
  { name: "PhonePe (UPI & Payments)", category: "Banking", keywords: ["phonepe", "phone pe"] },
  { name: "Paytm Payments", category: "Banking", keywords: ["paytm", "one97", "paytm payments bank"] },
  { name: "Google Pay India", category: "Banking", keywords: ["google pay", "gpay", "google payment"] },
  { name: "CRED", category: "Banking", keywords: ["cred", "dreamplug"] },
  { name: "BharatPe", category: "Banking", keywords: ["bharatpe", "resilient innovations"] },
  { name: "Zerodha Broking", category: "Banking", keywords: ["zerodha", "kite zerodha"] },
  { name: "Groww", category: "Banking", keywords: ["groww", "nextbillion technology"] },

  // Telecom & Internet
  { name: "Reliance Jio Infocomm", category: "Telecom", keywords: ["jio", "reliance jio", "jiocare", "jio fiber", "jio airfiber"] },
  { name: "Bharti Airtel", category: "Telecom", keywords: ["airtel", "bharti airtel", "airtel xstream", "airtel thanks"] },
  { name: "Vodafone Idea (Vi)", category: "Telecom", keywords: ["vodafone", "vodafone idea", " vi ", "myvi", "vodafone-idea"] },
  { name: "BSNL India", category: "Telecom", keywords: ["bsnl", "bharat sanchar nigam"] },
  { name: "ACT Fibernet", category: "Telecom", keywords: ["act fibernet", "act broadband", "atria convergence"] },

  // Travel & Airlines
  { name: "MakeMyTrip", category: "Travel", keywords: ["makemytrip", "mmt"] },
  { name: "IRCTC (Indian Railways)", category: "Travel", keywords: ["irctc", "indian railways", "cris", "railway"] },
  { name: "IndiGo Airlines", category: "Travel", keywords: ["indigo", "interglobe aviation", "6e"] },
  { name: "Air India", category: "Travel", keywords: ["air india", "tata sia", "airindia"] },
  { name: "SpiceJet Airlines", category: "Travel", keywords: ["spicejet", "spice jet"] },
  { name: "Akasa Air", category: "Travel", keywords: ["akasa air", "akasa", "snv aviation"] },
  { name: "Uber India", category: "Travel", keywords: ["uber", "uber india", "uber trip"] },
  { name: "Ola Cabs", category: "Travel", keywords: ["ola", "ani technologies", "ola cabs"] },
  { name: "Rapido Bike Taxi", category: "Travel", keywords: ["rapido", "roppen transportation"] },
  { name: "EaseMyTrip", category: "Travel", keywords: ["easemytrip", "easy trip planners"] },
  { name: "Cleartrip", category: "Travel", keywords: ["cleartrip"] },
  { name: "OYO Rooms", category: "Travel", keywords: ["oyo", "oyo rooms", "oravel stays"] },

  // Hardware, Electronics & Appliances
  { name: "Samsung Electronics India", category: "Product", keywords: ["samsung", "samsung india"] },
  { name: "Apple India", category: "Product", keywords: ["apple", "apple.com/in", "apple india", "apple store", "iphone"] },
  { name: "Xiaomi / Redmi India", category: "Product", keywords: ["xiaomi", "redmi", "mi.com", "mi india", "poco"] },
  { name: "OnePlus India", category: "Product", keywords: ["oneplus", "one plus"] },
  { name: "Realme India", category: "Product", keywords: ["realme"] },
  { name: "Vivo India", category: "Product", keywords: ["vivo", "vivo mobile"] },
  { name: "Oppo India", category: "Product", keywords: ["oppo", "oppo mobile"] },
  { name: "Sony India", category: "Product", keywords: ["sony", "sony india", "playstation"] },
  { name: "HP India (Hewlett Packard)", category: "Product", keywords: ["hp", "hewlett packard"] },
  { name: "Dell Technologies India", category: "Product", keywords: ["dell", "dell india"] },
  { name: "Lenovo India", category: "Product", keywords: ["lenovo"] },
  { name: "boAt Lifestyle", category: "Product", keywords: ["boat", "imagine marketing"] },
  { name: "LG Electronics India", category: "Product", keywords: ["lg electronics", "lg india"] },
  { name: "Whirlpool of India", category: "Product", keywords: ["whirlpool"] },
  { name: "Voltas (Tata Enterprise)", category: "Product", keywords: ["voltas", "voltas beko"] },
  { name: "Havells India (Lloyd)", category: "Product", keywords: ["havells", "lloyd"] },
  { name: "Godrej Appliances", category: "Product", keywords: ["godrej", "godrej appliances"] },

  // Automotive & EV
  { name: "Tata Motors Passenger Vehicles", category: "Product", keywords: ["tata motors", "tata passenger"] },
  { name: "Maruti Suzuki India", category: "Product", keywords: ["maruti", "maruti suzuki", "arena", "nexa"] },
  { name: "Hyundai Motor India", category: "Product", keywords: ["hyundai"] },
  { name: "Mahindra & Mahindra", category: "Product", keywords: ["mahindra"] },
  { name: "Ola Electric Mobility", category: "Product", keywords: ["ola electric", "s1 pro", "s1 air"] },
  { name: "Ather Energy", category: "Product", keywords: ["ather", "ather energy", "450x"] },

  // Insurance, EdTech & Utilities
  { name: "Life Insurance Corporation (LIC)", category: "Banking", keywords: ["lic", "life insurance corporation"] },
  { name: "Star Health Insurance", category: "Banking", keywords: ["star health", "star health and allied"] },
  { name: "BYJU'S", category: "Other", keywords: ["byju", "byjus", "think and learn"] },
  { name: "Urban Company", category: "Service", keywords: ["urban company", "urban clap"] },
  { name: "BookMyShow", category: "Service", keywords: ["bookmyshow", "bigtree"] }
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

  // 2. Detect Order / Invoice / PNR ID / Transaction Ref
  let orderId = "";
  // Amazon format: 408-1234567-1234567 or 171-1234567-1234567
  const amazonMatch = rawText.match(/\b\d{3}-\d{7}-\d{7}\b/);
  // Flipkart format: OD123456789... or OD followed by 14-18 digits
  const flipkartMatch = rawText.match(/\bOD\d{12,20}\b/i);
  // Swiggy / Zomato order ID: #SW-12345678, Order #1234567890
  const foodMatch = rawText.match(/\b(?:order\s*#?|sw-|zom-|blink-|zep-)([A-Z0-9\-_]{6,16})\b/i);
  // Airline 6-char PNR: e.g. PNR: ABC12D or PNR ABCDEF
  const pnrMatch = rawText.match(/\b(?:pnr|booking\s*(?:id|ref|no|#)?)\s*[:#\-]?\s*([A-Z0-9]{5,7})\b/i);
  // IRCTC 10-digit PNR
  const trainPnrMatch = rawText.match(/\b(?:pnr\s*no\.?|pnr)\s*[:#\-]?\s*(\d{10})\b/i);
  // Bank UTR / UPI Ref / RRN: 12 digit number
  const utrMatch = rawText.match(/\b(?:utr|upi\s*ref|rrn|txn\s*id)\s*[:#\-]?\s*(\d{12})\b/i);
  // Generic Invoice/Bill/Receipt Ref: e.g. INV-2024-0012, DL-100234
  const genericMatch = rawText.match(/\b(?:order|invoice|bill|receipt|ref|docket|tx|inv)\s*(?:no|id|number|#)?\s*[:#\-]?\s*([A-Z0-9\-_]{5,22})\b/i);

  if (amazonMatch) {
    orderId = amazonMatch[0];
  } else if (flipkartMatch) {
    orderId = flipkartMatch[0].toUpperCase();
  } else if (trainPnrMatch && trainPnrMatch[1]) {
    orderId = `PNR: ${trainPnrMatch[1]}`;
  } else if (pnrMatch && pnrMatch[1]) {
    orderId = pnrMatch[1].toUpperCase();
  } else if (foodMatch && foodMatch[1]) {
    orderId = foodMatch[1].trim();
  } else if (utrMatch && utrMatch[1]) {
    orderId = utrMatch[1];
  } else if (genericMatch && genericMatch[1]) {
    orderId = genericMatch[1].trim();
  }

  // 3. Detect Disputed / Paid Amount (₹)
  let amount = null;
  const amountPatterns = [
    /(?:grand\s*total|total\s*amount|net\s*payable|amount\s*paid|paid\s*amount|invoice\s*value|total)\s*[:=]?\s*(?:₹|inr|rs\.?|inr\.)?\s*([0-9,]+(?:\.[0-9]{2})?)/i,
    /(?:₹|inr|rs\.?)\s*([0-9,]+(?:\.[0-9]{2})?)/i,
    /\b([0-9]{2,7}(?:\.[0-9]{2})?)\s*(?:paid|inr|rupees)\b/i,
  ];

  for (const pattern of amountPatterns) {
    const match = rawText.match(pattern);
    if (match && match[1]) {
      const numStr = match[1].replace(/,/g, "");
      const parsedNum = parseFloat(numStr);
      if (parsedNum > 0 && parsedNum < 100000000) {
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

  const confidenceScore =
    (matchedMerchant ? 40 : 0) +
    (orderId ? 35 : 0) +
    (amount ? 25 : 0);

  return {
    merchantName: matchedMerchant ? matchedMerchant.name : "",
    category: matchedMerchant ? matchedMerchant.category : "Product",
    orderId: orderId,
    amount: amount,
    date: dateStr,
    confidence: confidenceScore,
  };
}
