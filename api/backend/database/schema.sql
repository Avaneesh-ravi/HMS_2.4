-- ============================================================
-- Hospital Patient Feedback System — Database Schema
-- Tech: MySQL 5.7+ / MariaDB
-- ============================================================

CREATE DATABASE IF NOT EXISTS hospital_feedback_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE hospital_feedback_db;

-- ------------------------------------------------------------
-- 1. HOSPITALS  (supports the "Select Hospital" multi-tenant flow)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hospitals (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    hospital_name   VARCHAR(150) NOT NULL,
    subdomain       VARCHAR(100) NOT NULL UNIQUE,      -- e.g. cityhospital.feedback.com
    logo_path       VARCHAR(255) DEFAULT NULL,
    address         VARCHAR(255) DEFAULT NULL,
    contact_number  VARCHAR(20)  DEFAULT NULL,
    is_active       TINYINT(1) DEFAULT 1,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. ADMIN USERS (per-hospital login)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    hospital_id     INT NOT NULL,
    username        VARCHAR(100) NOT NULL,
    email           VARCHAR(150) DEFAULT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(150) DEFAULT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_hospital_username (hospital_id, username),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. PATIENTS  (Patient Information card)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patients (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    hospital_id       INT DEFAULT NULL,
    uhid              VARCHAR(50)  NOT NULL,
    full_name         VARCHAR(150) NOT NULL,
    age               SMALLINT     NOT NULL,
    gender            ENUM('Male','Female','Other') NOT NULL,
    mobile_number     VARCHAR(15)  NOT NULL,
    email             VARCHAR(150) DEFAULT NULL,
    address           VARCHAR(255) DEFAULT NULL,
    pincode           VARCHAR(10)  DEFAULT NULL,
    city              VARCHAR(100) DEFAULT NULL,
    state             VARCHAR(100) DEFAULT 'Tamil Nadu',
    country           VARCHAR(100) DEFAULT 'India',
    visit_type        ENUM('OP','IP') NOT NULL DEFAULT 'OP',   -- OP/IP selector
    visit_uhid        VARCHAR(50)  DEFAULT NULL,               -- "UHID" field under OP/IP section
    admission_date    DATE DEFAULT NULL,
    discharge_date    DATE DEFAULT NULL,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. FEEDBACK RESPONSES (Service Feedback ratings 1-13 + Y/N + text)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feedback_responses (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    patient_id              INT NOT NULL,

    -- 12 service category ratings (1 = Very Bad ... 5 = Excellent)
    rating_reception        TINYINT DEFAULT NULL,
    rating_admission        TINYINT DEFAULT NULL,
    rating_billing          TINYINT DEFAULT NULL,
    rating_doctor           TINYINT DEFAULT NULL,
    rating_nursing          TINYINT DEFAULT NULL,
    rating_pharmacy         TINYINT DEFAULT NULL,
    rating_lab_scan         TINYINT DEFAULT NULL,
    rating_insurance        TINYINT DEFAULT NULL,
    rating_food             TINYINT DEFAULT NULL,
    rating_physiotherapy    TINYINT DEFAULT NULL,
    rating_blood_bank       TINYINT DEFAULT NULL,
    rating_cleanliness      TINYINT DEFAULT NULL,
    rating_overall          TINYINT DEFAULT NULL,   -- Overall Experience (13th)

    -- Yes/No toggle questions
    cleanliness_issue       ENUM('Yes','No') DEFAULT NULL,
    cleanliness_issue_text  TEXT DEFAULT NULL,       -- shown only if cleanliness_issue = 'Yes'
    cost_explained          ENUM('Yes','No') DEFAULT NULL,
    cost_issue_text         TEXT DEFAULT NULL,       -- shown only if cost_explained = 'No'
    would_recommend         ENUM('Yes','No') DEFAULT NULL,
    recommend_reason_text   TEXT DEFAULT NULL,       -- shown only if would_recommend = 'No'

    -- What made you choose us (Questionary Page)
    choose_reason           VARCHAR(100) DEFAULT NULL, -- e.g. Advertisement / News / Social Media

    -- Suggestions
    suggestions             TEXT DEFAULT NULL,

    -- Appreciation
    appreciation_name       VARCHAR(150) DEFAULT NULL,
    appreciation_department VARCHAR(100) DEFAULT NULL,
    appreciation_note       TEXT DEFAULT NULL,

    -- Signature / confirmation
    signature_name          VARCHAR(150) DEFAULT NULL,
    signature_confirmed     TINYINT(1) DEFAULT 0,

    submitted_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. OFFICE USE ONLY (Admin — per response, independent record)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS office_use (
    id                    INT AUTO_INCREMENT PRIMARY KEY,
    feedback_response_id  INT NOT NULL UNIQUE,
    complaint_review      TEXT DEFAULT NULL,
    review_date           DATE DEFAULT NULL,
    corrective_action     TEXT DEFAULT NULL,
    preventive_action     TEXT DEFAULT NULL,
    incharge_name         VARCHAR(150) DEFAULT NULL,
    status                ENUM('Pending Review','Reviewed') DEFAULT 'Pending Review',
    updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (feedback_response_id) REFERENCES feedback_responses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 6. DRAFT AUTOSAVE (optional — supports "Save Draft")
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feedback_drafts (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    draft_token   VARCHAR(64) NOT NULL UNIQUE,
    draft_data    LONGTEXT NOT NULL,   -- JSON blob of the whole form
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- SEED DATA
-- ------------------------------------------------------------
INSERT INTO hospitals (hospital_name, subdomain, address, contact_number)
VALUES ('Apollo Healthcare Center', 'apollo.feedback.com', '123 Health Street, Perundurai, Tamil Nadu', '+91-98765-43210')
ON DUPLICATE KEY UPDATE hospital_name = hospital_name;

-- NOTE: The default admin account is NOT created here because a bcrypt hash
-- must be generated by PHP itself (password_hash never gives the same output
-- twice, and a hand-typed hash here would not verify).
--
-- After importing this schema, run database/create_admin.php ONCE from your
-- browser (e.g. http://localhost/hospital-feedback-system/database/create_admin.php)
-- to create the default admin login: username = admin / password = Admin@123
-- Delete that file afterwards for security.
