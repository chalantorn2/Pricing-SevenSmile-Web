-- seed_iyara_transport_transfer.sql
-- Iyara Transport's agent rate sheet, taken from the four PDFs in
-- Agent/3 Phuket/Iyara Transport (contract 01 JUL 2026 - 30 SEP 2026):
--
--   HDY  Hat Yai Airport      8 routes, Sedan only
--   KBV  Krabi Airport       11 routes + Krabi hotel point-to-point 7 routes
--   URT  Surat Thani Airport 12 routes, adds a Minivan VVIP column
--   USM  Samui Airport       11 routes
--
-- Unlike seed_transfer_data.sql this file is additive, not destructive: it only
-- inserts what is missing, so it can be re-run and it leaves every other
-- supplier's rate sheet untouched. Prices are upserted, so re-running after a
-- contract change re-applies the numbers in this file.
--
-- The rate sheet has no place for its validity window - the schema stores a
-- price, not a season - so the 01 JUL - 30 SEP 2026 dates live only in this
-- comment and in the source PDFs.
--
-- Locations are shared master data, so the wording of the sheet ("Khao Lak Pang
-- Nga Area", "Phang Nga Bay, Khao Lak Area") is kept in `label` and both rows
-- point at the one `Khao Lak` location that already exists. Same for Don Sak
-- Pier and Phuket Airport.

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

-- ---------------------------------------------------------------------------
-- Staging. Temp tables are referenced once per statement on purpose: MariaDB
-- cannot open a temporary table twice in the same query, which is also why the
-- prices go in as one INSERT per vehicle column instead of an unpivot.
-- ---------------------------------------------------------------------------
DROP TEMPORARY TABLE IF EXISTS `tmp_iyara_loc`;
DROP TEMPORARY TABLE IF EXISTS `tmp_iyara_route`;

CREATE TEMPORARY TABLE `tmp_iyara_loc` (
  `seq` INT NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `province` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`name`)
) ENGINE=MEMORY DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TEMPORARY TABLE `tmp_iyara_route` (
  `seq` INT NOT NULL,
  `origin` VARCHAR(150) NOT NULL,
  `dest` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `label` VARCHAR(300) NOT NULL,
  `sedan` DECIMAL(10,2) DEFAULT NULL,
  `suv` DECIMAL(10,2) DEFAULT NULL,
  `van` DECIMAL(10,2) DEFAULT NULL,
  `vvip` DECIMAL(10,2) DEFAULT NULL,
  PRIMARY KEY (`seq`)
) ENGINE=MEMORY DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pickup points and the areas the sheet sells to. Rows whose name already
-- exists in `transfer_locations` are skipped by the insert below, so listing
-- them here is harmless and keeps the source readable.
INSERT INTO `tmp_iyara_loc` (`seq`, `name`, `province`) VALUES
-- Origins
(1,  'Hat Yai Airport (HDY)',      'Songkhla'),
(2,  'Krabi Airport (KBV)',        'Krabi'),
(3,  'Krabi Hotel',                'Krabi'),
(4,  'Surat Thani Airport (URT)',  'Surat Thani'),
(5,  'Samui Airport (USM)',        'Samui'),

-- HDY destinations
(6,  'Hat Yai Town Area',                        'Songkhla'),
(7,  'Kho Hong / Ban Pru / Khlong Hae Area',     'Songkhla'),
(8,  'Koh Yor Area',                             'Songkhla'),
(9,  'Thung Wang / Dan Nok / Padang Besar Area', 'Songkhla'),
(10, 'Pak Bara Pier / Tammalang Pier',           'Satun'),

-- Areas shared by several sheets
(11, 'Krabi Area',              'Krabi'),
(12, 'Phang Nga Area',          'Phang Nga'),
(13, 'Phuket Area',             'Phuket'),
(14, 'Khao Sok National Park',  'Surat Thani'),

