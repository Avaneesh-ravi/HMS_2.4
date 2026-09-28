import { FeedbackResponse, OfficeUse } from '../types';

export function printFeedbackDetail(
  response: FeedbackResponse,
  officeUse: Partial<OfficeUse> = {},
  hospitalName: string = 'Apollo Healthcare Center'
) {
  const uhid = response.uhid || 'NO_UHID';
  const visitType = (response.visitType === 'IP' || response.ipNumber) ? 'IP' : 'OP';
  
  let formattedDate = response.date || '';
  if (response.submittedAt) {
    const dt = new Date(response.submittedAt);
    if (!isNaN(dt.getTime())) {
      formattedDate = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    }
  }

  const printDocTitle = `${uhid}_${formattedDate.replace(/[\/\\]/g, '-')}_${visitType}`;

  const ratingList: Array<{ name: string; score: any }> = [];
  if (Array.isArray(response.rawRatings) && response.rawRatings.length > 0) {
    response.rawRatings.forEach(r => {
      const qText = r.question_text || r.question_en || r.question_text_en || r.question_ta || 'Service';
      ratingList.push({ name: qText, score: r.rating });
    });
  } else if (response.ratings && typeof response.ratings === 'object') {
    Object.entries(response.ratings).forEach(([k, v]) => {
      const label = k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1');
      ratingList.push({ name: label, score: v });
    });
  }

  const yesNoList: Array<{ text: string; answer: string; remarks?: string }> = [];
  if (Array.isArray(response.rawYesNo) && response.rawYesNo.length > 0) {
    response.rawYesNo.forEach(y => {
      const qText = y.question_en || y.question_text || y.question_ta || 'Question';
      const ans = String(y.answer || '—');
      yesNoList.push({ text: qText, answer: ans, remarks: y.remarks });
    });
  } else if (response.yesNoAnswers && typeof response.yesNoAnswers === 'object') {
    Object.entries(response.yesNoAnswers).forEach(([k, v]) => {
      const label = k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1');
      yesNoList.push({ text: label, answer: v === true ? 'Yes' : (v === false ? 'No' : '—') });
    });
  }

  const appreciations = response.appreciations || (response as any).rawAppreciations || [];

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${printDocTitle}</title>
    <style>
      @page {
        size: A4 portrait;
        margin: 10mm 12mm;
      }
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body {
        background: #ffffff;
        color: #0f172a;
        font-size: 11px;
        line-height: 1.35;
        padding: 0;
      }
      .header {
        border-bottom: 2px solid #0d9488;
        padding-bottom: 6px;
        margin-bottom: 10px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
      }
      .header h1 {
        font-size: 16px;
        font-weight: 800;
        color: #0f766e;
      }
      .header p {
        font-size: 10px;
        color: #64748b;
      }
      .summary-box {
        background: #f0fdfa;
        border: 1px solid #ccfbf1;
        border-left: 4px solid #0d9488;
        border-radius: 6px;
        padding: 8px 12px;
        margin-bottom: 10px;
      }
      .grid-4 {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 6px 12px;
      }
      .grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px 12px;
      }
      .label {
        font-size: 9px;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .val {
        font-size: 11px;
        font-weight: 600;
        color: #0f172a;
      }
      .section-title {
        font-size: 12px;
        font-weight: 700;
        color: #0f766e;
        margin: 10px 0 5px 0;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 2px;
      }
      .ratings-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 4px 10px;
        margin-bottom: 8px;
      }
      .rating-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        padding: 4px 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .rating-card .r-name {
        font-size: 10px;
        color: #334155;
        font-weight: 500;
      }
      .rating-card .r-val {
        font-size: 11px;
        font-weight: 700;
        color: #0f766e;
      }
      .yesno-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 8px;
      }
      .yesno-table td {
        padding: 4px 8px;
        border-bottom: 1px solid #f1f5f9;
        font-size: 10.5px;
      }
      .yesno-table td.ans {
        text-align: right;
        font-weight: 700;
        color: #0f766e;
        width: 60px;
      }
      .office-use {
        margin-top: 10px;
        border: 1.5px solid #0f766e;
        border-radius: 6px;
        overflow: hidden;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .ou-header {
        background: #0f766e;
        color: #ffffff;
        padding: 5px 10px;
        font-size: 11px;
        font-weight: 700;
        display: flex;
        justify-content: space-between;
      }
      .ou-body {
        background: #f8fafc;
        padding: 8px 10px;
      }
      .ou-field {
        margin-bottom: 6px;
      }
      .ou-field .f-label {
        font-size: 9px;
        font-weight: 700;
        color: #475569;
        text-transform: uppercase;
      }
      .ou-field .f-box {
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 10.5px;
        color: #1e293b;
        min-height: 20px;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <h1>${hospitalName}</h1>
        <p>Patient Feedback Detail Summary Record</p>
      </div>
      <div style="text-align: right;">
        <p style="font-weight: 700; color: #0f172a; font-size: 12px;">UHID: ${response.uhid}</p>
        <p>Type: <span style="font-weight: 700; color: #0f766e;">${visitType}</span> | Date: ${formattedDate}</p>
      </div>
    </div>

    <div class="summary-box">
      <div class="grid-4">
        <div>
          <div class="label">Patient Name</div>
          <div class="val">${response.patientName || '—'}</div>
        </div>
        <div>
          <div class="label">UHID</div>
          <div class="val">${response.uhid}</div>
        </div>
        <div>
          <div class="label">Overall Rating</div>
          <div class="val" style="color: #d97706;">★ ${response.overallRating || 5} / 5</div>
        </div>
        <div>
          <div class="label">Consolidated Average</div>
          <div class="val" style="color: #0f766e;">★ ${(response.consolidatedRating || 5.0).toFixed(1)} / 5.0</div>
        </div>
      </div>
    </div>

    <div class="section-title">Patient Demographics & Visit Information</div>
    <div class="grid-4" style="margin-bottom: 8px;">
      <div>
        <div class="label">${visitType === 'IP' ? 'IP Number' : 'OP Number'}</div>
        <div class="val">${response.ipNumber || response.opNumber || (response as any).op_no || response.uhid}</div>
      </div>
      <div>
        <div class="label">${visitType === 'IP' ? 'IP Date' : 'OP Date'}</div>
        <div class="val">${response.ipDate || response.opDate || (response as any).op_date || response.date}</div>
      </div>
      <div>
        <div class="label">Mobile Number</div>
        <div class="val">${response.mobile || '—'}</div>
      </div>
      <div>
        <div class="label">Email Address</div>
        <div class="val">${response.email || '—'}</div>
      </div>
    </div>
    <div class="grid-4" style="margin-bottom: 10px;">
      <div style="grid-column: span 2;">
        <div class="label">Address</div>
        <div class="val">${response.address || '—'}</div>
      </div>
      <div>
        <div class="label">City</div>
        <div class="val">${response.city || '—'}</div>
      </div>
      <div>
        <div class="label">State / Country</div>
        <div class="val">${response.state || 'Tamil Nadu'}, ${response.country || 'India'}</div>
      </div>
    </div>

    ${ratingList.length > 0 ? `
      <div class="section-title">Department Service Ratings</div>
      <div class="ratings-grid">
        ${ratingList.map(r => `
          <div class="rating-card">
            <span class="r-name">${r.name}</span>
            <span class="r-val">★ ${r.score}</span>
          </div>
        `).join('')}
      </div>
    ` : ''}

    ${yesNoList.length > 0 ? `
      <div class="section-title">Satisfaction & Additional Questionary</div>
      <table class="yesno-table">
        ${yesNoList.map(y => `
          <tr>
            <td>${y.text}</td>
            <td class="ans">${y.answer}</td>
          </tr>
          ${y.remarks ? `<tr><td colspan="2" style="font-size: 9.5px; color: #64748b; padding-left: 12px; font-style: italic;">Remarks: ${y.remarks}</td></tr>` : ''}
        `).join('')}
      </table>
    ` : ''}

    ${appreciations.length > 0 ? `
      <div class="section-title">Staff Appreciation</div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 10px; margin-bottom: 8px;">
        ${appreciations.map((a: any) => `
          <p style="font-weight: 600; color: #0f172a;">${a.name} (${a.department || 'Staff'})</p>
          <p style="font-size: 10px; color: #475569; font-style: italic;">"${a.note || ''}"</p>
        `).join('')}
      </div>
    ` : ''}

    <div class="office-use">
      <div class="ou-header">
        <span>FOR OFFICE USE ONLY — INVESTIGATION & CAPA RESOLUTION</span>
        <span>ADMIN LOG</span>
      </div>
      <div class="ou-body">
        <div class="grid-2" style="margin-bottom: 6px;">
          <div class="ou-field">
            <div class="f-label">Review of Complaint / Root Cause Analysis</div>
            <div class="f-box">${officeUse.reviewOfComplaint || 'No complaint review recorded.'}</div>
          </div>
          <div class="ou-field">
            <div class="f-label">Immediate Corrective Action Taken</div>
            <div class="f-box">${officeUse.correctiveAction || 'No corrective action recorded.'}</div>
          </div>
        </div>
        <div class="grid-2">
          <div class="ou-field">
            <div class="f-label">Long-Term Preventive Policy / Action</div>
            <div class="f-box">${officeUse.preventiveAction || 'No preventive action recorded.'}</div>
          </div>
          <div class="ou-field">
            <div class="f-label">Investigating Officer / Incharge Name & Date</div>
            <div class="f-box">${officeUse.inchargeName || 'Dr. Ramesh Kumar / Quality Manager'} (${officeUse.dateOfReview || formattedDate})</div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;

  executePrintViaIframe(html);
}

export interface PrintFeedbackReportParams {
  hospitalName: string;
  responses: FeedbackResponse[];
  officeUseByResponse: Record<string, Partial<OfficeUse>>;
  departmentReportData?: any[];
  fromDate?: string;
  toDate?: string;
}

export function printFeedbackReport(params: PrintFeedbackReportParams) {
  const { hospitalName, responses, officeUseByResponse, departmentReportData = [], fromDate, toDate } = params;
  
  const totalCount = responses.length;
  const resolvedCount = responses.filter(r => !!(officeUseByResponse[r.uhid]?.reviewOfComplaint || officeUseByResponse[r.uhid]?.inchargeName)).length;
  const unresolvedCount = totalCount - resolvedCount;
  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 100;
  const avgRating = totalCount > 0 ? (responses.reduce((sum, r) => sum + Number(r.overallRating || 5), 0) / totalCount).toFixed(1) : '5.0';

  const today = new Date().toISOString().slice(0, 10);
  const dateRangeStr = (fromDate && toDate) ? `${fromDate} to ${toDate}` : `All Recorded Periods (as of ${today})`;

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Feedback_Report_${today}</title>
    <style>
      @page {
        size: A4 portrait;
        margin: 10mm 12mm;
      }
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body {
        background: #ffffff;
        color: #0f172a;
        font-size: 11px;
        line-height: 1.35;
        padding: 0;
      }
      .header {
        border-bottom: 2px solid #0d9488;
        padding-bottom: 6px;
        margin-bottom: 10px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
      }
      .header h1 {
        font-size: 16px;
        font-weight: 800;
        color: #0f766e;
      }
      .header p {
        font-size: 10px;
        color: #64748b;
      }
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        margin-bottom: 12px;
      }
      .kpi-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 8px;
        text-align: center;
      }
      .kpi-card .k-title {
        font-size: 9px;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
      }
      .kpi-card .k-val {
        font-size: 16px;
        font-weight: 800;
        color: #0f766e;
        margin-top: 2px;
      }
      .section-title {
        font-size: 12px;
        font-weight: 700;
        color: #0f766e;
        margin: 12px 0 6px 0;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 2px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 12px;
        font-size: 10px;
      }
      th {
        background: #0f766e;
        color: #ffffff;
        text-align: left;
        padding: 5px 8px;
        font-weight: 700;
      }
      td {
        padding: 4px 8px;
        border-bottom: 1px solid #e2e8f0;
      }
      tr:nth-child(even) td {
        background: #f8fafc;
      }
      .badge-res {
        display: inline-block;
        padding: 1px 6px;
        border-radius: 4px;
        font-size: 9px;
        font-weight: 700;
        background: #dcfce7;
        color: #166534;
      }
      .badge-pend {
        display: inline-block;
        padding: 1px 6px;
        border-radius: 4px;
        font-size: 9px;
        font-weight: 700;
        background: #fef3c7;
        color: #92400e;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <h1>${hospitalName}</h1>
        <p>Comprehensive Patient Feedback & CAPA Action Performance Report</p>
      </div>
      <div style="text-align: right;">
        <p style="font-weight: 700; color: #0f172a; font-size: 11px;">Date Range: ${dateRangeStr}</p>
        <p>Generated: ${today}</p>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="k-title">Total Responses</div>
        <div class="k-val">${totalCount}</div>
      </div>
      <div class="kpi-card">
        <div class="k-title">Average Rating</div>
        <div class="k-val" style="color: #d97706;">★ ${avgRating} / 5</div>
      </div>
      <div class="kpi-card">
        <div class="k-title">Resolved Problems</div>
        <div class="k-val" style="color: #16a34a;">${resolvedCount}</div>
      </div>
      <div class="kpi-card">
        <div class="k-title">Resolution Rate</div>
        <div class="k-val">${resolutionRate}%</div>
      </div>
    </div>

    ${departmentReportData.length > 0 ? `
      <div class="section-title">Department Service Performance Summary</div>
      <table>
        <thead>
          <tr>
            <th>Department / Question Category</th>
            <th>Evaluated Responses</th>
            <th>Average Score</th>
            <th>Performance Rating</th>
          </tr>
        </thead>
        <tbody>
          ${departmentReportData.map(d => `
            <tr>
              <td style="font-weight: 600;">${d.departmentName}</td>
              <td>${d.totalResponses || totalCount}</td>
              <td style="font-weight: 700; color: #0f766e;">★ ${(d.avgRating || 5).toFixed(1)} / 5</td>
              <td>${(d.avgRating || 5) >= 4.5 ? 'Excellent' : (d.avgRating || 5) >= 3.5 ? 'Good' : 'Needs Improvement'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : ''}

    <div class="section-title">Recent Feedback Logs & Resolution Status</div>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>UHID</th>
          <th>Patient Name</th>
          <th>Type</th>
          <th>Rating</th>
          <th>Resolution Status</th>
          <th>Action Summary / Incharge</th>
        </tr>
      </thead>
      <tbody>
        ${responses.slice(0, 25).map(r => {
          const ou = officeUseByResponse[r.uhid];
          const isRes = !!(ou?.reviewOfComplaint || ou?.inchargeName);
          return `
            <tr>
              <td>${r.date || today}</td>
              <td style="font-weight: 600;">${r.uhid}</td>
              <td>${r.patientName || '—'}</td>
              <td>${r.visitType || (r.ipNumber ? 'IP' : 'OP')}</td>
              <td style="font-weight: 700; color: #d97706;">★ ${r.overallRating || 5}</td>
              <td>${isRes ? '<span class="badge-res">Resolved ✓</span>' : '<span class="badge-pend">Pending</span>'}</td>
              <td style="font-size: 9.5px; color: #475569;">${ou?.correctiveAction || ou?.reviewOfComplaint || (isRes ? `Reviewed by ${ou?.inchargeName}` : '—')}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  </body>
</html>`;

  executePrintViaIframe(html);
}

function executePrintViaIframe(html: string) {
  let iframe = document.getElementById('print-isolation-frame') as HTMLIFrameElement;
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'print-isolation-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
  }

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) {
    window.print();
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error('Iframe print error:', e);
      window.print();
    }
  }, 250);
}
