const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");
const Complaint = require("../models/Complaint");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clean existing seed records
    await User.deleteMany({
      email: { $in: ["admin@consumertrust.gov", "manojpuchakayala321@gmail.com"] },
    });
    await Complaint.deleteMany({
      complaintId: { $in: ["CTP-2026-001", "CTP-2026-002", "CTP-2026-003"] },
    });

    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash("Admin@123", salt);
    const userPasswordHash = await bcrypt.hash("Manoj@123", salt);

    // 1. Create Admin Account
    const admin = await User.create({
      name: "System Administrator",
      email: "admin@consumertrust.gov",
      password: adminPasswordHash,
      phone: "9876543210",
      role: "admin",
      authProvider: "local",
      isTwoFactorEnabled: true,
    });
    console.log(`✅ Admin account created: ${admin.email} (Role: ${admin.role})`);

    // 2. Create Citizen Account
    const citizen = await User.create({
      name: "Manoj Puchakayala",
      email: "manojpuchakayala321@gmail.com",
      password: userPasswordHash,
      phone: "9123456780",
      role: "user",
      authProvider: "local",
      isTwoFactorEnabled: true,
    });
    console.log(`✅ Citizen account created: ${citizen.email} (Role: ${citizen.role})`);

    // 3. Seed Sample Grievances for Testing
    const c1 = await Complaint.create({
      complaintId: "CTP-2026-001",
      name: citizen.name,
      email: citizen.email,
      phone: citizen.phone,
      category: "Product",
      subject: "Defective Smart LED TV delivered with broken panel",
      description:
        "Ordered 55-inch Smart TV on Aug 28. Package arrived with internal screen damage. Merchant refuses refund or replacement within warranty window.",
      status: "Pending",
      priority: "High",
      user: citizen._id,
    });

    const c2 = await Complaint.create({
      complaintId: "CTP-2026-002",
      name: citizen.name,
      email: citizen.email,
      phone: citizen.phone,
      category: "Banking",
      subject: "Unauthorized international transaction fee charged twice",
      description:
        "Bank deducted INR 4,820 twice for a single online order. Customer support ticket remained unresolved for over 14 days.",
      status: "In Progress",
      priority: "Urgent",
      user: citizen._id,
      adminRemarks:
        "Case assigned to Banking Ombudsman officer. Chargeback dispute initiated with merchant acquiring bank.",
    });

    const c3 = await Complaint.create({
      complaintId: "CTP-2026-003",
      name: citizen.name,
      email: citizen.email,
      phone: citizen.phone,
      category: "Service",
      subject: "Broadband Fiber internet downtime exceeding 10 days",
      description:
        "Fiber connection disrupted due to road construction. ISP failed SLA commitment of 24h repair.",
      status: "Resolved",
      priority: "Medium",
      user: citizen._id,
      adminRemarks:
        "Fiber cable re-spliced and tested. Billing credit of 15 days waived on next billing cycle.",
      resolvedAt: new Date(),
    });

    console.log(`✅ Seeded 3 sample complaints: ${c1.complaintId}, ${c2.complaintId}, ${c3.complaintId}`);
    console.log("🎉 Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Error:", error);
    process.exit(1);
  }
}

seed();
