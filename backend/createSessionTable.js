// createSessionTable.js
import pool from './db.js'; // adjust path if needed

const createTable = async () => {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ admin_sessions table created successfully');
  } catch (err) {
    console.error('❌ Failed to create table:', err.message);
  } finally {
    await pool.end();
  }
};

createTable();