// Email Service Helper for Live OTP & Grievance Milestone Notifications
const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const isGmail =
      (process.env.SMTP_HOST || "").includes("gmail") ||
      (process.env.SMTP_USER || "").includes("@gmail.com");

    if (isGmail) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        pool: true,
        maxConnections: 3,
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_SECURE === "true",
        pool: true,
        maxConnections: 3,
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  return transporter;
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

module.exports = {
  sendOtpEmail,
  sendComplaintConfirmationEmail,
  sendComplaintStatusUpdateEmail,
};
