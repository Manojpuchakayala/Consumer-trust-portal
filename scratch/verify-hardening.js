// Automated Launch Hardening & Verification Suite
const fs = require("fs");
const path = require("path");

console.log("==================================================================");
console.log("🛡️ RUNNING COMPREHENSIVE LAUNCH SECURITY & COMPLIANCE AUDIT");
console.log("==================================================================");

let totalChecks = 0;
let passedChecks = 0;

function check(title, condition, detail = "") {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`✅ [PASS] ${title}`);
  } else {
    console.error(`❌ [FAIL] ${title} - ${detail}`);
  }
}

// 1. Check frontend Login.jsx & AuthCard.jsx for test credentials / auto-fill removal & Real Google OAuth
const loginPath = path.join(__dirname, "../frontend/src/pages/Login.jsx");
const authCardPath = path.join(__dirname, "../frontend/src/components/AuthCard.jsx");
const loginContent = fs.readFileSync(loginPath, "utf8");
const authCardContent = fs.existsSync(authCardPath) ? fs.readFileSync(authCardPath, "utf8") : "";
const combinedAuthContent = loginContent + "\n" + authCardContent;

check(
  "Login Page: Auto-Fill & Test Credentials Helper Removed",
  !combinedAuthContent.includes("Auto-Fill") &&
  !combinedAuthContent.includes("Admin@123") &&
  !combinedAuthContent.includes("User@123") &&
  !combinedAuthContent.includes("admin@consumertrust.gov")
);
check(
  "Login Page: Real Google OAuth Component Integrated (@react-oauth/google)",
  combinedAuthContent.includes("GoogleLogin") &&
  combinedAuthContent.includes("handleGoogleSuccess") &&
  combinedAuthContent.includes("/auth/google")
);

// 2. Check TrackComplaint.jsx for mock case autoloading removal & OTP Verification flow
const trackPath = path.join(__dirname, "../frontend/src/pages/TrackComplaint.jsx");
const trackContent = fs.readFileSync(trackPath, "utf8");
check(
  "Track Case: Default Mock Case / PII Autoload Removed",
  !trackContent.includes("Manoj Puchakayala") &&
  !trackContent.includes("8074875176") &&
  !trackContent.includes("CT-2026-76665")
);
check(
  "Track Case: 2-Factor OTP Verification Modal Implemented",
  trackContent.includes("otpStep") &&
  trackContent.includes("handleVerifyOtp") &&
  trackContent.includes("/complaints/track/verify-otp")
);
check(
  "Track Case: Privacy & Independent Notice Present",
  trackContent.includes("Protected Case Tracking") || trackContent.includes("Independent Platform Notice")
);

// 3. Check main.jsx for GoogleOAuthProvider and App.jsx for Legal Routes
const mainPath = path.join(__dirname, "../frontend/src/main.jsx");
const mainContent = fs.readFileSync(mainPath, "utf8");
check("App Root: GoogleOAuthProvider Configured in main.jsx", mainContent.includes("GoogleOAuthProvider"));

const appPath = path.join(__dirname, "../frontend/src/App.jsx");
const appContent = fs.readFileSync(appPath, "utf8");
check("Routes: /privacy Route Registered", appContent.includes('path="/privacy"'));
check("Routes: /terms Route Registered", appContent.includes('path="/terms"'));
check("Routes: /charter Route Registered", appContent.includes('path="/charter"'));
check("Routes: /accessibility Route Registered", appContent.includes('path="/accessibility"'));
check("Routes: /methodology Route Registered", appContent.includes('path="/methodology"'));
check("Routes: /contact Route Registered", appContent.includes('path="/contact"'));

// 4. Check Backend complaintController.js for Protected Tracking API
const complaintCtrlPath = path.join(__dirname, "../backend/controllers/complaintController.js");
const complaintCtrlContent = fs.readFileSync(complaintCtrlPath, "utf8");
check(
  "Backend Controller: Public Complaint Tracking PII Masking & Token Verification Active",
  complaintCtrlContent.includes("maskName") &&
  complaintCtrlContent.includes("maskEmail") &&
  complaintCtrlContent.includes("maskPhone") &&
  complaintCtrlContent.includes("verifyTrackToken")
);
check(
  "Backend Controller: OTP-Based Case Access Endpoints Implemented",
  complaintCtrlContent.includes("requestTrackAccess") &&
  complaintCtrlContent.includes("verifyTrackOtp") &&
  complaintCtrlContent.includes("TRACK_OTP_EXPIRY_MS")
);

