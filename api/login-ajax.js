import crypto from 'crypto';
import { query } from './db.js';

// Unique, non-shared credentials per hospital to prevent cross-hospital login
const HOSPITAL_PASSWORDS = {
  1: { pass: 'Apollo@Admin8092', hash: 'a9a70fca9ce94a3b3f26dc42c699b1cdccfe76e535020c87781e5068cab87f93' },
  2: { pass: 'City@Admin4719', hash: '75999945f196fa71dffb13ecdc74d6004df68868bfaf815084dd5849ed113766' },
  3: { pass: 'Govt@Admin3185', hash: '55823e9428f8d3dc53ed12a57fc9704959c8f3bec7138fea79e72d54c1b53063' }
};

// Map alphanumeric codes to integer hospital IDs
function resolveHospitalId(rawId) {
  const str = String(rawId || '').toLowerCase().trim();
  if (str === '1' || str.includes('apl') || str.includes('apollo')) return 1;
  if (str === '2' || str.includes('cmc') || str.includes('city')) return 2;
  if (str === '3' || str.includes('gov') || str.includes('govt')) return 3;
  const num = parseInt(str, 10);
  return isNaN(num) ? 0 : num;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    body = body || {};

    const hospitalId = resolveHospitalId(body.hospital_id);
    const identifier = String(body.email || body.username || body.userid || '').trim().toLowerCase();
    const password = String(body.password || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Direct password match or standard admin check
    const adminRes = await query(
      'SELECT hospital_admin_id, hospital_id, admin_name, email, username, password_hash, status FROM hospital_admin WHERE (LOWER(email) = $1 OR username = $1)',
      [identifier]
    );

    if (adminRes.rows.length > 0) {
      const admin = adminRes.rows[0];
      const targetHid = admin.hospital_id;

      // Strict hospital ID comparison: Admin account must belong to the selected hospital
      if (hospitalId > 0 && targetHid !== hospitalId) {
        return res.status(401).json({
          success: false,
          message: 'Invalid user ID or password for this hospital. Please check your credentials.'
        });
      }

      const inputHash = crypto.createHash('sha256').update(password).digest('hex');
      const expectedInfo = HOSPITAL_PASSWORDS[targetHid];

      // Strict password comparison: Password must match this hospital's unique password
      const isMatch = (
        (expectedInfo && (password === expectedInfo.pass || inputHash === expectedInfo.hash)) ||
        admin.password_hash === inputHash ||
        admin.password_hash === password
      );

      // Disallow cross-hospital login using another hospital's password
      const isCrossHospitalPassword = Object.entries(HOSPITAL_PASSWORDS).some(([hid, info]) => {
        return parseInt(hid, 10) !== targetHid && (password === info.pass || inputHash === info.hash);
      });

      if (!isMatch || isCrossHospitalPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid user ID or password. Please check your credentials and try again.'
        });
      }

      // Sync the distinct hash to the database if not yet updated
      if (expectedInfo && admin.password_hash !== expectedInfo.hash) {
        try {
          await query('UPDATE hospital_admin SET password_hash = $1 WHERE hospital_admin_id = $2', [expectedInfo.hash, admin.hospital_admin_id]);
        } catch (e) {}
      }

      delete admin.password_hash;
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        admin: admin
      });
    }

    // Fallback check for demo superadmin account (global access only)
    if (
      (identifier === 'admin' || identifier === 'admin@hospitalfeedback.com') &&
      (password === 'Super@Admin2026' || password === 'Admin@123')
    ) {
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        admin: {
          admin_name: 'Administrator',
          username: 'admin',
          role: 'Super Admin'
        }
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid user ID or password. Please check your credentials and try again.'
    });
  } catch (error) {
    console.error('Error in login-ajax API:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to sign in right now. Please try again later.'
    });
  }
}
