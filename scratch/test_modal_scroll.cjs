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

function startLocalServer(port = 3336) {
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

async function testModalScroll() {
  const server = await startLocalServer(3336);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1050, deviceScaleFactor: 2 });

  await page.goto('http://localhost:3336/', { waitUntil: 'networkidle2', timeout: 30000 });
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

  // Go to Feedback Responses
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('aside nav button, nav button, aside button'));
    const b = btns.find(x => x.textContent.trim().includes('Feedback Responses'));
    if (b) b.click();
  });
  await sleep(1500);

  // Click View on first row
  await page.evaluate(() => {
    const tableRows = document.querySelectorAll('tbody tr');
    if (tableRows.length > 0) {
      const rowBtns = tableRows[0].querySelectorAll('button');
      if (rowBtns.length > 0) rowBtns[rowBtns.length - 1].click();
    }
  });
  await sleep(1500);

  await page.screenshot({ path: 'c:/xampp/htdocs/HMS_V6.6/scratch/m_top.png' });

  // Scroll to Office Use and save
  await page.evaluate(() => {
    const modal = document.querySelector('#printable-feedback-modal');
    if (modal) {
      modal.scrollTo({ top: modal.scrollHeight, behavior: 'instant' });
    }
    const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Save Office Use Details'));
    if (saveBtn) {
      saveBtn.scrollIntoView({ block: 'center' });
      saveBtn.click();
    }
  });
  await sleep(1000);

  await page.screenshot({ path: 'c:/xampp/htdocs/HMS_V6.6/scratch/m_bottom.png' });

  await browser.close();
  server.close();
}

testModalScroll();
