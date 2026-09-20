// Email Service Helper for Live OTP & Grievance Milestone Notifications
const nodemailer = require("nodemailer");

let cachedTransporter = null;

const getTransporter = () => {
  const user = (process.env.SMTP_USER || "manojpuchakayala321@gmail.com").trim();
  const rawPass = process.env.SMTP_PASS || "usacctslmycqdmmh";
  const pass = rawPass ? rawPass.trim().replace(/\s+/g, "") : "";

  if (!user || !pass) {
    console.warn("⚠️ SMTP credentials not configured. Email will be logged to console only.");
    return null;
  }

  // Create robust Gmail transport
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user,
      pass: pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// 1. Two-Step Verification (2FA OTP)
const sendOtpEmail = async (email, otp, name = "Consumer") => {
  console.log("=========================================");
  console.log(`📧 [TWO-STEP VERIFICATION OTP DISPATCHED]`);
  console.log(`   To: ${email} (${name})`);
  console.log(`   Code: ${otp}`);
  console.log(`   Expires in: 10 minutes`);
  console.log("=========================================");

  const mailer = getTransporter();

  if (mailer) {
    try {
      const isInternalDomain =
        email.endsWith("@consumertrust.gov") ||
        email.endsWith("@consumertrust.com");
      const targetEmail = isInternalDomain && process.env.SMTP_USER ? process.env.SMTP_USER : email;

      await mailer.sendMail({
        from: `"Consumer Trust Portal" <${process.env.SMTP_USER}>`,
        to: targetEmail,
        subject: `Your Verification Code: ${otp} - Consumer Trust`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #1565c0; margin: 0;">Consumer Trust Portal</h2>
              <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Official Citizen Grievance Redressal System</p>
            </div>
            <p style="font-size: 16px; color: #334155;">Hello <strong>${name}</strong>,</p>
            <p style="color: #475569; line-height: 1.5;">You requested a security verification code to access your Consumer Trust account (<strong>${email}</strong>). Use the code below to complete your sign-in:</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; font-size: 36px; font-weight: 800; letter-spacing: 8px; background: #eff6ff; color: #1d4ed8; padding: 14px 32px; border-radius: 10px; border: 2px dashed #3b82f6;">
                ${otp}
              </div>
            </div>
            <p style="color: #64748b; font-size: 13px; text-align: center;">⏱️ This code is valid for <strong>10 minutes</strong>. Never share this code with anyone.</p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} Consumer Trust Grievance Portal. All rights reserved.</p>
          </div>
        `,
      });
      console.log(`✅ Live OTP email delivered to ${targetEmail} (account: ${email})`);
    } catch (smtpErr) {
      console.warn("⚠️ SMTP OTP dispatch error:", smtpErr.message);
    }
  }

  return true;
};

// 2. Complaint Submission Confirmation Email
const sendComplaintConfirmationEmail = async (complaint) => {
  console.log("=========================================");
  console.log(`📧 [GRIEVANCE REGISTRATION CONFIRMATION EMAIL]`);
  console.log(`   To: ${complaint.email} (${complaint.name})`);
  console.log(`   ID: ${complaint.complaintId}`);
  console.log(`   Subject: ${complaint.subject}`);
  console.log("=========================================");

  const mailer = getTransporter();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const trackUrl = `${frontendUrl}/track?id=${complaint.complaintId}`;

  if (mailer) {
    try {
      await mailer.sendMail({
        from: `"Consumer Trust Redressal" <${process.env.SMTP_USER}>`,
        to: complaint.email,
        subject: `Grievance Filed: ${complaint.complaintId} - Consumer Trust Portal`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px;">
              <h2 style="color: #1e3a8a; margin: 0; font-size: 22px;">Consumer Trust Grievance Redressal</h2>
              <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">Official Citizen Complaint Acknowledgement</p>
            </div>

            <p style="color: #334155; font-size: 15px;">Dear <strong>${complaint.name}</strong>,</p>
            <p style="color: #475569; line-height: 1.6; font-size: 14px;">
              Your consumer grievance has been registered successfully. An authorized Grievance Redressal Officer has been assigned to investigate this issue under official consumer protection guidelines.
            </p>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 20px 0;">
              <div style="margin-bottom: 10px;">
                <span style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 0.5px;">Tracking ID:</span>
                <div style="font-size: 20px; font-weight: 800; color: #2563eb; letter-spacing: 1px; margin-top: 2px;">
                  ${complaint.complaintId}
                </div>
              </div>
              <div style="margin-bottom: 8px;">
                <strong style="color: #475569; font-size: 13px;">Subject:</strong> 
                <span style="color: #1e293b; font-size: 14px;">${complaint.subject}</span>
              </div>
              <div style="margin-bottom: 8px;">
                <strong style="color: #475569; font-size: 13px;">Category:</strong> 
                <span style="color: #1e293b; font-size: 14px; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 6px; font-weight: bold;">${complaint.category}</span>
              </div>
              <div>
                <strong style="color: #475569; font-size: 13px;">Current Status:</strong> 
                <span style="color: #b45309; background: #fef3c7; padding: 2px 8px; border-radius: 6px; font-size: 13px; font-weight: bold;">Pending Review</span>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${trackUrl}" style="background: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
                Track Grievance Live →
              </a>
            </div>

            <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
              You can track real-time resolution updates anytime by entering your Tracking ID on the portal.
            </p>

            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
            <p style="color: #94a3b8; font-size: 11px; text-align: center;">
              © ${new Date().getFullYear()} Consumer Trust Grievance Portal. This is an automated receipt.
            </p>
          </div>
        `,
      });
      console.log(`✅ Complaint confirmation email delivered to ${complaint.email}`);
    } catch (err) {
      console.warn("⚠️ Confirmation email dispatch error:", err.message);
    }
  }

  return true;
};

