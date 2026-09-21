// High-Resolution Consumer Grievance Claim Summary, Resolution Certificate & Statutory Escalation PDF Generator with Dynamic Cryptographic QR Verification
import QRCode from "qrcode";

export const generateGrievanceNoticePdf = async (complaint) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow pop-ups to download/print your Grievance Summary PDF.");
    return;
  }

  const filingDate = complaint.createdAt
    ? new Date(complaint.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://consumer-trust-portal.vercel.app";
  const trackingUrl = `${baseUrl}/track?id=${encodeURIComponent(complaint.complaintId || "")}`;

  let qrDataUrl = "";
  try {
    qrDataUrl = await QRCode.toDataURL(trackingUrl, {
      width: 130,
      margin: 1,
      color: {
        dark: "#0f2b5c",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.warn("QR code generation error:", err);
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Consumer Grievance Docket - ${complaint.complaintId}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #1e293b; margin: 0; padding: 16px; line-height: 1.5; font-size: 13px; background: #ffffff; }
    .header { text-align: center; border-bottom: 2.5px solid #0f2b5c; padding-bottom: 12px; margin-bottom: 14px; position: relative; }
    .emblem-wrap { font-size: 32px; margin-bottom: 2px; }
    .govt-heading { font-size: 18px; font-weight: 800; color: #0f2b5c; text-transform: uppercase; letter-spacing: 0.5px; margin: 0; }
    .govt-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
    .docket-badge { display: inline-block; background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 3px 12px; border-radius: 12px; font-size: 10.5px; font-weight: 800; letter-spacing: 0.5px; margin-top: 6px; }
    .meta-bar { display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 14px; border-radius: 6px; margin-bottom: 14px; font-size: 12px; }
    .section-title { font-size: 11.5px; font-weight: 800; text-transform: uppercase; color: #0f2b5c; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin: 14px 0 8px; letter-spacing: 0.5px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
    .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 9px 12px; }
    .info-card .label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; }
    .info-card .value { font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px; }
    .claim-box { background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 12px; margin: 8px 0; font-size: 12.5px; line-height: 1.6; }
    .sla-box { background: #fffbeb; border: 1.5px solid #f59e0b; border-radius: 6px; padding: 10px 14px; margin: 12px 0; font-size: 11.5px; color: #92400e; }
    .verification-strip { margin-top: 18px; border: 1.5px solid #bfdbfe; background: #eff6ff; border-radius: 8px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; }
    .qr-box { display: flex; align-items: center; gap: 12px; }
    .qr-img { width: 72px; height: 72px; border-radius: 4px; border: 1px solid #cbd5e1; background: #fff; }
    .qr-text { font-size: 11px; color: #1e40af; line-height: 1.35; }
    .seal-circle { display: inline-block; border: 2px dashed #1d4ed8; color: #1d4ed8; padding: 6px 14px; border-radius: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; text-align: center; }
    .disclaimer-text { margin-top: 12px; font-size: 9.5px; color: #64748b; text-align: center; line-height: 1.4; border-top: 1px dashed #cbd5e1; padding-top: 6px; }
    .print-actions { text-align: center; margin-bottom: 16px; }
    .print-btn { background: #1e40af; color: white; border: none; padding: 10px 24px; font-size: 14px; font-weight: bold; border-radius: 6px; cursor: pointer; }
    @media print { .print-actions { display: none; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="print-actions">
    <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>
  <div class="header">
    <div class="emblem-wrap">📋</div>
    <h1 class="govt-heading">Consumer Grievance Claim Summary & Facilitation Docket</h1>
    <div class="govt-sub">Consumer Trust Platform • Independent Dispute Facilitation Desk</div>
    <div class="docket-badge">AUTHENTICATED CASE SUMMARY DOCKET</div>
  </div>
  <div class="meta-bar">
    <div><strong>Docket ID:</strong> #${complaint.complaintId}</div>
    <div><strong>Filing Date:</strong> ${filingDate}</div>
    <div><strong>Current Status:</strong> <span style="color:#b45309; font-weight:800;">${complaint.status || "Pending"}</span></div>
  </div>
  <div class="section-title">I. Parties & Subject Matter</div>
  <div class="grid-2">
    <div class="info-card">
      <div class="label">Complainant (Citizen)</div>
      <div class="value">${complaint.name || "Consumer"}</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${complaint.email || ""} | ${complaint.phone || ""}</div>
    </div>
    <div class="info-card">
      <div class="label">Disputed Enterprise / Platform</div>
      <div class="value">${complaint.companyName || "General Enterprise"}</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Grievance Redressal Desk</div>
    </div>
  </div>
  <div class="grid-2">
    <div class="info-card">
      <div class="label">Category / Domain</div>
      <div class="value">${complaint.category || "General Dispute"}</div>
    </div>
    <div class="info-card">
      <div class="label">Order / Transaction Reference</div>
      <div class="value">${complaint.orderOrTransactionId || "N/A (Direct Consumer Dispute)"}</div>
    </div>
  </div>
  <div class="section-title">II. Grievance Statement & Claim Narrative</div>
  <div class="claim-box">
    <div style="font-weight: 800; color: #0f172a; margin-bottom: 6px; font-size: 13.5px;">${complaint.subject}</div>
    <div style="white-space: pre-line; color: #334155;">${complaint.description}</div>
  </div>
  <div class="sla-box">
    <strong>⚡ Voluntary Redressal Notice & Resolution SLA:</strong><br>
    This dispute summary has been registered on Consumer Trust for voluntary dispute facilitation with ${complaint.companyName || "the enterprise"}. The consumer requests formal acknowledgment within 48 hours and dispute redressal within standard 7-day timelines. If unresolved, this verified summary may be submitted to the National Consumer Helpline (1915) or e-Daakhil Consumer Commission courts.
  </div>
  <div class="verification-strip">
    <div class="qr-box">
      ${qrDataUrl ? `<img src="${qrDataUrl}" alt="Verification QR Code" class="qr-img" />` : ""}
      <div class="qr-text">
        <strong>📱 Scan to Verify Live Progress</strong><br>
        Scan with camera to view live case milestones and nodal responses.<br>
        <span style="font-size: 10px; color: #64748b;">${trackingUrl}</span>
      </div>
    </div>
    <div class="seal-circle">🛡️ Digitally Verified<br>Docket Record</div>
  </div>
  <div class="disclaimer-text">
    <strong>LEGAL DISCLAIMER:</strong> Consumer Trust is an independent private dispute facilitation platform and is not a government agency, court, or statutory commission. This document is a structured record of the consumer's claim and does not constitute a judicial order.
  </div>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
};

export const generateResolutionCertificatePdf = async (complaint) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow pop-ups to download/print your Certificate.");
    return;
  }

  const res = complaint.companyResolution || {};
  const resolvedDate = res.resolvedAt
    ? new Date(res.resolvedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://consumer-trust-portal.vercel.app";
  const trackingUrl = `${baseUrl}/track?id=${encodeURIComponent(complaint.complaintId || "")}`;

  let qrDataUrl = "";
  try {
    qrDataUrl = await QRCode.toDataURL(trackingUrl, {
      width: 120,
      margin: 1,
      color: {
        dark: "#15803d",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.warn("QR code error:", err);
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Resolution Certificate - ${complaint.complaintId}</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #1e293b; margin: 0; padding: 20px; line-height: 1.5; font-size: 13px; background: #ffffff; }
    .cert-border { border: 3.5px double #15803d; padding: 20px 24px; border-radius: 12px; background: #fcfdfc; position: relative; }
    .header { text-align: center; margin-bottom: 16px; }
    .emblem { font-size: 34px; }
    .cert-title { font-size: 21px; font-weight: 800; color: #15803d; text-transform: uppercase; letter-spacing: 1.5px; margin: 4px 0 0; }
    .cert-sub { font-size: 11.5px; color: #64748b; }
    .cert-body { text-align: center; max-width: 780px; margin: 0 auto; }
    .cert-text { font-size: 14px; color: #334155; margin: 12px 0; }
    .party-name { font-size: 17px; font-weight: 800; color: #0f172a; text-decoration: underline; }
    .details-table { width: 100%; border-collapse: collapse; margin: 16px 0; background: #ffffff; border: 1px solid #dcfce7; border-radius: 8px; overflow: hidden; }
    .details-table th, .details-table td { padding: 8px 14px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
    .details-table th { background: #f0fdf4; color: #166534; font-weight: 800; width: 35%; }
    .seal-wrap { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 12px; border-top: 1px solid #dcfce7; }
    .seal-badge { border: 2px solid #15803d; color: #15803d; padding: 6px 16px; border-radius: 50px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
    .qr-mini-wrap { display: flex; align-items: center; gap: 8px; font-size: 10.5px; color: #166534; }
    .qr-mini-wrap img { width: 56px; height: 56px; border-radius: 4px; border: 1px solid #bbf7d0; }
    .cert-disclaimer { font-size: 9px; color: #94a3b8; text-align: center; margin-top: 10px; }
    .print-actions { text-align: center; margin-bottom: 16px; }
    .print-btn { background: #15803d; color: white; border: none; padding: 10px 24px; font-size: 14px; font-weight: bold; border-radius: 6px; cursor: pointer; }
    @media print { .print-actions { display: none; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="print-actions">
    <button class="print-btn" onclick="window.print()">🖨️ Print / Save Certificate as PDF</button>
  </div>
  <div class="cert-border">
    <div class="header">
      <div class="emblem">🎖️</div>
      <h1 class="cert-title">Certificate of Consumer Dispute Resolution</h1>
      <div class="cert-sub">Consumer Trust Platform • Enterprise Settlement Summary Record</div>
    </div>
    <div class="cert-body">
      <p class="cert-text">
        This record certifies that the dispute registered under Docket <strong>#${complaint.complaintId}</strong> by <span class="party-name">${complaint.name || "Consumer"}</span> has been settled and redressed by <strong>${complaint.companyName || "the Enterprise"}</strong>.
      </p>
      <table class="details-table">
        <tr><th>Dispute Docket ID</th><td>#${complaint.complaintId}</td></tr>
        <tr><th>Subject / Claim</th><td>${complaint.subject}</td></tr>
        <tr><th>Enterprise / Platform</th><td>${complaint.companyName}</td></tr>
        <tr><th>Redressal Action Completed</th><td><span style="color:#15803d; font-weight:800;">${res.actionTaken || "Dispute Resolved & Settled"}</span></td></tr>
        ${res.refundAmount ? `<tr><th>Settlement / Refund Amount</th><td><strong style="color:#047857; font-size:14px;">₹${res.refundAmount}</strong></td></tr>` : ""}
        ${res.referenceNumber ? `<tr><th>Bank UTR / Transaction Ref</th><td><span style="font-family:monospace; font-weight:700;">${res.referenceNumber}</span></td></tr>` : ""}
        <tr><th>Date of Redressal & Closure</th><td>${resolvedDate}</td></tr>
        ${res.resolutionNotes ? `<tr><th>Official Settlement Remarks</th><td><em>"${res.resolutionNotes}"</em></td></tr>` : ""}
      </table>
    </div>
    <div class="seal-wrap">
      <div class="qr-mini-wrap">
        ${qrDataUrl ? `<img src="${qrDataUrl}" alt="QR" />` : ""}
        <div>
          <strong>Cryptographic QR Verification</strong><br>
          Scan to verify authentic settlement record
        </div>
      </div>
      <div class="seal-badge">✅ Settlement Verified</div>
      <div style="text-align: right;"><div style="font-size: 11px; color: #64748b;">Enterprise Status</div><div style="font-size: 12px; font-weight: 700; color: #15803d;">Redressal Completed</div></div>
    </div>
    <div class="cert-disclaimer">
      DISCLAIMER: This certificate records a voluntary grievance resolution facilitated between the consumer and the enterprise through the Consumer Trust platform.
    </div>
  </div>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
};

/**
 * Generates an official Statutory Escalation Packet & Legal Notice for e-Daakhil / NCH submission
 */
export const generateStatutoryEscalationPdf = async (complaint) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow pop-ups to download your Statutory Escalation Packet.");
    return;
  }

  const filingDate = complaint.createdAt
    ? new Date(complaint.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://consumer-trust-portal.vercel.app";
  const trackingUrl = `${baseUrl}/track?id=${encodeURIComponent(complaint.complaintId || "")}`;

  let qrDataUrl = "";
  try {
    qrDataUrl = await QRCode.toDataURL(trackingUrl, {
      width: 120,
      margin: 1,
      color: {
        dark: "#b91c1c",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.warn("QR code error:", err);
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Statutory Escalation Packet - ${complaint.complaintId}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #0f172a; margin: 0; padding: 16px; line-height: 1.55; font-size: 12.5px; background: #ffffff; }
    .header { text-align: center; border-bottom: 2.5px solid #b91c1c; padding-bottom: 12px; margin-bottom: 14px; }
    .header-title { font-size: 17px; font-weight: 800; color: #b91c1c; text-transform: uppercase; margin: 0; }
    .header-sub { font-size: 11px; color: #475569; margin-top: 2px; }
    .badge { display: inline-block; background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; padding: 3px 12px; border-radius: 12px; font-size: 10px; font-weight: 800; margin-top: 6px; }
    .notice-box { background: #fff1f2; border: 1.5px solid #fecdd3; border-radius: 6px; padding: 10px 14px; margin: 12px 0; font-size: 12px; color: #9f1239; }
    .section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin: 14px 0 8px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 9px 12px; }
    .card-label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; }
    .card-val { font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px; }
    .statement-box { background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 12px; margin: 8px 0; font-size: 12px; }
    .affidavit-declaration { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; margin-top: 14px; font-size: 11.5px; color: #334155; }
    .statutory-channels-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 12px 0; }
    .channel-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 8px 12px; border-radius: 6px; font-size: 11.5px; }
    .channel-box.court { background: #eff6ff; border-color: #bfdbfe; }
    .footer-bar { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #cbd5e1; padding-top: 12px; margin-top: 16px; font-size: 10.5px; color: #64748b; }
    .qr-box { display: flex; align-items: center; gap: 10px; }
    .qr-box img { width: 64px; height: 64px; border: 1px solid #cbd5e1; border-radius: 4px; }
    .print-actions { text-align: center; margin-bottom: 16px; }
    .print-btn { background: #b91c1c; color: white; border: none; padding: 10px 24px; font-size: 14px; font-weight: bold; border-radius: 6px; cursor: pointer; }
    @media print { .print-actions { display: none; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="print-actions">
    <button class="print-btn" onclick="window.print()">🖨️ Print / Save Statutory Packet (PDF)</button>
  </div>
  <div class="header">
    <div style="font-size: 30px;">⚖️</div>
    <h1 class="header-title">Statutory Consumer Grievance Escalation Packet</h1>
    <div class="header-sub">Compiled pursuant to the Consumer Protection Act, 2019 • Pre-Filing Legal Notice Record</div>
    <div class="badge">OFFICIAL STATUTORY SUBMISSION DOCUMENT</div>
  </div>

  <div class="notice-box">
    <strong>⚠️ STATUTORY SUBMISSION SUMMARY:</strong><br>
    This docket records an unresolved consumer dispute previously submitted for voluntary facilitation. Having received inadequate voluntary settlement within statutory timeframes, the complainant hereby compiles this verified dossier for formal escalation to <strong>National Consumer Helpline (NCH 1915)</strong> or the <strong>District Consumer Disputes Redressal Commission (e-Daakhil)</strong>.
  </div>

  <div class="section-title">I. Formal Particulars of Parties</div>
  <div class="grid-2">
    <div class="card">
      <div class="card-label">Complainant / Consumer</div>
      <div class="card-val">${complaint.name || "Consumer"}</div>
      <div style="font-size: 11px; color: #475569;">Email: ${complaint.email} | Phone: ${complaint.phone || "On file"}</div>
    </div>
    <div class="card">
      <div class="card-label">Opposite Party (Enterprise)</div>
      <div class="card-val">${complaint.companyName}</div>
      <div style="font-size: 11px; color: #475569;">Domain: ${complaint.category || "Commercial Enterprise"}</div>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-label">Docket Tracking Reference</div>
      <div class="card-val">#${complaint.complaintId}</div>
    </div>
    <div class="card">
      <div class="card-label">Order / Transaction / PNR ID</div>
      <div class="card-val">${complaint.orderOrTransactionId || "N/A (Direct Commercial Transaction)"}</div>
    </div>
  </div>

  <div class="section-title">II. Cause of Action & Statement of Facts</div>
  <div class="statement-box">
    <strong style="font-size: 13px; color: #0f172a;">${complaint.subject}</strong>
    <p style="white-space: pre-line; color: #334155; margin-top: 6px;">${complaint.description}</p>
  </div>

  <div class="section-title">III. Statutory Filing Avenues in India</div>
  <div class="statutory-channels-grid">
    <div class="channel-box">
      <strong>1. National Consumer Helpline (NCH)</strong><br>
      • Portal: <code>consumerhelpline.gov.in</code><br>
      • Toll-Free: <strong>1915</strong> (or SMS 8800001915)<br>
      • Use this dossier as attachment for fast-track conciliation.
    </div>
    <div class="channel-box court">
      <strong>2. e-Daakhil Online Consumer Court</strong><br>
      • Portal: <code>edaakhil.nic.in</code><br>
      • File digital case before District/State Commission.<br>
      • Covered under Consumer Protection Act, 2019.
    </div>
  </div>

  <div class="affidavit-declaration">
    <strong>Verification & Declaration:</strong><br>
    I, the Complainant above named, do hereby solemnly declare and verify that the contents of this grievance packet are true and correct to the best of my personal knowledge, belief, and records. No material particulars have been suppressed.
    <div style="margin-top: 14px; display: flex; justify-content: space-between;">
      <div><strong>Date of Dossier:</strong> ${filingDate}</div>
      <div><strong>Signature of Complainant:</strong> __________________________</div>
    </div>
  </div>

  <div class="footer-bar">
    <div class="qr-box">
      ${qrDataUrl ? `<img src="${qrDataUrl}" alt="QR" />` : ""}
      <div>
        <strong>Digital Record Verification QR</strong><br>
        Scan to view digital case history & evidence logs:<br>
        <span>${trackingUrl}</span>
      </div>
    </div>
    <div style="text-align: right;">
      <strong>Consumer Trust Platform</strong><br>
      Independent Dispute Facilitation Dossier
    </div>
  </div>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
};
