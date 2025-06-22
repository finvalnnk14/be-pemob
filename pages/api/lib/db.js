// lib/db.js
import mysql from 'mysql2/promise';

// Sesuaikan dengan konfigurasi XAMPP kamu
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // default XAMPP biasanya kosong
  database: 'projek_pemob', // Ganti dengan nama database kamu
});

export default db;