// 3. Complaint Status / Officer Remarks Update Email
const sendComplaintStatusUpdateEmail = async (complaint) => {
  console.log("=========================================");
  console.log(`📧 [GRIEVANCE STATUS UPDATE EMAIL]`);
  console.log(`   To: ${complaint.email} (${complaint.name})`);
  console.log(`   ID: ${complaint.complaintId}`);
  console.log(`   New Status: ${complaint.status}`);
  console.log("=========================================");

  const mailer = getTransporter();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const trackUrl = `${frontendUrl}/track?id=${complaint.complaintId}`;

  let statusBg = "#fef3c7";
  let statusColor = "#b45309";
  if (complaint.status === "In Progress") {
    statusBg = "#e0f2fe";
    statusColor = "#0369a1";
  } else if (complaint.status === "Resolved") {
    statusBg = "#dcfce7";
    statusColor = "#15803d";
  } else if (complaint.status === "Rejected") {
    statusBg = "#fee2e2";
    statusColor = "#b91c1c";
  }

  if (mailer) {
    try {
      await mailer.sendMail({
        from: `"Consumer Trust Redressal" <${process.env.SMTP_USER}>`,
        to: complaint.email,
        subject: `Update on Grievance ${complaint.complaintId}: Status is now [${complaint.status}]`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px;">
              <h2 style="color: #1e3a8a; margin: 0; font-size: 22px;">Grievance Status Update</h2>
              <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">Consumer Trust Grievance Redressal Cell</p>
            </div>

            <p style="color: #334155; font-size: 15px;">Dear <strong>${complaint.name}</strong>,</p>
            <p style="color: #475569; line-height: 1.6; font-size: 14px;">
              An official action or status update has been recorded on your grievance <strong>${complaint.complaintId}</strong>:
            </p>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 20px 0;">
              <div style="margin-bottom: 12px;">
                <span style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: bold;">New Status:</span>
                <div style="margin-top: 4px;">
                  <span style="background: ${statusBg}; color: ${statusColor}; font-size: 15px; font-weight: 800; padding: 4px 14px; border-radius: 8px; display: inline-block;">
                    ${complaint.status}
                  </span>
                </div>
              </div>

              ${
                complaint.adminRemarks
                  ? `
                <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #cbd5e1;">
                  <strong style="color: #1e293b; font-size: 13px; display: block; margin-bottom: 4px;">
                    🛡️ Official Officer Remarks / Actions:
                  </strong>
                  <div style="background: #ffffff; border-left: 3px solid #2563eb; padding: 10px 14px; color: #334155; font-size: 14px; border-radius: 0 6px 6px 0; font-style: italic;">
                    "${complaint.adminRemarks}"
                  </div>
                </div>
              `
                  : ""
              }
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${trackUrl}" style="background: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
                View Official Case Details →
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
            <p style="color: #94a3b8; font-size: 11px; text-align: center;">
              © ${new Date().getFullYear()} Consumer Trust Grievance Portal. This is an automated update.
            </p>
          </div>
        `,
      });
      console.log(`✅ Status update email delivered to ${complaint.email}`);
    } catch (err) {
      console.warn("⚠️ Status update email dispatch error:", err.message);
    }
  }

  return true;
};

// 4. Successful Login / Security Notification Email
const sendLoginNotificationEmail = async ({
  email,
  name = "Citizen",
  role = "user",
  authMethod = "Email & Password",
  loginTime = new Date(),
}) => {
  const formattedTime = new Date(loginTime).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "medium",
  });

  console.log("=========================================");
  console.log(`📧 [LOGIN SECURITY NOTIFICATION EMAIL]`);
  console.log(`   To: ${email} (${name})`);
  console.log(`   Time: ${formattedTime}`);
  console.log(`   Method: ${authMethod}`);
  console.log("=========================================");

  const mailer = getTransporter();
  const frontendUrl = process.env.FRONTEND_URL || "https://consumer-trust-portal.vercel.app";

  if (mailer) {
    try {
      const isInternalDomain =
        email.endsWith("@consumertrust.gov") ||
        email.endsWith("@consumertrust.com");
      const targetEmail =
        isInternalDomain && process.env.SMTP_USER ? process.env.SMTP_USER : email;

      await mailer.sendMail({
        from: `"Consumer Trust Security" <${process.env.SMTP_USER}>`,
        to: targetEmail,
        subject: `🔐 Login Notification: Successful Sign-In (${email}) - Consumer Trust Portal`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 14px; background: #ffffff;">
            <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px;">
              <h2 style="color: #1e3a8a; margin: 0; font-size: 22px;">🏛️ Consumer Trust Portal</h2>
              <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">Official Citizen Grievance & Redressal Platform</p>
            </div>

            <p style="color: #334155; font-size: 15px;">Hello <strong>${name}</strong>,</p>
            <p style="color: #475569; line-height: 1.6; font-size: 14px;">
              Your account was recently accessed on the <strong>Consumer Trust Grievance Portal</strong>. Here are the security details for this session:
            </p>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 20px 0;">
              <div style="margin-bottom: 10px;">
                <strong style="color: #475569; font-size: 13px;">Registered Email:</strong> 
                <span style="color: #1e293b; font-size: 14px; font-weight: 700;">${email}</span>
              </div>
              <div style="margin-bottom: 10px;">
                <strong style="color: #475569; font-size: 13px;">Account Type:</strong> 
                <span style="color: #0369a1; background: #e0f2fe; padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 700; text-transform: uppercase;">
                  ${role === "admin" ? "Administrator" : "Consumer / Citizen"}
                </span>
              </div>
              <div style="margin-bottom: 10px;">
                <strong style="color: #475569; font-size: 13px;">Sign-In Method:</strong> 
                <span style="color: #166534; background: #dcfce7; padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 700;">
                  ${authMethod}
                </span>
              </div>
              <div>
                <strong style="color: #475569; font-size: 13px;">Login Timestamp:</strong> 
                <span style="color: #1e293b; font-size: 13px;">${formattedTime}</span>
              </div>
            </div>

            <div style="text-align: center; margin: 26px 0;">
              <a href="${frontendUrl}/my-complaints" style="background: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
                Access Your Complaints Dashboard →
              </a>
            </div>

            <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px 16px; margin: 20px 0;">
              <p style="color: #92400e; font-size: 12px; margin: 0; line-height: 1.5;">
                🛡️ <strong>Security Notice:</strong> If this was you, you can safely disregard this email. If you did not sign in or suspect unauthorized access, please contact our support desk immediately.
              </p>
            </div>

            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
            <p style="color: #94a3b8; font-size: 11px; text-align: center;">
              © ${new Date().getFullYear()} Consumer Trust Grievance Portal. All rights reserved.
            </p>
          </div>
        `,
      });
      console.log(`✅ Login notification email delivered to ${targetEmail} (account: ${email})`);
    } catch (err) {
      console.warn("⚠️ Login notification email dispatch error:", err.message);
    }
  }

  return true;
};

