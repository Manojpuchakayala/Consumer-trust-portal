const puppeteer = require('./node_modules/puppeteer-core');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\manoj\\.gemini\\antigravity\\brain\\55cc5e00-5e69-412f-9868-f42eafa7e4bd';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function capture() {
  console.log('Launching Edge for visual QA captures...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();

    // 1. Desktop Light Mode Full Page
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1000));
    
    const desktopLightPath = path.join(ARTIFACT_DIR, 'desktop_homepage_refined.png');
    await page.screenshot({ path: desktopLightPath, fullPage: true });
    console.log(`Saved: ${desktopLightPath}`);

    // 2. Mobile Light Mode Full Page
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1000));
    
    const mobileLightPath = path.join(ARTIFACT_DIR, 'mobile_homepage_refined.png');
    await page.screenshot({ path: mobileLightPath, fullPage: true });
    console.log(`Saved: ${mobileLightPath}`);

    // 3. Desktop Dark Mode Full Page
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.click('.theme-btn:not(.mobile)');
    await new Promise((r) => setTimeout(r, 600));
    const desktopDarkPath = path.join(ARTIFACT_DIR, 'desktop_homepage_dark.png');
    await page.screenshot({ path: desktopDarkPath, fullPage: true });
    console.log(`Saved: ${desktopDarkPath}`);

    // 4. Mobile Dark Mode Full Page
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await new Promise((r) => setTimeout(r, 600));
    const mobileDarkPath = path.join(ARTIFACT_DIR, 'mobile_homepage_dark.png');
    await page.screenshot({ path: mobileDarkPath, fullPage: true });
    console.log(`Saved: ${mobileDarkPath}`);

    // Reset theme back to light
    await page.click('.theme-btn.mobile');
    await new Promise((r) => setTimeout(r, 400));

    console.log('All screenshots captured successfully!');
  } catch (err) {
    console.error('Capture error:', err);
  } finally {
    await browser.close();
  }
}

capture();
