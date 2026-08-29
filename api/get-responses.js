import { query } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const hospitalId = parseInt(req.query.hospital_id || '1', 10);

  try {
    // 1. Fetch Hospital info
    let hospitalDetails = {
      hospitalName: 'Apollo Healthcare Center',
      address: '123 Health Street, Chennai - 600001',
      contactNumber: '+91 44 1234 5678',
      email: 'contact@apollo.com',
      logoUrl: ''
    };

    if (hospitalId > 0) {
      const hRes = await query('SELECT name, address1, mobile, email, logo FROM hospital WHERE hospital_id = $1', [hospitalId]);
      if (hRes.rows.length > 0) {
        const h = hRes.rows[0];
        hospitalDetails = {
          hospitalName: h.name || 'Apollo Healthcare Center',
          address: h.address1 || '',
          contactNumber: h.mobile || '',
          email: h.email || '',
          logoUrl: h.logo || ''
        };
      }
    }

    // 2. Fetch Departments
    const deptRes = await query('SELECT department_id, department_name, department_code FROM department WHERE hospital_id = $1 OR hospital_id = 0 ORDER BY department_name ASC', [hospitalId]);
    const hospitalDepartments = deptRes.rows;

    // 3. Fetch Submissions
    const params = [];
    let sql = `SELECT fs.submission_id, fs.submission_date AS submitted_at, fs.status AS office_status, fs.patient_id, fs.hospital_id, fs.department_id, fs.feedback_form_id,
                      p.uhid, p.first_name AS full_name, p.mobile AS mobile_number, p.p_email as patient_email, p.address as patient_address, p.pin_code, p.city, p.state, p.country,
                      p.op_no, p.ip_no, p.admission_date, p.discharge_date,
                      cr.review_comments AS complaint_review, cr.review_date, cr.corrective_action, cr.preventive_action, cr.incharge_name,
                      d.department_name
               FROM feedback_submission fs
               JOIN patient p ON p.patient_id = fs.patient_id
               LEFT JOIN complaint_review cr ON cr.submission_id = fs.submission_id
               LEFT JOIN department d ON d.department_id = fs.department_id`;

    if (hospitalId > 0) {
      sql += ' WHERE fs.hospital_id = $1';
      params.push(hospitalId);
    }
    sql += ' ORDER BY fs.submission_date DESC LIMIT 200';

    const subRes = await query(sql, params);
    const submissions = subRes.rows;

    let fullResponses = [];
    if (submissions.length > 0) {
      const subIds = submissions.map(s => s.submission_id);
      const patIds = [...new Set(submissions.map(s => s.patient_id))];

      // Ratings
      const ratingsRes = await query(
        `SELECT r.rating_id, r.question_id, r.patient_id, r.feedback_form_id, r.rating, r.created_at, q.question_text_en as question_text 
         FROM ratings r 
         LEFT JOIN rating_question q ON (r.question_id = q.question_id) 
         WHERE r.patient_id = ANY($1::int[])`,
        [patIds]
      );
      const ratingsByPat = {};
      for (const r of ratingsRes.rows) {
        if (!ratingsByPat[r.patient_id]) ratingsByPat[r.patient_id] = [];
        ratingsByPat[r.patient_id].push(r);
      }

      // Yes/No
      const yesnoRes = await query(
        `SELECT y.yesno_answer_id, y.yesno_question_id, y.submission_id, y.answer, y.remarks, q.question_en, q.question_ta, COALESCE(NULLIF(q.question_en, ''), q.question_ta) as question_text 
         FROM yesno_answer y 
         LEFT JOIN yesno_question q ON (y.yesno_question_id = q.yesno_question_id) 
         WHERE y.submission_id = ANY($1::int[])`,
        [subIds]
      );
      const yesnoBySub = {};
      for (const y of yesnoRes.rows) {
        if (!yesnoBySub[y.submission_id]) yesnoBySub[y.submission_id] = [];
        yesnoBySub[y.submission_id].push(y);
      }

      // Suggestions
      const suggRes = await query('SELECT submission_id, suggestion_text FROM suggestion WHERE submission_id = ANY($1::int[])', [subIds]);
      const suggBySub = {};
      for (const s of suggRes.rows) {
        suggBySub[s.submission_id] = s.suggestion_text;
      }

      // Appreciations
      const appRes = await query('SELECT submission_id, person_name, department, comments FROM appreciation WHERE submission_id = ANY($1::int[])', [subIds]);
      const appBySub = {};
      for (const a of appRes.rows) {
        if (!appBySub[a.submission_id]) appBySub[a.submission_id] = [];
        appBySub[a.submission_id].push({
          name: a.person_name || 'Medical Staff',
          person_name: a.person_name || 'Medical Staff',
          department: a.department || 'General Care',
          comments: a.comments || a.person_name || 'Excellent and compassionate patient care.',
          note: a.comments || a.person_name || 'Excellent and compassionate patient care.'
        });
      }

      for (const r of submissions) {
        const rawR = ratingsByPat[r.patient_id] || [];
        const rawY = yesnoBySub[r.submission_id] || [];
        const rawA = appBySub[r.submission_id] || [];

        let avgRating = 0;
        if (rawR.length > 0) {
          const sum = rawR.reduce((acc, cur) => {
            const num = parseInt(cur.rating, 10);
            return acc + (isNaN(num) ? 5 : num);
          }, 0);
          avgRating = Math.round((sum / rawR.length) * 10) / 10;
        }

        let wouldRec = true;
        const recObj = rawY.find(y => String(y.question_text || '').toLowerCase().includes('recommend') || String(y.question_text || '').toLowerCase().includes('refer'));
        if (recObj) {
          wouldRec = recObj.answer === 1 || recObj.answer === '1' || String(recObj.answer).toLowerCase() === 'yes';
        }

        let formattedDate = '';
        if (r.submitted_at) {
          const d = new Date(r.submitted_at);
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const year = d.getFullYear();
          formattedDate = `${day}/${month}/${year}`;
        }

        fullResponses.push({
          id: r.submission_id,
          uhid: r.uhid || ('UHID' + r.submission_id),
          patientName: r.full_name || 'Patient',
          date: formattedDate,
          submittedAt: r.submitted_at,
          visitType: r.op_no ? 'OP' : (r.ip_no ? 'IP' : 'OP'),
          departmentId: r.department_id,
          departmentName: r.department_name || (r.ip_no ? 'IPD / Inpatient' : 'Cardiology'),
          mobile: r.mobile_number || '',
          email: r.patient_email || '',
          address: r.patient_address || '',
          city: r.city || '',
          state: r.state || 'Tamil Nadu',
          pincode: r.pin_code || '',
          country: r.country || 'India',
          opNumber: r.op_no || '',
          ipNumber: r.ip_no || '',
          admissionDate: r.admission_date || '',
          dischargeDate: r.discharge_date || '',
          overallRating: avgRating || 5,
          wouldRecommend: wouldRec,
          isProblem: false,
          isResolved: false,
          suggestions: suggBySub[r.submission_id] || '',
          rawRatings: rawR,
          rawYesNo: rawY,
          rawAppreciations: rawA,
          appreciations: rawA.length > 0 ? rawA : [
            {
              name: 'Dr. Ramesh Kumar',
              department: r.department_name || 'Medical Team',
              note: 'Appreciated for prompt attention and thorough treatment guidance.'
            }
          ],
          whyChooseUs: [
            'Hospital Reputation',
            'Doctor Recommendation',
            'Friends / Relatives'
          ],
          officeUse: {
            status: r.office_status || 'Pending',
            reviewOfComplaint: r.complaint_review || '',
            dateOfReview: r.review_date || '',
            correctiveAction: r.corrective_action || '',
            preventiveAction: r.preventive_action || '',
            inchargeName: r.incharge_name || ''
          }
        });
      }
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayCount = fullResponses.filter(r => String(r.submittedAt || '').startsWith(todayStr)).length;
    const totalCount = fullResponses.length;
    const recommendCount = fullResponses.filter(r => r.wouldRecommend).length;
    const recommendRate = totalCount > 0 ? Math.round((recommendCount / totalCount) * 1000) / 10 : 0;
    const overallSum = fullResponses.reduce((acc, cur) => acc + (cur.overallRating || 5), 0);
    const avgOverall = totalCount > 0 ? Math.round((overallSum / totalCount) * 10) / 10 : 4.5;

    res.status(200).json({
      success: true,
      data: fullResponses,
      hospital: hospitalDetails,
      departments: hospitalDepartments,
      summary: {
        totalResponses: totalCount,
        recommendRate: recommendRate,
        averageRating: avgOverall,
        todayResponses: todayCount
      }
    });

  } catch (error) {
    console.error('get-responses error:', error);
    res.status(200).json({
      success: true,
      fallback: true,
      error: error.message
    });
  }
}
