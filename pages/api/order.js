import db from './lib/db';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const [rows] = await db.query('SELECT * FROM pembayaran ORDER BY timestamp DESC');
      return res.status(200).json(rows);
    } catch (error) {
      console.error('Gagal mengambil data dari database:', error);
      return res.status(500).json({ message: 'Gagal mengambil data' });
    }
  }

  if (req.method === 'POST') {
    try {
      console.log('Body:', req.body);

      const { items, total, timestamp, username } = req.body;

      console.log('Username:', username);

      if (!items || !total || !timestamp || !username) {
        return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
      }

      for (const item of items) {
        const { name, price } = item;

        if (!name || !price) continue;

        const query = `
          INSERT INTO pembayaran (total, timestamp, nama, price, username)
          VALUES (?, ?, ?, ?, ?)
        `;

        await db.query(query, [total, timestamp, name, price, username]);
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

  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
}
