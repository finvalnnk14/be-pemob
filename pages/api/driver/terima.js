import db from '../lib/db'; // atau sesuaikan '../lib/db' jika di dalam /driver

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // CORS preflight
  }

  // GET digunakan untuk TrackingPage
  if (req.method === 'GET') {
    const { status } = req.query;

    try {
      const [rows] = await db.query(
        'SELECT * FROM pengiriman WHERE status = ? ORDER BY timestamp DESC LIMIT 1',
        [status]
      );

      return res.status(200).json({ data: rows });
    } catch (err) {
      console.error('Gagal mengambil data:', err);
      return res.status(500).json({ message: 'Gagal mengambil data' });
    }
  }

  // POST digunakan saat driver klik tombol "Terima"
  if (req.method === 'POST') {
    try {
      const { orderId } = req.body;

      if (!orderId) {
        return res.status(400).json({ message: 'orderId tidak ditemukan dalam body' });
      }

      const query = 'UPDATE pengiriman SET status = ? WHERE id = ?';
      const [result] = await db.query(query, ['cooking', orderId]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Data dengan ID tersebut tidak ditemukan' });
      }

      return res.status(200).json({ message: 'Status berhasil diubah menjadi cooking' });
    } catch (error) {
      console.error('Gagal mengubah status:', error);
      return res.status(500).json({ message: 'Terjadi kesalahan saat mengubah status' });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
