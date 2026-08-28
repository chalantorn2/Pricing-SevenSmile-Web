-- seed_transfer_data.sql
-- Real transfer rates carried over from the INDO SMILE official-web database
-- (backend/migrations/006_transfer_real_data.sql, itself built from transfer.csv).
-- IDs are kept identical to the source so the two systems can be diffed later.
--
-- Run add_transfer_tables.sql first. This file is destructive: it clears the four
-- transfer tables and reinserts them, so re-running it is safe but discards any
-- edits made in the UI — including every OTHER supplier's rate sheet, because the
-- routes it rebuilds carry their prices away with them.
--
-- Everything in this sheet is Phuket-based; `province` is set from the place each
-- location actually is, so cross-province routes (Phuket to Krabi, Khao Lak,
-- Trang) show up under both provinces in the sidebar.
--
-- The locations, vehicles and routes are shared by every supplier, but the prices
-- are one supplier's rate sheet, so name that supplier below before running. It
-- must already exist in `suppliers`; a name that matches nothing leaves
-- @transfer_supplier_id NULL and the price insert stops with "Column
-- 'supplier_id' cannot be null" rather than seeding rates onto nobody. The default
-- below is the placeholder the sheet was parked on when supplier_id was added,
-- because the source data never recorded who quoted it.

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET @transfer_supplier_name = 'Unknown Transfer Supplier';
SET @transfer_supplier_id = (
    SELECT `id` FROM `suppliers` WHERE `name` = @transfer_supplier_name LIMIT 1
);

START TRANSACTION;

DELETE FROM `transfer_route_prices`;
DELETE FROM `transfer_routes`;
DELETE FROM `transfer_locations`;
DELETE FROM `transfer_vehicles`;

ALTER TABLE `transfer_route_prices` AUTO_INCREMENT = 1;
ALTER TABLE `transfer_routes` AUTO_INCREMENT = 1;
ALTER TABLE `transfer_locations` AUTO_INCREMENT = 1;
ALTER TABLE `transfer_vehicles` AUTO_INCREMENT = 1;

-- =====================================================================
-- Vehicles (3) — the price columns of the rate sheet
-- =====================================================================
INSERT INTO `transfer_vehicles` (`id`, `name`, `max_passengers`, `max_luggage`, `description`, `is_active`, `sort_order`) VALUES
(1, 'Sedan', 3, 2, 'Comfortable sedan ideal for couples or solo travelers with light luggage.', 1, 1),
(2, 'SUV',   5, 4, 'Spacious SUV suitable for small families with extra luggage room.', 1, 2),
(3, 'Van',   9, 7, 'Roomy van for groups, families, and travelers with plenty of luggage.', 1, 3);

-- =====================================================================
-- Locations (58)
-- =====================================================================
INSERT INTO `transfer_locations` (`id`, `name`, `province`, `is_active`, `sort_order`) VALUES
-- Airport
(1,  'Phuket Airport (HKT)', 'Phuket', 1, 1),

-- Hotel areas used as airport-transfer destinations
(2,  'Patong Beach',      'Phuket', 1, 2),
(3,  'Kalim Beach',       'Phuket', 1, 3),
(4,  'Phuket Town',       'Phuket', 1, 4),
(5,  'Tritrang Beach',    'Phuket', 1, 5),
(6,  'Karon Beach',       'Phuket', 1, 6),
(7,  'Kata Beach',        'Phuket', 1, 7),
(8,  'Laguna Beach',      'Phuket', 1, 8),
(9,  'Bang Tao Beach',    'Phuket', 1, 9),
(10, 'Surin Beach',       'Phuket', 1, 10),
(11, 'Kamala Beach',      'Phuket', 1, 11),
(12, 'Nai Yang Beach',    'Phuket', 1, 12),
(13, 'Nai Thon Beach',    'Phuket', 1, 13),
(14, 'Rawai Beach',       'Phuket', 1, 14),
(15, 'Chalong Bay',       'Phuket', 1, 15),
(16, 'Cape Panwa Beach',  'Phuket', 1, 16),
(17, 'Sirey Bay',         'Phuket', 1, 17),
(18, 'Mai Khao',          'Phuket', 1, 18),
(19, 'Nai Harn',          'Phuket', 1, 19),

