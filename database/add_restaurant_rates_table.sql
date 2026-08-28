-- add_restaurant_rates_table.sql
-- Net rates per restaurant menu, one row per (menu, period). Modelled on
-- hotel_rates but simpler: food is not priced per adult/child, so there is a
-- single `price` plus a `price_unit` saying what that price buys — per head, per
-- set, or per table. `min_pax` is the minimum the rate is valid for (a set menu
-- quoted at 10 pax and up).
--
-- period_start/end drive filtering and sorting; period_label keeps the original
-- text from the contract so it can be shown verbatim.

CREATE TABLE IF NOT EXISTS `restaurant_rates` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `restaurant_id` INT(11) NOT NULL,
  `menu_name` VARCHAR(255) NOT NULL COMMENT 'matches a name in restaurants.menu_types, free text',
  `period_label` VARCHAR(255) DEFAULT NULL COMMENT 'original season/date text',
  `period_start` DATE DEFAULT NULL,
  `period_end` DATE DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `price_unit` VARCHAR(20) NOT NULL DEFAULT 'per_person' COMMENT 'per_person | per_set | per_table',
  `min_pax` INT(11) DEFAULT NULL COMMENT 'minimum pax this rate is valid for',
  `currency` VARCHAR(3) NOT NULL DEFAULT 'THB',
  `note` VARCHAR(255) DEFAULT NULL,
  `sort_order` INT(11) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_restaurant` (`restaurant_id`),
  KEY `idx_menu` (`restaurant_id`, `menu_name`),
  KEY `idx_period` (`period_start`, `period_end`),
  CONSTRAINT `fk_restaurant_rates_restaurant` FOREIGN KEY (`restaurant_id`)
    REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Restaurant-level rate conditions (free text). Hotels keep three of these; food
-- has no child policy, so only validity and terms are carried over.
-- Run once; ignore "duplicate column" if re-run.
ALTER TABLE `restaurants`
  ADD COLUMN `rate_validity` TEXT DEFAULT NULL COMMENT 'validity / sales period / market / booking code'
    AFTER `menu_types`,
  ADD COLUMN `rate_terms` TEXT DEFAULT NULL COMMENT 'cancellation, inclusions, surcharges etc.'
    AFTER `rate_validity`;
