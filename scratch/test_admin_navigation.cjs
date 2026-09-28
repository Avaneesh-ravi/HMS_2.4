const puppeteer = require('c:/xampp/htdocs/HMS_V6.6/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAdmin() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 });

  await page.goto('https://hms-2-4.vercel.app/', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(2000);

  // Click Admin button
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Admin')) {
      console.log('Found Admin button, clicking...');
      await btn.click();
      await sleep(1500);
      break;
    }
  }

  // Check what sidebar items exist
  const sidebarButtons = await page.$$('aside button, nav button');
  console.log(`Found ${sidebarButtons.length} sidebar buttons:`);
  for (const btn of sidebarButtons) {
    const text = await page.evaluate(el => el.textContent.trim(), btn);
    console.log(' - Sidebar item:', text);
  }

  await browser.close();
}

testAdmin();
