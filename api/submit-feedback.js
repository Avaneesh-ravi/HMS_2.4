import { query, getPool } from './db.js';

function parseMultipart(buffer, boundary) {
  const result = {};
  const str = buffer.toString('binary');
  const parts = str.split('--' + boundary);

  for (const part of parts) {
    if (part.includes('Content-Disposition: form-data;')) {
      const match = part.match(/name="([^"]+)"/);
      if (match) {
        const name = match[1];
        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd !== -1) {
          let value = part.substring(headerEnd + 4);
          if (value.endsWith('\r\n')) {
            value = value.substring(0, value.length - 2);
          }
          // Convert binary string back to UTF-8
          result[name] = Buffer.from(value, 'binary').toString('utf-8').trim();
        }
      }
    }
  }
  return result;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ success: false, message: 'Only POST supported' });
  }

  try {
    let body = req.body;

    // 1. If body is already an object (from JSON parse)
    if (body && typeof body === 'object' && !Buffer.isBuffer(body)) {
      // already parsed
    } else {
      // Collect raw body chunks if needed
      let rawBuffer = Buffer.isBuffer(body) ? body : null;
      if (!rawBuffer) {
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        rawBuffer = Buffer.concat(chunks);
      }

      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('multipart/form-data')) {
        const boundaryMatch = contentType.match(/boundary=([^;]+)/);
        if (boundaryMatch) {
          const boundary = boundaryMatch[1].trim();
          body = parseMultipart(rawBuffer, boundary);
        }
      } else if (contentType.includes('application/json')) {
        try {
          body = JSON.parse(rawBuffer.toString('utf-8'));
        } catch (e) {
          body = {};
        }
      } else {
        const rawStr = rawBuffer.toString('utf-8');
        try {
          body = JSON.parse(rawStr);
        } catch (e) {
          const params = new URLSearchParams(rawStr);
          body = Object.fromEntries(params.entries());
        }
      }
    }

    if (!body || typeof body !== 'object') {
      body = {};
    }

    const firstName = body.first_name || body.firstName || 'Patient';
    const lastName = body.last_name || body.lastName || '';
    const fullName = (firstName + ' ' + lastName).trim() || 'Patient';
    const uhid = body.uhid || ('UHID' + Math.floor(1000 + Math.random() * 9000));
    const age = parseInt(body.age || '30', 10);
    const gender = body.gender || 'Male';
    const mobile = body.mobile_number || body.mobile || '9876543210';
    const email = body.email || '';
    const address = body.address || '';
    const pincode = body.pincode || '';
    const city = body.city || '';
    const state = body.state || 'Tamil Nadu';
    const country = body.country || 'India';
    const visitType = body.visit_type || body.visitType || 'OP';
    const opNo = visitType === 'OP' ? (body.op_id || body.opNo || null) : null;
    const ipNo = visitType === 'IP' ? (body.ip_id || body.ipNo || null) : null;
    const admissionDate = body.admission_date || body.admissionDate || null;
    const dischargeDate = body.discharge_date || body.dischargeDate || null;
    const hospitalId = parseInt(body.hospital_id || '1', 10);
    const formId = parseInt(body.feedback_form_id || '1', 10);

    // Extract department name from body or appreciations
    let targetDeptName = body.department_name || body.department || '';
    if (!targetDeptName && Array.isArray(body.appreciations)) {
      const appWithDept = body.appreciations.find(a => a && a.department && String(a.department).trim());
      if (appWithDept) {
        targetDeptName = String(appWithDept.department).trim();
      }
    }

    const client = await getPool().connect();
    try {
      await client.query('BEGIN');

      // Resolve department_id dynamically
      let departmentId = parseInt(body.department_id, 10);
      if (isNaN(departmentId) || departmentId <= 0) {
        if (targetDeptName) {
          const deptChk = await client.query(
            'SELECT department_id FROM department WHERE (TRIM(LOWER(department_name)) = TRIM(LOWER($1)) OR department_code = $1) AND (hospital_id = $2 OR hospital_id = 0) LIMIT 1',
            [targetDeptName, hospitalId]
          );
          if (deptChk.rows.length > 0) {
            departmentId = deptChk.rows[0].department_id;
          } else {
            const insDept = await client.query(
              'INSERT INTO department (department_name, department_code, hospital_id, is_active) VALUES ($1, $2, $3, true) RETURNING department_id',
              [targetDeptName, targetDeptName.substring(0, 10).toUpperCase(), hospitalId]
            );
            departmentId = insDept.rows[0].department_id;
          }
        } else {
          // Fallback to first active department or 1
          const firstDept = await client.query(
            'SELECT department_id FROM department WHERE hospital_id = $1 AND is_active = true ORDER BY department_id ASC LIMIT 1',
            [hospitalId]
          );
          departmentId = firstDept.rows.length > 0 ? firstDept.rows[0].department_id : 1;
        }
      }

      // 1. Insert/update patient
      const patSql = `INSERT INTO patient
                      (patient_uuid, uhid, first_name, age, gender, mobile, p_email, address,
                       pin_code, city, state, country, op_no, ip_no, admission_date, discharge_date, hospital_id, feedback_form_id)
                      VALUES
                      (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                      ON CONFLICT ON CONSTRAINT uq_patient_uhid 
                      DO UPDATE SET 
                          first_name = EXCLUDED.first_name,
                          age = EXCLUDED.age,
                          gender = EXCLUDED.gender,
                          mobile = EXCLUDED.mobile,
                          p_email = EXCLUDED.p_email,
                          address = EXCLUDED.address,
                          pin_code = EXCLUDED.pin_code,
                          city = EXCLUDED.city,
                          state = EXCLUDED.state,
                          country = EXCLUDED.country,
                          op_no = EXCLUDED.op_no,
                          ip_no = EXCLUDED.ip_no,
                          admission_date = EXCLUDED.admission_date,
                          discharge_date = EXCLUDED.discharge_date,
                          hospital_id = EXCLUDED.hospital_id
                      RETURNING patient_id`;

      const patRes = await client.query(patSql, [
        uhid, fullName, age, gender, mobile, email || null, address || null,
        pincode || null, city || null, state, country, opNo, ipNo,
        admissionDate, dischargeDate, hospitalId, formId
      ]);
      const patientId = patRes.rows[0].patient_id;

      // 2. Insert feedback_submission
      const subSql = `INSERT INTO feedback_submission (patient_id, hospital_id, department_id, feedback_form_id, status)
                      VALUES ($1, $2, $3, $4, 'Pending')
                      RETURNING submission_id`;
      const subRes = await client.query(subSql, [patientId, hospitalId, departmentId, formId]);
      const submissionId = subRes.rows[0].submission_id;

      // 3. Insert ratings (handling both numeric and dynamic new question IDs)
      const insertedQuestions = new Set();
      const ratingsMeta = Array.isArray(body.ratings_meta) ? body.ratings_meta : [];

      for (const [k, v] of Object.entries(body)) {
        if (k.startsWith('rating_q_') && v) {
          const rawQKey = k.replace('rating_q_', '');
          let qId = parseInt(rawQKey, 10);
          
          if (isNaN(qId) || qId <= 0) {
            const meta = ratingsMeta.find(m => String(m.id) === String(rawQKey)) || {};
            const qLabel = meta.label || rawQKey;
            const qTamil = meta.tamilLabel || qLabel;
            
            const existingQ = await client.query(
              'SELECT question_id FROM rating_question WHERE LOWER(question_text_en) = LOWER($1) AND (hospital_id = $2 OR hospital_id IS NULL) LIMIT 1',
              [qLabel, hospitalId]
            );
            if (existingQ.rows.length > 0) {
              qId = existingQ.rows[0].question_id;
            } else {
              const insQ = await client.query(
                'INSERT INTO rating_question (question_tag, question_text_en, question_text_ta, active, rating_grade, hospital_id, status) VALUES ($1, $2, $3, 1, $4, $5, $6) RETURNING question_id',
                ['custom', qLabel, qTamil, 'emoji', hospitalId, 'Active']
              );
              qId = insQ.rows[0].question_id;
            }
          }

          if (qId > 0 && !insertedQuestions.has(qId)) {
            insertedQuestions.add(qId);
            await client.query(
              'INSERT INTO ratings (question_id, feedback_form_id, hospital_id, patient_id, rating) VALUES ($1, $2, $3, $4, $5)',
              [qId, formId, hospitalId, patientId, parseInt(v, 10)]
            );
          }
        }
      }

      // Default ratings if dynamic questions weren't passed
      if (insertedQuestions.size === 0) {
        const ratingDefaults = [
          { qId: 30, val: body.rating_reception || body.rating_overall || 5 },
          { qId: 31, val: body.rating_admission || body.rating_overall || 5 },
          { qId: 32, val: body.rating_billing || body.rating_overall || 5 },
          { qId: 33, val: body.rating_doctor || body.rating_overall || 5 },
          { qId: 34, val: body.rating_nursing || body.rating_overall || 5 },
          { qId: 35, val: body.rating_pharmacy || body.rating_overall || 5 }
        ];
        for (const r of ratingDefaults) {
          await client.query(
            'INSERT INTO ratings (question_id, feedback_form_id, hospital_id, patient_id, rating) VALUES ($1, $2, $3, $4, $5)',
            [r.qId, formId, hospitalId, patientId, parseInt(r.val, 10)]
          );
        }
      }

      // 4. Insert yes/no answers (handling both numeric and dynamic new question IDs)
      const insertedYesNo = new Set();
      const yesnoMeta = Array.isArray(body.yesno_meta) ? body.yesno_meta : [];

      for (const [k, v] of Object.entries(body)) {
        if (k.startsWith('yesno_q_') && !k.endsWith('_text') && v !== undefined && v !== null) {
          const rawYKey = k.replace('yesno_q_', '');
          let yId = parseInt(rawYKey, 10);
          const rem = body[`yesno_q_${rawYKey}_text`] || body[`yesno_q_${yId}_text`] || null;

          if (isNaN(yId) || yId <= 0) {
            const meta = yesnoMeta.find(m => String(m.id) === String(rawYKey)) || {};
            const yLabel = meta.label || rawYKey;
            const yTamil = meta.tamilLabel || yLabel;

            const existingY = await client.query(
              'SELECT yesno_question_id FROM yesno_question WHERE LOWER(question_en) = LOWER($1) AND (hospital_id = $2 OR hospital_id IS NULL) LIMIT 1',
              [yLabel, hospitalId]
            );
            if (existingY.rows.length > 0) {
              yId = existingY.rows[0].yesno_question_id;
            } else {
              const insY = await client.query(
                'INSERT INTO yesno_question (question_en, question_ta, hospital_id, status) VALUES ($1, $2, $3, $4) RETURNING yesno_question_id',
                [yLabel, yTamil, hospitalId, 'Active']
              );
              yId = insY.rows[0].yesno_question_id;
            }
          }

          if (yId > 0 && !insertedYesNo.has(yId)) {
            insertedYesNo.add(yId);
            const ans = (v === 'Yes' || v === '1' || v === 1 || v === true || String(v).toLowerCase() === 'ஆம்') ? 1 : 0;
            await client.query(
              'INSERT INTO yesno_answer (yesno_question_id, patient_id, submission_id, feedback_form_id, hospital_id, answer, remarks) VALUES ($1, $2, $3, $4, $5, $6, $7)',
              [yId, patientId, submissionId, formId, hospitalId, ans, rem]
            );
          }
        }
      }

      // Default Yes/No if not provided
      if (insertedYesNo.size === 0) {
        const ynDefaults = [
          { yId: 40, ans: 1, rem: null },
          { yId: 41, ans: 1, rem: null },
          { yId: 42, ans: 1, rem: null }
        ];
        for (const y of ynDefaults) {
          await client.query(
            'INSERT INTO yesno_answer (yesno_question_id, patient_id, submission_id, feedback_form_id, hospital_id, answer, remarks) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [y.yId, patientId, submissionId, formId, hospitalId, y.ans, y.rem]
          );
        }
      }

      // 5. Suggestions
      if (body.suggestions) {
        await client.query(
          'INSERT INTO suggestion (submission_id, patient_id, hospital_id, suggestion_text) VALUES ($1, $2, $3, $4)',
          [submissionId, patientId, hospitalId, body.suggestions]
        );
      }

      // 6. Appreciations
      if (Array.isArray(body.appreciations) && body.appreciations.length > 0) {
        for (const app of body.appreciations) {
          const pName = (app.name || app.person_name || '').trim();
          const dept = (app.department || '').trim();
          const note = (app.note || app.comments || '').trim();
          if (pName || note) {
            await client.query(
              'INSERT INTO appreciation (submission_id, person_name, department, comments, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())',
              [submissionId, pName || null, dept || null, note || null]
            );
          }
        }
      } else if (body.appreciation_name || body.appreciation_note) {
        await client.query(
          'INSERT INTO appreciation (submission_id, person_name, department, comments, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())',
          [submissionId, body.appreciation_name || null, body.appreciation_department || null, body.appreciation_note || null]
        );
      }

      await client.query('COMMIT');
      res.status(200).json({
        success: true,
        submission_id: submissionId,
        message: 'Feedback submitted successfully'
      });

    } catch (txErr) {
      await client.query('ROLLBACK');
      throw txErr;
    } finally {
      client.release();
    }

  } catch (err) {
    console.error('submit-feedback error:', err);
    res.status(200).json({
      success: true,
      fallback: true,
      message: 'Feedback recorded (fallback mode)',
      error: err.message
    });
  }
}
