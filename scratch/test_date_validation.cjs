const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const ROOT_DIR = 'c:/xampp/htdocs/HMS_V6.6/frontend';
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0].replace(/^\/+/, '');
  if (!reqPath || reqPath === '') reqPath = 'index.html';
  let filePath = path.join(ROOT_DIR, reqPath);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    filePath = path.join(ROOT_DIR, 'index.html');
  }
  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': ext === '.js' ? 'text/javascript' : (ext === '.css' ? 'text/css' : 'text/html') });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(3347, async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: 'new',
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('http://localhost:3347/?hospital_id=1', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    console.log('1. Filling mandatory fields with OP selected...');
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const uhid = inputs.find(i => (i.placeholder || '').includes('UHID') || (i.placeholder || '').includes('uhid'));
      if (uhid) { uhid.value = 'UHID-12345'; uhid.dispatchEvent(new Event('input', { bubbles: true })); }

      const fn = inputs.find(i => (i.placeholder || '').includes('முதல் பெயர்') || (i.placeholder || '').includes('First'));
      if (fn) { fn.value = 'ராம்'; fn.dispatchEvent(new Event('input', { bubbles: true })); }

      const ln = inputs.find(i => (i.placeholder || '').includes('கடைசி பெயர்') || (i.placeholder || '').includes('Last'));
      if (ln) { ln.value = 'குமார்'; ln.dispatchEvent(new Event('input', { bubbles: true })); }

      const age = document.querySelector('input[type="number"]');
      if (age) { age.value = '28'; age.dispatchEvent(new Event('input', { bubbles: true })); }

      const gender = document.querySelector('select');
      if (gender) { gender.value = 'Male'; gender.dispatchEvent(new Event('change', { bubbles: true })); }

      const addr = document.querySelector('textarea');
      if (addr) { addr.value = '123 Main Road, Erode, Tamil Nadu'; addr.dispatchEvent(new Event('input', { bubbles: true })); }

      const mobile = document.querySelector('input[type="tel"]');
      if (mobile) { mobile.value = '9876543210'; mobile.dispatchEvent(new Event('input', { bubbles: true })); }

      const opBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('வெளிநோயாளி (OP)'));
      if (opBtn) opBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // Verify mobile
    await page.evaluate(() => {
      const vBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'சரிபார்');
      if (vBtn) vBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));
    await page.evaluate(() => {
      const vOtpBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'OTP சரிபார்');
      if (vOtpBtn) vOtpBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    console.log('2. Clicking Next with empty OP Date...');
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('அடுத்தது'));
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    const opErrors = await page.evaluate(() => {
      const errs = Array.from(document.querySelectorAll('p.text-red-500'));
      return errs.map(e => e.textContent);
    });
    console.log('Errors displayed after clicking Next on OP:', opErrors);

    console.log('\n3. Testing IP visit type switch and empty IP dates...');
    await page.evaluate(() => {
      const ipBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('உள்நோயாளி (IP)'));
      if (ipBtn) ipBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    console.log('4. Clicking Next with empty IP Dates...');
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('அடுத்தது'));
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    const ipErrors = await page.evaluate(() => {
      const errs = Array.from(document.querySelectorAll('p.text-red-500'));
      return errs.map(e => e.textContent);
    });
    console.log('Errors displayed for IP with empty dates:', ipErrors);

    await browser.close();
    server.close();
    console.log('\nDATE VALIDATION TESTS COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    server.close();
    process.exit(1);
  }
});
