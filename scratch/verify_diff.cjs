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

function startLocalServer(port = 3335) {
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

async function verifyScreenshotsDiff() {
  const server = await startLocalServer(3335);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1050, deviceScaleFactor: 2 });

  await page.goto('http://localhost:3335/', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(2000);

  // Fill Step 1
  await page.evaluate(() => {
    const uhidInput = document.querySelector('input[placeholder*="UHID"], input[placeholder*="uhid"]');
    if (uhidInput) { uhidInput.value = 'UHID-98234'; uhidInput.dispatchEvent(new Event('input', { bubbles: true })); }
    
    const fnInput = document.querySelector('input[placeholder*="First name"], input[placeholder*="முதல்"]');
    if (fnInput) { fnInput.value = 'நந்தினி'; fnInput.dispatchEvent(new Event('input', { bubbles: true })); }

    const lnInput = document.querySelector('input[placeholder*="Last name"], input[placeholder*="கடைசி"]');
    if (lnInput) { lnInput.value = 'இளங்கோவன்'; lnInput.dispatchEvent(new Event('input', { bubbles: true })); }
    
    const ageInput = document.querySelector('input[type="number"]');
    if (ageInput) { ageInput.value = '28'; ageInput.dispatchEvent(new Event('input', { bubbles: true })); }

    const genderSelect = document.querySelector('select');
    if (genderSelect) { genderSelect.value = 'Female'; genderSelect.dispatchEvent(new Event('change', { bubbles: true })); }

    const mobInput = document.querySelector('input[type="tel"]');
    if (mobInput) { mobInput.value = '9876543210'; mobInput.dispatchEvent(new Event('input', { bubbles: true })); }
  });
  await sleep(1000);

  // Step 1 screenshot
  await page.screenshot({ path: 'c:/xampp/htdocs/HMS_V6.6/scratch/t_step1.png' });

  // Click Next -> Step 2 (Service Feedback)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const nextBtn = btns.find(b => b.textContent && (b.textContent.includes('Next') || b.textContent.includes('அடுத்தது')));
    if (nextBtn) nextBtn.click();
  });
  await sleep(1500);
  await page.screenshot({ path: 'c:/xampp/htdocs/HMS_V6.6/scratch/t_step2.png' });

  // Click Next -> Step 3 (Questionary Page)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const nextBtn = btns.find(b => b.textContent && (b.textContent.includes('Next') || b.textContent.includes('அடுத்தது')));
    if (nextBtn) nextBtn.click();
  });
  await sleep(1500);
  await page.screenshot({ path: 'c:/xampp/htdocs/HMS_V6.6/scratch/t_step3.png' });

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

  // Take top screenshot (OP Date)
  await page.screenshot({ path: 'c:/xampp/htdocs/HMS_V6.6/scratch/t_modal_top.png' });

  // Scroll modal to Office Use section and click save
  await page.evaluate(() => {
    const modal = document.querySelector('#printable-feedback-modal');
    if (modal) modal.scrollTop = 500;

    const textareas = document.querySelectorAll('#printable-feedback-modal textarea');
    if (textareas.length >= 2) {
      textareas[0].value = 'Patient requested additional clarification on consultation charges. Addressed by billing desk.';
      textareas[0].dispatchEvent(new Event('input', { bubbles: true }));
      textareas[1].value = 'Detailed fee schedule explained to patient. Updated patient billing summary copy provided.';
      textareas[1].dispatchEvent(new Event('input', { bubbles: true }));
    }
    const inputs = document.querySelectorAll('#printable-feedback-modal input');
    if (inputs.length >= 2) {
      inputs[inputs.length - 1].value = 'Dr. Ramesh Kumar / Quality Manager';
      inputs[inputs.length - 1].dispatchEvent(new Event('input', { bubbles: true }));
    }
    const btns = Array.from(document.querySelectorAll('#printable-feedback-modal button'));
    const saveBtn = btns.find(b => b.textContent && b.textContent.includes('Save Office Use Details'));
    if (saveBtn) saveBtn.click();
  });
  await sleep(1000);

  // Take scrolled screenshot (Office Use & Alert Banner)
  await page.screenshot({ path: 'c:/xampp/htdocs/HMS_V6.6/scratch/t_modal_bottom.png' });

  await browser.close();
  server.close();
}

verifyScreenshotsDiff();
