-- =====================================================
-- SUPPORT MANAGEMENT SYSTEM - DATABASE SCHEMA
-- =====================================================

CREATE DATABASE IF NOT EXISTS support_system;
USE support_system;

-- =====================================================
-- DEPARTMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default departments
INSERT INTO departments (name, code, description) VALUES
('IT', 'IT', 'Information Technology Department'),
('Underwriting', 'UW', 'Underwriting Department'),
('MIS', 'MIS', 'Management Information System Department');

-- =====================================================
-- BRANCHES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS branches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample branches
INSERT INTO branches (name, code, address) VALUES
('Head Office', '1', 'Main Office Building'),
('Dhaka Central', '2', 'Dhaka Central Branch'),
('Chittagong North', '3', 'Chittagong North Branch'),
('Sylhet', '4', 'Sylhet Branch'),
('Rajshahi', '5', 'Rajshahi Branch');

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(60) NOT NULL UNIQUE,
    email VARCHAR(100) NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_image_url VARCHAR(500) NULL,
    role ENUM('admin', 'user', 'it', 'underwriting', 'mis') NOT NULL DEFAULT 'user',
    department_id INT,
    branch_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_department (department_id),
    INDEX idx_branch (branch_id),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Users can be linked to multiple branches; branch_id in users kept as primary/legacy branch
CREATE TABLE IF NOT EXISTS user_branches (
    user_id INT NOT NULL,
    branch_id INT NOT NULL,
    PRIMARY KEY (user_id, branch_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    INDEX idx_user_branch_user (user_id),
    INDEX idx_user_branch_branch (branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default admin user (password: admin123)
INSERT INTO users (name, username, email, password, role, department_id, branch_id) VALUES
('System Admin', 'admin', 'admin@support.com', '$2a$10$rDkPvvAFV8kqwXy4l2u.j.AeCvWVpPmRMgLVgJrp1EiVYlEiC7q1m', 'admin', 1, 1);

-- =====================================================
-- TICKETS TABLE
-- =====================================================
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
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT,
    INDEX idx_ticket_number (ticket_number),
    INDEX idx_user_id (user_id),
    INDEX idx_department (department_id),
    INDEX idx_status (status),
    INDEX idx_problem_type (problem_type),
    INDEX idx_branch (branch_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TICKET MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ticket_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    sender_id INT NOT NULL,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    sender_ip VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TICKET ATTACHMENTS TABLE (Cloudinary)
-- =====================================================
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
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_public_id (public_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TICKET APPROVALS TABLE (Workflow Tracking)
-- =====================================================
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
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_approver (approver_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- TICKET STATUS HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ticket_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    changed_by INT NOT NULL,
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- NOTICES TABLE
-- =====================================================
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
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notice_date (notice_date),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- NOTICE POPUP SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notice_popup_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    popup_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- ACTIVITY LOGS TABLE (with client IP)
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NULL,
    entity_id INT NULL,
    details TEXT NULL,
    client_ip VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- CONTACTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(100) NULL,
    department VARCHAR(100) NOT NULL,
    branch_id INT NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_branch (branch_id),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
