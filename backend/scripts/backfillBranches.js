require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'support_system'
  });

  const sql = `
    INSERT INTO user_branches (user_id, branch_id)
    SELECT u.id, u.branch_id
    FROM users u
    WHERE u.branch_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM user_branches ub
        WHERE ub.user_id = u.id AND ub.branch_id = u.branch_id
      )
  `;

  const [result] = await conn.execute(sql);
  console.log('Backfill inserted rows:', result.affectedRows);
  await conn.end();
}

run().catch((err) => {
  console.error('Backfill failed:', err.message);
  process.exit(1);
});
