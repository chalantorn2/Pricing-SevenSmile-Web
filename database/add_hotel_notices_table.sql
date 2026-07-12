-- add_hotel_notices_table.sql
-- Date-range overlays on a hotel: Stop Sale (period closed for sale) and
-- Promotion (special promo price for a period). One row per notice.
-- room_type NULL = applies to the whole hotel. promo_price is only used when
-- type = 'promotion' (staff enter the final promo price directly; no % math).

CREATE TABLE IF NOT EXISTS `hotel_notices` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `hotel_id` INT(11) NOT NULL,
  `type` ENUM('stop_sale','promotion') NOT NULL,
  `room_type` VARCHAR(255) DEFAULT NULL COMMENT 'NULL = whole hotel',
  `date_start` DATE NOT NULL,
  `date_end` DATE NOT NULL,
  `title` VARCHAR(255) DEFAULT NULL COMMENT 'promo name / stop-sale reason',
  `detail` TEXT DEFAULT NULL,
  `promo_price` DECIMAL(10,2) DEFAULT NULL COMMENT 'final price, promotion only',
  `currency` VARCHAR(3) NOT NULL DEFAULT 'THB',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_hotel` (`hotel_id`),
  KEY `idx_type` (`hotel_id`, `type`),
  KEY `idx_dates` (`date_start`, `date_end`),
  CONSTRAINT `fk_hotel_notices_hotel` FOREIGN KEY (`hotel_id`)
    REFERENCES `hotels` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