-- Grouped destinations used by the hotel-transfer section
(20, 'Phuket Town / Laem Hin Pier',   'Phuket', 1, 20),
(21, 'Patong / Kalim / Tri Trang',    'Phuket', 1, 21),
(22, 'Kata / Karon',                  'Phuket', 1, 22),
(23, 'Rawai / Nai Harn',              'Phuket', 1, 23),
(24, 'Surin / Bang Tao / Laguna',     'Phuket', 1, 24),
(25, 'Ao Por Yacht Haven',            'Phuket', 1, 25),
(26, 'Nai Yang / Nai Thon Beach',     'Phuket', 1, 26),

-- Inter-province destinations
(27, 'Phang Nga Province',     'Phang Nga',   1, 27),
(28, 'Trang Province',         'Trang',       1, 28),
(29, 'Krabi / Krabi Airport',  'Krabi',       1, 29),
(30, 'Don Sak Pier',           'Surat Thani', 1, 30),
(31, 'Surat Thani Province',   'Surat Thani', 1, 31),
(32, 'Khao Lak',               'Phang Nga',   1, 32),
(33, 'Krabi / Ao Nang',        'Krabi',       1, 33),

-- Generic origin: any Phuket hotel
(34, 'Phuket Hotel', 'Phuket', 1, 34),

-- City tour programs (modelled as destinations so they can carry a price)
(35, 'Half Day City Tour (4 hrs)',                    'Phuket', 1, 35),
(36, 'Half Day City Tour (6 hrs) + Tiger Kingdom',    'Phuket', 1, 36),
(37, 'Half Day City Tour PVT 5 hrs + Elephant',       'Phuket', 1, 37),

-- Attractions / activities used by the round-trip sections
(38, 'Restaurant',                        'Phuket', 1, 38),
(39, 'Splash Jungle Water Park',          'Phuket', 1, 39),
(40, 'Tiger Kingdom',                     'Phuket', 1, 40),
(41, 'Aquaria / Andamanda',               'Phuket', 1, 41),
(42, 'Phuket Elephant Jungle Sanctuary',  'Phuket', 1, 42),
(43, 'Blue Tree Lagoon',                  'Phuket', 1, 43),
(44, 'Hanuman World',                     'Phuket', 1, 44),
(45, 'Show Venue A',                      'Phuket', 1, 45),
(46, 'Show Venue B',                      'Phuket', 1, 46),

-- Combined area origins: round trips are priced by the area the hotel sits in
(47, 'Patong / Kalim / Kata area',          'Phuket', 1, 47),
(48, 'Laguna / Surin / Bang Tao',           'Phuket', 1, 48),
(49, 'Kamala / Kalim / Patong',             'Phuket', 1, 49),
(50, 'Rawai / Nai Harn / Chalong Bay',      'Phuket', 1, 50),
(51, 'Cape Panwa / Ao Por / Koh Sirey',     'Phuket', 1, 51),
(52, 'Patong / Kata / Karon / Cape Panwa',  'Phuket', 1, 52),
(53, 'Patong / Kata / Karon',               'Phuket', 1, 53),
(54, 'Patong area',                         'Phuket', 1, 54),
(55, 'Kamala area',                         'Phuket', 1, 55),
(56, 'Patong / Kalim',                      'Phuket', 1, 56),

-- Programs that combine a hotel move with a tour
(57, 'Krabi / Ao Nang (Move Hotel + City Tour)', 'Krabi',     1, 57),
(58, 'Khao Lak (Move Hotel)',                    'Phang Nga', 1, 58);

-- =====================================================================
-- Routes (59), grouped by the section of the rate sheet they came from
-- =====================================================================
INSERT INTO `transfer_routes` (`id`, `origin_id`, `destination_id`, `category`, `label`, `sort_order`, `is_active`) VALUES
-- Section 1: Hotel to destination
(1,  34, 20, 'hotel_transfer', 'Hotel to Phuket Town / Laem Hin Pier', 1, 1),
(2,  34, 21, 'hotel_transfer', 'Hotel to Patong / Kalim / Tri Trang',  2, 1),
(3,  34, 22, 'hotel_transfer', 'Hotel to Kata / Karon',                3, 1),
(4,  34, 23, 'hotel_transfer', 'Hotel to Rawai / Nai Harn',            4, 1),
(5,  34, 24, 'hotel_transfer', 'Hotel to Surin / Bang Tao / Laguna',   5, 1),
(6,  34, 11, 'hotel_transfer', 'Hotel to Kamala',                      6, 1),
(7,  34, 18, 'hotel_transfer', 'Hotel to Mai Khao',                    7, 1),
(8,  34, 25, 'hotel_transfer', 'Hotel to Ao Por Yacht Haven',          8, 1),
(9,  34, 26, 'hotel_transfer', 'Hotel to Nai Yang / Nai Thon Beach',   9, 1),