-- KBV destinations
(15, 'Krabi Town Area',                    'Krabi'),
(16, 'Ao Nang Krabi Area',                 'Krabi'),
(17, 'Klong Muang Krabi Area',             'Krabi'),
(18, 'Tub Kaek / Nong Talang Krabi Area',  'Krabi'),
(19, 'Tha Lane Krabi Area',                'Krabi'),
(20, 'Phang Nga Town Area',                'Phang Nga'),
(21, 'Koh Lanta Krabi Area',               'Krabi'),
(22, 'Thap Lamu Pier',                     'Phang Nga'),

-- URT destinations
(23, 'Surat Thani Town Area',      'Surat Thani'),
(24, 'Rajchaprabha Dam',           'Surat Thani'),
(25, 'Chumphon / Ranong Area',     'Chumphon'),
(26, 'Nakhon Si Thammarat Area',   'Nakhon Si Thammarat'),
(27, 'Koh Samui Area',             'Samui'),
(28, 'Hua Hin Area',               'Hua Hin'),
(29, 'Bangkok Area',               'Bangkok'),

-- USM destinations
(30, 'Chaweng / Choengmon / Bangrak Samui Area',            'Samui'),
(31, 'Bophut Samui Area',                                   'Samui'),
(32, 'Lamai / Maenam Samui Area',                           'Samui'),
(33, 'Bangpor Samui Area',                                  'Samui'),
(34, 'Nathon Samui Area',                                   'Samui'),
(35, 'Intercon Hotel Samui',                                'Samui'),
(36, 'Coconut Samui Villa / Samui Sunrise Villa / Bophut Villa', 'Samui'),
(37, 'Conrad Hotel Samui',                                  'Samui'),
(38, 'Maenam Villa Samui',                                  'Samui'),
(39, 'Bang Por Villa Samui',                                'Samui'),
(40, 'Bang Makham Villa Samui / Lamai Villa Samui',         'Samui');

-- One row per line of the rate sheet. NULL in a vehicle column means the sheet
-- does not sell that vehicle on that route (HDY quotes a Sedan only; the VVIP
-- minivan appears on the URT sheet alone).
INSERT INTO `tmp_iyara_route` (`seq`, `origin`, `dest`, `category`, `label`, `sedan`, `suv`, `van`, `vvip`) VALUES
-- HDY: Hat Yai Airport, meeting & sending
(1, 'Hat Yai Airport (HDY)', 'Hat Yai Town Area',                        'airport_transfer', 'Hat Yai Airport to Hat Yai Town Area',                        500.00,  NULL, NULL, NULL),
(2, 'Hat Yai Airport (HDY)', 'Kho Hong / Ban Pru / Khlong Hae Area',     'airport_transfer', 'Hat Yai Airport to Kho Hong / Ban Pru / Khlong Hae Area',     600.00,  NULL, NULL, NULL),
(3, 'Hat Yai Airport (HDY)', 'Koh Yor Area',                             'airport_transfer', 'Hat Yai Airport to Koh Yor Area',                             900.00,  NULL, NULL, NULL),
(4, 'Hat Yai Airport (HDY)', 'Thung Wang / Dan Nok / Padang Besar Area', 'airport_transfer', 'Hat Yai Airport to Thung Wang / Dan Nok / Padang Besar Area', 1000.00, NULL, NULL, NULL),
(5, 'Hat Yai Airport (HDY)', 'Pak Bara Pier / Tammalang Pier',           'airport_transfer', 'Hat Yai Airport to Pak Bara Pier / Tammalang Pier',           2000.00, NULL, NULL, NULL),
(6, 'Hat Yai Airport (HDY)', 'Krabi Area',                               'airport_transfer', 'Hat Yai Airport to Krabi Area',                               4800.00, NULL, NULL, NULL),
(7, 'Hat Yai Airport (HDY)', 'Phang Nga Area',                           'airport_transfer', 'Hat Yai Airport to Phang Nga Area',                           5800.00, NULL, NULL, NULL),
(8, 'Hat Yai Airport (HDY)', 'Phuket Area',                              'airport_transfer', 'Hat Yai Airport to Phuket Area',                              6800.00, NULL, NULL, NULL),

