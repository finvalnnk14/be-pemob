import db from './lib/db';

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', true);

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ success: false, message: 'Username wajib diisi' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM profiles WHERE username = ?',
      [username]
    );

    if (rows.length > 0) {
      return res.status(200).json({ success: true, profile: rows[0] });
    } else {
      return res.status(200).json({ success: true, profile: null });
    }
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
}
