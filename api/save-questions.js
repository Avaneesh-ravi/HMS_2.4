import { query } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    if (!body || typeof body !== 'object') body = {};

    const hospitalId = parseInt(body.hospital_id || req.query.hospital_id || '1', 10);
    const questions = Array.isArray(body.questions) ? body.questions : [];
    const yesnoQuestions = Array.isArray(body.yesno_questions || body.yesno_data) ? (body.yesno_questions || body.yesno_data) : [];
    const settings = body.settings || {};

    // 1. Find or create feedback_form for this hospital
    let formRes = await query(
      `SELECT feedback_form_id FROM feedback_form WHERE hospital_id = $1 ORDER BY feedback_form_id ASC LIMIT 1`,
      [hospitalId]
    );
    let formId;
    if (formRes.rows.length === 0) {
      const newFormRes = await query(
        `INSERT INTO feedback_form (name_en, name_ta, hospital_id, created_at, status)
         VALUES ('Patient Feedback Form', 'நோயாளி கருத்து படிவம்', $1, NOW(), 'Active')
         RETURNING feedback_form_id`,
        [hospitalId]
      );
      formId = newFormRes.rows[0].feedback_form_id;
    } else {
      formId = formRes.rows[0].feedback_form_id;
    }

    // Update settings on feedback_form and department table
    if (settings) {
      const layoutModeVal = settings.layoutMode === '1-column' ? 1 : 2;
      const combinePagesVal = settings.combinePages ? 1 : 0;
      const deptsVal = settings.departments ? JSON.stringify(settings.departments) : null;
      await query(
        `UPDATE feedback_form SET 
          layout_mode = $1, 
          combine_pages = $2, 
          theme_color = $3, 
          font_size = $4, 
          show_title_labels = $5,
          departments = COALESCE($6, departments)
         WHERE feedback_form_id = $7`,
        [
          layoutModeVal,
          combinePagesVal,
          settings.themeColor || null,
          settings.fontSize || null,
          settings.showPageTitleLabels ? 1 : 0,
          deptsVal,
          formId
        ]
      );

      // Insert any new departments into department table
      const deptsList = body.departments || settings.departments || [];
      if (Array.isArray(deptsList) && deptsList.length > 0) {
        for (const dName of deptsList) {
          if (dName && String(dName).trim()) {
            const trimmed = String(dName).trim();
            const dExists = await query('SELECT department_id FROM department WHERE LOWER(department_name) = LOWER($1) AND (hospital_id = $2 OR hospital_id = 0)', [trimmed, hospitalId]);
            if (dExists.rows.length === 0) {
              await query('INSERT INTO department (department_name, department_code, hospital_id, active, status) VALUES ($1, $2, $3, 1, $4)', [trimmed, trimmed.substring(0, 10).toUpperCase(), hospitalId, 'Active']);
            }
          }
        }
      }
    }

    // 2. Save Rating Questions
    const savedRatingQuestions = [];
    if (questions.length > 0) {
      // Clear current mappings for this form
      await query(`DELETE FROM feedback_form_rating_question WHERE feedback_form_id = $1`, [formId]);

      let displayOrder = 1;
      for (const q of questions) {
        let qid = q.id;
        let ratingGrade = q.ratingMode || 'emoji';
        if (q.cardColor || q.backgroundColor) {
          ratingGrade += '|' + (q.cardColor || q.backgroundColor);
        }

        const isNew = String(qid).startsWith('new_') || isNaN(parseInt(qid, 10));
        if (isNew) {
          // Insert new rating question
          const insRes = await query(
            `INSERT INTO rating_question (question_tag, question_text_en, question_text_ta, active, rating_grade, hospital_id, status)
             VALUES ($1, $2, $3, 1, $4, $5, 'Active')
             RETURNING question_id`,
            [
              q.category || 'overall',
              q.label || 'Question',
              q.tamilLabel || q.label || 'கேள்வி',
              ratingGrade,
              hospitalId
            ]
          );
          qid = insRes.rows[0].question_id;
        } else {
          // Check if exists
          const numId = parseInt(qid, 10);
          const chkRes = await query(`SELECT hospital_id FROM rating_question WHERE question_id = $1`, [numId]);
          if (chkRes.rows.length > 0) {
            await query(
              `UPDATE rating_question SET 
                question_text_en = $1, 
                question_text_ta = $2, 
                rating_grade = $3
               WHERE question_id = $4`,
              [
                q.label || '',
                q.tamilLabel || q.label || '',
                ratingGrade,
                numId
              ]
            );
            qid = numId;
          } else {
            const insRes = await query(
              `INSERT INTO rating_question (question_id, question_tag, question_text_en, question_text_ta, active, rating_grade, hospital_id, status)
               VALUES ($1, $2, $3, 1, $4, $5, 'Active')
               RETURNING question_id`,
              [
                numId,
                q.category || 'overall',
                q.label || 'Question',
                q.tamilLabel || q.label || '',
                ratingGrade,
                hospitalId
              ]
            );
            qid = insRes.rows[0].question_id;
          }
        }

        // Map into feedback_form_rating_question
        await query(
          `INSERT INTO feedback_form_rating_question (feedback_form_id, question_id, display_order, status, created_at)
           VALUES ($1, $2, $3, 'Active', NOW())`,
          [formId, qid, displayOrder++]
        );

        savedRatingQuestions.push({
          id: String(qid),
          label: q.label,
          tamilLabel: q.tamilLabel || q.label,
          ratingMode: q.ratingMode || 'emoji',
          cardColor: q.cardColor || q.backgroundColor
        });
      }
    }

    // 3. Save Yes/No Questions
    const savedYesNoQuestions = [];
    if (yesnoQuestions.length > 0) {
      await query(`DELETE FROM feedback_form_yesno_question WHERE feedback_form_id = $1`, [formId]);

      let ynOrder = 1;
      for (const y of yesnoQuestions) {
        let yid = y.id;
        const isNew = String(yid).startsWith('new_') || isNaN(parseInt(yid, 10));
        if (isNew) {
          const insYn = await query(
            `INSERT INTO yesno_question (question_en, question_ta, hospital_id, status)
             VALUES ($1, $2, $3, 'Active')
             RETURNING yesno_question_id`,
            [y.label || 'Question', y.tamilLabel || y.label || '', hospitalId]
          );
          yid = insYn.rows[0].yesno_question_id;
        } else {
          const numYId = parseInt(yid, 10);
          await query(
            `UPDATE yesno_question SET question_en = $1, question_ta = $2 WHERE yesno_question_id = $3`,
            [y.label || '', y.tamilLabel || y.label || '', numYId]
          );
          yid = numYId;
        }

        await query(
          `INSERT INTO feedback_form_yesno_question (feedback_form_id, yesno_question_id, display_order, status, created_at)
           VALUES ($1, $2, $3, 'Active', NOW())`,
          [formId, yid, ynOrder++]
        );

        savedYesNoQuestions.push({
          id: String(yid),
          label: y.label,
          tamilLabel: y.tamilLabel || y.label
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Form configuration saved successfully to database!',
      data: savedRatingQuestions,
      yesno_data: savedYesNoQuestions
    });

  } catch (err) {
    console.error('save-questions error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Error saving questions'
    });
  }
}
