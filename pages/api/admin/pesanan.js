import db from '../lib/db';

export default async function handler(req, res) {
  console.log("METHOD:", req.method);

  // === CORS ===
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // === POST: Simpan order baru ===
  if (req.method === 'POST') {
    try {
      const { status, total, timestamp } = req.body;

      const finalStatus = status || 'pending';

      if (!total) {
        return res.status(400).json({ success: false, message: 'Total harus diisi' });
      }

      // === Perbaiki timestamp ===
      let finalTimestamp;
      if (timestamp) {
        // Convert ISO atau string lain ke format MySQL
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
          return res.status(400).json({ success: false, message: 'Format timestamp tidak valid' });
        }
        finalTimestamp = date.toISOString().slice(0, 19).replace('T', ' ');
      } else {
        // Jika kosong, pakai waktu sekarang
        const now = new Date();
        finalTimestamp = now.toISOString().slice(0, 19).replace('T', ' ');
      }

      const query = `
        INSERT INTO \`order\` (status, total, timestamp)
        VALUES (?, ?, ?)
      `;

      await db.query(query, [finalStatus, total, finalTimestamp]);

      console.log('Data berhasil disimpan ke database');
      return res.status(200).json({
        success: true,
        message: 'Pesanan berhasil disimpan ke database',
      });

    } catch (error) {
      console.error('Gagal menyimpan ke database:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menyimpan ke database',
      });
    }
  }

  // === GET: Ambil status order berdasarkan ID atau status ===
  if (req.method === 'GET') {
    try {
      const { id, status } = req.query;

      if (!id && !status) {
        return res.status(400).json({ success: false, message: 'ID atau Status harus diisi' });
      }

      let rows;

      if (id) {
        [rows] = await db.query('SELECT * FROM `order` WHERE id = ?', [id]);
      } else if (status) {
        [rows] = await db.query('SELECT * FROM `order` WHERE status = ? ORDER BY timestamp DESC LIMIT 1', [status]);
      }

      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
      }

      return res.status(200).json({
        success: true,
        data: rows.length === 1 ? rows[0] : rows,
      });

    } catch (error) {
      console.error('Gagal mengambil data:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data',
      });
    }
  }

  // === Method selain POST/GET ===
  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
}