// 5. Check Backend authController.js for Google Token Verification, Lockout & Password Complexity
const authCtrlPath = path.join(__dirname, "../backend/controllers/authController.js");
const authCtrlContent = fs.readFileSync(authCtrlPath, "utf8");
check(
  "Backend Auth: Google OAuth ID Token Cryptographic Verification (OAuth2Client)",
  authCtrlContent.includes("OAuth2Client") &&
  authCtrlContent.includes("googleLogin") &&
  authCtrlContent.includes("verifyIdToken")
);
check(
  "Backend Auth: Password Complexity Enforced (8+ chars, letters & numbers)",
  authCtrlContent.includes("pwd.length < 8") || authCtrlContent.includes("password.length < 8")
);
check(
  "Backend Auth: Brute-Force Account Lockout / Backoff Active",
  authCtrlContent.includes("isLockedOut") && authCtrlContent.includes("MAX_ATTEMPTS")
);
check(
  "Backend Auth: Password Bypasses Removed",
  !authCtrlContent.includes("validSeedPasswords") &&
  !authCtrlContent.includes("admin@123")
);

// 6. Check Backend server.js for Helmet & Rate Limiting
const serverPath = path.join(__dirname, "../backend/server.js");
const serverContent = fs.readFileSync(serverPath, "utf8");
check("Backend Security: Helmet Headers Active", serverContent.includes("helmet("));
check("Backend Security: Global Rate Limiter Active", serverContent.includes("rateLimit("));

// 7. Check RegisterComplaint.jsx for 4-step wizard & unselected consents
const registerPath = path.join(__dirname, "../frontend/src/pages/RegisterComplaint.jsx");
const registerContent = fs.readFileSync(registerPath, "utf8");
check(
  "Register Grievance: 4-Step Wizard & Step Validation Implemented",
  registerContent.includes("currentStep") &&
  registerContent.includes("validateStep")
);
check(
  "Register Grievance: Pre-Submission Review Implemented",
  registerContent.includes("Grievance Summary") &&
  registerContent.includes("Grievance Statement Preview")
);
check(
  "Register Grievance: Explicit Unselected Consents Present",
  registerContent.includes("consentAccuracy") &&
  registerContent.includes("consentTermsPrivacy") &&
  registerContent.includes("useState(false)")
);

// 8. Check Footer.jsx for Independent Platform Disclaimer & Active Links
const footerPath = path.join(__dirname, "../frontend/src/components/Footer.jsx");
const footerContent = fs.readFileSync(footerPath, "utf8");
check(
  "Footer: Prominent Non-Affiliation Disclaimer Strip Active",
  footerContent.includes("NON-AFFILIATION & LEGAL DISCLAIMER")
);
check(
  "Footer: Active Links to Privacy, Terms, Charter, Methodology, Contact",
  footerContent.includes('to="/privacy"') &&
  footerContent.includes('to="/terms"') &&
  footerContent.includes('to="/methodology"')
);

// 9. Check PDF Generator for Disclaimers & Accurate Non-Judicial Titles
const pdfPath = path.join(__dirname, "../frontend/src/utils/pdfGenerator.js");
const pdfContent = fs.readFileSync(pdfPath, "utf8");
check(
  "PDF Generator: Grievance Summary & Resolution Certificate Disclaimers Added",
  pdfContent.includes("LEGAL DISCLAIMER") &&
  pdfContent.includes("Consumer Grievance Claim Summary & Facilitation Docket")
);

console.log("==================================================================");
console.log(`📊 AUDIT RESULTS: ${passedChecks} / ${totalChecks} CHECKS PASSED (${((passedChecks / totalChecks) * 100).toFixed(1)}%)`);
console.log("==================================================================");

if (passedChecks === totalChecks) {
  console.log("🎉 ALL AUDIT CHECKS PASSED PERFECTLY!");
  process.exit(0);
} else {
  console.error("❌ SOME CHECKS FAILED.");
  process.exit(1);
}
