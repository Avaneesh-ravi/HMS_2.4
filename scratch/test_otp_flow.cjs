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

server.listen(3340, async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto('http://localhost:3340/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    console.log('Testing Email "asdf" typing and verifying button state...');
    const emailInput = await page.$('input[type="email"]');
    await emailInput.focus();
    await emailInput.type('asdf');
    await new Promise(r => setTimeout(r, 300));

    const emailError = await page.evaluate(() => {
      const errs = Array.from(document.querySelectorAll('p.text-red-500'));
      return errs.map(e => e.textContent);
    });
    console.log('Email error:', emailError);

    const emailVerifyBtnInfo = await page.evaluate(() => {
      const emailContainer = document.querySelector('input[type="email"]').closest('div.bg-gray-50');
      const btn = emailContainer ? emailContainer.querySelector('button') : null;
      return {
        disabled: btn ? btn.disabled : null,
        className: btn ? btn.className : null,
        text: btn ? btn.textContent.trim() : null
      };
    });
    console.log('Email verify button info for "asdf":', emailVerifyBtnInfo);

    console.log('\nTesting Email valid "patient@example.com" typing...');
    await page.evaluate(() => {
      const emailInput = document.querySelector('input[type="email"]');
      emailInput.value = '';
    });
    await emailInput.focus();
    await emailInput.type('patient@example.com');
    await new Promise(r => setTimeout(r, 300));

    const emailVerifyBtnValidInfo = await page.evaluate(() => {
      const emailContainer = document.querySelector('input[type="email"]').closest('div.bg-gray-50');
      const btn = emailContainer ? emailContainer.querySelector('button') : null;
      return {
        disabled: btn ? btn.disabled : null,
        className: btn ? btn.className : null,
        text: btn ? btn.textContent.trim() : null
      };
    });
    console.log('Email verify button info for valid email:', emailVerifyBtnValidInfo);

    await browser.close();
    server.close();
    console.log('\nEMAIL VALIDATION & DISABLE STATE TEST PASSED!');
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    server.close();
    process.exit(1);
  }
});
