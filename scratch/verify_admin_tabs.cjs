const puppeteer = require('c:/xampp/htdocs/HMS_V6.6/node_modules/puppeteer-core');
const fs = require('fs');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function verifyTabs() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1050, deviceScaleFactor: 2 });

  await page.goto('https://hms-2-4.vercel.app/?hospital_id=1', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(2000);

  // Login
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(x => x.textContent && x.textContent.includes('Admin'));
    if (b) b.click();
  });
  await sleep(1000);

  const modalInputs = await page.$$('div.fixed input');
  if (modalInputs.length >= 2) {
    await modalInputs[0].type('admin', { delay: 30 });
    await modalInputs[1].type('Admin@123', { delay: 30 });
  }
  await sleep(500);

  const modalSubmitBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('div.fixed button'));
    return btns.find(x => x.textContent && (x.textContent.includes('உள்நுழைக') || x.textContent.includes('Login')));
  });
  if (modalSubmitBtn) {
    await modalSubmitBtn.click();
    await sleep(2500);
  }

  // 1. Overview
  const t1 = await page.evaluate(() => document.body.innerText.slice(0, 300));
  console.log('--- Overview Tab Content ---:\n', t1.replace(/\n+/g, ' '));

  // 2. Click Branding Settings
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('aside nav button, nav button, aside button'));
    const b = btns.find(x => x.textContent.trim().includes('Branding Settings'));
    if (b) b.click();
  });
  await sleep(1500);
  const t2 = await page.evaluate(() => document.body.innerText.slice(0, 300));
  console.log('--- Branding Settings Tab Content ---:\n', t2.replace(/\n+/g, ' '));

  // 3. Click Form Builder
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('aside nav button, nav button, aside button'));
    const b = btns.find(x => x.textContent.trim().includes('Form Builder'));
    if (b) b.click();
  });
  await sleep(1500);
  const t3 = await page.evaluate(() => document.body.innerText.slice(0, 300));
  console.log('--- Form Builder - Service Feedback Content ---:\n', t3.replace(/\n+/g, ' '));

  // 4. Click Questionary Page inside Form Builder
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(x => x.textContent.trim() === 'Questionary Page');
    if (b) b.click();
  });
  await sleep(1500);
  const t4 = await page.evaluate(() => document.body.innerText.slice(0, 300));
  console.log('--- Form Builder - Questionary Page Content ---:\n', t4.replace(/\n+/g, ' '));

  // 5. Click Settings inside Form Builder
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(x => x.textContent.trim() === 'Settings');
    if (b) b.click();
  });
  await sleep(1500);
  const t5 = await page.evaluate(() => document.body.innerText.slice(0, 300));
  console.log('--- Form Builder - Settings Content ---:\n', t5.replace(/\n+/g, ' '));

  // 6. Click Departments inside Form Builder
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(x => x.textContent.trim() === 'Departments');
    if (b) b.click();
  });
  await sleep(1500);
  const t6 = await page.evaluate(() => document.body.innerText.slice(0, 300));
  console.log('--- Form Builder - Departments Content ---:\n', t6.replace(/\n+/g, ' '));

  await browser.close();
}

verifyTabs();
