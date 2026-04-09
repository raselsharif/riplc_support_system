const pool = require('../config/database');

async function createContactsTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(30) NOT NULL,
        email VARCHAR(100) NULL,
        department VARCHAR(100) NOT NULL,
        branch_id INT NOT NULL,
        created_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_branch (branch_id),
        INDEX idx_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('Contacts table created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating contacts table:', error.message);
    process.exit(1);
  }
}

createContactsTable();
