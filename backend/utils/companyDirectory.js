/**
 * National Enterprise & Nodal Officer Directory
 * Stores pre-configured official grievance nodal emails, ombudsman categories, and resolution SLAs.
 */

const COMPANY_DIRECTORY = [
  // --- E-Commerce & Marketplaces ---
  {
    id: "amazon",
    name: "Amazon India",
    category: "Product",
    nodalEmail: "grievance-officer@amazon.in",
    supportEmail: "cs-reply@amazon.in",
    ombudsman: "National Consumer Disputes Redressal Commission (NCDRC / e-Daakhil)",
    slaHours: 48,
    slaDays: 7,
  },
  {
    id: "flipkart",
    name: "Flipkart",
    category: "Product",
    nodalEmail: "grievance.officer@flipkart.com",
    supportEmail: "support@flipkart.com",
    ombudsman: "National Consumer Disputes Redressal Commission (NCDRC / e-Daakhil)",
    slaHours: 48,
    slaDays: 7,
  },
  {
    id: "myntra",
    name: "Myntra",
    category: "Product",
    nodalEmail: "grievanceofficer@myntra.com",
    supportEmail: "support@myntra.com",
    ombudsman: "National Consumer Helpline (1915)",
    slaHours: 48,
    slaDays: 7,
  },
  {
    id: "meesho",
    name: "Meesho",
    category: "Product",
    nodalEmail: "grievance-officer@meesho.com",
    supportEmail: "help@meesho.com",
    ombudsman: "National Consumer Helpline (1915)",
    slaHours: 48,
    slaDays: 7,
  },
  {
    id: "ajio",
    name: "Ajio (Reliance Retail)",
    category: "Product",
    nodalEmail: "grievance.officer@ajio.com",
    supportEmail: "customercare@ajio.com",
    ombudsman: "National Consumer Helpline (1915)",
    slaHours: 48,
    slaDays: 7,
  },

  // --- Food & Quick Commerce ---
  {
    id: "zomato",
    name: "Zomato",
    category: "Food",
    nodalEmail: "grievance@zomato.com",
    supportEmail: "support@zomato.com",
    ombudsman: "FSSAI & National Consumer Helpline",
    slaHours: 24,
    slaDays: 3,
  },
  {
    id: "swiggy",
    name: "Swiggy",
    category: "Food",
    nodalEmail: "grievances@swiggy.in",
    supportEmail: "support@swiggy.in",
    ombudsman: "FSSAI & National Consumer Helpline",
    slaHours: 24,
    slaDays: 3,
  },
  {
    id: "blinkit",
    name: "Blinkit",
    category: "Food",
    nodalEmail: "grievance@blinkit.com",
    supportEmail: "info@blinkit.com",
    ombudsman: "FSSAI & National Consumer Helpline",
    slaHours: 24,
    slaDays: 3,
  },
  {
    id: "zepto",
    name: "Zepto",
    category: "Food",
    nodalEmail: "grievance@zeptonow.com",
    supportEmail: "support@zeptonow.com",
    ombudsman: "FSSAI & National Consumer Helpline",
    slaHours: 24,
    slaDays: 3,
  },

  // --- Banking, UPI & Fintech ---
  {
    id: "sbi",
    name: "State Bank of India (SBI)",
    category: "Banking",
    nodalEmail: "nodalofficer@sbi.co.in",
    supportEmail: "customercare@sbi.co.in",
    ombudsman: "RBI Integrated Ombudsman Scheme (cms.rbi.org.in)",
    slaHours: 48,
    slaDays: 14,
  },
  {
    id: "hdfc",
    name: "HDFC Bank",
    category: "Banking",
    nodalEmail: "grievance.redressal@hdfcbank.com",
    supportEmail: "support@hdfcbank.com",
    ombudsman: "RBI Integrated Ombudsman Scheme (cms.rbi.org.in)",
    slaHours: 48,
    slaDays: 14,
  },
  {
    id: "icici",
    name: "ICICI Bank",
    category: "Banking",
    nodalEmail: "headservicequality@icicibank.com",
    supportEmail: "customer.care@icicibank.com",
    ombudsman: "RBI Integrated Ombudsman Scheme (cms.rbi.org.in)",
    slaHours: 48,
    slaDays: 14,
  },
  {
    id: "axis",
    name: "Axis Bank",
    category: "Banking",
    nodalEmail: "nodal.officer@axisbank.com",
    supportEmail: "customer.services@axisbank.com",
    ombudsman: "RBI Integrated Ombudsman Scheme (cms.rbi.org.in)",
    slaHours: 48,
    slaDays: 14,
  },
  {
    id: "phonepe",
    name: "PhonePe (UPI & Payments)",
    category: "Banking",
    nodalEmail: "grievance-officer@phonepe.com",
    supportEmail: "support@phonepe.com",
    ombudsman: "NPCI & RBI Ombudsman",
    slaHours: 24,
    slaDays: 5,
  },
  {
    id: "paytm",
    name: "Paytm Payments",
    category: "Banking",
    nodalEmail: "grievanceofficer@paytm.com",
    supportEmail: "care@paytm.com",
    ombudsman: "NPCI & RBI Ombudsman",
    slaHours: 24,
    slaDays: 5,
  },
  {
    id: "googlepay",
    name: "Google Pay India",
    category: "Banking",
    nodalEmail: "gpay-grievance-india@google.com",
    supportEmail: "support-in@google.com",
    ombudsman: "NPCI & RBI Ombudsman",
    slaHours: 24,
    slaDays: 5,
  },

  // --- Telecom & Utilities ---
  {
    id: "jio",
    name: "Reliance Jio Infocomm",
    category: "Telecom",
    nodalEmail: "appellate.authority@jio.com",
    supportEmail: "care@jio.com",
    ombudsman: "TRAI Telecom Dispute Settlement Appellate Tribunal (TDSAT)",
    slaHours: 48,
    slaDays: 7,
  },
  {
    id: "airtel",
    name: "Bharti Airtel",
    category: "Telecom",
    nodalEmail: "nodalofficer.india@airtel.com",
    supportEmail: "121@in.airtel.com",
    ombudsman: "TRAI Telecom Dispute Settlement Appellate Tribunal (TDSAT)",
    slaHours: 48,
    slaDays: 7,
  },
  {
    id: "vi",
    name: "Vodafone Idea (Vi)",
    category: "Telecom",
    nodalEmail: "nodalofficer@vodafoneidea.com",
    supportEmail: "customercare@vodafoneidea.com",
    ombudsman: "TRAI Telecom Dispute Settlement Appellate Tribunal (TDSAT)",
    slaHours: 48,
    slaDays: 7,
  },

  // --- Travel & Airlines ---
  {
    id: "makemytrip",
    name: "MakeMyTrip",
    category: "Travel",
    nodalEmail: "grievance.officer@makemytrip.com",
    supportEmail: "service@makemytrip.com",
    ombudsman: "Ministry of Civil Aviation / AirSewa & NCDRC",
    slaHours: 24,
    slaDays: 7,
  },
  {
    id: "irctc",
    name: "IRCTC (Indian Railways)",
    category: "Travel",
    nodalEmail: "customercare@irctc.co.in",
    supportEmail: "care@irctc.co.in",
    ombudsman: "RailMadad Grievance Redressal Mechanism",
    slaHours: 24,
    slaDays: 5,
  },
  {
    id: "indigo",
    name: "IndiGo Airlines",
    category: "Travel",
    nodalEmail: "nodalofficer@goindigo.in",
    supportEmail: "customer.relations@goindigo.in",
    ombudsman: "AirSewa / DGCA Passenger Redressal",
    slaHours: 24,
    slaDays: 7,
  },
  {
    id: "uber",
    name: "Uber India",
    category: "Travel",
    nodalEmail: "grievance-officer-india@uber.com",
    supportEmail: "support@uber.com",
    ombudsman: "Central Consumer Protection Authority (CCPA)",
    slaHours: 24,
    slaDays: 5,
  },
  {
    id: "ola",
    name: "Ola Cabs",
    category: "Travel",
    nodalEmail: "grievanceofficer@olacabs.com",
    supportEmail: "support@olacabs.com",
    ombudsman: "Central Consumer Protection Authority (CCPA)",
    slaHours: 24,
    slaDays: 5,
  },

  // --- Electronics & Brands ---
  {
    id: "samsung",
    name: "Samsung Electronics India",
    category: "Product",
    nodalEmail: "grievance.india@samsung.com",
    supportEmail: "support.india@samsung.com",
    ombudsman: "National Consumer Helpline (1915)",
    slaHours: 48,
    slaDays: 10,
  },
  {
    id: "apple",
    name: "Apple India",
    category: "Product",
    nodalEmail: "india_grievance_officer@apple.com",
    supportEmail: "contactus.in@apple.com",
    ombudsman: "National Consumer Helpline (1915)",
    slaHours: 48,
    slaDays: 10,
  },
];

const findCompany = (nameOrId) => {
  if (!nameOrId) return null;
  const q = nameOrId.toLowerCase().trim();
  return (
    COMPANY_DIRECTORY.find(
      (c) =>
        c.id.toLowerCase() === q ||
        c.name.toLowerCase() === q ||
        c.name.toLowerCase().includes(q)
    ) || null
  );
};

module.exports = {
  COMPANY_DIRECTORY,
  findCompany,
};
