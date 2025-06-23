import db from './lib/db';

export default async function handler(req, res) {
  // Tangani preflight CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // atau sesuaikan dengan origin frontend kamu
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  // CORS headers untuk permintaan POST juga perlu disetel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', true);

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
  }

  try {
    const [userExists] = await db.query('SELECT * FROM user WHERE username = ?', [username]);

    if (userExists.length > 0) {
      return res.status(409).json({ success: false, message: 'Username sudah terdaftar' });
    }

    const [result] = await db.query(
      'INSERT INTO user (username, password) VALUES (?, ?)',
      [username, password]
    );

    return res.status(200).json({
      success: true,
      message: 'Registrasi berhasil',
      user: { username },
    });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
}
