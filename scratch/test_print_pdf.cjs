const puppeteer = require('c:/xampp/htdocs/HMS_V6.6/node_modules/puppeteer-core');
const { PDFDocument } = require('c:/xampp/htdocs/HMS_V6.6/node_modules/pdf-lib');
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

function startLocalServer(port = 3337) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0];
      if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

      const filePath = path.join(ROOT_DIR, reqPath);
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

    server.listen(port, () => {
      resolve(server);
    });
  });
}

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function testPrintOutput() {
  const server = await startLocalServer(3337);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1050, deviceScaleFactor: 2 });

  await page.goto('http://localhost:3337/', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(1500);

  // Login Admin
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const adminBtn = btns.find(b => b.textContent && b.textContent.includes('Admin'));
    if (adminBtn) adminBtn.click();
  });
  await sleep(1000);

  const modalInputs = await page.$$('div.fixed input');
  if (modalInputs.length >= 2) {
    await modalInputs[0].type('admin', { delay: 20 });
    await modalInputs[1].type('Admin@123', { delay: 20 });
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

  // Feedback Responses
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('aside nav button, nav button, aside button'));
    const b = btns.find(x => x.textContent.trim().includes('Feedback Responses'));
    if (b) b.click();
  });
  await sleep(1500);

  // Open first modal
  await page.evaluate(() => {
    const tableRows = document.querySelectorAll('tbody tr');
    if (tableRows.length > 0) {
      const rowBtns = tableRows[0].querySelectorAll('button');
      if (rowBtns.length > 0) rowBtns[rowBtns.length - 1].click();
    }
  });
  await sleep(1500);

  // Trigger print mode class
  await page.evaluate(() => {
    document.body.classList.add('is-printing-modal');
  });

  // Emulate print media
  await page.emulateMediaType('print');

  const pdfPath = 'c:/xampp/htdocs/HMS_V6.6/scratch/printed_feedback_detail.pdf';
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '8mm', bottom: '8mm', left: '8mm', right: '8mm' }
  });

  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pageCount = pdfDoc.getPageCount();

  console.log(`Printed Feedback Detail PDF generated: ${pageCount} pages (Expected: 1-2 pages, zero blank pages)`);

  await browser.close();
  server.close();
}

testPrintOutput();
