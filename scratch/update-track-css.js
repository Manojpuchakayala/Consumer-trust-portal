const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const trackCssPath = path.join(root, "frontend", "src", "pages", "TrackComplaint.css");
let trackCss = fs.readFileSync(trackCssPath, "utf8");

const extraStyles = `
/* Platform Transparency Banner */
.platform-transparency-banner {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  padding: 10px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 16px;
}

.platform-transparency-banner .info-ico {
  font-size: 16px;
  color: #2563eb;
  flex-shrink: 0;
}

/* Privacy Redaction Notice */
.privacy-redaction-notice {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
  padding: 10px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12.5px;
  line-height: 1.4;
}

.privacy-redaction-notice .lock-ico {
  font-size: 15px;
  color: #d97706;
  flex-shrink: 0;
}

.privacy-redaction-notice a {
  color: #b45309;
  font-weight: 700;
  text-decoration: underline;
}

/* Awaiting Search Initial Card */
.tracking-awaiting-card {
  background: #ffffff;
  border: 1.5px dashed #cbd5e1;
  border-radius: 16px;
  padding: 50px 24px;
  text-align: center;
  color: #64748b;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.02);
}

.awaiting-icon-circle {
  width: 58px;
  height: 58px;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin: 0 auto 16px;
}

.tracking-awaiting-card h3 {
  font-size: 18px;
  font-weight: 800;
  color: #0f2b5c;
  margin: 0 0 8px;
}

.tracking-awaiting-card p {
  font-size: 13.5px;
  max-width: 480px;
  margin: 0 auto;
  line-height: 1.5;
}
`;

if (!trackCss.includes("platform-transparency-banner")) {
  trackCss += extraStyles;
  fs.writeFileSync(trackCssPath, trackCss, "utf8");
  console.log("Appended transparency and privacy CSS to TrackComplaint.css");
}
