const mysql = require("mysql2/promise");
require("dotenv").config();

async function initDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });

  const runSafe = async (query, params = []) => {
    try {
      await connection.query(query, params);
    } catch (err) {
      const ignorable = [
        "ER_DUP_FIELDNAME",
        "ER_DUP_KEYNAME",
        "ER_DUP_ENTRY",
        "ER_CANT_DROP_FIELD_OR_KEY",
        "ER_PARSE_ERROR",
        "ER_TABLE_EXISTS_ERROR",
        "ER_FK_DUP_NAME",
        "ER_FK_INCOMPATIBLE_COLUMNS",
      ];
      if (!ignorable.includes(err.code)) {
        throw err;
      }
    }
  };

  const schema = `
    CREATE DATABASE IF NOT EXISTS support_system;
    USE support_system;

    CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        code VARCHAR(20) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS branches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(20) NOT NULL UNIQUE,
        address TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(60) NOT NULL UNIQUE,
        email VARCHAR(100) NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        profile_image_url VARCHAR(500) NULL,
        role ENUM('admin', 'user', 'it', 'underwriting', 'mis') NOT NULL DEFAULT 'user',
        department_id INT NULL,
        branch_id INT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        last_seen TIMESTAMP NULL,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
        INDEX idx_username (username),
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_branch (branch_id),
        INDEX idx_department (department_id),
        INDEX idx_is_active (is_active),
        INDEX idx_last_seen (last_seen)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS user_branches (
        user_id INT NOT NULL,
        branch_id INT NOT NULL,
        PRIMARY KEY (user_id, branch_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
        INDEX idx_user_branch_user (user_id),
        INDEX idx_user_branch_branch (branch_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_number VARCHAR(20) NOT NULL UNIQUE,
        user_id INT NOT NULL,
        department_id INT NOT NULL,
        current_handler_id INT,
        problem_type ENUM('it', 'underwriting', 'mis') NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status ENUM('open', 'pending', 'approved', 'rejected', 'closed') DEFAULT 'open',
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        branch_id INT NOT NULL,
        approved_by INT NULL,
        approved_at TIMESTAMP NULL,
        approval_remarks TEXT NULL,
        created_ip VARCHAR(45) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        closed_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
        FOREIGN KEY (current_handler_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS ticket_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        sender_id INT NOT NULL,
        message TEXT NOT NULL,
        is_internal BOOLEAN DEFAULT FALSE,
        sender_ip VARCHAR(45) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS ticket_attachments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        uploaded_by INT NOT NULL,
        file_url VARCHAR(500) NOT NULL,
        public_id VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_type ENUM('image', 'pdf') NOT NULL,
        file_size INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS ticket_approvals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        approver_id INT NOT NULL,
        department_id INT NOT NULL,
        action ENUM('approve', 'reject') NOT NULL,
        remarks TEXT,
        from_status ENUM('open', 'pending', 'approved', 'rejected', 'closed') NOT NULL,
        to_status ENUM('open', 'pending', 'approved', 'rejected', 'closed') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
        FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE RESTRICT,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS ticket_status_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        changed_by INT NOT NULL,
        from_status VARCHAR(20),
        to_status VARCHAR(20) NOT NULL,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
        FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS notices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        heading VARCHAR(255) NOT NULL,
        detail TEXT NOT NULL,
        notice_date DATE NOT NULL,
        notice_time TIME NOT NULL,
        file_url VARCHAR(500) NULL,
        public_id VARCHAR(255) NULL,
        file_name VARCHAR(255) NULL,
        file_type ENUM('image', 'pdf') NULL,
        file_size INT NULL,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS notice_popup_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        popup_enabled BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  try {
    await connection.query(schema);
    console.log("Database initialized successfully");

    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // --- Migrations for existing installations ---
    // 1) Add new columns if missing (lenient null to avoid failures)
    await runSafe(`ALTER TABLE users ADD COLUMN username VARCHAR(60) NULL`);
    await runSafe(
      `ALTER TABLE users ADD COLUMN profile_image_url VARCHAR(500) NULL`,
    );
    await runSafe(`ALTER TABLE users ADD COLUMN last_seen TIMESTAMP NULL`);

    // 2) Ensure email is nullable and role includes 'it'
    await runSafe(`ALTER TABLE users MODIFY COLUMN email VARCHAR(100) NULL`);
    await runSafe(
      `ALTER TABLE users MODIFY COLUMN role ENUM('admin','user','it','underwriting','mis') NOT NULL DEFAULT 'user'`,
    );

    // 3) Backfill usernames for rows missing it
    await runSafe(
      `UPDATE users SET username = CONCAT('user', id) WHERE username IS NULL OR username = ''`,
    );
    await runSafe(`UPDATE users SET username = 'admin' WHERE id = 1`);

    // 4) Enforce NOT NULL + uniqueness and add indexes
    await runSafe(
      `ALTER TABLE users MODIFY COLUMN username VARCHAR(60) NOT NULL`,
    );
    await runSafe(`CREATE UNIQUE INDEX idx_username ON users (username)`);
    await runSafe(`CREATE INDEX idx_branch ON users (branch_id)`);
    await runSafe(`CREATE INDEX idx_department ON users (department_id)`);
    await runSafe(`CREATE INDEX idx_is_active ON users (is_active)`);
    await runSafe(`CREATE INDEX idx_last_seen ON users (last_seen)`);
    await runSafe(
      `CREATE TABLE user_branches (user_id INT NOT NULL, branch_id INT NOT NULL, PRIMARY KEY (user_id, branch_id))`,
    );
    await runSafe(
      `ALTER TABLE user_branches ADD INDEX idx_user_branch_user (user_id)`,
    );
    await runSafe(
      `ALTER TABLE user_branches ADD INDEX idx_user_branch_branch (branch_id)`,
    );
    await runSafe(
      `ALTER TABLE user_branches ADD CONSTRAINT fk_ub_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`,
    );
    await runSafe(
      `ALTER TABLE user_branches ADD CONSTRAINT fk_ub_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE`,
    );
    await runSafe(
      `INSERT IGNORE INTO user_branches (user_id, branch_id) SELECT id, branch_id FROM users WHERE branch_id IS NOT NULL`,
    );

    // 5) Notices tables
    await runSafe(
      `CREATE TABLE IF NOT EXISTS notices (id INT AUTO_INCREMENT PRIMARY KEY, heading VARCHAR(255) NOT NULL, detail TEXT NOT NULL, notice_date DATE NOT NULL, notice_time TIME NOT NULL, file_url VARCHAR(500) NULL, public_id VARCHAR(255) NULL, file_name VARCHAR(255) NULL, file_type ENUM('image', 'pdf') NULL, file_size INT NULL, created_by INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE)`,
    );
    await runSafe(
      `CREATE TABLE IF NOT EXISTS notice_popup_settings (id INT AUTO_INCREMENT PRIMARY KEY, popup_enabled BOOLEAN DEFAULT TRUE, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`,
    );

    // 6) BrandBar settings table
    await runSafe(
      `CREATE TABLE IF NOT EXISTS brandbar_settings (id INT AUTO_INCREMENT PRIMARY KEY, logo_url VARCHAR(500) NULL, company_name VARCHAR(100) DEFAULT 'Republic Insurance', subtitle VARCHAR(100) DEFAULT 'Support & IT Service Desk', weather_api_key VARCHAR(255) NULL, weather_city VARCHAR(100) NULL, weather_enabled BOOLEAN DEFAULT FALSE, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`,
    );

    // Migration for existing installations
    await runSafe(
      `ALTER TABLE brandbar_settings ADD COLUMN logo_public_id VARCHAR(255) NULL AFTER logo_url`,
    );
    await runSafe(
      `ALTER TABLE brandbar_settings ADD COLUMN weather_api_key VARCHAR(255) NULL AFTER subtitle`,
    );
    await runSafe(
      `ALTER TABLE brandbar_settings ADD COLUMN weather_city VARCHAR(100) NULL AFTER weather_api_key`,
    );
    await runSafe(
      `ALTER TABLE brandbar_settings ADD COLUMN weather_enabled BOOLEAN DEFAULT FALSE AFTER weather_city`,
    );

    await runSafe(
      `INSERT IGNORE INTO brandbar_settings (logo_url, company_name, subtitle) VALUES (NULL, 'Republic Insurance', 'Support & IT Service Desk')`,
    );

    await runSafe(
      `ALTER TABLE users ADD COLUMN totp_secret VARCHAR(100) NULL`,
    );
    await runSafe(
      `ALTER TABLE users ADD COLUMN totp_enabled BOOLEAN DEFAULT FALSE`,
    );
    await runSafe(
      `ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(255) NULL`,
    );
    await runSafe(
      `ALTER TABLE users ADD COLUMN password_reset_expires TIMESTAMP NULL`,
    );

    // New feature tables
    await runSafe(
      `CREATE TABLE IF NOT EXISTS activity_logs (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NULL, action VARCHAR(50) NOT NULL, entity_type VARCHAR(50) NULL, entity_id INT NULL, details TEXT NULL, client_ip VARCHAR(45) NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL, INDEX idx_user (user_id), INDEX idx_entity (entity_type, entity_id), INDEX idx_created (created_at))`,
    );
    await runSafe(
      `CREATE TABLE IF NOT EXISTS knowledge_base (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, content TEXT NOT NULL, category VARCHAR(50) NOT NULL, tags VARCHAR(255) NULL, is_published BOOLEAN DEFAULT FALSE, created_by INT NOT NULL, views INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE, INDEX idx_category (category), INDEX idx_published (is_published))`,
    );
    await runSafe(
      `CREATE TABLE IF NOT EXISTS ticket_templates (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, description TEXT NULL, problem_type ENUM('it', 'underwriting', 'mis') NOT NULL, priority VARCHAR(20) DEFAULT 'medium', department_id INT NULL, default_title VARCHAR(255) NULL, default_description TEXT NULL, created_by INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL)`,
    );
    await runSafe(
      `CREATE TABLE IF NOT EXISTS sla_policies (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, problem_type ENUM('it', 'underwriting', 'mis') NOT NULL, priority VARCHAR(20) NOT NULL, response_minutes INT NOT NULL, resolution_minutes INT NOT NULL, is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`,
    );
    await runSafe(
      `CREATE TABLE IF NOT EXISTS ticket_ratings (id INT AUTO_INCREMENT PRIMARY KEY, ticket_id INT NOT NULL, user_id INT NOT NULL, rating INT NOT NULL, feedback TEXT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, UNIQUE KEY unique_ticket_rating (ticket_id))`,
    );
    await runSafe(
      `CREATE TABLE IF NOT EXISTS user_sessions (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, token VARCHAR(255) NOT NULL, ip_address VARCHAR(45) NULL, user_agent TEXT NULL, last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, INDEX idx_user (user_id))`,
    );
    await runSafe(
      `CREATE TABLE IF NOT EXISTS password_resets (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, token VARCHAR(255) NOT NULL, expires_at TIMESTAMP NOT NULL, used BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, INDEX idx_token (token))`,
    );
    await runSafe(
      `ALTER TABLE ticket_messages ADD COLUMN file_url VARCHAR(500) NULL`,
    );
    await runSafe(
      `ALTER TABLE user_sessions MODIFY COLUMN token TEXT NULL`,
    );
    await runSafe(
      `ALTER TABLE ticket_messages ADD COLUMN file_type VARCHAR(50) NULL`,
    );
    await runSafe(
      `ALTER TABLE ticket_messages ADD COLUMN file_size INT NULL`,
    );
    await runSafe(
      `ALTER TABLE tickets ADD COLUMN created_ip VARCHAR(45) NULL`,
    );
    await runSafe(
      `ALTER TABLE ticket_messages ADD COLUMN sender_ip VARCHAR(45) NULL`,
    );
    await runSafe(
      `ALTER TABLE activity_logs ADD COLUMN client_ip VARCHAR(45) NULL`,
    );
    await runSafe(
      `CREATE TABLE IF NOT EXISTS ticket_merges (id INT AUTO_INCREMENT PRIMARY KEY, source_ticket_id INT NOT NULL, target_ticket_id INT NOT NULL, merged_by INT NULL, reason TEXT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (source_ticket_id) REFERENCES tickets(id) ON DELETE CASCADE, FOREIGN KEY (target_ticket_id) REFERENCES tickets(id) ON DELETE CASCADE, FOREIGN KEY (merged_by) REFERENCES users(id) ON DELETE SET NULL)`,
    );
    await runSafe(
      `CREATE TABLE IF NOT EXISTS custom_fields (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, field_type ENUM('text', 'number', 'select', 'date', 'boolean') NOT NULL, options JSON NULL, department_id INT NULL, is_required BOOLEAN DEFAULT FALSE, display_order INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE)`,
    );
    await runSafe(
      `CREATE TABLE IF NOT EXISTS custom_field_values (id INT AUTO_INCREMENT PRIMARY KEY, ticket_id INT NOT NULL, field_id INT NOT NULL, value TEXT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE, FOREIGN KEY (field_id) REFERENCES custom_fields(id) ON DELETE CASCADE, UNIQUE KEY unique_ticket_field (ticket_id, field_id))`,
    );
    await runSafe(
      `CREATE TABLE IF NOT EXISTS auto_assign_rules (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, problem_type ENUM('it', 'underwriting', 'mis') NULL, branch_id INT NULL, assign_to_user_id INT NULL, assign_to_department_id INT NULL, priority VARCHAR(20) NULL, is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL, FOREIGN KEY (assign_to_user_id) REFERENCES users(id) ON DELETE SET NULL, FOREIGN KEY (assign_to_department_id) REFERENCES departments(id) ON DELETE SET NULL)`,
    );

    // Seed SLA policies
    await runSafe(
      `INSERT IGNORE INTO sla_policies (name, problem_type, priority, response_minutes, resolution_minutes) VALUES
       ('IT - Urgent', 'it', 'urgent', 15, 120),
       ('IT - High', 'it', 'high', 30, 240),
       ('IT - Medium', 'it', 'medium', 60, 480),
       ('IT - Low', 'it', 'low', 120, 1440),
       ('Underwriting - Urgent', 'underwriting', 'urgent', 30, 240),
       ('Underwriting - High', 'underwriting', 'high', 60, 480),
       ('Underwriting - Medium', 'underwriting', 'medium', 120, 1440),
       ('Underwriting - Low', 'underwriting', 'low', 240, 2880),
       ('MIS - Urgent', 'mis', 'urgent', 30, 240),
       ('MIS - High', 'mis', 'high', 60, 480),
       ('MIS - Medium', 'mis', 'medium', 120, 1440),
       ('MIS - Low', 'mis', 'low', 240, 2880)`,
    );

    // --- Seed data after migrations so columns exist ---
    await connection.query(`
      INSERT IGNORE INTO departments (id, name, code, description) VALUES
      (1, 'IT', 'IT', 'Information Technology Department'),
      (2, 'Underwriting', 'UW', 'Underwriting Department'),
      (3, 'MIS', 'MIS', 'Management Information System Department')
    `);

    // await connection.query(`
    //   INSERT IGNORE INTO branches (id, name, code, address) VALUES
    //   (1, 'Head Office', 'HO', 'Main Office Building'),
    //   (2, 'Dhaka Central', 'DC', 'Dhaka Central Branch'),
    //   (3, 'Chittagong North', 'CN', 'Chittagong North Branch'),
    //   (4, 'Sylhet', 'SY', 'Sylhet Branch'),
    //   (5, 'Rajshahi', 'RJ', 'Rajshahi Branch')
    // `);

    await connection.query(
      `
      INSERT IGNORE INTO users (id, name, username, email, password, role, department_id, branch_id) VALUES
      (1, 'System Admin', 'admin', 'admin@support.com', ?, 'admin', 1, 1)
    `,
      [hashedPassword],
    );

    console.log("Seed data inserted successfully");
  } catch (error) {
    console.error("Database initialization failed:", error.message);
  } finally {
    await connection.end();
  }
}

initDatabase();
