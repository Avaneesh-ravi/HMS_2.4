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

server.listen(3335, async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1050, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3335/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Let's directly click step 2 in the progress stepper!
  // In the header, there is ProgressSteps:
  // Buttons: 1 Patient Information, 2 Service Feedback, 3 Questionary Page, 4 Review & Submit
  const stepBtns = await page.$$('button');
  for (let b of stepBtns) {
    const text = await (await b.getProperty('innerText')).jsonValue();
    console.log('BUTTON:', text.replace(/\n/g, ' '));
  }

  // Click on "2 Service Feedback"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const step2Btn = btns.find(b => b.innerText.includes('Service Feedback') || b.innerText.includes('சேவை கருத்து'));
    if (step2Btn) step2Btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: 'c:/xampp/htdocs/HMS_V6.6/screenshots/test_step1.png' });

  // Click on "3 Questionary Page"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const step3Btn = btns.find(b => b.innerText.includes('Questionary') || b.innerText.includes('கேள்வி'));
    if (step3Btn) step3Btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: 'c:/xampp/htdocs/HMS_V6.6/screenshots/test_step2.png' });

  console.log('Screenshots taken for step 1 and step 2!');
  await browser.close();
  server.close();
});
