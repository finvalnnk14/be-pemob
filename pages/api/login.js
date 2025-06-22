import db from './lib/db';

export default async function handler(req, res) {
  console.log('REQUEST METHOD:', req.method);
  console.log('BODY:', req.body);

  // Handle preflight (CORS pre-check)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Set CORS headers for POST response
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM user WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows.length > 0) {
      const user = rows[0];
      return res.status(200).json({
        success: true,
        message: 'Login berhasil',
        user: {
          username: user.username,
          password: user.password,
        },
      });
    } else {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }
  } catch (error) {
    console.error('Error saat login:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
}
