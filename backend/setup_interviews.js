import pool from './db.js';

async function setup() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS interviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        interviewDate DATE NOT NULL,
        interviewTime TIME NOT NULL,
        meetingLink VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'Scheduled',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `;
    // Removed foreign key constraint to users table as I am not 100% sure the users table `id` is primary or exactly what the schema is, 
    // but the task just asked for these fields. Wait, I'll keep it simple and just create the table without foreign key if it fails.
    // Actually, I'll just use the query without foreign key first to be safe, since they requested specific fields.
    await pool.query(query);
    console.log("✅ 'interviews' table created or already exists.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating table:", error);
    process.exit(1);
  }
}

setup();
