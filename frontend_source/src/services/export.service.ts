import { FeedbackResponse, DepartmentReportData } from '../types';

export function escapeCSV(val: any): string {
  const str = String(val === null || val === undefined ? '' : val).trim();
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateFeedbackReportCSV(
  departmentReportData: DepartmentReportData[],
  filteredResponses: FeedbackResponse[],
  officeUseByResponse: Record<string, any>,
  hospitalName: string = 'Apollo Healthcare Center'
): string {
  const rows: string[] = [];

  // Title Strip
  rows.push(`${escapeCSV(hospitalName)} - COMPREHENSIVE PATIENT FEEDBACK REPORT`);
  rows.push(`Export Generated: ${new Date().toLocaleString()} | Total Evaluated Records: ${filteredResponses.length}`);
  rows.push('');

  // SECTION 1: DEPARTMENT-WISE RATING QUESTIONS SUMMARY
  rows.push('========================================================================================================================');
  rows.push('SECTION 1: DEPARTMENT RATING QUESTIONS SUMMARY (5-STAR SCALE DISTRIBUTION)');
  rows.push('========================================================================================================================');
  rows.push([
    'Department',
    'Question ID',
    'Question Description (English)',
    'Question Description (Tamil)',
    'Category',
    'Status',
    'Total Rated',
    'Average Score (out of 5)',
    '5-Star Count (Excellent)',
    '5-Star %',
    '4-Star Count (Good)',
    '4-Star %',
    '3-Star Count (Average)',
    '3-Star %',
    '2-Star Count (Poor)',
    '2-Star %',
    '1-Star Count (Bad)',
    '1-Star %'
  ].map(escapeCSV).join(','));

  departmentReportData.forEach(dept => {
    dept.ratingQuestions.forEach(rq => {
      rows.push([
        dept.departmentName,
        rq.id,
        rq.label,
        rq.tamilLabel || '',
        rq.category,
        rq.isDeleted ? 'Deleted from Form (Past Data)' : 'Active Question',
        rq.totalRated,
        rq.averageScore.toFixed(2),
        rq.count5, `${rq.pct5}%`,
        rq.count4, `${rq.pct4}%`,
        rq.count3, `${rq.pct3}%`,
        rq.count2, `${rq.pct2}%`,
        rq.count1, `${rq.pct1}%`
      ].map(escapeCSV).join(','));
    });
  });

  rows.push('');
  rows.push('');

  // SECTION 2: DEPARTMENT-WISE YES/NO QUESTIONS BREAKDOWN
  rows.push('========================================================================================================================');
  rows.push('SECTION 2: DEPARTMENT YES / NO QUESTIONS BREAKDOWN');
  rows.push('========================================================================================================================');
  rows.push([
    'Department',
    'Question ID',
    'Question Description (English)',
    'Question Description (Tamil)',
    'Category',
    'Status',
    'Total Answered',
    'Yes Count',
    'Yes %',
    'No Count',
    'No %'
  ].map(escapeCSV).join(','));

  departmentReportData.forEach(dept => {
    dept.yesNoQuestions.forEach(yq => {
      rows.push([
        dept.departmentName,
        yq.id,
        yq.label,
        yq.tamilLabel || '',
        yq.category,
        yq.isDeleted ? 'Deleted from Form (Past Data)' : 'Active Question',
        yq.totalAnswered,
        yq.yesCount, `${yq.yesPercent}%`,
        yq.noCount, `${yq.noPercent}%`
      ].map(escapeCSV).join(','));
    });
  });

  rows.push('');
  rows.push('');

  // SECTION 3: INDIVIDUAL PATIENT RESPONSES & OFFICE RESOLUTION LOG
  rows.push('========================================================================================================================');
  rows.push('SECTION 3: INDIVIDUAL PATIENT RESPONSES & OFFICE RESOLUTION ACTION LOG');
  rows.push('========================================================================================================================');
  rows.push([
    'Submission Date',
    'UHID',
    'Patient Name',
    'Visit Type',
    'Department',
    'Overall Rating (out of 5)',
    'Recommend Hospital',
    'Mobile',
    'Email',
    'Patient Suggestions / Remarks',
    'Resolution Status',
    'Office Review of Complaint',
    'Date of Review',
    'Corrective Action Taken',
    'Preventive Action',
    'Incharge / Reviewer Name'
  ].map(escapeCSV).join(','));

  filteredResponses.forEach(r => {
    const ou = officeUseByResponse[r.uhid] || officeUseByResponse[r.id || ''] || r.officeUse || {};
    const isResolved = !!(ou.reviewOfComplaint || ou.inchargeName);

    rows.push([
      r.date || '',
      r.uhid || '',
      r.patientName || '',
      r.visitType || '',
      r.departmentName || '',
      r.overallRating !== undefined ? Number(r.overallRating).toFixed(1) : '',
      r.wouldRecommend ? 'Yes' : 'No',
      r.mobile || '',
      r.email || '',
      r.suggestions || '',
      isResolved ? 'Resolved' : 'Pending Action',
      ou.reviewOfComplaint || '',
      ou.dateOfReview || '',
      ou.correctiveAction || '',
      ou.preventiveAction || '',
      ou.inchargeName || ''
    ].map(escapeCSV).join(','));
  });

  return '\uFEFF' + rows.join('\r\n');
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
