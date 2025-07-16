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
    const { id, status } = req.body;

    // ✅ 1️⃣ Kalau body ada id & status → UPDATE berdasarkan ID
    if (id && status) {
      try {
        const query = `
          UPDATE pengiriman
          SET status = ?
          WHERE id = ?
        `;
        await db.query(query, [status, id]);

        console.log(`Status pengiriman ID ${id} berhasil diupdate ke ${status}`);
        return res.status(200).json({
          success: true,
          message: 'Status pengiriman berhasil diupdate berdasarkan ID',
        });
      } catch (error) {
        console.error('Gagal update status by ID:', error);
        return res.status(500).json({
          success: false,
          message: 'Gagal update status berdasarkan ID',
        });
      }
    }

    // ✅ 2️⃣ Kalau TIDAK ada ID tapi status dikirim → UPDATE yang cooking
    if (!id && status) {
      try {
        const query = `
          UPDATE pengiriman
          SET status = ?
          WHERE status = 'cooking'
          ORDER BY timestamp ASC
          LIMIT 1
        `;
        await db.query(query, [status]);

        console.log(`Status pengiriman pertama dengan status 'cooking' berhasil diupdate ke ${status}`);
        return res.status(200).json({
          success: true,
          message: 'Status pengiriman berhasil diupdate berdasarkan status sebelumnya',
        });
      } catch (error) {
        console.error('Gagal update status by status:', error);
        return res.status(500).json({
          success: false,
          message: 'Gagal update status berdasarkan status sebelumnya',
        });
      }
    }

    // ✅ 3️⃣ Kalau tidak ada ID & tidak update status → INSERT data baru
    try {
      const { total, timestamp, harga, username, phone, address } = req.body;

      if (!total || !timestamp || !harga || !username || !phone || !address) {
        return res.status(400).json({ success: false, message: 'Data tidak lengkap untuk INSERT' });
      }

      const insertQuery = `
        INSERT INTO pengiriman (total, timestamp, harga, username, phone, address, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
      `;

      await db.query(insertQuery, [total, timestamp, harga, username, phone, address]);

      console.log('Pengiriman baru berhasil disimpan');
      return res.status(200).json({
        success: true,
        message: 'Pengiriman berhasil disimpan ke database',
      });

    } catch (error) {
      console.error('Gagal insert pengiriman:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat insert pengiriman',
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
}
