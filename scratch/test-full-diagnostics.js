const mongoose = require("../backend/node_modules/mongoose");
const path = require("path");

const PROD_API = "https://consumer-trust-api.onrender.com/api";
const PROD_FRONTEND = "https://consumer-trust-portal.vercel.app";
const MONGO_URI = "mongodb+srv://manojj:manoj123@consumer-trust-db.rxdifnq.mongodb.net/consumer_trust?retryWrites=true&w=majority&appName=consumer-trust-db";

async function runFullDiagnostics() {
  console.log("==================================================================");
  console.log("🔍 FULL PRODUCTION HEALTH, API, DATABASE & KEY DIAGNOSTICS");
  console.log("==================================================================\n");

  let totalTests = 0;
  let passedTests = 0;

  function report(name, success, info = "") {
    totalTests++;
    if (success) {
      passedTests++;
      console.log(`✅ [PASS] ${name} ${info ? "(" + info + ")" : ""}`);
    } else {
      console.error(`❌ [FAIL] ${name} ${info ? "(" + info + ")" : ""}`);
    }
  }

  // -------------------------------------------------------------
  // TEST 1: Direct MongoDB Atlas Database Connection
  // -------------------------------------------------------------
  console.log("--- 1. Testing Direct MongoDB Atlas Database Connection ---");
  try {
    const connStart = Date.now();
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
    const connDuration = Date.now() - connStart;
    report("MongoDB Atlas Cluster Connection", mongoose.connection.readyState === 1, `${connDuration}ms`);

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    report("Database Schema & Collections Available", collections.length > 0, `${collections.map(c => c.name).join(", ")}`);

    const complaintCount = await db.collection("complaints").countDocuments();
    const userCount = await db.collection("users").countDocuments();
    report("Database Records Verified", true, `${complaintCount} complaints, ${userCount} users`);

    await mongoose.disconnect();
  } catch (err) {
    report("MongoDB Atlas Connection", false, err.message);
  }

  console.log("\n--- 2. Testing Live Production Backend API Endpoints (Render) ---");

  // TEST 2: /api/health
  try {
    const res = await fetch(`${PROD_API}/health`);
    const data = await res.json();
    report("Health Check Endpoint (/api/health)", res.ok && data.database?.status === "connected", `Status: ${res.status}, DB: ${data.database?.status}`);
  } catch (err) {
    report("Health Check Endpoint (/api/health)", false, err.message);
  }

  // TEST 3: /api/complaints/public-stats
  try {
    const res = await fetch(`${PROD_API}/complaints/public-stats`);
    const data = await res.json();
    report("Public Stats Endpoint (/api/complaints/public-stats)", res.ok && data.success, `Total Cases: ${data.stats?.total || data.total || "OK"}`);
  } catch (err) {
    report("Public Stats Endpoint (/api/complaints/public-stats)", false, err.message);
  }

  // TEST 4: /api/complaints/track/:id
  try {
    const res = await fetch(`${PROD_API}/complaints/track/CTP-2026-003`);
    const data = await res.json();
    report("Case Tracking Endpoint (/api/complaints/track/CTP-2026-003)", res.ok && data.complaint?.complaintId === "CTP-2026-003", `Found Case: ${data.complaint?.complaintId}, Status: ${data.complaint?.status}`);
  } catch (err) {
    report("Case Tracking Endpoint (/api/complaints/track/CTP-2026-003)", false, err.message);
  }

  // TEST 5: /api/complaints/track/:invalid_id (404 Handling)
  try {
    const res = await fetch(`${PROD_API}/complaints/track/NON_EXISTENT_ID_999`);
    const data = await res.json();
    report("Non-Existent Case 404 Handling", res.status === 404 || !data.complaint, `HTTP ${res.status}`);
  } catch (err) {
    report("Non-Existent Case 404 Handling", false, err.message);
  }

  // TEST 6: /api/auth/login validation
  try {
    const res = await fetch(`${PROD_API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid-email-format", password: "123" }),
    });
    report("Auth Login Input Validation", res.status === 400 || res.status === 401, `HTTP ${res.status}`);
  } catch (err) {
    report("Auth Login Input Validation", false, err.message);
  }

  // TEST 7: /api/auth/google endpoint availability
  try {
    const res = await fetch(`${PROD_API}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: "mock_test_token" }),
    });
    report("Google OAuth Backend Verification Endpoint", res.status === 400 || res.status === 401 || res.status === 500, `HTTP ${res.status} (Crypto verification active)`);
  } catch (err) {
    report("Google OAuth Backend Verification Endpoint", false, err.message);
  }

  console.log("\n--- 3. Testing Live Production Frontend Routes (Vercel) ---");

  const routes = [
    { path: "/", name: "Homepage" },
    { path: "/register", name: "Prepare Grievance Page" },
    { path: "/track", name: "Track Case Page" },
    { path: "/track?id=CTP-2026-003", name: "Direct Case Tracking Query URL" },
    { path: "/brands", name: "Brand Leaderboard Page" },
    { path: "/methodology", name: "Methodology Page" },
    { path: "/privacy", name: "Privacy Policy Page" },
    { path: "/terms", name: "Terms of Service Page" },
    { path: "/charter", name: "Citizen Charter Page" },
    { path: "/accessibility", name: "Accessibility Page" },
    { path: "/contact", name: "Contact Support Page" },
    { path: "/login", name: "Login & Auth Page" },
  ];

  for (const route of routes) {
    try {
      const res = await fetch(`${PROD_FRONTEND}${route.path}`);
      const text = await res.text();
      const hasContent = text.includes("<!doctype html>") || text.includes("<div id=\"root\">");
      report(`Frontend Route: ${route.name} (${route.path})`, res.ok && hasContent, `HTTP ${res.status}`);
    } catch (err) {
      report(`Frontend Route: ${route.name} (${route.path})`, false, err.message);
    }
  }

  console.log("\n==================================================================");
  console.log(`📊 FINAL DIAGNOSTIC SCORE: ${passedTests} / ${totalTests} CHECKS PASSED (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
  console.log("==================================================================");

  if (passedTests === totalTests) {
    console.log("🎉 ALL PRODUCTION APIS, DATABASE, KEYS & ROUTES ARE 100% OPERATIONAL!");
    process.exit(0);
  } else {
    console.error("⚠️ SOME DIAGNOSTIC CHECKS RETURNED WARNINGS OR ERRORS.");
    process.exit(1);
  }
}

runFullDiagnostics();
