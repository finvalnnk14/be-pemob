import db from '../lib/db'; // perhatikan path, sesuaikan

export default async function handler(req, res) {
  console.log("METHOD:", req.method);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { orderId, status, adminName, adminEmail } = req.body;

    if (!orderId || !status || !adminName || !adminEmail) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }

    const query = `
      UPDATE \`order\`
      SET status = ?, approved_by = ?, approver_email = ?
      WHERE id = ?
    `;

    await db.query(query, [status, adminName, adminEmail, orderId]);

    return res.status(200).json({ success: true, message: 'Order berhasil di-ACC' });
  }

  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
}
