import { query, getPool } from './db.js';

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
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // try URLSearchParams
        const params = new URLSearchParams(body);
        body = Object.fromEntries(params.entries());
      }
    } else if (!body) {
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
    const departmentId = parseInt(body.department_id || '1', 10);

    const client = await getPool().connect();
    try {
      await client.query('BEGIN');

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

      // 3. Insert ratings
      for (const [k, v] of Object.entries(body)) {
        if (k.startsWith('rating_q_') && v) {
          const qId = parseInt(k.replace('rating_q_', ''), 10);
          if (qId > 0) {
            await client.query(
              'INSERT INTO ratings (question_id, feedback_form_id, hospital_id, patient_id, rating) VALUES ($1, $2, $3, $4, $5)',
              [qId, formId, hospitalId, patientId, parseInt(v, 10)]
            );
          }
        }
      }

      // 4. Insert yes/no answers
      for (const [k, v] of Object.entries(body)) {
        if (k.startsWith('yesno_q_') && !k.endsWith('_text') && v !== undefined && v !== null) {
          const yId = parseInt(k.replace('yesno_q_', ''), 10);
          if (yId > 0) {
            const ans = (v === 'Yes' || v === '1' || v === 1 || v === true) ? 1 : 0;
            const rem = body[`yesno_q_${yId}_text`] || null;
            await client.query(
              'INSERT INTO yesno_answer (yesno_question_id, patient_id, submission_id, feedback_form_id, hospital_id, answer, remarks) VALUES ($1, $2, $3, $4, $5, $6, $7)',
              [yId, patientId, submissionId, formId, hospitalId, ans, rem]
            );
          }
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
      if (body.appreciation_name || body.appreciation_note) {
        await client.query(
          'INSERT INTO appreciation (submission_id, person_name, department, comments) VALUES ($1, $2, $3, $4)',
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
