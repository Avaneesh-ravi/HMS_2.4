import { query } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const result = await query(`
      SELECT hospital_id, hospital_code, slug, name, address1, address2, mobile, email, website, logo, status 
      FROM hospital 
      ORDER BY hospital_id ASC
    `);

    const hospitals = result.rows.map(r => {
      const addrParts = [r.address1, r.address2].filter(Boolean);
      return {
        id: r.hospital_id,
        hospitalId: r.hospital_id,
        hospitalCode: r.hospital_code || '',
        slug: r.slug || '',
        name: r.name || 'Healthcare Center',
        logo: r.logo || null,
        address: addrParts.join(', ') || null,
        address1: r.address1 || '',
        address2: r.address2 || '',
        contactNumber: r.mobile || null,
        email: r.email || null,
        status: r.status || 'Active'
      };
    });

    return res.status(200).json({
      success: true,
      hospitals: hospitals
    });
  } catch (error) {
    console.error('Error in get-hospitals API:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch hospitals'
    });
  }
}
