import db from '../lib/db';

export default async function handler(req, res) {
  // Izinkan CORS (untuk pengujian di emulator Android / Flutter)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Tangani preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { nama, email, password } = req.body;

  // Validasi data
  if (!nama || !email || !password) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }

  try {
    // Cek apakah email sudah terdaftar
    const [existing] = await db.query('SELECT * FROM admin WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email sudah terdaftar' });
    }

    // Simpan data ke database
    await db.query('INSERT INTO admin (nama, email, password) VALUES (?, ?, ?)', [
      nama,
      email,
      password, // Catatan: untuk produksi, hash password dengan bcrypt!
    ]);

    res.status(201).json({ message: 'Registrasi berhasil' });
  } catch (error) {
    console.error('Error register:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
}
