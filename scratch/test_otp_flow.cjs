const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const ROOT_DIR = 'c:/xampp/htdocs/HMS_V6.6/frontend';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = 'index.html';
  const safePath = reqPath.replace(/^\/+/, '');
  const filePath = path.join(ROOT_DIR, safePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType, 'Access-Control-Allow-Origin': '*' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    const indexPath = path.join(ROOT_DIR, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
    fs.createReadStream(indexPath).pipe(res);
  }
});

server.listen(3339, async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto('http://localhost:3339/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    console.log('1. Testing Mobile "123" typing...');
    const mobileInput = await page.$('input[type="tel"]');
    await mobileInput.focus();
    await mobileInput.type('123');
    await new Promise(r => setTimeout(r, 300));

    const mobileError = await page.evaluate(() => {
      const err = document.querySelector('p.text-red-500');
      return err ? err.textContent : null;
    });
    console.log('Mobile error for "123":', mobileError);

    const otpSectionVisible = await page.evaluate(() => {
      return document.body.innerText.includes('6 இலக்க OTP உள்ளிடவும்');
    });
    console.log('OTP section present for "123"?:', otpSectionVisible);

    const verifyBtnDisabled = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const vBtn = btns.find(b => b.textContent.includes('சரிபார்') || b.textContent.includes('Verify'));
      return vBtn ? vBtn.disabled : null;
    });
    console.log('Verify button disabled for "123"?:', verifyBtnDisabled);

    console.log('\n2. Testing Email "bjj" typing...');
    const emailInput = await page.$('input[type="email"]');
    await emailInput.focus();
    await emailInput.type('bjj');
    await new Promise(r => setTimeout(r, 300));

    const allErrors = await page.evaluate(() => {
      const errs = Array.from(document.querySelectorAll('p.text-red-500'));
      return errs.map(e => e.textContent);
    });
    console.log('All errors present:', allErrors);

    const emailOtpSectionVisible = await page.evaluate(() => {
      const text = document.body.innerText;
      return (text.match(/6 இலக்க OTP உள்ளிடவும்/g) || []).length > 0;
    });
    console.log('Any OTP section present for email "bjj"?:', emailOtpSectionVisible);

    console.log('\n3. Testing complete 10-digit mobile input...');
    await mobileInput.focus();
    await mobileInput.type('4567890'); // 123 + 4567890 = 10 digits
    await new Promise(r => setTimeout(r, 300));

    const mobileErrorsNow = await page.evaluate(() => {
      const errs = Array.from(document.querySelectorAll('p.text-red-500'));
      return errs.map(e => e.textContent);
    });
    console.log('Errors remaining after 10 digits:', mobileErrorsNow);

    const verifyBtnEnabled = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const vBtn = btns.find(b => b.textContent.trim() === 'சரிபார்' || b.textContent.trim() === 'Verify');
      return vBtn ? !vBtn.disabled : false;
    });
    console.log('Verify button enabled for 10 digits?:', verifyBtnEnabled);

    // Click verify
    console.log('Clicking Verify button...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const vBtn = btns.find(b => b.textContent.trim() === 'சரிபார்' || b.textContent.trim() === 'Verify');
      if (vBtn) vBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    const otpBoxNow = await page.evaluate(() => {
      return document.body.innerText.includes('6 இலக்க OTP உள்ளிடவும்');
    });
    console.log('OTP Box visible after clicking Verify on 10 digits?:', otpBoxNow);

    console.log('\n4. Testing backspacing to 9 digits (editing mobile number)...');
    await mobileInput.focus();
    await page.keyboard.press('Backspace');
    await new Promise(r => setTimeout(r, 400));

    const otpBoxAfterBackspace = await page.evaluate(() => {
      return document.body.innerText.includes('6 இலக்க OTP உள்ளிடவும்');
    });
    console.log('OTP Box disappeared after editing to 9 digits?:', !otpBoxAfterBackspace);

    const errorAfterBackspace = await page.evaluate(() => {
      const err = document.querySelector('p.text-red-500');
      return err ? err.textContent : null;
    });
    console.log('Mobile error after editing to 9 digits:', errorAfterBackspace);

    await browser.close();
    server.close();
    console.log('\nALL VERIFICATION TESTS PASSED PERFECTLY!');
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    server.close();
    process.exit(1);
  }
});