-- KBV: Krabi Airport, meeting & sending. One price for all three vehicles.
(9,  'Krabi Airport (KBV)', 'Krabi Town Area',                   'airport_transfer', 'Krabi Airport to Krabi Town Area',                                    600.00,  600.00,  600.00,  NULL),
(10, 'Krabi Airport (KBV)', 'Ao Nang Krabi Area',                'airport_transfer', 'Krabi Airport to Ao Nang Krabi Area (excludes Railay Area)',          700.00,  700.00,  700.00,  NULL),
(11, 'Krabi Airport (KBV)', 'Klong Muang Krabi Area',            'airport_transfer', 'Krabi Airport to Klong Muang Krabi Area',                             800.00,  800.00,  800.00,  NULL),
(12, 'Krabi Airport (KBV)', 'Tub Kaek / Nong Talang Krabi Area', 'airport_transfer', 'Krabi Airport to Tub Kaek Krabi / Nong Talang Krabi Area',            900.00,  900.00,  900.00,  NULL),
(13, 'Krabi Airport (KBV)', 'Tha Lane Krabi Area',               'airport_transfer', 'Krabi Airport to Tha Lane Krabi Area',                                1000.00, 1000.00, 1000.00, NULL),
(14, 'Krabi Airport (KBV)', 'Phang Nga Town Area',               'airport_transfer', 'Krabi Airport to Phang Nga Town Area',                                2100.00, 2100.00, 2100.00, NULL),
(15, 'Krabi Airport (KBV)', 'Koh Lanta Krabi Area',              'airport_transfer', 'Krabi Airport to Koh Lanta Krabi Area (excludes boat tickets)',       2500.00, 2500.00, 2500.00, NULL),
(16, 'Krabi Airport (KBV)', 'Khao Lak',                          'airport_transfer', 'Krabi Airport to Khao Lak Pang Nga Area',                             2500.00, 2500.00, 2500.00, NULL),
(17, 'Krabi Airport (KBV)', 'Phuket Area',                       'airport_transfer', 'Krabi Airport to Phuket Area',                                        2700.00, 2700.00, 2700.00, NULL),
(18, 'Krabi Airport (KBV)', 'Khao Sok National Park',            'airport_transfer', 'Krabi Airport to Khao Sok Surat Thani Area',                          2700.00, 2700.00, 2700.00, NULL),
(19, 'Krabi Airport (KBV)', 'Don Sak Pier',                      'airport_transfer', 'Krabi Airport to Koh Samui Don Sak Pier Surat Thani',                 3400.00, 3400.00, 3400.00, NULL),

-- KBV: Krabi hotel, point to point
(20, 'Krabi Hotel', 'Phuket Airport (HKT)',     'hotel_transfer', 'Krabi Hotel to Phuket Airport',                                     2300.00, 2300.00, 2300.00, NULL),
(21, 'Krabi Hotel', 'Thap Lamu Pier',           'hotel_transfer', 'Krabi Hotel to Thap Lamu Pier Phang Nga Area',                      2300.00, 2300.00, 2300.00, NULL),
(22, 'Krabi Hotel', 'Koh Lanta Krabi Area',     'hotel_transfer', 'Krabi Hotel to Koh Lanta Krabi Area (excludes boat tickets)',       2600.00, 2600.00, 2600.00, NULL),
(23, 'Krabi Hotel', 'Khao Lak',                 'hotel_transfer', 'Krabi Hotel to Khao Lak Pang Nga Area',                             2500.00, 2500.00, 2500.00, NULL),
(24, 'Krabi Hotel', 'Phuket Area',              'hotel_transfer', 'Krabi Hotel to Phuket Area',                                        2500.00, 2500.00, 2500.00, NULL),
(25, 'Krabi Hotel', 'Khao Sok National Park',   'hotel_transfer', 'Krabi Hotel to Khao Sok Surat Thani Area',                          2500.00, 2500.00, 2500.00, NULL),
(26, 'Krabi Hotel', 'Don Sak Pier',             'hotel_transfer', 'Krabi Hotel to Koh Samui Don Sak Pier Surat Thani Area',            3400.00, 3400.00, 3400.00, NULL),

