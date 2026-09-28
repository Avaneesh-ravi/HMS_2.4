const puppeteer = require('c:/xampp/htdocs/HMS_V6.6/node_modules/puppeteer-core');
const fs = require('fs');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function inspectLoginFlow() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 });

  await page.goto('https://hms-2-4.vercel.app/?hospital_id=1', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(2000);

  // Take screenshot of main page
  await page.screenshot({ path: 'c:/xampp/htdocs/HMS_V6.6/scratch/step0_main.png' });

  // Click Admin button
  const clicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, a'));
    const adminBtn = btns.find(b => b.textContent && b.textContent.includes('Admin'));
    if (adminBtn) {
      adminBtn.click();
      return true;
    }
    return false;
  });
  console.log('Admin button clicked:', clicked);
  await sleep(1500);

  // Take screenshot of modal
  await page.screenshot({ path: 'c:/xampp/htdocs/HMS_V6.6/scratch/step1_modal.png' });

  const modalInputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input, button')).map(el => ({
      tag: el.tagName,
      type: el.getAttribute('type'),
      placeholder: el.getAttribute('placeholder'),
      text: el.textContent ? el.textContent.trim() : '',
      value: el.value
    }));
  });
  console.log('Modal elements:', modalInputs);

  await browser.close();
}

inspectLoginFlow();