// 4. Formal Grievance Notice to Company / Bank Nodal Officer
const sendCompanyGrievanceNoticeEmail = async ({ complaint, company, resolutionUrl }) => {
  const companyName = complaint.companyName || (company ? company.name : "Enterprise Partner");
  const targetEmail = complaint.companyEmail || (company ? company.nodalEmail : null);

  console.log("=========================================");
  console.log(`🏛️ [DISPATCHING FORMAL LEGAL NOTICE TO ENTERPRISE]`);
  console.log(`   Enterprise: ${companyName}`);
  console.log(`   Nodal Desk: ${targetEmail}`);
  console.log(`   Case ID: ${complaint.complaintId}`);
  console.log(`   Resolution URL: ${resolutionUrl}`);
  console.log("=========================================");

  const mailer = getTransporter();

  if (mailer && targetEmail) {
    try {
      const isInternalDomain =
        targetEmail.endsWith("@consumertrust.gov") ||
        targetEmail.endsWith("@consumertrust.com");
      const dispatchTo = isInternalDomain && process.env.SMTP_USER ? process.env.SMTP_USER : targetEmail;

      await mailer.sendMail({
        from: `"Consumer Trust Redressal Authority" <${process.env.SMTP_USER}>`,
        to: dispatchTo,
        subject: `[FORMAL GRIEVANCE NOTICE] Case #${complaint.complaintId} against ${companyName} - Consumer Trust Cell`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 26px; border: 1.5px solid #cbd5e1; border-radius: 14px; background: #ffffff;">
            <div style="text-align: center; border-bottom: 2.5px solid #0b2545; padding-bottom: 16px; margin-bottom: 22px;">
              <div style="display: inline-block; background: #fee2e2; color: #991b1b; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 1px; margin-bottom: 8px;">
                OFFICIAL STATUTORY GRIEVANCE INTIMATION
              </div>
              <h2 style="color: #0b2545; margin: 0; font-size: 22px;">Consumer Trust Redressal Authority</h2>
              <p style="color: #64748b; font-size: 12.5px; margin: 4px 0 0;">Unified National Grievance Monitoring & Redressal Switch</p>
            </div>

            <p style="color: #334155; font-size: 15px;">To: <strong>Grievance Redressal Officer / Nodal Desk, ${companyName}</strong>,</p>
            <p style="color: #475569; font-size: 13.5px; line-height: 1.6;">
              A verified consumer dispute has been officially registered against your organization on the <strong>Consumer Trust Portal</strong>. In compliance with consumer protection norms and regulatory directives, your prompt acknowledgment and redressal are requested.
            </p>

            <!-- Case Summary Box -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 20px 0;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                <div>
                  <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Case Tracking ID</span>
                  <div style="font-size: 15px; font-weight: 800; color: #0b2545;">${complaint.complaintId}</div>
                </div>
                <div>
                  <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Category</span>
                  <div style="font-size: 14px; font-weight: 700; color: #1e40af;">${complaint.category}</div>
                </div>
              </div>

              ${
                complaint.orderOrTransactionId
                  ? `
                <div style="margin-bottom: 12px;">
                  <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Order / Transaction Reference ID</span>
                  <div style="font-size: 14px; font-weight: 700; color: #0f172a; font-family: monospace;">${complaint.orderOrTransactionId}</div>
                </div>
                `
                  : ""
              }

              <div style="margin-bottom: 12px;">
                <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Complainant</span>
                <div style="font-size: 13.5px; color: #334155;"><strong>${complaint.name}</strong> (${complaint.email} | ${complaint.phone})</div>
              </div>

              <div style="margin-bottom: 12px;">
                <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Grievance Subject</span>
                <div style="font-size: 14px; font-weight: 700; color: #0f172a;">${complaint.subject}</div>
              </div>

              <div>
                <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Statement of Claim</span>
                <div style="font-size: 13px; color: #475569; background: #ffffff; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0; margin-top: 4px; line-height: 1.5;">
                  ${complaint.description}
                </div>
              </div>
            </div>

            <!-- Resolution Action Button -->
            <div style="text-align: center; margin: 30px 0; background: #eff6ff; padding: 22px; border-radius: 12px; border: 1px dashed #3b82f6;">
              <h3 style="color: #1e3a8a; margin: 0 0 8px; font-size: 16px;">1-Click Resolution Portal for ${companyName}</h3>
              <p style="color: #475569; font-size: 12.5px; margin-bottom: 16px;">
                Click below to inspect evidence, submit refund UTR details, or provide resolution updates directly to the complainant.
              </p>
              <a href="${resolutionUrl}" style="background: #1565c0; color: #ffffff; padding: 13px 30px; text-decoration: none; border-radius: 8px; font-weight: 800; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(21, 101, 192, 0.35);">
                Submit Resolution / Refund Proof →
              </a>
            </div>

            <!-- Statutory Notice & SLA -->
            <div style="background: #fffbeb; border: 1.5px solid #f59e0b; border-radius: 8px; padding: 14px 18px; margin: 20px 0;">
              <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.6;">
                ⏱️ <strong>Strict 7-Day Resolution Mandate:</strong> Please acknowledge this case within <strong>48 hours</strong>. The statutory grievance redressal period is strictly capped at <strong>7 Days (168 Hours)</strong>. Unresolved cases past the 7-day deadline will be automatically escalated to the competent Statutory Ombudsman (RBI CMS / NCDRC e-Daakhil / TRAI TDSAT) with full timestamped audit logs.
              </p>
            </div>

            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
            <p style="color: #94a3b8; font-size: 11px; text-align: center;">
              © ${new Date().getFullYear()} Consumer Trust Grievance Portal. Generated automatically by the Central Redressal Gateway.
            </p>
          </div>
        `,
      });
      console.log(`✅ Formal notice dispatched to ${dispatchTo} (${companyName})`);
    } catch (err) {
      console.warn("⚠️ Company notice dispatch error:", err.message);
    }
  }

  return true;
};

// 5. Consumer Notification when Company Resolves Issue
const sendConsumerCompanyResolutionEmail = async ({ complaint, companyResolution }) => {
  console.log("=========================================");
  console.log(`🎉 [ENTERPRISE RESOLUTION DISPATCHED TO CONSUMER]`);
  console.log(`   Consumer: ${complaint.email} (${complaint.name})`);
  console.log(`   Company: ${complaint.companyName}`);
  console.log(`   Action: ${companyResolution.actionTaken}`);
  console.log("=========================================");

  const mailer = getTransporter();

  if (mailer && complaint.email) {
    try {
      const isInternalDomain =
        complaint.email.endsWith("@consumertrust.gov") ||
        complaint.email.endsWith("@consumertrust.com");
      const targetEmail = isInternalDomain && process.env.SMTP_USER ? process.env.SMTP_USER : complaint.email;
      const frontendUrl = process.env.FRONTEND_URL || "https://consumer-trust-portal.vercel.app";

      await mailer.sendMail({
        from: `"Consumer Trust Redressal Cell" <${process.env.SMTP_USER}>`,
        to: targetEmail,
        subject: `🎉 Resolution Update: ${complaint.companyName} has responded to Case #${complaint.complaintId}!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 14px; background: #ffffff;">
            <div style="text-align: center; border-bottom: 2.5px solid #10b981; padding-bottom: 16px; margin-bottom: 20px;">
              <span style="background: #d1fae5; color: #065f46; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 800;">
                CASE RESOLVED BY ENTERPRISE
              </span>
              <h2 style="color: #065f46; margin: 10px 0 0; font-size: 22px;">Grievance Redressed Successfully!</h2>
              <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">Case Reference: <strong>${complaint.complaintId}</strong></p>
            </div>

            <p style="color: #334155; font-size: 15px;">Dear <strong>${complaint.name}</strong>,</p>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">
              Great news! <strong>${complaint.companyName}</strong> has officially submitted a resolution for your registered grievance on the Consumer Trust Portal.
            </p>

            <div style="background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 12px; padding: 18px; margin: 20px 0;">
              <div style="margin-bottom: 10px;">
                <strong style="color: #166534; font-size: 13px;">Action Taken:</strong> 
                <span style="color: #15803d; font-size: 14px; font-weight: 800;">${companyResolution.actionTaken}</span>
              </div>

              ${
                companyResolution.refundAmount
                  ? `
                <div style="margin-bottom: 10px;">
                  <strong style="color: #166534; font-size: 13px;">Refund / Settlement Amount:</strong> 
                  <span style="color: #047857; font-size: 15px; font-weight: 800;">₹${companyResolution.refundAmount}</span>
                </div>
                `
                  : ""
              }

              ${
                companyResolution.referenceNumber
                  ? `
                <div style="margin-bottom: 10px;">
                  <strong style="color: #166534; font-size: 13px;">Bank UTR / Tracking Reference:</strong> 
                  <span style="color: #0f172a; font-size: 13px; font-family: monospace; font-weight: 700;">${companyResolution.referenceNumber}</span>
                </div>
                `
                  : ""
              }

              ${
                companyResolution.resolutionNotes
                  ? `
                <div style="margin-top: 10px;">
                  <strong style="color: #166534; font-size: 13px;">Official Remarks:</strong>
                  <p style="color: #1f2937; font-size: 13px; background: #ffffff; padding: 10px; border-radius: 6px; border: 1px solid #dcfce7; margin: 4px 0 0;">
                    "${companyResolution.resolutionNotes}"
                  </p>
                </div>
                `
                  : ""
              }
            </div>

            <div style="text-align: center; margin: 26px 0;">
              <a href="${frontendUrl}/track?id=${complaint.complaintId}" style="background: #059669; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
                View Official Resolution Certificate →
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
            <p style="color: #94a3b8; font-size: 11px; text-align: center;">
              © ${new Date().getFullYear()} Consumer Trust Grievance Portal.
            </p>
          </div>
        `,
      });
      console.log(`✅ Consumer resolution notification delivered to ${targetEmail}`);
    } catch (err) {
      console.warn("⚠️ Consumer resolution email dispatch error:", err.message);
    }
  }

  return true;
};

module.exports = {
  sendOtpEmail,
  sendComplaintConfirmationEmail,
  sendComplaintStatusUpdateEmail,
  sendLoginNotificationEmail,
  sendCompanyGrievanceNoticeEmail,
  sendConsumerCompanyResolutionEmail,
};

