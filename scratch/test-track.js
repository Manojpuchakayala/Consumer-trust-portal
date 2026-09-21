const puppeteer = require('./node_modules/puppeteer-core');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\manoj\\.gemini\\antigravity\\brain\\55cc5e00-5e69-412f-9868-f42eafa7e4bd';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function testTrack() {
  console.log('Testing tracking CTP-2026-003 in browser...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto('http://localhost:4173/track?id=CTP-2026-003', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 2000));

    const screenshotPath = path.join(ARTIFACT_DIR, 'track_case_result.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Saved screenshot: ${screenshotPath}`);
  } catch (err) {
    console.error('Error testing tracking:', err);
  } finally {
    await browser.close();
  }
}

testTrack();
