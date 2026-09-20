// High-Resolution Official Grievance Notice & Settlement Certificate PDF Generator

export const generateGrievanceNoticePdf = (complaint) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow pop-ups to download/print your Official Notice PDF.");
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

  const trackingUrl = window.location.origin + "/track?id=" + complaint.complaintId;

  const html = '<!DOCTYPE html>' +
'<html lang="en">' +
'<head>' +
'  <meta charset="UTF-8">' +
'  <title>Official Grievance Docket - ' + complaint.complaintId + '</title>' +
'  <style>' +
'    @page { size: A4 portrait; margin: 15mm; }' +
'    body { font-family: Segoe UI, Arial, sans-serif; color: #1e293b; margin: 0; padding: 20px; line-height: 1.5; font-size: 13px; }' +
'    .header { text-align: center; border-bottom: 2.5px solid #0f2b5c; padding-bottom: 12px; margin-bottom: 16px; }' +
'    .emblem-wrap { font-size: 32px; margin-bottom: 4px; }' +
'    .govt-heading { font-size: 18px; font-weight: 800; color: #0f2b5c; text-transform: uppercase; letter-spacing: 1px; margin: 0; }' +
'    .govt-sub { font-size: 11px; color: #64748b; margin-top: 3px; }' +
'    .docket-badge { display: inline-block; background: #fee2e2; color: #991b1b; padding: 3px 12px; border-radius: 12px; font-size: 10px; font-weight: 800; letter-spacing: 1px; margin-top: 6px; }' +
'    .meta-bar { display: flex; justify-content: space-between; background: #f1f5f9; padding: 10px 14px; border-radius: 6px; margin-bottom: 16px; font-size: 12px; }' +
'    .section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #0f2b5c; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin: 16px 0 8px; letter-spacing: 0.5px; }' +
'    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }' +
'    .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; }' +
'    .info-card .label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; }' +
'    .info-card .value { font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px; }' +
'    .claim-box { background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 12px; margin: 10px 0; font-size: 12.5px; line-height: 1.6; }' +
'    .sla-box { background: #fffbeb; border: 1.5px solid #f59e0b; border-radius: 6px; padding: 10px 14px; margin: 14px 0; font-size: 11.5px; color: #92400e; }' +
'    .footer { margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #94a3b8; }' +
'    .seal-circle { display: inline-block; border: 2px dashed #15803d; color: #15803d; padding: 6px 14px; border-radius: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; }' +
'    .print-actions { text-align: center; margin-bottom: 16px; }' +
'    .print-btn { background: #1e40af; color: white; border: none; padding: 10px 24px; font-size: 14px; font-weight: bold; border-radius: 6px; cursor: pointer; }' +
'    @media print { .print-actions { display: none; } body { padding: 0; } }' +
'  </style>' +
'</head>' +
'<body>' +
'  <div class="print-actions">' +
'    <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>' +
'  </div>' +
'  <div class="header">' +
'    <div class="emblem-wrap">🏛️</div>' +
'    <h1 class="govt-heading">Consumer Trust Redressal Authority</h1>' +
'    <div class="govt-sub">Unified National Grievance Monitoring & Statutory Redressal Cell</div>' +
'    <div class="docket-badge">OFFICIAL STATUTORY GRIEVANCE DOCKET</div>' +
'  </div>' +
'  <div class="meta-bar">' +
'    <div><strong>Docket ID:</strong> ' + complaint.complaintId + '</div>' +
'    <div><strong>Filing Date:</strong> ' + filingDate + '</div>' +
'    <div><strong>Current Status:</strong> <span style="color:#b45309; font-weight:800;">' + (complaint.status || "Pending") + '</span></div>' +
'  </div>' +
'  <div class="section-title">I. Parties & Subject Matter</div>' +
'  <div class="grid-2">' +
'    <div class="info-card">' +
'      <div class="label">Complainant (Citizen)</div>' +
'      <div class="value">' + complaint.name + '</div>' +
'      <div style="font-size: 11px; color: #64748b; margin-top: 2px;">' + complaint.email + ' | ' + complaint.phone + '</div>' +
'    </div>' +
'    <div class="info-card">' +
'      <div class="label">Disputed Enterprise / Partner</div>' +
'      <div class="value">' + (complaint.companyName || "General Enterprise") + '</div>' +
'      <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Nodal Desk: ' + (complaint.companyEmail || "Registered Grievance Officer") + '</div>' +
'    </div>' +
'  </div>' +
'  <div class="grid-2">' +
'    <div class="info-card">' +
'      <div class="label">Category / Domain</div>' +
'      <div class="value">' + (complaint.category || "General") + '</div>' +
'    </div>' +
'    <div class="info-card">' +
'      <div class="label">Order / Transaction Reference</div>' +
'      <div class="value">' + (complaint.orderOrTransactionId || "N/A (Direct Consumer Dispute)") + '</div>' +
'    </div>' +
'  </div>' +
'  <div class="section-title">II. Formal Grievance Statement & Claim</div>' +
'  <div class="claim-box">' +
'    <div style="font-weight: 800; color: #0f172a; margin-bottom: 6px; font-size: 13px;">' + complaint.subject + '</div>' +
'    <div style="white-space: pre-line; color: #334155;">' + complaint.description + '</div>' +
'  </div>' +
'  <div class="sla-box">' +
'    <strong>⚖️ Statutory Resolution Mandate & Legal Notice:</strong><br>' +
'    Under the provisions of the Consumer Protection (E-Commerce) Rules 2020 and regulatory ombudsman guidelines, the nodal grievance officer of ' + (complaint.companyName || "the enterprise") + ' is required to acknowledge this docket within 48 hours and achieve definitive redressal within 7 Days (168 Hours). Failure to redress triggers automated statutory escalation to the competent Ombudsman / NCDRC e-Daakhil court.' +
'  </div>' +
'  <div class="footer">' +
'    <div><strong>Live Tracking Link:</strong><br>' + trackingUrl + '</div>' +
'    <div class="seal-circle">🛡️ Digitally Certified & Timestamped</div>' +
'  </div>' +
'</body>' +
'</html>';

  printWindow.document.write(html);
  printWindow.document.close();
};

