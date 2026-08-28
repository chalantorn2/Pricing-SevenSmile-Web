-- add_transfer_tables.sql
-- Transfer rates are a price matrix, not a vendor catalogue, so this module does
-- NOT follow the hotels/restaurants shape. The structure is ported from the
-- INDO SMILE official-web backend (migrations 006 + 006_transfer_real_data), so
-- both systems can stay in sync:
--
--   transfer_locations     master list of pickup / dropoff points
--   transfer_vehicles      master list of vehicle types (Sedan / SUV / Van)
--   transfer_routes        an origin-destination pair, grouped by service category
--   transfer_route_prices  the price one supplier charges for one vehicle on one route
--
-- Three columns are additions on top of the official-web schema:
--   locations.province    so the sidebar province filter works like the other
--                         modules; a route belongs to a province when either end
--                         of it does.
--   routes.category       already exists upstream, but is NOT NULL here because it
--                         is part of the uniqueness rule: the same pair of places
--                         can be sold as an airport transfer and as a round trip
--                         at different prices.
--   prices.supplier_id    every supplier quotes the same journeys, so the routes
--                         are shared and only the money is per supplier. Each
--                         supplier's rate sheet is therefore its slice of
--                         transfer_route_prices, not a private copy of the routes.

CREATE TABLE IF NOT EXISTS `transfer_locations` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `province` VARCHAR(100) NOT NULL DEFAULT 'Phuket',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT(11) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_name` (`name`),
  KEY `idx_province` (`province`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `transfer_vehicles` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `max_passengers` INT(11) NOT NULL DEFAULT 1,
  `max_luggage` INT(11) NOT NULL DEFAULT 2,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT(11) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_name` (`name`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- `category` groups routes into the sections of the supplier's rate sheet:
--   hotel_transfer, airport_transfer, inter_province, move_hotel, city_tour,
--   restaurant_roundtrip, attraction_roundtrip, show_roundtrip_a, show_roundtrip_b
-- `label` keeps the wording used on that rate sheet, which is often richer than
-- "origin to destination" (it carries durations, inclusions, and round trips).
CREATE TABLE IF NOT EXISTS `transfer_routes` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `origin_id` INT(11) NOT NULL,
  `destination_id` INT(11) NOT NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT 'transfer',
  `label` VARCHAR(300) DEFAULT NULL,
  `note` VARCHAR(255) DEFAULT NULL,
  `sort_order` INT(11) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_pair` (`origin_id`, `destination_id`, `category`),
  KEY `idx_origin` (`origin_id`),
  KEY `idx_destination` (`destination_id`),
  KEY `idx_category` (`category`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `fk_transfer_route_origin` FOREIGN KEY (`origin_id`)
    REFERENCES `transfer_locations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_transfer_route_destination` FOREIGN KEY (`destination_id`)
    REFERENCES `transfer_locations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- One row is one cell of one supplier's rate sheet. The unique key carries
-- supplier_id, so the same route and vehicle can hold a different price for every
-- supplier, and a supplier that does not sell a route simply has no row for it.
CREATE TABLE IF NOT EXISTS `transfer_route_prices` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `route_id` INT(11) NOT NULL,
  `supplier_id` INT(11) NOT NULL,
  `vehicle_id` INT(11) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'THB',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_route_supplier_vehicle` (`route_id`, `supplier_id`, `vehicle_id`),
  KEY `idx_route` (`route_id`),
  KEY `idx_supplier` (`supplier_id`),
  KEY `idx_vehicle` (`vehicle_id`),
  CONSTRAINT `fk_transfer_price_route` FOREIGN KEY (`route_id`)
    REFERENCES `transfer_routes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_transfer_price_supplier` FOREIGN KEY (`supplier_id`)
    REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_transfer_price_vehicle` FOREIGN KEY (`vehicle_id`)
    REFERENCES `transfer_vehicles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