-- Section 2: Airport to hotel area
(10, 1,  2,  'airport_transfer', 'Phuket Airport to Patong Beach',     10, 1),
(11, 1,  3,  'airport_transfer', 'Phuket Airport to Kalim Beach',      11, 1),
(12, 1,  4,  'airport_transfer', 'Phuket Airport to Phuket Town',      12, 1),
(13, 1,  5,  'airport_transfer', 'Phuket Airport to Tritrang Beach',   13, 1),
(14, 1,  6,  'airport_transfer', 'Phuket Airport to Karon Beach',      14, 1),
(15, 1,  7,  'airport_transfer', 'Phuket Airport to Kata Beach',       15, 1),
(16, 1,  8,  'airport_transfer', 'Phuket Airport to Laguna Beach',     16, 1),
(17, 1,  9,  'airport_transfer', 'Phuket Airport to Bang Tao Beach',   17, 1),
(18, 1,  10, 'airport_transfer', 'Phuket Airport to Surin Beach',      18, 1),
(19, 1,  11, 'airport_transfer', 'Phuket Airport to Kamala Beach',     19, 1),
(20, 1,  12, 'airport_transfer', 'Phuket Airport to Nai Yang Beach',   20, 1),
(21, 1,  13, 'airport_transfer', 'Phuket Airport to Nai Thon Beach',   21, 1),
(22, 1,  14, 'airport_transfer', 'Phuket Airport to Rawai Beach',      22, 1),
(23, 1,  15, 'airport_transfer', 'Phuket Airport to Chalong Bay',      23, 1),
(24, 1,  16, 'airport_transfer', 'Phuket Airport to Cape Panwa Beach', 24, 1),
(25, 1,  17, 'airport_transfer', 'Phuket Airport to Sirey Bay',        25, 1),

-- Section 3: Inter-province
(26, 34, 27, 'inter_province', 'Phang Nga Province (2 hrs)',      26, 1),
(27, 34, 28, 'inter_province', 'Trang Province (2 hrs)',          27, 1),
(28, 34, 29, 'inter_province', 'Krabi / Krabi Airport (3 hrs)',   28, 1),
(29, 34, 30, 'inter_province', 'Don Sak Pier',                    29, 1),
(30, 34, 31, 'inter_province', 'Surat Thani Province (5 hrs)',    30, 1),
(31, 34, 32, 'inter_province', 'Phuket Hotel to Khao Lak Hotel',  31, 1),

-- Section 4: Move hotel
(32, 34, 33, 'move_hotel', 'Phuket Hotel to Krabi / Ao Nang (Move Hotel)', 32, 1),

-- Section 5: City tour programs
(33, 34, 35, 'city_tour', 'Half Day City Tour (4 hrs)',                     33, 1),
(34, 34, 36, 'city_tour', 'Half Day City Tour (6 hrs) + Tiger Kingdom',     34, 1),
(35, 34, 57, 'city_tour', 'Phuket to Krabi / Ao Nang (Move Hotel + City Tour)', 35, 1),
(36, 34, 37, 'city_tour', 'Half Day City Tour PVT 5 hrs + Elephant',        36, 1),
(37, 34, 58, 'city_tour', 'Phuket Hotel to Khao Lak (Move Hotel)',          37, 1),

-- Section 6: Restaurant round trip
(38, 47, 38, 'restaurant_roundtrip', 'Hotel - Restaurant - Hotel (Patong / Kalim / Kata area)',   38, 1),
(39, 48, 38, 'restaurant_roundtrip', 'Hotel - Restaurant - Hotel (Laguna / Surin / Bang Tao)',    39, 1),
(40, 49, 38, 'restaurant_roundtrip', 'Hotel - Restaurant - Hotel (Kamala / Kalim / Patong)',      40, 1),
(41, 50, 38, 'restaurant_roundtrip', 'Hotel - Restaurant - Hotel (Rawai / Nai Harn / Chalong Bay)', 41, 1),
(42, 51, 38, 'restaurant_roundtrip', 'Hotel - Restaurant - Hotel (Cape Panwa / Ao Por / Koh Sirey)', 42, 1),

