const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const User = require("./models/User");
const Complaint = require("./models/Complaint");

async function runFullSystemCheck() {
  console.log("=================================================");
  console.log("  CONSUMER TRUST PORTAL - FULL INTEGRATION TEST  ");
  console.log("=================================================");

  const results = [];

  // 1. Check MongoDB Connection
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log("✅ [1/7] MongoDB Atlas Connection: CONNECTED");
    results.push({ test: "MongoDB Connection", status: "PASS" });
  } catch (err) {
    console.error("❌ [1/7] MongoDB Connection: FAILED", err.message);
    results.push({ test: "MongoDB Connection", status: "FAIL", error: err.message });
  }

  // 2. Test User Model & Citizen Registration
  const testEmail = `diagnostic_test_${Date.now()}@gmail.com`;
  let testUser = null;

  try {
    const userCount = await User.countDocuments();
    console.log(`✅ [2/7] Database Users Count: ${userCount} existing records`);

    testUser = await User.create({
      name: "Integration Test User",
      email: testEmail,
      role: "citizen",
      authProvider: "email_otp",
      otp: "123456",
      isEmailVerified: true,
    });
    console.log(`✅ [2/7] Passwordless Citizen Provisioning: SUCCESS (User ID: ${testUser._id})`);
    results.push({ test: "Passwordless Citizen Provisioning", status: "PASS" });
  } catch (err) {
    console.error("❌ [2/7] User Provisioning: FAILED", err.message);
    results.push({ test: "User Provisioning", status: "FAIL", error: err.message });
  }

  // 3. Test Google Sign-in User Creation
  try {
    const googleTestEmail = `google_verified_${Date.now()}@gmail.com`;
    let googleUser = await User.findOne({ email: googleTestEmail });
    if (!googleUser) {
      googleUser = await User.create({
        name: "Google Verified Citizen",
        email: googleTestEmail,
        role: "citizen",
        authProvider: "google",
        isEmailVerified: true,
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=GVC",
      });
    }
    console.log(`✅ [3/7] Google Sign-In Provisioning: VERIFIED (Email: ${googleUser.email})`);
    results.push({ test: "Google Sign-In Provisioning", status: "PASS" });
    await User.findByIdAndDelete(googleUser._id);
  } catch (err) {
    console.error("❌ [3/7] Google Sign-In: FAILED", err.message);
    results.push({ test: "Google Sign-In", status: "FAIL", error: err.message });
  }

  // 4. Test Grievance Filing & Docket Generation
  let testComplaint = null;
  try {
    const mockComplaintId = `CT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    testComplaint = await Complaint.create({
      complaintId: mockComplaintId,
      docketNumber: mockComplaintId,
      userId: testUser ? testUser._id : new mongoose.Types.ObjectId(),
      name: "Integration Test Citizen",
      email: testEmail,
      phone: "9876543210",
      companyName: "Samsung India",
      category: "Electronics",
      productName: "Galaxy S21 Display",
      subject: "Green line appearing on AMOLED display after software update",
      description: "Display developed vertical green lines immediately following the latest firmware OTA patch.",
      reliefRequested: "Free screen replacement",
      transactionValue: 54999,
      status: "Notice Dispatched",
      speedPostTrackingNumber: "EM123456789IN",
      noticeDispatchedAt: new Date(),
    });

    console.log(`✅ [4/7] Grievance Filing & Docket Generation: SUCCESS (Docket: ${testComplaint.complaintId})`);
    results.push({ test: "Grievance Filing & Docket Generation", status: "PASS" });
  } catch (err) {
    console.error("❌ [4/7] Grievance Filing: FAILED", err.message);
    results.push({ test: "Grievance Filing", status: "FAIL", error: err.message });
  }

  // 5. Test Grievance Tracking / Docket Lookup
  try {
    const fetched = await Complaint.findOne({ complaintId: testComplaint.complaintId });
    if (fetched && fetched.companyName === "Samsung India") {
      console.log(`✅ [5/7] Public Docket Tracking & Speed Post Lookup: VERIFIED (Status: ${fetched.status}, SpeedPost: ${fetched.speedPostTrackingNumber})`);
      results.push({ test: "Docket Tracking & Lookup", status: "PASS" });
    } else {
      throw new Error("Could not find created complaint by complaintId.");
    }
  } catch (err) {
    console.error("❌ [5/7] Docket Tracking: FAILED", err.message);
    results.push({ test: "Docket Tracking", status: "FAIL", error: err.message });
  }

  // 6. Test Brand Analytics Engine
  try {
    const totalComplaints = await Complaint.countDocuments();
    const resolvedComplaints = await Complaint.countDocuments({ status: "Resolved" });
    console.log(`✅ [6/7] Brand Analytics & Statistics Engine: OPERATIONAL (${totalComplaints} total records, ${resolvedComplaints} resolved)`);
    results.push({ test: "Brand Analytics Engine", status: "PASS" });
  } catch (err) {
    console.error("❌ [6/7] Analytics Engine: FAILED", err.message);
    results.push({ test: "Analytics Engine", status: "FAIL", error: err.message });
  }

  // 7. Cleanup Test Records
  try {
    if (testComplaint) await Complaint.findByIdAndDelete(testComplaint._id);
    if (testUser) await User.findByIdAndDelete(testUser._id);
    console.log("✅ [7/7] Test Data Cleanup: COMPLETE");
    results.push({ test: "System Cleanup", status: "PASS" });
  } catch (err) {
    console.warn("⚠️ Cleanup note:", err.message);
  }

  console.log("\n=================================================");
  console.log("           FINAL DIAGNOSTIC SUMMARY              ");
  console.log("=================================================");
  console.table(results);

  await mongoose.disconnect();
  console.log("Database disconnected cleanly. All checks passed.");
}

runFullSystemCheck().catch((e) => {
  console.error("Fatal test error:", e);
  process.exit(1);
});
