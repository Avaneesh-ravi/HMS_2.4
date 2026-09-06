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

    if (body && typeof body === 'object' && !Buffer.isBuffer(body)) {
      // already parsed
    } else {
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

    let submissionId = parseInt(body.submission_id || body.response_id || '0', 10);
    const uhid = (body.uhid || '').trim();
    const reviewComments = body.review_comments || body.reviewOfComplaint || '';
    const reviewDate = body.review_date || body.dateOfReview || new Date().toISOString().slice(0, 10);
    const correctiveAction = body.corrective_action || body.correctiveAction || '';
    const preventiveAction = body.preventive_action || body.preventiveAction || '';
    const inchargeName = body.incharge_name || body.inchargeName || '';

    // If submission_id not provided but UHID is provided, look up submission_id
    if (!submissionId || isNaN(submissionId) || submissionId <= 0) {
      if (uhid) {
        const lookupRes = await query(
          `SELECT fs.submission_id 
           FROM feedback_submission fs
           JOIN patient p ON p.patient_id = fs.patient_id
           WHERE p.uhid = $1
           ORDER BY fs.submission_id DESC LIMIT 1`,
          [uhid]
        );
        if (lookupRes.rows.length > 0) {
          submissionId = parseInt(lookupRes.rows[0].submission_id, 10);
        }
      }
    }

    if (!submissionId || isNaN(submissionId) || submissionId <= 0) {
      return res.status(200).json({ success: false, message: 'Missing valid submission ID or UHID.' });
    }

    const client = await getPool().connect();
    try {
      await client.query('BEGIN');

      // Check if complaint_review row already exists
      const existing = await client.query(
        'SELECT review_id FROM complaint_review WHERE submission_id = $1 LIMIT 1',
        [submissionId]
      );

      if (existing.rows.length > 0) {
        await client.query(
          `UPDATE complaint_review 
           SET review_comments = $1, review_date = $2, corrective_action = $3, preventive_action = $4, incharge_name = $5, updated_at = NOW()
           WHERE submission_id = $6`,
          [reviewComments, reviewDate || null, correctiveAction, preventiveAction, inchargeName, submissionId]
        );
      } else {
        await client.query(
          `INSERT INTO complaint_review (submission_id, review_comments, review_date, corrective_action, preventive_action, incharge_name, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
          [submissionId, reviewComments, reviewDate || null, correctiveAction, preventiveAction, inchargeName]
        );
      }

      // Mark feedback_submission as Reviewed / Resolved
      await client.query(
        `UPDATE feedback_submission 
         SET status = 'Reviewed', updated_at = NOW()
         WHERE submission_id = $1`,
        [submissionId]
      );

      await client.query('COMMIT');

      return res.status(200).json({
        success: true,
        message: 'Office Use details saved successfully and marked as Reviewed.',
        submission_id: submissionId
      });
    } catch (dbErr) {
      await client.query('ROLLBACK');
      console.error('Database error in save-office-use:', dbErr);
      return res.status(500).json({ success: false, message: 'Database error: ' + dbErr.message });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Save office use error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
