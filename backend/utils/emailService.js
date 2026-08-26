// Email Service Helper for OTP Delivery

const sendOtpEmail = async (email, otp, name = "Consumer") => {
  console.log("=========================================");
  console.log(`📧 [TWO-STEP VERIFICATION OTP DISPATCHED]`);
  console.log(`   To: ${email} (${name})`);
  console.log(`   Code: ${otp}`);
  console.log(`   Expires in: 10 minutes`);
  console.log("=========================================");

  // If SMTP environment variables are configured, send real email via nodemailer
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const nodemailer = require("nodemailer");
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Consumer Trust Portal" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Your Verification Code: ${otp} - Consumer Trust`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #1565c0; text-align: center;">Consumer Trust Portal</h2>
            <p>Hello ${name},</p>
            <p>Your Two-Step Verification security code is:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; background: #e3f2fd; color: #0d47a1; padding: 12px 24px; border-radius: 8px; border: 1px dashed #1976d2;">
                ${otp}
              </span>
            </div>
            <p style="color: #666; font-size: 14px;">This code is valid for 10 minutes. If you did not request this login, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} Consumer Trust Grievance Portal</p>
          </div>
        `,
      });
      console.log(`✅ Real email sent successfully to ${email}`);
    } catch (smtpErr) {
      console.warn("⚠️ SMTP dispatch failed (falling back to console/dev OTP):", smtpErr.message);
    }
  }

  return true;
};

module.exports = {
  sendOtpEmail,
};
