import { query } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const uhid = req.query.uhid || '';
  const hospitalId = parseInt(req.query.hospital_id || '1', 10);

  if (!uhid) {
    return res.status(200).json({ success: false, message: 'UHID is required' });
  }

  try {
    const patRes = await query(
      `SELECT patient_id, uhid, first_name, age, gender, mobile, p_email, address,
              pin_code, city, state, country, op_no, ip_no, admission_date, discharge_date, hospital_id
       FROM patient
       WHERE (uhid ILIKE $1) AND (hospital_id = $2 OR hospital_id = 0)
       ORDER BY patient_id DESC LIMIT 1`,
      [uhid, hospitalId]
    );

    if (patRes.rows.length > 0) {
      const p = patRes.rows[0];
      const nameParts = (p.first_name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      res.status(200).json({
        success: true,
        data: {
          patient_id: p.patient_id,
          uhid: p.uhid,
          first_name: firstName,
          last_name: lastName,
          full_name: p.first_name,
          age: p.age,
          gender: p.gender,
          mobile_number: p.mobile,
          email: p.p_email || '',
          address: p.address || '',
          pincode: p.pin_code || '',
          city: p.city || '',
          state: p.state || 'Tamil Nadu',
          country: p.country || 'India',
          op_id: p.op_no || '',
          ip_id: p.ip_no || '',
          admission_date: p.admission_date || '',
          discharge_date: p.discharge_date || ''
        }
      });
    } else {
      res.status(200).json({
        success: false,
        message: 'Patient not found'
      });
    }

  } catch (err) {
    res.status(200).json({
      success: false,
      error: err.message
    });
  }
}
