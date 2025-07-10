import db from '../lib/db';

export default async function handler(req, res) {
  console.log("METHOD:", req.method);

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { status, total, timestamp } = req.body;

      // Gunakan nilai default jika status tidak dikirim
      const finalStatus = status || 'pending';

      if (!total) {
        return res.status(400).json({ success: false, message: 'Total harus diisi' });
      }

      // Insert satu kali, tanpa loop items
      const query = `
        INSERT INTO \`order\` (status, total, timestamp)
        VALUES (?, ?, ?)
      `;

      await db.query(query, [finalStatus, total, timestamp]);

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

  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
}
