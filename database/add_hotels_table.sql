-- add_hotels_table.sql
-- Hotels are imported (synced) from indosmilesouthservices.com public_hotels.php
-- into our own DB so we don't have to re-enter them. `source_id` is the hotel id
-- on the source system and is the key we upsert on. No price fields yet (source
-- has none) — they can be added later without touching the sync logic.

CREATE TABLE IF NOT EXISTS `hotels` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `source_id` INT(11) DEFAULT NULL COMMENT 'id on indosmilesouthservices.com',
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `destination` VARCHAR(255) DEFAULT NULL,
  `stars` TINYINT(1) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `short_description` TEXT DEFAULT NULL,
  `rating` DECIMAL(2,1) DEFAULT NULL,
  `review_count` INT(11) DEFAULT 0,
  `main_image` VARCHAR(500) DEFAULT NULL COMMENT 'absolute URL (prefixed at sync)',
  `amenities` TEXT DEFAULT NULL COMMENT 'JSON array',
  `check_in_time` VARCHAR(50) DEFAULT NULL,
  `check_out_time` VARCHAR(50) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `contact_phone` VARCHAR(50) DEFAULT NULL,
  `contact_email` VARCHAR(150) DEFAULT NULL,
  `website` VARCHAR(255) DEFAULT NULL,
  `is_featured` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `images` TEXT DEFAULT NULL COMMENT 'JSON array',
  `room_types` TEXT DEFAULT NULL COMMENT 'JSON array',
  `source_created_at` DATETIME DEFAULT NULL,
  `source_updated_at` DATETIME DEFAULT NULL,
  `synced_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_source_id` (`source_id`),
  KEY `idx_slug` (`slug`),
  KEY `idx_destination` (`destination`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_is_featured` (`is_featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
