-- add_restaurants_table.sql
-- Restaurants are entered by hand in this system (unlike hotels, which started as
-- an import). The column set mirrors `hotels` on purpose so the list/detail/form
-- code can stay the same shape; `menu_types` is the restaurant answer to
-- `room_types` — the set menus / courses the restaurant sells. Prices are NOT
-- stored here: a `restaurant_rates` table (per menu, per period) comes later,
-- the same way hotel_rates was added after hotels.

CREATE TABLE IF NOT EXISTS `restaurants` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `destination` VARCHAR(255) DEFAULT NULL,
  `cuisine` VARCHAR(255) DEFAULT NULL COMMENT 'e.g. Thai, Seafood, Halal',
  `description` TEXT DEFAULT NULL,
  `short_description` TEXT DEFAULT NULL,
  `rating` DECIMAL(2,1) DEFAULT NULL,
  `review_count` INT(11) DEFAULT 0,
  `main_image` VARCHAR(500) DEFAULT NULL,
  `logo` VARCHAR(500) DEFAULT NULL,
  `facilities` TEXT DEFAULT NULL COMMENT 'JSON array',
  `open_time` VARCHAR(50) DEFAULT NULL,
  `close_time` VARCHAR(50) DEFAULT NULL,
  `seating_capacity` INT(11) DEFAULT NULL COMMENT 'max pax the restaurant can seat',
  `address` TEXT DEFAULT NULL,
  `map_url` VARCHAR(500) DEFAULT NULL,
  `contact_phone` VARCHAR(50) DEFAULT NULL,
  `contact_email` VARCHAR(150) DEFAULT NULL,
  `website` VARCHAR(255) DEFAULT NULL,
  `is_featured` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `images` TEXT DEFAULT NULL COMMENT 'JSON array',
  `menu_types` TEXT DEFAULT NULL COMMENT 'JSON array of set menus / courses',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_slug` (`slug`),
  KEY `idx_destination` (`destination`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_is_featured` (`is_featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
