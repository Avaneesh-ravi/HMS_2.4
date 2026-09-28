const puppeteer = require('c:/xampp/htdocs/HMS_V6.6/node_modules/puppeteer-core');
const fs = require('fs');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function inspectPage() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000']
  });

  const page = await browser.newPage();
  await page.goto('https://hms-2-4.vercel.app/', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(2000);

  const elements = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, a, input, h1, h2, h3')).map(el => ({
      tag: el.tagName,
      text: el.textContent ? el.textContent.trim() : '',
      href: el.getAttribute('href'),
      className: el.className
    }));
  });

  console.log('Elements on page:', JSON.stringify(elements, null, 2));

  await browser.close();
}

inspectPage();
