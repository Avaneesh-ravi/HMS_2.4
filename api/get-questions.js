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
    const qRes = await query(
      `SELECT question_id as id, question_text_en as label, question_text_ta as "tamilLabel" 
       FROM rating_question 
       WHERE question_id IN (30,31,32,33,34,35) 
       ORDER BY question_id ASC`
    );

    const questions = qRes.rows.map(q => ({
      id: String(q.id),
      label: (q.label || '').trim(),
      tamilLabel: (q.tamilLabel || '').trim(),
      ratingMode: 'emoji'
    }));

    const ynRes = await query(
      `SELECT yesno_question_id as id, question_en as label, question_ta as "tamilLabel" 
       FROM yesno_question 
       WHERE yesno_question_id IN (40,41,42) 
       ORDER BY yesno_question_id ASC`
    );

    const yesno = ynRes.rows.map(y => ({
      id: String(y.id),
      label: (y.label || '').trim(),
      tamilLabel: (y.tamilLabel || '').trim()
    }));

    const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine'];

    res.status(200).json({
      success: true,
      data: questions,
      yesno_data: yesno,
      settings: {
        departments,
        layoutMode: '2-column',
        combinePages: false
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
