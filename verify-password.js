// verify-password.js
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const saltRounds = 10;

// --- CONFIG DATABASE ---
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'atk_project',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function fixPassword(username, newPassword) {
  try {
    const [users] = await db.execute('SELECT * FROM c_sec_user WHERE username = ?', [username]);
    if (users.length === 0) return console.log(`User "${username}" tidak ditemukan.`);

    const user = users[0];
    const hashedPass = await bcrypt.hash(newPassword, saltRounds);

    await db.execute('UPDATE c_sec_user SET password = ? WHERE id = ?', [hashedPass, user.id]);
    console.log(`Password user "${username}" berhasil diubah menjadi hash baru.`);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    db.end();
  }
}

// --- Ganti password di sini ---
fixPassword('agus.salim', '122');
