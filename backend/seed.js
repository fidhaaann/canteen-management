const bcrypt = require('bcryptjs');
const pool = require('./db');

async function seed() {
  try {
    const adminHash = await bcrypt.hash('admin123', 10);
    const staffHash = await bcrypt.hash('staff123', 10);

    // Update existing placeholder users or insert new ones
    await pool.query(
      `INSERT INTO users (username, password_hash, full_name, role)
       VALUES ('admin', ?, 'System Admin', 'admin')
       ON DUPLICATE KEY UPDATE password_hash = ?`,
      [adminHash, adminHash]
    );
    await pool.query(
      `INSERT INTO users (username, password_hash, full_name, role)
       VALUES ('staff1', ?, 'John Staff', 'staff')
       ON DUPLICATE KEY UPDATE password_hash = ?`,
      [staffHash, staffHash]
    );

    console.log('Seed complete!');
    console.log('Admin login: admin / admin123');
    console.log('Staff login: staff1 / staff123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