export const generateResolutionCertificatePdf = (complaint) => {
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

  const html = '<!DOCTYPE html>' +
'<html lang="en">' +
'<head>' +
'  <meta charset="UTF-8">' +
'  <title>Resolution Certificate - ' + complaint.complaintId + '</title>' +
'  <style>' +
'    @page { size: A4 landscape; margin: 15mm; }' +
'    body { font-family: Segoe UI, Arial, sans-serif; color: #1e293b; margin: 0; padding: 24px; line-height: 1.5; font-size: 13px; }' +
'    .cert-border { border: 4px double #15803d; padding: 24px; border-radius: 12px; background: #fcfdfc; position: relative; }' +
'    .header { text-align: center; margin-bottom: 20px; }' +
'    .emblem { font-size: 38px; }' +
'    .cert-title { font-size: 24px; font-weight: 800; color: #15803d; text-transform: uppercase; letter-spacing: 2px; margin: 4px 0 0; }' +
'    .cert-sub { font-size: 12px; color: #64748b; }' +
'    .cert-body { text-align: center; max-width: 750px; margin: 0 auto; }' +
'    .cert-text { font-size: 15px; color: #334155; margin: 16px 0; }' +
'    .party-name { font-size: 20px; font-weight: 800; color: #0f172a; text-decoration: underline; }' +
'    .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: #ffffff; border: 1px solid #dcfce7; border-radius: 8px; overflow: hidden; }' +
'    .details-table th, .details-table td { padding: 10px 14px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 12.5px; }' +
'    .details-table th { background: #f0fdf4; color: #166534; font-weight: 800; width: 35%; }' +
'    .seal-wrap { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; padding-top: 16px; border-top: 1px solid #dcfce7; }' +
'    .seal-badge { border: 2px solid #15803d; color: #15803d; padding: 8px 18px; border-radius: 50px; font-size: 12px; font-weight: 800; text-transform: uppercase; }' +
'    .print-actions { text-align: center; margin-bottom: 16px; }' +
'    .print-btn { background: #15803d; color: white; border: none; padding: 10px 24px; font-size: 14px; font-weight: bold; border-radius: 6px; cursor: pointer; }' +
'    @media print { .print-actions { display: none; } body { padding: 0; } }' +
'  </style>' +
'</head>' +
'<body>' +
'  <div class="print-actions">' +
'    <button class="print-btn" onclick="window.print()">🖨️ Print / Save Certificate as PDF</button>' +
'  </div>' +
'  <div class="cert-border">' +
'    <div class="header">' +
'      <div class="emblem">🎖️</div>' +
'      <h1 class="cert-title">Certificate of Grievance Redressal</h1>' +
'      <div class="cert-sub">National Consumer Trust Redressal Authority & Enterprise Settlement Cell</div>' +
'    </div>' +
'    <div class="cert-body">' +
'      <p class="cert-text">' +
'        This official document certifies that the consumer dispute registered under Case Docket Reference <strong>' + complaint.complaintId + '</strong> filed by <span class="party-name">' + complaint.name + '</span> has been formally reviewed, settled, and redressed by <strong>' + (complaint.companyName || "the Enterprise") + '</strong>.' +
'      </p>' +
'      <table class="details-table">' +
'        <tr><th>Dispute Docket ID</th><td>' + complaint.complaintId + '</td></tr>' +
'        <tr><th>Subject / Claim</th><td>' + complaint.subject + '</td></tr>' +
'        <tr><th>Enterprise / Partner</th><td>' + complaint.companyName + '</td></tr>' +
'        <tr><th>Redressal Action Completed</th><td><span style="color:#15803d; font-weight:800;">' + (res.actionTaken || "Dispute Resolved & Closed") + '</span></td></tr>' +
(res.refundAmount ? '<tr><th>Settlement / Refund Amount</th><td><strong style="color:#047857; font-size:14px;">₹' + res.refundAmount + '</strong></td></tr>' : '') +
(res.referenceNumber ? '<tr><th>Bank UTR / Courier Reference</th><td><span style="font-family:monospace; font-weight:700;">' + res.referenceNumber + '</span></td></tr>' : '') +
'        <tr><th>Date of Redressal & Closure</th><td>' + resolvedDate + '</td></tr>' +
(res.resolutionNotes ? '<tr><th>Official Closing Remarks</th><td><em>"' + res.resolutionNotes + '"</em></td></tr>' : '') +
'      </table>' +
'    </div>' +
'    <div class="seal-wrap">' +
'      <div><div style="font-size: 11px; color: #64748b;">Verified Case Docket</div><div style="font-size: 12px; font-weight: 700; color: #0f172a;">Consumer Trust Portal</div></div>' +
'      <div class="seal-badge">✅ Official Redressal Certified</div>' +
'      <div style="text-align: right;"><div style="font-size: 11px; color: #64748b;">Authorized Signatory</div><div style="font-size: 12px; font-weight: 700; color: #15803d;">Grievance Redressal Authority</div></div>' +
'    </div>' +
'  </div>' +
'</body>' +
'</html>';

  printWindow.document.write(html);
  printWindow.document.close();
};
