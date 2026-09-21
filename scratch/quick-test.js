async function run() {
  const apis = [
    { name: 'Render Backend Health Check', url: 'https://consumer-trust-api.onrender.com/api/health' },
    { name: 'Public Aggregate Stats API', url: 'https://consumer-trust-api.onrender.com/api/complaints/public-stats' },
    { name: 'Live Case Tracking API (CTP-2026-003)', url: 'https://consumer-trust-api.onrender.com/api/complaints/track/CTP-2026-003' },
    { name: 'Vercel Frontend: Homepage', url: 'https://consumer-trust-portal.vercel.app' },
    { name: 'Vercel Frontend: Prepare Grievance', url: 'https://consumer-trust-portal.vercel.app/register' },
    { name: 'Vercel Frontend: Track Case (with query param)', url: 'https://consumer-trust-portal.vercel.app/track?id=CTP-2026-003' },
    { name: 'Vercel Frontend: Brand Benchmark Index', url: 'https://consumer-trust-portal.vercel.app/brands' },
    { name: 'Vercel Frontend: Citizen Charter', url: 'https://consumer-trust-portal.vercel.app/charter' },
    { name: 'Vercel Frontend: Privacy Policy', url: 'https://consumer-trust-portal.vercel.app/privacy' },
    { name: 'Vercel Frontend: Terms of Service', url: 'https://consumer-trust-portal.vercel.app/terms' },
    { name: 'Vercel Frontend: Sign In & Authentication', url: 'https://consumer-trust-portal.vercel.app/login' }
  ];

  console.log("==================================================");
  console.log("⚡ TESTING LIVE PRODUCTION ENDPOINTS");
  console.log("==================================================");

  let passed = 0;
  for (const item of apis) {
    const start = Date.now();
    try {
      const res = await fetch(item.url);
      const latency = Date.now() - start;
      if (res.status === 200) {
        console.log(`✅ [PASS] ${item.name} -> HTTP ${res.status} (${latency}ms)`);
        passed++;
      } else {
        console.log(`⚠️ [WARN] ${item.name} -> HTTP ${res.status} (${latency}ms)`);
      }
    } catch (e) {
      console.log(`❌ [FAIL] ${item.name} -> Error: ${e.message}`);
    }
  }

  console.log("==================================================");
  console.log(`📊 TOTAL SCORE: ${passed} / ${apis.length} PASSED (${Math.round((passed / apis.length) * 100)}%)`);
  console.log("==================================================");
}

run();