-- URT: Surat Thani Airport, meeting & sending
(27, 'Surat Thani Airport (URT)', 'Surat Thani Town Area',    'airport_transfer', 'Surat Thani Airport to Surat Thani Town Area',                              1100.00, 1300.00, 1600.00, 3100.00),
(28, 'Surat Thani Airport (URT)', 'Don Sak Pier',             'airport_transfer', 'Surat Thani Airport to Donsak Ferry Pier',                                 1700.00, 1900.00, 2100.00, 4600.00),
(29, 'Surat Thani Airport (URT)', 'Rajchaprabha Dam',         'airport_transfer', 'Surat Thani Airport to Rajchaprabha Dam Area',                             1700.00, 1900.00, 2100.00, 5600.00),
(30, 'Surat Thani Airport (URT)', 'Khao Sok National Park',   'airport_transfer', 'Surat Thani Airport to Khao Sok National Park Area',                       2100.00, 2600.00, 2900.00, 6100.00),
(31, 'Surat Thani Airport (URT)', 'Khao Lak',                 'airport_transfer', 'Surat Thani Airport to Phang Nga Bay, Khao Lak Area',                      3100.00, 3600.00, 4100.00, 8100.00),
(32, 'Surat Thani Airport (URT)', 'Chumphon / Ranong Area',   'airport_transfer', 'Surat Thani Airport to Chumphon, Ranong Area',                             3600.00, 4100.00, 4600.00, 8100.00),
(33, 'Surat Thani Airport (URT)', 'Krabi Area',               'airport_transfer', 'Surat Thani Airport to Krabi Area (excludes Koh Lanta, Railay Area)',      3100.00, 3600.00, 4100.00, 8100.00),
(34, 'Surat Thani Airport (URT)', 'Nakhon Si Thammarat Area', 'airport_transfer', 'Surat Thani Airport to Nakhon Si Thammarat Area',                          3100.00, 3600.00, 4100.00, 8100.00),
(35, 'Surat Thani Airport (URT)', 'Koh Samui Area',           'airport_transfer', 'Surat Thani Airport to Koh Samui Area',                                    4600.00, 5100.00, 6100.00, 11100.00),
(36, 'Surat Thani Airport (URT)', 'Phuket Area',              'airport_transfer', 'Surat Thani Airport to Phuket Area',                                       4100.00, 4600.00, 5100.00, 14100.00),
(37, 'Surat Thani Airport (URT)', 'Hua Hin Area',             'airport_transfer', 'Surat Thani Airport to Hua Hin Area',                                      8100.00, 9100.00, 10100.00, 14100.00),
(38, 'Surat Thani Airport (URT)', 'Bangkok Area',             'airport_transfer', 'Surat Thani Airport to Bangkok Area',                                      10100.00, 11100.00, 12100.00, 20100.00),

