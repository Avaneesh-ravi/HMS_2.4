const puppeteer = require('c:/xampp/htdocs/HMS_V6.6/node_modules/puppeteer-core');
const fs = require('fs');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testFullAdmin() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 });

  await page.goto('https://hms-2-4.vercel.app/?hospital_id=1', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(2000);

  // Click Admin button in header
  const adminBtn = await page.$('button.flex.items-center.gap-2.text-sm');
  if (adminBtn) {
    await adminBtn.click();
  } else {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(x => x.textContent && x.textContent.includes('Admin'));
      if (b) b.click();
    });
  }
  await sleep(1000);

  // Type credentials into modal
  const inputs = await page.$$('div.fixed input');
  console.log(`Found ${inputs.length} inputs in modal`);
  if (inputs.length >= 2) {
    await inputs[0].click({ clickCount: 3 });
    await inputs[0].type('admin', { delay: 50 });
    await inputs[1].click({ clickCount: 3 });
    await inputs[1].type('Admin@123', { delay: 50 });
  }

  await sleep(500);

  // Click modal submit button
  const modalSubmitBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('div.fixed button'));
    return btns.find(x => x.textContent && (x.textContent.includes('உள்நுழைக') || x.textContent.includes('Login')));
  });

  if (modalSubmitBtn) {
    await modalSubmitBtn.click();
    console.log('Clicked modal submit button');
  }

  await sleep(3000);

  const navs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('aside nav button, nav button, aside button')).map(b => b.textContent.trim());
  });

  console.log('Sidebar Navigation Buttons:', navs);

  await page.screenshot({ path: 'c:/xampp/htdocs/HMS_V6.6/scratch/admin_dashboard_full.png' });

  await browser.close();
}

testFullAdmin();
