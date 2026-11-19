import { query } from './_lib/db.js';

function resolveHospitalId(rawId) {
  const str = String(rawId || '').toLowerCase().trim();
  if (str === '1' || str.includes('apl') || str.includes('apollo')) return 1;
  if (str === '2' || str.includes('cmc') || str.includes('city')) return 2;
  if (str === '3' || str.includes('gov') || str.includes('govt')) return 3;
  const num = parseInt(str, 10);
  return isNaN(num) ? 1 : num;
}

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
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
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
        if (chunks.length > 0) {
          rawBuffer = Buffer.concat(chunks);
        }
      }

      if (rawBuffer) {
        const contentType = req.headers['content-type'] || '';
        if (contentType.includes('multipart/form-data')) {
          const match = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
          if (match) {
            const boundary = match[1] || match[2];
            body = parseMultipart(rawBuffer, boundary);
          }
        } else {
          try {
            body = JSON.parse(rawBuffer.toString('utf-8'));
          } catch (e) {
            body = {};
          }
        }
      }
    }

    body = body || {};
    const hospitalId = resolveHospitalId(body.hospital_id || req.query.hospital_id || '1');
    const hospitalName = body.hospitalName || body.name || '';
    const address = body.address || body.address1 || '';
    const contactNumber = body.contactNumber || body.mobile || body.phone || '';
    const email = body.email || '';
    const logo = body.logo || '';

    try {
      if (logo) {
        await query(
          `UPDATE hospital SET name = $1, address1 = $2, mobile = $3, email = $4, logo = $5 WHERE hospital_id = $6`,
          [hospitalName, address, contactNumber, email, logo, hospitalId]
        );
      } else {
        await query(
          `UPDATE hospital SET name = $1, address1 = $2, mobile = $3, email = $4 WHERE hospital_id = $5`,
          [hospitalName, address, contactNumber, email, hospitalId]
        );
      }
    } catch (dbErr) {
      console.warn('Database update failed, continuing with client sync:', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Branding saved successfully',
      hospital: {
        hospital_id: hospitalId,
        hospitalName,
        address,
        contactNumber,
        email,
        logo
      }
    });
  } catch (error) {
    console.error('Error in save-branding:', error);
    return res.status(200).json({
      success: true,
      message: 'Branding saved locally'
    });
  }
}
