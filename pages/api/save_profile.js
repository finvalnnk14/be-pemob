import db from './lib/db';

export default async function handler(req, res) {
  // Tangani preflight CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  // CORS headers untuk POST
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', true);

  const { username, phone, address } = req.body;

  if (!username || !phone || !address) {
    return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
  }

  try {
    // Cek apakah profile user sudah ada
    const [profileExists] = await db.query(
      'SELECT * FROM profiles WHERE username = ?',
      [username]
    );

    if (profileExists.length > 0) {
      // Sudah ada, update
      await db.query(
        'UPDATE profiles SET phone = ?, address = ? WHERE username = ?',
        [phone, address, username]
      );
      return res.status(200).json({
        success: true,
        message: 'Profil berhasil diperbarui',
      });
    } else {
      // Belum ada, insert
      await db.query(
        'INSERT INTO profiles (username, phone, address) VALUES (?, ?, ?)',
        [username, phone, address]
      );
      return res.status(200).json({
        success: true,
        message: 'Profil berhasil disimpan',
      });
    }
  } catch (error) {
    console.error('Save Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
}
