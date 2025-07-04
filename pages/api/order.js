import db from './lib/db';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle GET: ambil semua data dari tabel pembayaran
  if (req.method === 'GET') {
    try {
      const [rows] = await db.query('SELECT * FROM pembayaran ORDER BY timestamp DESC');
      return res.status(200).json(rows);
    } catch (error) {
      console.error('Gagal mengambil data dari database:', error);
      return res.status(500).json({ message: 'Gagal mengambil data' });
    }
  }

  // Handle POST: simpan data ke tabel pembayaran
  if (req.method === 'POST') {
    try {
      const { items, total, timestamp } = req.body;

      if (!items || !total || !timestamp) {
        return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
      }

      for (const item of items) {
        const { name, price } = item;

        if (!name || !price) continue;

        const query = `
          INSERT INTO pembayaran (total, timestamp, nama, price)
          VALUES (?, ?, ?, ?)
        `;

        await db.query(query, [total, timestamp, name, price]);
      }

      console.log('Data berhasil dikirim ke DB');
      return res.status(200).json({
        success: true,
        message: 'Pembayaran berhasil disimpan ke database',
      });

    } catch (error) {
      console.error('Gagal menyimpan ke database:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menyimpan ke database',
      });
    }
  }

  // Method lain ditolak
  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
}
