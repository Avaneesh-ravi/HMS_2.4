import { getPool } from './db.js';

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

  const pool = getPool();
  let client;

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
    const deptsList = body.departments || settings.departments || [];

    client = await pool.connect();
    await client.query('BEGIN');

    // 1. Find or create feedback_form for this hospital
    let formRes = await client.query(
      `SELECT feedback_form_id FROM feedback_form WHERE hospital_id = $1 ORDER BY feedback_form_id ASC LIMIT 1`,
      [hospitalId]
    );
    let formId;
    if (formRes.rows.length === 0) {
      const newFormRes = await client.query(
        `INSERT INTO feedback_form (name_en, name_ta, hospital_id, created_at, status)
         VALUES ('Patient Feedback Form', 'நோயாளி கருத்து படிவம்', $1, NOW(), 'Active')
         RETURNING feedback_form_id`,
        [hospitalId]
      );
      formId = newFormRes.rows[0].feedback_form_id;
    } else {
      formId = formRes.rows[0].feedback_form_id;
    }

    // Update settings on feedback_form
    if (settings) {
      const layoutModeVal = settings.layoutMode === '1-column' ? 1 : 2;
      const combinePagesVal = settings.combinePages ? 1 : 0;
      const deptsVal = deptsList.length > 0 ? JSON.stringify(deptsList) : null;
      await client.query(
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
    }

    // 2. Department Synchronization & Active/Inactive Status
    if (Array.isArray(deptsList) && deptsList.length > 0) {
      const trimmedLowerDepts = deptsList.map(d => String(d).trim().toLowerCase()).filter(Boolean);
      
      // Mark removed departments as is_active = false
      await client.query(
        `UPDATE department SET is_active = false WHERE hospital_id = $1 AND TRIM(LOWER(department_name)) != ALL($2::text[])`,
        [hospitalId, trimmedLowerDepts]
      );

      // Insert or reactivate active departments
      for (const dName of deptsList) {
        if (dName && String(dName).trim()) {
          const trimmed = String(dName).trim();
          const dExists = await client.query(
            'SELECT department_id FROM department WHERE TRIM(LOWER(department_name)) = LOWER($1) AND hospital_id = $2',
            [trimmed, hospitalId]
          );
          if (dExists.rows.length === 0) {
            await client.query(
              'INSERT INTO department (department_name, department_code, hospital_id, is_active) VALUES ($1, $2, $3, true)',
              [trimmed, trimmed.substring(0, 10).toUpperCase(), hospitalId]
            );
          } else {
            await client.query(
              'UPDATE department SET is_active = true, department_name = $1 WHERE department_id = $2',
              [trimmed, dExists.rows[0].department_id]
            );
          }
        }
      }
    }

    // 3. Save Rating Questions & Manage Active/Inactive Status
    const savedRatingQuestions = [];
    const activeRatingIds = [];

    if (questions.length > 0) {
      // Clear current mappings for this form
      await client.query(`DELETE FROM feedback_form_rating_question WHERE feedback_form_id = $1`, [formId]);

      let displayOrder = 1;
      for (const q of questions) {
        let qid = q.id;
        let ratingGrade = q.ratingMode || 'emoji';
        if (q.cardColor || q.backgroundColor) {
          ratingGrade += '|' + (q.cardColor || q.backgroundColor);
        }

        const isNew = String(qid).startsWith('new_') || isNaN(parseInt(qid, 10));
        if (isNew) {
          const insRes = await client.query(
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
          const numId = parseInt(qid, 10);
          const chkRes = await client.query(`SELECT question_id FROM rating_question WHERE question_id = $1`, [numId]);
          if (chkRes.rows.length > 0) {
            await client.query(
              `UPDATE rating_question SET 
                question_text_en = $1, 
                question_text_ta = $2, 
                rating_grade = $3,
                active = 1,
                status = 'Active',
                hospital_id = $4
               WHERE question_id = $5`,
              [
                q.label || '',
                q.tamilLabel || q.label || '',
                ratingGrade,
                hospitalId,
                numId
              ]
            );
            qid = numId;
          } else {
            const insRes = await client.query(
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

        activeRatingIds.push(parseInt(qid, 10));

        // Map into feedback_form_rating_question
        await client.query(
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

      // Mark removed rating questions as Inactive and active = 0 in database for this hospital
      if (activeRatingIds.length > 0) {
        await client.query(
          `UPDATE rating_question SET active = 0, status = 'Inactive' WHERE hospital_id = $1 AND question_id != ALL($2::int[])`,
          [hospitalId, activeRatingIds]
        );
      }
    }

    // 4. Save Yes/No Questions & Manage Active/Inactive Status
    const savedYesNoQuestions = [];
    const activeYesNoIds = [];

    if (yesnoQuestions.length > 0) {
      await client.query(`DELETE FROM feedback_form_yesno_question WHERE feedback_form_id = $1`, [formId]);

      let ynOrder = 1;
      for (const y of yesnoQuestions) {
        let yid = y.id;
        const isNew = String(yid).startsWith('new_') || isNaN(parseInt(yid, 10));
        if (isNew) {
          const insYn = await client.query(
            `INSERT INTO yesno_question (question_en, question_ta, hospital_id, status)
             VALUES ($1, $2, $3, 'Active')
             RETURNING yesno_question_id`,
            [y.label || 'Question', y.tamilLabel || y.label || '', hospitalId]
          );
          yid = insYn.rows[0].yesno_question_id;
        } else {
          const numYId = parseInt(yid, 10);
          await client.query(
            `UPDATE yesno_question SET question_en = $1, question_ta = $2, status = 'Active', hospital_id = $3 WHERE yesno_question_id = $4`,
            [y.label || '', y.tamilLabel || y.label || '', hospitalId, numYId]
          );
          yid = numYId;
        }

        activeYesNoIds.push(parseInt(yid, 10));

        await client.query(
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

      // Mark removed yes/no questions as Inactive in database for this hospital
      if (activeYesNoIds.length > 0) {
        await client.query(
          `UPDATE yesno_question SET status = 'Inactive' WHERE hospital_id = $1 AND yesno_question_id != ALL($2::int[])`,
          [hospitalId, activeYesNoIds]
        );
      }
    }

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: 'Form configuration saved successfully to database!',
      data: savedRatingQuestions,
      yesno_data: savedYesNoQuestions,
      departments: deptsList
    });

  } catch (err) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch (rbErr) {}
    }
    console.error('save-questions error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Error saving questions'
    });
  } finally {
    if (client) {
      try { client.release(); } catch (relErr) {}
    }
  }
}
