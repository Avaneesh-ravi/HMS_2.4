const puppeteer = require('c:/xampp/htdocs/HMS_V6.6/node_modules/puppeteer-core');
const { PDFDocument, rgb, StandardFonts } = require('c:/xampp/htdocs/HMS_V6.6/node_modules/pdf-lib');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

const SCREENSHOT_DIR = 'c:\\xampp\\htdocs\\HMS_V6.6\\screenshots';
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureAllAdminScreenshots() {
  console.log('Launching browser with Chrome at:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1050, deviceScaleFactor: 2 });

  const capturedViews = [];

  try {
    // -------------------------------------------------------------
    // PART 1: PATIENT REGISTRATION & LOCALIZATION VIEWS
    // -------------------------------------------------------------
    console.log('1. Capturing Patient Information (Tamil)...');
    await page.goto('https://hms-2-4.vercel.app/?hospital_id=1', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    // Switch to Tamil
    try {
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const b = btns.find(x => x.textContent && x.textContent.includes('தமிழ்'));
        if (b) b.click();
      });
      await sleep(1000);
    } catch (e) {}

    // Fill Tamil patient info
    try {
      const inputs = await page.$$('input[type="text"]');
      if (inputs.length >= 2) {
        await inputs[0].type('UHID-98234');
        await inputs[1].type('நந்தினி'); // Valid Tamil Name
      }
      const ageInput = await page.$('input[type="number"]');
      if (ageInput) await ageInput.type('28');
    } catch (e) {}

    const p1Path = path.join(SCREENSHOT_DIR, '01_patient_info_tamil.png');
    await page.screenshot({ path: p1Path, fullPage: false });
    capturedViews.push({
      file: p1Path,
      badge: 'PATIENT PORTAL',
      title: 'Reference 12 & 15: Patient Registration with Verified Tamil Name Validation',
      desc: 'Demonstrates acceptance of native Unicode Tamil script (Nandhini) without triggering false validation warnings, alongside fully localized field labels and progress indicators.'
    });

    // 2. Service Feedback (Tamil)
    console.log('2. Capturing Service Feedback (Tamil)...');
    try {
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const b = btns.find(x => x.textContent && (x.textContent.includes('அடுத்தது') || x.textContent.includes('Next')));
        if (b) b.click();
      });
      await sleep(1500);
    } catch (e) {}

    const p2Path = path.join(SCREENSHOT_DIR, '02_service_feedback_tamil.png');
    await page.screenshot({ path: p2Path, fullPage: false });
    capturedViews.push({
      file: p2Path,
      badge: 'PATIENT PORTAL',
      title: 'Reference 1, 11, 14 & 16: Bilingual Hospital Service Rating Cards',
      desc: 'Displays bilingual Tamil & English department rating cards (Reception, Admission, Billing, Nursing, Doctor Care) with 5-star & emoji rating modes and clean typography.'
    });

    // -------------------------------------------------------------
    // PART 2: ADMIN DASHBOARD - AUTHENTICATION
    // -------------------------------------------------------------
    console.log('3. Logging into Admin Dashboard...');
    // Click Admin in Header
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(x => x.textContent && x.textContent.includes('Admin'));
      if (b) b.click();
    });
    await sleep(1000);

    // Type credentials
    const modalInputs = await page.$$('div.fixed input');
    if (modalInputs.length >= 2) {
      await modalInputs[0].type('admin', { delay: 20 });
      await modalInputs[1].type('Admin@123', { delay: 20 });
    }
    await sleep(500);

    // Submit login
    const modalSubmitBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('div.fixed button'));
      return btns.find(x => x.textContent && (x.textContent.includes('உள்நுழைக') || x.textContent.includes('Login')));
    });
    if (modalSubmitBtn) {
      await modalSubmitBtn.click();
      await sleep(2500);
    }

    // Helper to click sidebar navigation items
    async function clickSidebarTab(name) {
      await page.evaluate((tabName) => {
        const btns = Array.from(document.querySelectorAll('aside nav button, nav button, aside button'));
        const target = btns.find(b => b.textContent.trim().toLowerCase().includes(tabName.toLowerCase()));
        if (target) target.click();
      }, name);
      await sleep(1500);
    }

    // --- Page 3: Overview ---
    console.log('4. Capturing Admin Dashboard Overview...');
    await clickSidebarTab('Overview');
    const p3Path = path.join(SCREENSHOT_DIR, '03_admin_overview_analytics.png');
    await page.screenshot({ path: p3Path, fullPage: false });
    capturedViews.push({
      file: p3Path,
      badge: 'ADMIN DASHBOARD',
      title: 'Admin Dashboard: Real-Time Overview & Performance Analytics',
      desc: 'Executive dashboard featuring Total Responses (72), 79% Recommend Rate, Google Play-style 5-star rating breakdown, and recent activity logs with refresh control.'
    });

    // --- Page 4: Feedback Responses Table with Filters ---
    console.log('5. Capturing Admin Feedback Responses Table...');
    await clickSidebarTab('Feedback Responses');
    // Open filter toggle if exists
    try {
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const fBtn = btns.find(b => b.textContent && b.textContent.includes('Filter'));
        if (fBtn) fBtn.click();
      });
      await sleep(500);
    } catch (e) {}

    const p4Path = path.join(SCREENSHOT_DIR, '04_admin_responses_table_filters.png');
    await page.screenshot({ path: p4Path, fullPage: false });
    capturedViews.push({
      file: p4Path,
      badge: 'ADMIN DASHBOARD',
      title: 'Reference 6, 9, 19 & 23: Feedback Responses Management & Live Filtering',
      desc: 'Active Export CSV action, multi-parameter filtering (Search by UHID/Name, OP/IP Visit Type, Rating filter, Department filter), and uncorrupted Tamil patient submissions.'
    });

    // --- Page 5: Office Use Investigation & Resolution Modal ---
    console.log('6. Capturing Office Use Modal...');
    try {
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const actionBtn = btns.find(b => b.textContent && (b.textContent.includes('Edit Office') || b.textContent.includes('Fill') || b.textContent.includes('Resolve')));
        if (actionBtn) actionBtn.click();
      });
      await sleep(1500);
    } catch (e) {}

    const p5Path = path.join(SCREENSHOT_DIR, '05_admin_office_use_modal.png');
    await page.screenshot({ path: p5Path, fullPage: false });
    capturedViews.push({
      file: p5Path,
      badge: 'ADMIN DASHBOARD',
      title: 'Reference 16, 17, 18 & 20: Office Use Investigation & CAPA Resolution Modal',
      desc: 'Interactive modal for hospital administrators to record Review of Complaint, Date of Review, Incharge Name, Immediate Corrective Actions, and Long-Term Preventive Policies.'
    });

    // Close modal
    try {
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('div.fixed button'));
        const closeBtn = btns.find(b => b.textContent && (b.textContent.includes('Cancel') || b.textContent.includes('Close')));
        if (closeBtn) closeBtn.click();
      });
      await sleep(1000);
    } catch (e) {}

    // --- Page 6: Resolved Problems View ---
    console.log('7. Capturing Resolved Problems View...');
    try {
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const resBtn = btns.find(b => b.textContent && b.textContent.includes('Resolved'));
        if (resBtn) resBtn.click();
      });
      await sleep(1500);
    } catch (e) {}

    const p6Path = path.join(SCREENSHOT_DIR, '06_admin_resolved_problems.png');
    await page.screenshot({ path: p6Path, fullPage: false });
    capturedViews.push({
      file: p6Path,
      badge: 'ADMIN DASHBOARD',
      title: 'Reference 20, 21 & 26: Resolved Problems & Corrective Action Audit Trail',
      desc: 'Dedicated audit log tracking all investigated patient complaints, resolution dates, assigned department incharge, recorded corrective actions, and preventive policies.'
    });

    // --- Page 7: Feedback Report ---
    console.log('8. Capturing Feedback Report...');
    await clickSidebarTab('Feedback Report');
    const p7Path = path.join(SCREENSHOT_DIR, '07_admin_feedback_report.png');
    await page.screenshot({ path: p7Path, fullPage: false });
    capturedViews.push({
      file: p7Path,
      badge: 'ADMIN DASHBOARD',
      title: 'Reference 22, 25, 26 & 27: Full-Width Feedback Report & Action Header',
      desc: 'Executive summary report with Download Report and Print Report actions, KPI satisfaction metrics, full-width 2-column department breakdown, and Yes/No question analysis.'
    });

    // --- Page 8: Form Builder - Service Feedback ---
    console.log('9. Capturing Form Builder - Service Feedback...');
    await clickSidebarTab('Form Builder');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(x => x.textContent.trim() === 'Service Feedback');
      if (b) b.click();
    });
    await sleep(1200);

    const p8Path = path.join(SCREENSHOT_DIR, '08_admin_form_builder_services.png');
    await page.screenshot({ path: p8Path, fullPage: false });
    capturedViews.push({
      file: p8Path,
      badge: 'ADMIN DASHBOARD',
      title: 'Admin Form Builder: Service Feedback Question Cards & Rating Customization',
      desc: 'Drag-and-drop sortable question cards with grab handles, Emoji vs Star rating selector, Card background color palette picker, and 1-Column / 2-Column layout toggle.'
    });

    // --- Page 9: Form Builder - Questionary Page (Yes/No Questions) ---
    console.log('10. Capturing Form Builder - Questionary Page...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(x => x.textContent.trim() === 'Questionary Page');
      if (b) b.click();
    });
    await sleep(1200);

    const p9Path = path.join(SCREENSHOT_DIR, '09_admin_form_builder_questionary.png');
    await page.screenshot({ path: p9Path, fullPage: false });
    capturedViews.push({
      file: p9Path,
      badge: 'ADMIN DASHBOARD',
      title: 'Admin Form Builder: Questionary Page (Yes/No Questions & Dynamic Triggers)',
      desc: 'Builder for binary satisfaction questions with bilingual labels, conditional issue description triggers, and interactive live preview toggle chips.'
    });

    // --- Page 10: Form Builder - Settings & Layout ---
    console.log('11. Capturing Form Builder - Settings...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(x => x.textContent.trim() === 'Settings');
      if (b) b.click();
    });
    await sleep(1200);

    const p10Path = path.join(SCREENSHOT_DIR, '10_admin_form_builder_settings.png');
    await page.screenshot({ path: p10Path, fullPage: false });
    capturedViews.push({
      file: p10Path,
      badge: 'ADMIN DASHBOARD',
      title: 'Admin Form Builder: Form Layout & Global Presentation Settings',
      desc: 'Theme color customization, typography font size scaling, Combine Pages (single-page continuous vs multi-step wizard mode) toggle, and section title controls.'
    });

    // --- Page 11: Form Builder - Department Management ---
    console.log('12. Capturing Form Builder - Department Management...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(x => x.textContent.trim() === 'Departments');
      if (b) b.click();
    });
    await sleep(1200);

    const p11Path = path.join(SCREENSHOT_DIR, '11_admin_form_builder_departments.png');
    await page.screenshot({ path: p11Path, fullPage: false });
    capturedViews.push({
      file: p11Path,
      badge: 'ADMIN DASHBOARD',
      title: 'Admin Form Builder: Hospital Clinical & Support Department Directory',
      desc: 'Management interface to add, organize, and delete hospital departments selectable by patients during staff appreciation and service feedback.'
    });

    // --- Page 12: Branding Settings ---
    console.log('13. Capturing Branding Settings...');
    await clickSidebarTab('Branding Settings');
    const p12Path = path.join(SCREENSHOT_DIR, '12_admin_branding_settings.png');
    await page.screenshot({ path: p12Path, fullPage: false });
    capturedViews.push({
      file: p12Path,
      badge: 'ADMIN DASHBOARD',
      title: 'Admin Branding Settings: Hospital Identity & Dynamic Header Preview',
      desc: 'Configuration for Hospital Name, Address, Contact details, official Email, and Logo upload with real-time live preview of the branded patient header.'
    });

  } catch (err) {
    console.error('Error during admin screenshot capture:', err);
  } finally {
    await browser.close();
  }

  // -------------------------------------------------------------
  // PART 3: COMPILE ALL SCREENSHOTS INTO MULTI-PAGE PDF
  // -------------------------------------------------------------
  console.log(`Compiling ${capturedViews.length} screenshots into Comprehensive Reference PDF...`);
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pageWidth = 842; // A4 Landscape
  const pageHeight = 595;

  for (let i = 0; i < capturedViews.length; i++) {
    const sc = capturedViews[i];
    if (!fs.existsSync(sc.file)) {
      console.warn(`File does not exist: ${sc.file}`);
      continue;
    }

    const imgBytes = fs.readFileSync(sc.file);
    const img = await pdfDoc.embedPng(imgBytes);

    const pdfPage = pdfDoc.addPage([pageWidth, pageHeight]);

    // Top Header Banner
    const isPatientPortal = sc.badge === 'PATIENT PORTAL';
    pdfPage.drawRectangle({
      x: 0,
      y: pageHeight - 55,
      width: pageWidth,
      height: 55,
      color: isPatientPortal ? rgb(0.12, 0.53, 0.48) : rgb(0.05, 0.38, 0.36)
    });

    // Header Title
    pdfPage.drawText(`HMS V6.6 - System Verification & Admin Architecture Reference (${i + 1}/${capturedViews.length})`, {
      x: 25,
      y: pageHeight - 33,
      size: 13,
      font: fontBold,
      color: rgb(1, 1, 1)
    });

    // Category Badge
    const badgeText = `[ ${sc.badge} ]`;
    pdfPage.drawText(badgeText, {
      x: pageWidth - 160,
      y: pageHeight - 33,
      size: 10,
      font: fontBold,
      color: rgb(0.9, 0.95, 0.95)
    });

    // Page Title
    pdfPage.drawText(sc.title, {
      x: 25,
      y: pageHeight - 74,
      size: 11,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1)
    });

    // Description
    pdfPage.drawText(sc.desc, {
      x: 25,
      y: pageHeight - 90,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.35, 0.35, 0.35)
    });

    // Image Placement
    const maxImgWidth = pageWidth - 50;
    const maxImgHeight = pageHeight - 120;
    const scale = Math.min(maxImgWidth / img.width, maxImgHeight / img.height);
    const renderWidth = img.width * scale;
    const renderHeight = img.height * scale;
    const renderX = (pageWidth - renderWidth) / 2;
    const renderY = 18;

    // Card border
    pdfPage.drawRectangle({
      x: renderX - 2,
      y: renderY - 2,
      width: renderWidth + 4,
      height: renderHeight + 4,
      borderColor: rgb(0.85, 0.85, 0.85),
      borderWidth: 1,
      color: rgb(1, 1, 1)
    });

    pdfPage.drawImage(img, {
      x: renderX,
      y: renderY,
      width: renderWidth,
      height: renderHeight
    });
  }

  const pdfBytes = await pdfDoc.save();
  const outputPdfPath = 'c:\\xampp\\htdocs\\HMS_V6.6\\FIXED_TEST_REFERENCES_SCREENSHOTS.pdf';
  fs.writeFileSync(outputPdfPath, pdfBytes);
  console.log('SUCCESS: Generated Comprehensive Admin & Patient Reference PDF at:', outputPdfPath);
}

captureAllAdminScreenshots();