-- USM: Samui Airport, meeting & sending. One price for all three vehicles.
(39, 'Samui Airport (USM)', 'Chaweng / Choengmon / Bangrak Samui Area',            'airport_transfer', 'Samui Airport to Chaweng / Choengmon / Bangrak Samui Area (excluding villas located on the hill)', 450.00,  450.00,  450.00,  NULL),
(40, 'Samui Airport (USM)', 'Bophut Samui Area',                                   'airport_transfer', 'Samui Airport to Bophut Samui Area (excluding villas located on the hill)',                        550.00,  550.00,  550.00,  NULL),
(41, 'Samui Airport (USM)', 'Lamai / Maenam Samui Area',                           'airport_transfer', 'Samui Airport to Lamai / Maenam Samui Area (excluding villas located on the hill)',                600.00,  600.00,  600.00,  NULL),
(42, 'Samui Airport (USM)', 'Bangpor Samui Area',                                  'airport_transfer', 'Samui Airport to Bangpor Samui Area (excluding villas located on the hill)',                       700.00,  700.00,  700.00,  NULL),
(43, 'Samui Airport (USM)', 'Nathon Samui Area',                                   'airport_transfer', 'Samui Airport to Nathon Samui Area',                                                               800.00,  800.00,  800.00,  NULL),
(44, 'Samui Airport (USM)', 'Intercon Hotel Samui',                                'airport_transfer', 'Samui Airport to Intercon Hotel Samui',                                                            900.00,  900.00,  900.00,  NULL),
(45, 'Samui Airport (USM)', 'Coconut Samui Villa / Samui Sunrise Villa / Bophut Villa', 'airport_transfer', 'Samui Airport to Coconut Samui Villa / Samui Sunrise Villa / Bophut Villa',                   1000.00, 1000.00, 1000.00, NULL),
(46, 'Samui Airport (USM)', 'Conrad Hotel Samui',                                  'airport_transfer', 'Samui Airport to Conrad Hotel Samui',                                                              1100.00, 1100.00, 1100.00, NULL),
(47, 'Samui Airport (USM)', 'Maenam Villa Samui',                                  'airport_transfer', 'Samui Airport to Maenam Villa Samui',                                                              1200.00, 1200.00, 1200.00, NULL),
(48, 'Samui Airport (USM)', 'Bang Por Villa Samui',                                'airport_transfer', 'Samui Airport to Bang Por Villa Samui',                                                            1400.00, 1400.00, 1400.00, NULL),
(49, 'Samui Airport (USM)', 'Bang Makham Villa Samui / Lamai Villa Samui',         'airport_transfer', 'Samui Airport to Bang Makham Villa Samui / Lamai Villa Samui',                                     1700.00, 1700.00, 1700.00, NULL);

START TRANSACTION;

-- ---------------------------------------------------------------------------
-- Supplier and vehicles
-- ---------------------------------------------------------------------------
INSERT INTO `suppliers` (`name`, `type`) VALUES ('Iyara Transport', 'transfer')
  ON DUPLICATE KEY UPDATE `type` = VALUES(`type`);
SET @iyara_id = (SELECT `id` FROM `suppliers` WHERE `name` = 'Iyara Transport' LIMIT 1);

-- The URT sheet sells a fourth class the other sheets do not have.
INSERT INTO `transfer_vehicles` (`name`, `max_passengers`, `max_luggage`, `description`, `is_active`, `sort_order`)
VALUES ('Minivan VVIP', 6, 5, 'Premium minivan with business-class seating, sold on the Surat Thani airport sheet.', 1, 4)
  ON DUPLICATE KEY UPDATE `is_active` = 1;

SET @veh_sedan = (SELECT `id` FROM `transfer_vehicles` WHERE `name` = 'Sedan' LIMIT 1);
SET @veh_suv   = (SELECT `id` FROM `transfer_vehicles` WHERE `name` = 'SUV' LIMIT 1);
SET @veh_van   = (SELECT `id` FROM `transfer_vehicles` WHERE `name` = 'Van' LIMIT 1);
SET @veh_vvip  = (SELECT `id` FROM `transfer_vehicles` WHERE `name` = 'Minivan VVIP' LIMIT 1);

-- ---------------------------------------------------------------------------
-- Locations, then routes. Both skip anything already present by name / by the
-- (origin, destination, category, note) key the routes table is unique on.
-- ---------------------------------------------------------------------------
SET @loc_sort = (SELECT COALESCE(MAX(`sort_order`), 0) FROM `transfer_locations`);

INSERT INTO `transfer_locations` (`name`, `province`, `is_active`, `sort_order`)
SELECT t.`name`, t.`province`, 1, (@loc_sort := @loc_sort + 1)
FROM `tmp_iyara_loc` t
LEFT JOIN `transfer_locations` l ON l.`name` = t.`name`
WHERE l.`id` IS NULL
ORDER BY t.`seq`;