-- Section 7: Attraction round trip
(43, 52, 39, 'attraction_roundtrip', 'Hotel - Splash Jungle Water Park - Hotel (Patong / Kata / Karon / Cape Panwa)', 43, 1),
(44, 52, 40, 'attraction_roundtrip', 'Hotel - Tiger Kingdom - Hotel (Patong / Kata / Karon / Cape Panwa)', 44, 1),
(45, 53, 4,  'attraction_roundtrip', 'Hotel - Phuket Town - Hotel (Patong / Kata / Karon)',        45, 1),
(46, 34, 41, 'attraction_roundtrip', 'Hotel - Aquaria / Andamanda - Hotel',                        46, 1),
(47, 34, 42, 'attraction_roundtrip', 'Hotel - Phuket Elephant Jungle Sanctuary - Hotel',           47, 1),
(48, 34, 43, 'attraction_roundtrip', 'Hotel - Blue Tree Lagoon - Hotel',                           48, 1),
(49, 34, 44, 'attraction_roundtrip', 'Hotel - Hanuman World - Hotel',                              49, 1),

-- Section 8: Show round trip, venue group A
(50, 54, 45, 'show_roundtrip_a', 'Hotel - Show - Hotel (Patong area)',              50, 1),
(51, 22, 45, 'show_roundtrip_a', 'Hotel - Show - Hotel (Kata / Karon)',             51, 1),
(52, 23, 45, 'show_roundtrip_a', 'Hotel - Show - Hotel (Rawai / Nai Harn)',         52, 1),
(53, 24, 45, 'show_roundtrip_a', 'Hotel - Show - Hotel (Surin / Bang Tao / Laguna)', 53, 1),
(54, 55, 45, 'show_roundtrip_a', 'Hotel - Show - Hotel (Kamala area)',              54, 1),

-- Section 9: Show round trip, venue group B
(55, 56, 46, 'show_roundtrip_b', 'Hotel - Show - Hotel (Patong / Kalim)',           55, 1),
(56, 22, 46, 'show_roundtrip_b', 'Hotel - Show - Hotel (Kata / Karon)',             56, 1),
(57, 23, 46, 'show_roundtrip_b', 'Hotel - Show - Hotel (Rawai / Nai Harn)',         57, 1),
(58, 24, 46, 'show_roundtrip_b', 'Hotel - Show - Hotel (Surin / Bang Tao / Laguna)', 58, 1),
(59, 4,  46, 'show_roundtrip_b', 'Hotel - Show - Hotel (Phuket Town)',              59, 1);

-- =====================================================================
-- Prices (174) — vehicle 1 = Sedan, 2 = SUV, 3 = Van, all THB
-- Route 30 (Surat Thani) is quoted on request and has no price rows.
-- =====================================================================
INSERT INTO `transfer_route_prices` (`route_id`, `supplier_id`, `vehicle_id`, `price`) VALUES
-- Section 1: hotel transfer
(1, @transfer_supplier_id, 1, 1150.00), (1, @transfer_supplier_id, 2, 1350.00), (1, @transfer_supplier_id, 3, 1350.00),
(2, @transfer_supplier_id, 1, 1350.00), (2, @transfer_supplier_id, 2, 1650.00), (2, @transfer_supplier_id, 3, 1650.00),
(3, @transfer_supplier_id, 1, 1350.00), (3, @transfer_supplier_id, 2, 1650.00), (3, @transfer_supplier_id, 3, 1650.00),
(4, @transfer_supplier_id, 1, 1450.00), (4, @transfer_supplier_id, 2, 1650.00), (4, @transfer_supplier_id, 3, 1650.00),
(5, @transfer_supplier_id, 1, 1150.00), (5, @transfer_supplier_id, 2, 1350.00), (5, @transfer_supplier_id, 3, 1350.00),
(6, @transfer_supplier_id, 1, 1250.00), (6, @transfer_supplier_id, 2, 1450.00), (6, @transfer_supplier_id, 3, 1450.00),
(7, @transfer_supplier_id, 1, 1450.00), (7, @transfer_supplier_id, 2, 1650.00), (7, @transfer_supplier_id, 3, 1650.00),
(8, @transfer_supplier_id, 1, 1550.00), (8, @transfer_supplier_id, 2, 1750.00), (8, @transfer_supplier_id, 3, 1750.00),
(9, @transfer_supplier_id, 1, 1350.00), (9, @transfer_supplier_id, 2, 1550.00), (9, @transfer_supplier_id, 3, 1550.00),

