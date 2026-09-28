const puppeteer = require('c:/xampp/htdocs/HMS_V6.6/node_modules/puppeteer-core');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = 'c:/xampp/htdocs/HMS_V6.6/frontend';
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
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
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1050, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3340/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Admin login
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const adminBtn = btns.find(b => b.textContent && b.textContent.includes('Admin'));
    if (adminBtn) adminBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const modalInputs = await page.$$('div.fixed input');
  if (modalInputs.length >= 2) {
    await modalInputs[0].type('admin', { delay: 20 });
    await modalInputs[1].type('Admin@123', { delay: 20 });
  }
  await new Promise(r => setTimeout(r, 500));

  const modalSubmitBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('div.fixed button'));
    return btns.find(x => x.textContent && (x.textContent.includes('உள்நுழைக') || x.textContent.includes('Login')));
  });
  if (modalSubmitBtn) {
    await modalSubmitBtn.click();
    await new Promise(r => setTimeout(r, 2500));
  }

  // 1. Click sidebar 'Feedback Responses'
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('aside nav button, nav button, aside button'));
    const target = btns.find(b => b.textContent.includes('Feedback Responses') || b.textContent.includes('கருத்து பதில்கள்'));
    if (target) target.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: 'c:/xampp/htdocs/HMS_V6.6/screenshots/test_responses_table.png' });

  // 2. Open Feedback Detail modal (Ref 26)
  await page.evaluate(() => {
    const eyeBtn = document.querySelector('tbody tr button[title*="View Feedback"], tbody tr td:nth-child(7) button');
    if (eyeBtn) eyeBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: 'c:/xampp/htdocs/HMS_V6.6/screenshots/test_eye_modal.png' });

  // Close Feedback Detail modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector('#printable-feedback-modal button:last-child');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // 3. Open Office Use modal (Ref 16 & Ref 28)
  await page.evaluate(() => {
    const officeBtn = document.querySelector('tbody tr td:last-child button');
    if (officeBtn) officeBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: 'c:/xampp/htdocs/HMS_V6.6/screenshots/test_office_use_modal.png' });

  console.log('Successfully captured all admin modals!');
  await browser.close();
  server.close();
});
