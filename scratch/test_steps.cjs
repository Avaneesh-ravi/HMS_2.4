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

server.listen(3334, async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new'
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  await page.goto('http://localhost:3334/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const debugInfo = await page.evaluate(async () => {
    return {
      title: document.title,
      headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.innerText),
      buttons: Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim())
    };
  });

  console.log('DEBUG INFO RESULT:', debugInfo);
  await browser.close();
  server.close();
});