-- Section 2: airport transfer — flat 850 / 950 / 1050 everywhere
(10, @transfer_supplier_id, 1, 850.00), (10, @transfer_supplier_id, 2, 950.00), (10, @transfer_supplier_id, 3, 1050.00),
(11, @transfer_supplier_id, 1, 850.00), (11, @transfer_supplier_id, 2, 950.00), (11, @transfer_supplier_id, 3, 1050.00),
(12, @transfer_supplier_id, 1, 850.00), (12, @transfer_supplier_id, 2, 950.00), (12, @transfer_supplier_id, 3, 1050.00),
(13, @transfer_supplier_id, 1, 850.00), (13, @transfer_supplier_id, 2, 950.00), (13, @transfer_supplier_id, 3, 1050.00),
(14, @transfer_supplier_id, 1, 850.00), (14, @transfer_supplier_id, 2, 950.00), (14, @transfer_supplier_id, 3, 1050.00),
(15, @transfer_supplier_id, 1, 850.00), (15, @transfer_supplier_id, 2, 950.00), (15, @transfer_supplier_id, 3, 1050.00),
(16, @transfer_supplier_id, 1, 850.00), (16, @transfer_supplier_id, 2, 950.00), (16, @transfer_supplier_id, 3, 1050.00),
(17, @transfer_supplier_id, 1, 850.00), (17, @transfer_supplier_id, 2, 950.00), (17, @transfer_supplier_id, 3, 1050.00),
(18, @transfer_supplier_id, 1, 850.00), (18, @transfer_supplier_id, 2, 950.00), (18, @transfer_supplier_id, 3, 1050.00),
(19, @transfer_supplier_id, 1, 850.00), (19, @transfer_supplier_id, 2, 950.00), (19, @transfer_supplier_id, 3, 1050.00),
(20, @transfer_supplier_id, 1, 850.00), (20, @transfer_supplier_id, 2, 950.00), (20, @transfer_supplier_id, 3, 1050.00),
(21, @transfer_supplier_id, 1, 850.00), (21, @transfer_supplier_id, 2, 950.00), (21, @transfer_supplier_id, 3, 1050.00),
(22, @transfer_supplier_id, 1, 850.00), (22, @transfer_supplier_id, 2, 950.00), (22, @transfer_supplier_id, 3, 1050.00),
(23, @transfer_supplier_id, 1, 850.00), (23, @transfer_supplier_id, 2, 950.00), (23, @transfer_supplier_id, 3, 1050.00),
(24, @transfer_supplier_id, 1, 850.00), (24, @transfer_supplier_id, 2, 950.00), (24, @transfer_supplier_id, 3, 1050.00),
(25, @transfer_supplier_id, 1, 850.00), (25, @transfer_supplier_id, 2, 950.00), (25, @transfer_supplier_id, 3, 1050.00),

-- Section 3: inter-province
(26, @transfer_supplier_id, 1, 1950.00), (26, @transfer_supplier_id, 2, 2050.00), (26, @transfer_supplier_id, 3, 2350.00),
(27, @transfer_supplier_id, 1, 4650.00), (27, @transfer_supplier_id, 2, 5150.00), (27, @transfer_supplier_id, 3, 5450.00),
(28, @transfer_supplier_id, 1, 2250.00), (28, @transfer_supplier_id, 2, 2450.00), (28, @transfer_supplier_id, 3, 2650.00),
(29, @transfer_supplier_id, 1, 4650.00), (29, @transfer_supplier_id, 2, 5150.00), (29, @transfer_supplier_id, 3, 5450.00),
(31, @transfer_supplier_id, 1, 2150.00), (31, @transfer_supplier_id, 2, 2350.00), (31, @transfer_supplier_id, 3, 2750.00),

-- Section 4: move hotel
(32, @transfer_supplier_id, 1, 2450.00), (32, @transfer_supplier_id, 2, 2650.00), (32, @transfer_supplier_id, 3, 2950.00),

-- Section 5: city tour programs
(33, @transfer_supplier_id, 1, 1950.00), (33, @transfer_supplier_id, 2, 1950.00), (33, @transfer_supplier_id, 3, 1950.00),
(34, @transfer_supplier_id, 1, 2250.00), (34, @transfer_supplier_id, 2, 2250.00), (34, @transfer_supplier_id, 3, 2250.00),
(35, @transfer_supplier_id, 1, 3650.00), (35, @transfer_supplier_id, 2, 3650.00), (35, @transfer_supplier_id, 3, 3950.00),
(36, @transfer_supplier_id, 1, 2250.00), (36, @transfer_supplier_id, 2, 2250.00), (36, @transfer_supplier_id, 3, 2250.00),
(37, @transfer_supplier_id, 1, 3150.00), (37, @transfer_supplier_id, 2, 3150.00), (37, @transfer_supplier_id, 3, 3150.00),