SET @route_sort = (SELECT COALESCE(MAX(`sort_order`), 0) FROM `transfer_routes`);

INSERT INTO `transfer_routes` (`origin_id`, `destination_id`, `category`, `label`, `note`, `sort_order`, `is_active`)
SELECT o.`id`, d.`id`, t.`category`, t.`label`, '', (@route_sort := @route_sort + 1), 1
FROM `tmp_iyara_route` t
JOIN `transfer_locations` o ON o.`name` = t.`origin`
JOIN `transfer_locations` d ON d.`name` = t.`dest`
LEFT JOIN `transfer_routes` r
  ON r.`origin_id` = o.`id` AND r.`destination_id` = d.`id`
 AND r.`category` = t.`category` AND r.`note` = ''
WHERE r.`id` IS NULL
ORDER BY t.`seq`;

-- ---------------------------------------------------------------------------
-- Prices: one statement per vehicle column, because a temporary table may be
-- opened only once per query. Existing cells are overwritten so a re-run
-- re-applies the contract.
-- ---------------------------------------------------------------------------
INSERT INTO `transfer_route_prices` (`route_id`, `supplier_id`, `vehicle_id`, `price`)
SELECT r.`id`, @iyara_id, @veh_sedan, t.`sedan`
FROM `tmp_iyara_route` t
JOIN `transfer_locations` o ON o.`name` = t.`origin`
JOIN `transfer_locations` d ON d.`name` = t.`dest`
JOIN `transfer_routes` r
  ON r.`origin_id` = o.`id` AND r.`destination_id` = d.`id`
 AND r.`category` = t.`category` AND r.`note` = ''
WHERE t.`sedan` IS NOT NULL
ON DUPLICATE KEY UPDATE `price` = VALUES(`price`);

INSERT INTO `transfer_route_prices` (`route_id`, `supplier_id`, `vehicle_id`, `price`)
SELECT r.`id`, @iyara_id, @veh_suv, t.`suv`
FROM `tmp_iyara_route` t
JOIN `transfer_locations` o ON o.`name` = t.`origin`
JOIN `transfer_locations` d ON d.`name` = t.`dest`
JOIN `transfer_routes` r
  ON r.`origin_id` = o.`id` AND r.`destination_id` = d.`id`
 AND r.`category` = t.`category` AND r.`note` = ''
WHERE t.`suv` IS NOT NULL
ON DUPLICATE KEY UPDATE `price` = VALUES(`price`);

INSERT INTO `transfer_route_prices` (`route_id`, `supplier_id`, `vehicle_id`, `price`)
SELECT r.`id`, @iyara_id, @veh_van, t.`van`
FROM `tmp_iyara_route` t
JOIN `transfer_locations` o ON o.`name` = t.`origin`
JOIN `transfer_locations` d ON d.`name` = t.`dest`
JOIN `transfer_routes` r
  ON r.`origin_id` = o.`id` AND r.`destination_id` = d.`id`
 AND r.`category` = t.`category` AND r.`note` = ''
WHERE t.`van` IS NOT NULL
ON DUPLICATE KEY UPDATE `price` = VALUES(`price`);

INSERT INTO `transfer_route_prices` (`route_id`, `supplier_id`, `vehicle_id`, `price`)
SELECT r.`id`, @iyara_id, @veh_vvip, t.`vvip`
FROM `tmp_iyara_route` t
JOIN `transfer_locations` o ON o.`name` = t.`origin`
JOIN `transfer_locations` d ON d.`name` = t.`dest`
JOIN `transfer_routes` r
  ON r.`origin_id` = o.`id` AND r.`destination_id` = d.`id`
 AND r.`category` = t.`category` AND r.`note` = ''
WHERE t.`vvip` IS NOT NULL
ON DUPLICATE KEY UPDATE `price` = VALUES(`price`);

COMMIT;

DROP TEMPORARY TABLE IF EXISTS `tmp_iyara_loc`;
DROP TEMPORARY TABLE IF EXISTS `tmp_iyara_route`;
