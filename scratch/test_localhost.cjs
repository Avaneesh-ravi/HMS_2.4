const puppeteer = require('c:/xampp/htdocs/HMS_V6.6/node_modules/puppeteer-core');
const fs = require('fs');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function testLocalhost() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1050']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost/HMS_V6.6/frontend/index.html', { waitUntil: 'networkidle2', timeout: 15000 });
  
  const title = await page.title();
  console.log('Page Title:', title);

  const heading = await page.evaluate(() => document.querySelector('h1, h2, h3')?.textContent);
  console.log('Heading:', heading);

  await browser.close();
}

testLocalhost();
