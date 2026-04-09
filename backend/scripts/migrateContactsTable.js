const pool = require('../config/database');

async function migrateContactsTable() {
  try {
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'support_system' AND TABLE_NAME = 'contacts' AND COLUMN_NAME = 'department'
    `);

    if (columns.length > 0) {
      await pool.execute(`
        ALTER TABLE contacts
        DROP COLUMN department,
        ADD COLUMN department_id INT NULL AFTER email,
        ADD INDEX idx_department (department_id)
      `);
      console.log('Column replaced with department_id');
    } else {
      const [hasDeptId] = await pool.execute(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = 'support_system' AND TABLE_NAME = 'contacts' AND COLUMN_NAME = 'department_id'
      `);
      if (hasDeptId.length === 0) {
        await pool.execute(`
          ALTER TABLE contacts
          ADD COLUMN department_id INT NULL AFTER email,
          ADD INDEX idx_department (department_id)
        `);
        console.log('department_id column added');
      } else {
        console.log('department_id already exists');
      }
    }

    const [departments] = await pool.execute('SELECT id, name FROM departments');
    const [contacts] = await pool.execute('SELECT id, department_id FROM contacts WHERE department_id IS NULL');

    if (contacts.length > 0) {
      console.log(`Found ${contacts.length} contacts without department_id. Please update them manually.`);
    }

    try {
      await pool.execute(`
        ALTER TABLE contacts
        MODIFY COLUMN department_id INT NOT NULL,
        ADD FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
      `);
      console.log('Foreign key constraint added successfully');
    } catch (fkError) {
      console.log('Could not add NOT NULL constraint (some contacts may have NULL department_id):', fkError.message);
      await pool.execute(`
        ALTER TABLE contacts
        ADD FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
      `);
      console.log('Foreign key added (nullable)');
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error migrating contacts table:', error.message);
    process.exit(1);
  }
}

migrateContactsTable();
