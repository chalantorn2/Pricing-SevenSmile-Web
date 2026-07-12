-- add_hotel_rates_table.sql
-- Net rates per hotel room type, normalised to one row per (room, period, meal plan).
-- Handles every Excel layout (RO/RB split, single price, multi-season) via meal_plan
-- being NULL when the source has no meal-plan split. period_start/end are best-effort
-- parsed from period_label for filtering/sorting; period_label keeps the original text.
-- Hotel-level conditions live as free text on `hotels` (rate_validity/child_policy/rate_terms).

CREATE TABLE IF NOT EXISTS `hotel_rates` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `hotel_id` INT(11) NOT NULL,
  `room_type` VARCHAR(255) NOT NULL,
  `period_label` VARCHAR(255) DEFAULT NULL COMMENT 'original season/date text',
  `period_start` DATE DEFAULT NULL,
  `period_end` DATE DEFAULT NULL,
  `meal_plan` VARCHAR(10) DEFAULT NULL COMMENT 'RO, RB, or NULL when source has no split',
  `price` DECIMAL(10,2) NOT NULL,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'THB',
  `sort_order` INT(11) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_hotel` (`hotel_id`),
  KEY `idx_room` (`hotel_id`, `room_type`),
  KEY `idx_period` (`period_start`, `period_end`),
  CONSTRAINT `fk_hotel_rates_hotel` FOREIGN KEY (`hotel_id`)
    REFERENCES `hotels` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Hotel-level rate conditions (free text). Run once; ignore "duplicate column" if re-run.
ALTER TABLE `hotels`
  ADD COLUMN `rate_validity` TEXT DEFAULT NULL COMMENT 'validity / sales-stay period / market / booking code'
    AFTER `room_types`,
  ADD COLUMN `child_policy`  TEXT DEFAULT NULL AFTER `rate_validity`,
  ADD COLUMN `rate_terms`    TEXT DEFAULT NULL COMMENT 'cancellation, extra bed, T&C etc.'
    AFTER `child_policy`;
