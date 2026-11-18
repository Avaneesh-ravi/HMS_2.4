import { FeedbackResponse, DepartmentReportData } from '../types';

export function escapeCSV(val: any): string {
  const str = String(val === null || val === undefined ? '' : val).trim();
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function escapeXML(val: any): string {
  const str = String(val === null || val === undefined ? '' : val);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates an Excel-native spreadsheet (.xls) using UTF-8 HTML/XML format.
 * Microsoft Excel for Windows and Google Sheets both open this natively
 * with 100% accurate Tamil font rendering, bold headers, and proper table formatting.
 */
export function generateFeedbackReportExcel(
  departmentReportData: DepartmentReportData[],
  filteredResponses: FeedbackResponse[],
  officeUseByResponse: Record<string, any>,
  hospitalName: string = 'Apollo Healthcare Center'
): string {
  let html = `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <!--[if gte mso 9]>
    <xml>
      <x:ExcelWorkbook>
        <x:ExcelWorksheets>
          <x:ExcelWorksheet>
            <x:Name>Feedback Report</x:Name>
            <x:WorksheetOptions>
              <x:DisplayGridlines/>
            </x:WorksheetOptions>
          </x:ExcelWorksheet>
        </x:ExcelWorksheets>
      </x:ExcelWorkbook>
    </xml>
    <![endif]-->
    <style>
      body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 24px; }
      th { background-color: #0d9488; color: #ffffff; font-weight: bold; border: 1px solid #0f766e; padding: 8px 12px; text-align: left; }
      td { border: 1px solid #e2e8f0; padding: 6px 10px; font-size: 13px; color: #1e293b; }
      .title-cell { font-size: 18px; font-weight: bold; color: #0f766e; padding: 12px; }
      .meta-cell { font-size: 12px; color: #64748b; padding: 6px 12px; }
      .section-header { background-color: #f0fdfa; color: #0f766e; font-weight: bold; font-size: 14px; border: 1px solid #ccfbf1; padding: 10px; }
      .tamil-text { font-family: 'Segoe UI', 'Mukta Malar', 'Latha', Arial, sans-serif; }
      .badge-resolved { background-color: #dcfce7; color: #15803d; font-weight: bold; text-align: center; }
      .badge-pending { background-color: #fef3c7; color: #b45309; font-weight: bold; text-align: center; }
      .num-cell { text-align: right; }
      .center-cell { text-align: center; }
    </style>
  </head>
  <body>
    <!-- Title and Metadata -->
    <table>
      <tr>
        <td colspan="12" class="title-cell">${escapeXML(hospitalName)} - COMPREHENSIVE PATIENT FEEDBACK REPORT</td>
      </tr>
      <tr>
        <td colspan="12" class="meta-cell">Export Generated: ${escapeXML(new Date().toLocaleString('en-GB'))} | Total Evaluated Records: ${filteredResponses.length}</td>
      </tr>
    </table>

    <!-- Section 1: Department Rating Questions Summary -->
    <table>
      <tr>
        <td colspan="11" class="section-header">=== SECTION 1: DEPARTMENT SERVICE RATING QUESTIONS SUMMARY (5-STAR SCALE) ===</td>
      </tr>
      <tr>
        <th>Department</th>
        <th>Service / Question (English)</th>
        <th>Question (Tamil / தமிழ்)</th>
        <th class="center-cell">Total Rated</th>
        <th class="center-cell">Average Rating</th>
        <th class="center-cell">Positive Response %</th>
        <th class="center-cell">5 Star (Excellent)</th>
        <th class="center-cell">4 Star (Good)</th>
        <th class="center-cell">3 Star (Average)</th>
        <th class="center-cell">2 Star (Poor)</th>
        <th class="center-cell">1 Star (Very Poor)</th>
      </tr>
  `;

  departmentReportData.forEach(dept => {
    dept.ratingQuestions.forEach(rq => {
      const posCount = (rq.count5 || 0) + (rq.count4 || 0);
      const posPct = rq.totalRated > 0 ? Math.round((posCount / rq.totalRated) * 100) : 0;
      html += `
        <tr>
          <td>${escapeXML(dept.departmentName)}</td>
          <td>${escapeXML(rq.label)}</td>
          <td class="tamil-text">${escapeXML(rq.tamilLabel || '')}</td>
          <td class="num-cell">${rq.totalRated}</td>
          <td class="num-cell">${escapeXML(rq.averageScore)}</td>
          <td class="num-cell">${posPct}%</td>
          <td class="num-cell">${rq.count5 || 0}</td>
          <td class="num-cell">${rq.count4 || 0}</td>
          <td class="num-cell">${rq.count3 || 0}</td>
          <td class="num-cell">${rq.count2 || 0}</td>
          <td class="num-cell">${rq.count1 || 0}</td>
        </tr>
      `;
    });
  });

  html += `
    </table>

    <!-- Section 2: Yes / No Questions Breakdown -->
    <table>
      <tr>
        <td colspan="8" class="section-header">=== SECTION 2: YES / NO QUESTIONS BREAKDOWN ===</td>
      </tr>
      <tr>
        <th>Department</th>
        <th>Question (English)</th>
        <th>Question (Tamil / தமிழ்)</th>
        <th class="center-cell">Total Answered</th>
        <th class="center-cell">Yes Count</th>
        <th class="center-cell">No Count</th>
        <th class="center-cell">Yes %</th>
        <th class="center-cell">Remarks Count</th>
      </tr>
  `;

  departmentReportData.forEach(dept => {
    dept.yesNoQuestions.forEach(yq => {
      html += `
        <tr>
          <td>${escapeXML(dept.departmentName)}</td>
          <td>${escapeXML(yq.label)}</td>
          <td class="tamil-text">${escapeXML(yq.tamilLabel || '')}</td>
          <td class="num-cell">${yq.totalAnswered}</td>
          <td class="num-cell">${yq.yesCount}</td>
          <td class="num-cell">${yq.noCount}</td>
          <td class="num-cell">${yq.yesPercent}%</td>
          <td class="num-cell">${yq.remarks.length}</td>
        </tr>
      `;
    });
  });

  html += `
    </table>

    <!-- Section 3: Patient Feedback Responses & Resolution Log -->
    <table>
      <tr>
        <td colspan="12" class="section-header">=== SECTION 3: PATIENT FEEDBACK RESPONSES & RESOLUTION ACTION LOG ===</td>
      </tr>
      <tr>
        <th>UHID</th>
        <th>Patient Name</th>
        <th>Visit Type</th>
        <th>Date</th>
        <th>Department</th>
        <th class="center-cell">Overall Rating</th>
        <th class="center-cell">Would Recommend</th>
        <th class="center-cell">Office Status</th>
        <th>Review of Complaint</th>
        <th>Corrective Action Taken</th>
        <th>Preventive Action</th>
        <th>Incharge Name / Date</th>
      </tr>
  `;

  filteredResponses.forEach(r => {
    const ou = officeUseByResponse[r.uhid] || officeUseByResponse[String(r.id)] || r.officeUse || {};
    const isResolved = !!(ou.reviewOfComplaint || ou.inchargeName || ou.status === 'Reviewed');
    html += `
      <tr>
        <td>${escapeXML(r.uhid || '')}</td>
        <td>${escapeXML(r.patientName || '')}</td>
        <td>${escapeXML(r.visitType || 'OP')}</td>
        <td>${escapeXML(r.date || '')}</td>
        <td>${escapeXML(r.departmentName || 'Cardiology')}</td>
        <td class="center-cell">${escapeXML(typeof r.overallRating === 'number' ? r.overallRating.toFixed(1) : r.overallRating)}</td>
        <td class="center-cell">${r.wouldRecommend ? 'Yes' : 'No'}</td>
        <td class="${isResolved ? 'badge-resolved' : 'badge-pending'}">${isResolved ? 'Resolved' : 'Pending Action'}</td>
        <td>${escapeXML(ou.reviewOfComplaint || '')}</td>
        <td>${escapeXML(ou.correctiveAction || '')}</td>
        <td>${escapeXML(ou.preventiveAction || '')}</td>
        <td>${escapeXML((ou.inchargeName || '') + (ou.dateOfReview ? ` (${ou.dateOfReview})` : ''))}</td>
      </tr>
    `;
  });

  html += `
    </table>
  </body>
  </html>
  `;

  return html;
}

/**
 * Downloads content as an Excel-native spreadsheet (.xls) with UTF-8 encoding.
 * Opens seamlessly in both Microsoft Excel (Windows & Mac) and Google Sheets.
 */
export function downloadExcel(content: string, filename: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.xls') ? filename : `${filename}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates clean CSV with UTF-8 BOM and clean Star text (no symbol corruption).
 */
export function generateFeedbackReportCSV(
  departmentReportData: DepartmentReportData[],
  filteredResponses: FeedbackResponse[],
  officeUseByResponse: Record<string, any>,
  hospitalName: string = 'Apollo Healthcare Center'
): string {
  const rows: string[] = [];

  // Title Strip
  rows.push(`"PATIENT FEEDBACK REPORT - ${hospitalName.replace(/"/g, '""')}"`);
  rows.push(`"Generated On: ${new Date().toLocaleString('en-GB')}"`);
  rows.push(`"Total Feedback Responses Evaluated: ${filteredResponses.length}"`);
  rows.push('');

  // SECTION 1: DEPARTMENT SERVICE RATING QUESTIONS SUMMARY
  rows.push('"=== SECTION 1: DEPARTMENT SERVICE RATING QUESTIONS SUMMARY ==="');
  rows.push([
    '"Department"',
    '"Service / Question (English)"',
    '"Question (Tamil)"',
    '"Total Rated"',
    '"Average Rating (out of 5.0)"',
    '"Positive Response % (4 Star & 5 Star)"',
    '"5 Star (Excellent)"',
    '"4 Star (Good)"',
    '"3 Star (Average)"',
    '"2 Star (Poor)"',
    '"1 Star (Very Poor)"'
  ].join(','));

  departmentReportData.forEach(dept => {
    dept.ratingQuestions.forEach(rq => {
      const posCount = (rq.count5 || 0) + (rq.count4 || 0);
      const posPct = rq.totalRated > 0 ? Math.round((posCount / rq.totalRated) * 100) : 0;
      rows.push([
        `"${dept.departmentName.replace(/"/g, '""')}"`,
        `"${rq.label.replace(/"/g, '""')}"`,
        `"${(rq.tamilLabel || '').replace(/"/g, '""')}"`,
        rq.totalRated,
        `"${rq.averageScore}"`,
        `"${posPct}%"`,
        rq.count5 || 0,
        rq.count4 || 0,
        rq.count3 || 0,
        rq.count2 || 0,
        rq.count1 || 0
      ].join(','));
    });
  });

  rows.push('');
  rows.push('');

  // SECTION 2: YES / NO QUESTIONS BREAKDOWN
  rows.push('"=== SECTION 2: YES / NO QUESTIONS BREAKDOWN ==="');
  rows.push([
    '"Department"',
    '"Question (English)"',
    '"Question (Tamil)"',
    '"Total Answered"',
    '"Yes Count"',
    '"No Count"',
    '"Yes %"',
    '"Remarks Count"'
  ].join(','));

  departmentReportData.forEach(dept => {
    dept.yesNoQuestions.forEach(yq => {
      rows.push([
        `"${dept.departmentName.replace(/"/g, '""')}"`,
        `"${yq.label.replace(/"/g, '""')}"`,
        `"${(yq.tamilLabel || '').replace(/"/g, '""')}"`,
        yq.totalAnswered,
        yq.yesCount,
        yq.noCount,
        `"${yq.yesPercent}%"`,
        yq.remarks.length
      ].join(','));
    });
  });

  rows.push('');
  rows.push('');

  // SECTION 3: PATIENT FEEDBACK RESPONSES & RESOLUTION LOG
  rows.push('"=== SECTION 3: PATIENT FEEDBACK RESPONSES & RESOLUTION LOG ==="');
  rows.push([
    '"UHID"',
    '"Patient Name"',
    '"Visit Type"',
    '"Date"',
    '"Department"',
    '"Overall Rating"',
    '"Would Recommend"',
    '"Office Status"',
    '"Review of Complaint"',
    '"Corrective Action Taken"',
    '"Preventive Action"',
    '"Incharge Name / Date"'
  ].join(','));

  filteredResponses.forEach(r => {
    const ou = officeUseByResponse[r.uhid] || officeUseByResponse[String(r.id)] || r.officeUse || {};
    const isResolved = !!(ou.reviewOfComplaint || ou.inchargeName || ou.status === 'Reviewed');
    rows.push([
      `"${(r.uhid || '').replace(/"/g, '""')}"`,
      `"${(r.patientName || '').replace(/"/g, '""')}"`,
      `"${(r.visitType || 'OP').replace(/"/g, '""')}"`,
      `"${(r.date || '').replace(/"/g, '""')}"`,
      `"${(r.departmentName || 'Cardiology').replace(/"/g, '""')}"`,
      `"${typeof r.overallRating === 'number' ? r.overallRating.toFixed(1) : r.overallRating}"`,
      `"${r.wouldRecommend ? 'Yes' : 'No'}"`,
      `"${isResolved ? 'Resolved' : 'Pending Action'}"`,
      `"${(ou.reviewOfComplaint || '').replace(/"/g, '""')}"`,
      `"${(ou.correctiveAction || '').replace(/"/g, '""')}"`,
      `"${(ou.preventiveAction || '').replace(/"/g, '""')}"`,
      `"${(ou.inchargeName || '') + (ou.dateOfReview ? ` (${ou.dateOfReview})` : '')}"`
    ].join(','));
  });

  return '\uFEFF' + rows.join('\r\n');
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