-- Section 6: restaurant round trip
(38, @transfer_supplier_id, 1, 1350.00), (38, @transfer_supplier_id, 2, 1350.00), (38, @transfer_supplier_id, 3, 1650.00),
(39, @transfer_supplier_id, 1, 1350.00), (39, @transfer_supplier_id, 2, 1350.00), (39, @transfer_supplier_id, 3, 1650.00),
(40, @transfer_supplier_id, 1, 1550.00), (40, @transfer_supplier_id, 2, 1650.00), (40, @transfer_supplier_id, 3, 1750.00),
(41, @transfer_supplier_id, 1, 1550.00), (41, @transfer_supplier_id, 2, 1650.00), (41, @transfer_supplier_id, 3, 1750.00),
(42, @transfer_supplier_id, 1, 1950.00), (42, @transfer_supplier_id, 2, 2350.00), (42, @transfer_supplier_id, 3, 2350.00),

-- Section 7: attraction round trip
(43, @transfer_supplier_id, 1, 1650.00), (43, @transfer_supplier_id, 2, 2150.00), (43, @transfer_supplier_id, 3, 2150.00),
(44, @transfer_supplier_id, 1, 1350.00), (44, @transfer_supplier_id, 2, 1550.00), (44, @transfer_supplier_id, 3, 1650.00),
(45, @transfer_supplier_id, 1, 1150.00), (45, @transfer_supplier_id, 2, 1350.00), (45, @transfer_supplier_id, 3, 1350.00),
(46, @transfer_supplier_id, 1, 1450.00), (46, @transfer_supplier_id, 2, 1550.00), (46, @transfer_supplier_id, 3, 1650.00),
(47, @transfer_supplier_id, 1, 1450.00), (47, @transfer_supplier_id, 2, 1550.00), (47, @transfer_supplier_id, 3, 1650.00),
(48, @transfer_supplier_id, 1, 1650.00), (48, @transfer_supplier_id, 2, 1750.00), (48, @transfer_supplier_id, 3, 1750.00),
(49, @transfer_supplier_id, 1, 1850.00), (49, @transfer_supplier_id, 2, 1950.00), (49, @transfer_supplier_id, 3, 2050.00),

-- Section 8: show round trip A
(50, @transfer_supplier_id, 1, 1350.00), (50, @transfer_supplier_id, 2, 1650.00), (50, @transfer_supplier_id, 3, 1650.00),
(51, @transfer_supplier_id, 1, 1450.00), (51, @transfer_supplier_id, 2, 1650.00), (51, @transfer_supplier_id, 3, 1650.00),
(52, @transfer_supplier_id, 1, 1550.00), (52, @transfer_supplier_id, 2, 1750.00), (52, @transfer_supplier_id, 3, 1750.00),
(53, @transfer_supplier_id, 1, 1450.00), (53, @transfer_supplier_id, 2, 1650.00), (53, @transfer_supplier_id, 3, 1650.00),
(54, @transfer_supplier_id, 1, 1150.00), (54, @transfer_supplier_id, 2, 1350.00), (54, @transfer_supplier_id, 3, 1350.00),

-- Section 9: show round trip B
(55, @transfer_supplier_id, 1, 1450.00), (55, @transfer_supplier_id, 2, 1650.00), (55, @transfer_supplier_id, 3, 1650.00),
(56, @transfer_supplier_id, 1, 1450.00), (56, @transfer_supplier_id, 2, 1650.00), (56, @transfer_supplier_id, 3, 1650.00),
(57, @transfer_supplier_id, 1, 1550.00), (57, @transfer_supplier_id, 2, 1750.00), (57, @transfer_supplier_id, 3, 1750.00),
(58, @transfer_supplier_id, 1, 1450.00), (58, @transfer_supplier_id, 2, 1650.00), (58, @transfer_supplier_id, 3, 1650.00),
(59, @transfer_supplier_id, 1, 1150.00), (59, @transfer_supplier_id, 2, 1350.00), (59, @transfer_supplier_id, 3, 1350.00);

COMMIT;
