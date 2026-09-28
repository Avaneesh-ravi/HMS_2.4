const puppeteer = require('c:/xampp/htdocs/HMS_V6.6/node_modules/puppeteer-core');
const fs = require('fs');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAdminLogin() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 });

  await page.goto('https://hms-2-4.vercel.app/?hospital_id=1', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(2000);

  console.log('Finding Admin button in header...');
  // Find button with text 'Admin' or icon
  const adminBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button, a'));
    return btns.find(b => b.textContent && b.textContent.includes('Admin'));
  });

  if (adminBtn) {
    console.log('Clicking Admin button...');
    await adminBtn.click();
    await sleep(1000);

    // Fill login modal
    console.log('Typing credentials...');
    const usernameInput = await page.$('input[type="text"], input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');

    if (usernameInput && passwordInput) {
      await usernameInput.type('admin');
      await passwordInput.type('admin123');
      
      // Click Login submit button
      const submitBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.textContent && (b.textContent.includes('Login') || b.textContent.includes('Sign In') || b.textContent.includes('உள்நுழைக')));
      });

      if (submitBtn) {
        console.log('Submitting login...');
        await submitBtn.click();
        await sleep(2000);
      }
    }
  }

  // Check what sidebar items are now visible
  const sidebarItems = await page.evaluate(() => {
    const navButtons = Array.from(document.querySelectorAll('aside button, nav button'));
    return navButtons.map(b => b.textContent.trim());
  });

  console.log('Admin Dashboard Sidebar Items:', sidebarItems);

  await browser.close();
}

testAdminLogin();
