import db from '../lib/db';

export default async function handler(req, res) {
  // Atur CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const [rows] = await db.query(`
        SELECT id, total, timestamp, harga AS price, username, phone, address, status
        FROM pengiriman
        ORDER BY timestamp DESC
      `);
      return res.status(200).json(rows);
    } catch (error) {
      console.error('Gagal mengambil data dari database:', error);
      return res.status(500).json({ message: 'Gagal mengambil data' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { total, timestamp, harga, username, phone, address, status } = req.body;

      if (!total || !timestamp || !harga || !username || !phone || !address || !status) {
        return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
      }

      const query = `
        INSERT INTO pengiriman (total, timestamp, harga, username, phone, address, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      await db.query(query, [total, timestamp, harga, username, phone, address]);

      console.log('Data pengiriman berhasil disimpan');
      return res.status(200).json({
        success: true,
        message: 'Pengiriman berhasil disimpan ke database',
      });

    } catch (error) {
      console.error('Gagal menyimpan ke database:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menyimpan ke database',
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
}
