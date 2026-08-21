import { query } from './db.js';

export default async function handler(req, res) {
  try {
    const result = await query('SELECT count(*) as count FROM hospital');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      status: 'ok',
      engine: 'Node.js Serverless on Vercel',
      connectedToPostgres: true,
      hospitalsCount: parseInt(result.rows[0].count, 10),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}
