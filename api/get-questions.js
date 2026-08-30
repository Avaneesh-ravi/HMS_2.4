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
    // 1. Get the feedback form for this hospital
    let formRes = await query(
      `SELECT * FROM feedback_form WHERE hospital_id = $1 ORDER BY feedback_form_id ASC LIMIT 1`,
      [hospitalId]
    );
    let form = formRes.rows[0];

    // 2. Fetch rating questions linked to this form via feedback_form_rating_question (and active in rating_question)
    let qRes = null;
    if (form) {
      qRes = await query(
        `SELECT q.question_id as id, q.question_text_en as label, q.question_text_ta as "tamilLabel", q.rating_grade, ffrq.display_order
         FROM feedback_form_rating_question ffrq
         JOIN rating_question q ON q.question_id = ffrq.question_id
         WHERE ffrq.feedback_form_id = $1 AND ffrq.status = 'Active' AND (q.status = 'Active' OR q.active = 1)
         ORDER BY ffrq.display_order ASC, ffrq.id ASC`,
        [form.feedback_form_id]
      );
    }

    // Fallback if no questions are mapped to the form yet
    if (!qRes || qRes.rows.length === 0) {
      qRes = await query(
        `SELECT question_id as id, question_text_en as label, question_text_ta as "tamilLabel", rating_grade
         FROM rating_question 
         WHERE (hospital_id = $1 OR hospital_id IS NULL OR question_id IN (30,31,32,33,34,35))
           AND (status = 'Active' OR active = 1)
         ORDER BY question_id ASC`,
        [hospitalId]
      );
    }

    const questions = qRes.rows.map(q => {
      let ratingMode = 'emoji';
      let cardColor = undefined;
      if (q.rating_grade) {
        const parts = q.rating_grade.split('|');
        ratingMode = parts[0] || 'emoji';
        if (parts.length > 1) cardColor = parts[1];
      }
      return {
        id: String(q.id),
        label: (q.label || '').trim(),
        tamilLabel: (q.tamilLabel || '').trim(),
        ratingMode,
        cardColor
      };
    });

    // 3. Fetch Yes/No questions
    let ynRes = null;
    if (form) {
      ynRes = await query(
        `SELECT yq.yesno_question_id as id, yq.question_en as label, yq.question_ta as "tamilLabel", ffyq.display_order
         FROM feedback_form_yesno_question ffyq
         JOIN yesno_question yq ON yq.yesno_question_id = ffyq.yesno_question_id
         WHERE ffyq.feedback_form_id = $1 AND ffyq.status = 'Active' AND yq.status = 'Active'
         ORDER BY ffyq.display_order ASC, ffyq.id ASC`,
        [form.feedback_form_id]
      );
    }

    if (!ynRes || ynRes.rows.length === 0) {
      ynRes = await query(
        `SELECT yesno_question_id as id, question_en as label, question_ta as "tamilLabel" 
         FROM yesno_question 
         WHERE (hospital_id = $1 OR hospital_id IS NULL OR yesno_question_id IN (40,41,42,1,2,3))
           AND status = 'Active'
         ORDER BY yesno_question_id ASC LIMIT 3`,
        [hospitalId]
      );
    }

    const yesno = ynRes.rows.map(y => ({
      id: String(y.id),
      label: (y.label || y.tamilLabel || '').trim(),
      tamilLabel: (y.tamilLabel || y.label || '').trim()
    }));

    // 4. Fetch Departments from department table where is_active = true
    let departments = [];
    const deptRes = await query(
      `SELECT department_name FROM department WHERE hospital_id = $1 AND is_active = true ORDER BY department_id ASC`,
      [hospitalId]
    );
    if (deptRes.rows.length > 0) {
      departments = deptRes.rows.map(r => r.department_name);
    } else if (form?.departments) {
      try {
        const parsed = typeof form.departments === 'string' ? JSON.parse(form.departments) : form.departments;
        if (Array.isArray(parsed) && parsed.length > 0) departments = parsed;
      } catch (e) {
        departments = form.departments.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    if (departments.length === 0) {
      departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'ENT'];
    }

    res.status(200).json({
      success: true,
      data: questions,
      yesno_data: yesno,
      departments,
      settings: {
        departments,
        layoutMode: form?.layout_mode === 1 ? '1-column' : '2-column',
        combinePages: !!form?.combine_pages,
        themeColor: form?.theme_color || undefined,
        fontSize: form?.font_size || undefined,
        showPageTitleLabels: form?.show_title_labels !== undefined ? !!form.show_title_labels : true
      }
    });

  } catch (err) {
    res.status(200).json({
      success: true,
      fallback: true,
      error: err.message
    });
  }
}
