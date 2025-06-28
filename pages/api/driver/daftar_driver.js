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

  const { nama_driver, password } = req.body;

  // Validasi data
  if (!nama_driver || !password) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }

  try {
    // Cek apakah email sudah terdaftar di tabel driver
    const [existing] = await db.query('SELECT * FROM driver WHERE nama_driver = ?', [nama_driver]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Nama driver sudah terdaftar' });
    }

    // Simpan data ke tabel driver
    await db.query('INSERT INTO driver (nama_driver, password) VALUES (?, ?)', [
      nama_driver,
      password, // Untuk produksi: hash password dengan bcrypt!
    ]);

    res.status(201).json({ message: 'Registrasi driver berhasil' });
  } catch (error) {
    console.error('Error register driver:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server saat register driver' });
  }
}
