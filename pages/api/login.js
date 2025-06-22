// pages/api/login.js
import db from './lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

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
        message: 'Login berhasil',
        user: {
          username: user.username,
          password: user.password,
        },
      });
    } else {
      return res.status(401).json({ message: 'Email atau password salah' });
    }
  } catch (error) {
    console.error('Error saat login:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
}
