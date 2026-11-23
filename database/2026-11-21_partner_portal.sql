-- Prism Partners: run ONCE in the same MySQL database as the current Prism website.
-- Does not alter the users, enquiries, or staff authentication tables.
CREATE TABLE IF NOT EXISTS prism_partners (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  business_name VARCHAR(150) NOT NULL,
  category ENUM('hotel','motel','resort','homestay','transport','activities','local_guide','other') NOT NULL,
  star_rating TINYINT UNSIGNED NULL,
  contact_name VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL,
  phone VARCHAR(25) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  address VARCHAR(250) NOT NULL,
  postal_code VARCHAR(15) NOT NULL DEFAULT '',
  website VARCHAR(255) NOT NULL DEFAULT '',
  registration_id VARCHAR(80) NOT NULL DEFAULT '',
  description TEXT NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email_verified_at DATETIME NULL,
  status ENUM('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
  reviewed_at DATETIME NULL,
  reviewed_by BIGINT UNSIGNED NULL,
  reviewer_note VARCHAR(500) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prism_partner_email (email),
  KEY idx_prism_partner_status (status,created_at),
  KEY idx_prism_partner_category (category,city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prism_partner_verify_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  partner_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  purpose ENUM('verify','reset') NOT NULL DEFAULT 'verify',
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prism_verify_hash (token_hash),
  KEY idx_prism_verify_expiry (expires_at),
  CONSTRAINT fk_prism_partner_verify FOREIGN KEY (partner_id) REFERENCES prism_partners(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prism_partner_offerings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  partner_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(140) NOT NULL,
  offer_type ENUM('room','vehicle','experience','other') NOT NULL,
  description TEXT NOT NULL,
  capacity SMALLINT UNSIGNED NULL,
  indicative_price DECIMAL(12,2) NULL,
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_prism_offer_review (status,created_at),
  KEY idx_prism_offer_partner (partner_id,created_at),
  CONSTRAINT fk_prism_partner_offer FOREIGN KEY (partner_id) REFERENCES prism_partners(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
