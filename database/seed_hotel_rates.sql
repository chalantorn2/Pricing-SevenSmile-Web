-- seed_hotel_rates.sql  (generated from INDO SMILE - HOTEL NET RATES - PHUKET.xlsx)
-- One-time import. Run AFTER add_hotel_rates_table.sql.
-- Idempotent: clears existing rates for these hotels first, then re-inserts.
-- Generated: 2026-06-27

SET NAMES utf8mb4;
START TRANSACTION;

DELETE FROM `hotel_rates` WHERE `hotel_id` IN (10,11,12,13,14,15,16,17,18,20,21,22,23,24,26,27,29);

-- [26] Amata Patong  (80 rates)
INSERT INTO `hotel_rates` (`hotel_id`,`room_type`,`period_label`,`period_start`,`period_end`,`meal_plan`,`price`,`sort_order`) VALUES
(26, 'Standard', '01 Nov 25 – 25 Dec 25', '2025-11-01', '2025-12-25', 'RO', 3500.00, 0),
(26, 'Standard', '01 Nov 25 – 25 Dec 25', '2025-11-01', '2025-12-25', 'RB', 3800.00, 1),
(26, 'Superior', '01 Nov 25 – 25 Dec 25', '2025-11-01', '2025-12-25', 'RO', 3700.00, 2),
(26, 'Superior', '01 Nov 25 – 25 Dec 25', '2025-11-01', '2025-12-25', 'RB', 4000.00, 3),
(26, 'Deluxe', '01 Nov 25 – 25 Dec 25', '2025-11-01', '2025-12-25', 'RO', 3900.00, 4),
(26, 'Deluxe', '01 Nov 25 – 25 Dec 25', '2025-11-01', '2025-12-25', 'RB', 4200.00, 5),
(26, 'Deluxe Pool View', '01 Nov 25 – 25 Dec 25', '2025-11-01', '2025-12-25', 'RO', 4400.00, 6),
(26, 'Deluxe Pool View', '01 Nov 25 – 25 Dec 25', '2025-11-01', '2025-12-25', 'RB', 4700.00, 7),
(26, 'Deluxe Renovated Pool View', '01 Nov 25 – 25 Dec 25', '2025-11-01', '2025-12-25', 'RO', 4900.00, 8),
(26, 'Deluxe Renovated Pool View', '01 Nov 25 – 25 Dec 25', '2025-11-01', '2025-12-25', 'RB', 5200.00, 9),
(26, 'Grand Deluxe', '01 Nov 25 – 25 Dec 25', '2025-11-01', '2025-12-25', 'RO', 5400.00, 10),
(26, 'Grand Deluxe', '01 Nov 25 – 25 Dec 25', '2025-11-01', '2025-12-25', 'RB', 5700.00, 11),
(26, 'Standard', '26 Dec 25 – 05 Jan 26', '2025-12-26', '2026-01-05', 'RO', 6000.00, 12),
(26, 'Standard', '26 Dec 25 – 05 Jan 26', '2025-12-26', '2026-01-05', 'RB', 6300.00, 13),
(26, 'Superior', '26 Dec 25 – 05 Jan 26', '2025-12-26', '2026-01-05', 'RO', 6200.00, 14),
(26, 'Superior', '26 Dec 25 – 05 Jan 26', '2025-12-26', '2026-01-05', 'RB', 6500.00, 15),
(26, 'Deluxe', '26 Dec 25 – 05 Jan 26', '2025-12-26', '2026-01-05', 'RO', 6400.00, 16),
(26, 'Deluxe', '26 Dec 25 – 05 Jan 26', '2025-12-26', '2026-01-05', 'RB', 6700.00, 17),
(26, 'Deluxe Pool View', '26 Dec 25 – 05 Jan 26', '2025-12-26', '2026-01-05', 'RO', 6900.00, 18),
(26, 'Deluxe Pool View', '26 Dec 25 – 05 Jan 26', '2025-12-26', '2026-01-05', 'RB', 7200.00, 19),
(26, 'Deluxe Renovated Pool View', '26 Dec 25 – 05 Jan 26', '2025-12-26', '2026-01-05', 'RO', 7400.00, 20),
(26, 'Deluxe Renovated Pool View', '26 Dec 25 – 05 Jan 26', '2025-12-26', '2026-01-05', 'RB', 7700.00, 21),
(26, 'Grand Deluxe', '26 Dec 25 – 05 Jan 26', '2025-12-26', '2026-01-05', 'RO', 7900.00, 22),
(26, 'Grand Deluxe', '26 Dec 25 – 05 Jan 26', '2025-12-26', '2026-01-05', 'RB', 8200.00, 23),
(26, 'Standard', '06 Jan 26 – 28 Feb 26', '2026-01-06', '2026-02-28', 'RO', 5000.00, 24),
(26, 'Standard', '06 Jan 26 – 28 Feb 26', '2026-01-06', '2026-02-28', 'RB', 5300.00, 25),
(26, 'Superior', '06 Jan 26 – 28 Feb 26', '2026-01-06', '2026-02-28', 'RO', 5200.00, 26),
(26, 'Superior', '06 Jan 26 – 28 Feb 26', '2026-01-06', '2026-02-28', 'RB', 5500.00, 27),
(26, 'Deluxe', '06 Jan 26 – 28 Feb 26', '2026-01-06', '2026-02-28', 'RO', 5400.00, 28),
(26, 'Deluxe', '06 Jan 26 – 28 Feb 26', '2026-01-06', '2026-02-28', 'RB', 5700.00, 29),
(26, 'Deluxe Pool View', '06 Jan 26 – 28 Feb 26', '2026-01-06', '2026-02-28', 'RO', 5900.00, 30),
(26, 'Deluxe Pool View', '06 Jan 26 – 28 Feb 26', '2026-01-06', '2026-02-28', 'RB', 6200.00, 31),
(26, 'Deluxe Renovated Pool View', '06 Jan 26 – 28 Feb 26', '2026-01-06', '2026-02-28', 'RO', 6400.00, 32),
(26, 'Deluxe Renovated Pool View', '06 Jan 26 – 28 Feb 26', '2026-01-06', '2026-02-28', 'RB', 6700.00, 33),
(26, 'Grand Deluxe', '06 Jan 26 – 28 Feb 26', '2026-01-06', '2026-02-28', 'RO', 6900.00, 34),
(26, 'Grand Deluxe', '06 Jan 26 – 28 Feb 26', '2026-01-06', '2026-02-28', 'RB', 7200.00, 35),
(26, 'Standard', '01 Mar 26 – 30 Apr 26', '2026-03-01', '2026-04-30', 'RO', 4000.00, 36),
(26, 'Standard', '01 Mar 26 – 30 Apr 26', '2026-03-01', '2026-04-30', 'RB', 4300.00, 37),
(26, 'Superior', '01 Mar 26 – 30 Apr 26', '2026-03-01', '2026-04-30', 'RO', 4200.00, 38),
(26, 'Superior', '01 Mar 26 – 30 Apr 26', '2026-03-01', '2026-04-30', 'RB', 4500.00, 39),
(26, 'Deluxe', '01 Mar 26 – 30 Apr 26', '2026-03-01', '2026-04-30', 'RO', 4400.00, 40),
(26, 'Deluxe', '01 Mar 26 – 30 Apr 26', '2026-03-01', '2026-04-30', 'RB', 4700.00, 41),
(26, 'Deluxe Pool View', '01 Mar 26 – 30 Apr 26', '2026-03-01', '2026-04-30', 'RO', 4900.00, 42),
(26, 'Deluxe Pool View', '01 Mar 26 – 30 Apr 26', '2026-03-01', '2026-04-30', 'RB', 5200.00, 43),
(26, 'Deluxe Renovated Pool View', '01 Mar 26 – 30 Apr 26', '2026-03-01', '2026-04-30', 'RO', 5400.00, 44),
(26, 'Deluxe Renovated Pool View', '01 Mar 26 – 30 Apr 26', '2026-03-01', '2026-04-30', 'RB', 5700.00, 45),
(26, 'Grand Deluxe', '01 Mar 26 – 30 Apr 26', '2026-03-01', '2026-04-30', 'RO', 5900.00, 46),
(26, 'Grand Deluxe', '01 Mar 26 – 30 Apr 26', '2026-03-01', '2026-04-30', 'RB', 6200.00, 47),
(26, 'Standard', '01 May 26 – 31 Oct 26', '2026-05-01', '2026-10-31', 'RO', 2500.00, 48),
(26, 'Standard', '01 May 26 – 31 Oct 26', '2026-05-01', '2026-10-31', 'RB', 2800.00, 49);
INSERT INTO `hotel_rates` (`hotel_id`,`room_type`,`period_label`,`period_start`,`period_end`,`meal_plan`,`price`,`sort_order`) VALUES
(26, 'Superior', '01 May 26 – 31 Oct 26', '2026-05-01', '2026-10-31', 'RO', 2700.00, 50),
(26, 'Superior', '01 May 26 – 31 Oct 26', '2026-05-01', '2026-10-31', 'RB', 3000.00, 51),
(26, 'Deluxe', '01 May 26 – 31 Oct 26', '2026-05-01', '2026-10-31', 'RO', 2900.00, 52),
(26, 'Deluxe', '01 May 26 – 31 Oct 26', '2026-05-01', '2026-10-31', 'RB', 3200.00, 53),
(26, 'Deluxe Pool View', '01 May 26 – 31 Oct 26', '2026-05-01', '2026-10-31', 'RO', 3200.00, 54),
(26, 'Deluxe Pool View', '01 May 26 – 31 Oct 26', '2026-05-01', '2026-10-31', 'RB', 3500.00, 55),
(26, 'Deluxe Renovated Pool View', '01 May 26 – 31 Oct 26', '2026-05-01', '2026-10-31', 'RO', 3500.00, 56),
(26, 'Deluxe Renovated Pool View', '01 May 26 – 31 Oct 26', '2026-05-01', '2026-10-31', 'RB', 3800.00, 57),
(26, 'Grand Deluxe', '01 May 26 – 31 Oct 26', '2026-05-01', '2026-10-31', 'RO', 3800.00, 58),
(26, 'Grand Deluxe', '01 May 26 – 31 Oct 26', '2026-05-01', '2026-10-31', 'RB', 4100.00, 59),
(26, 'Junior Suite (4 Pax)', '01 Nov – 25 Dec 2025', '2025-11-01', '2025-12-25', 'RO', 12000.00, 60),
(26, 'Junior Suite (4 Pax)', '01 Nov – 25 Dec 2025', '2025-11-01', '2025-12-25', 'RB', 13000.00, 61),
(26, 'Junior Suite (4 Pax)', '26 Dec 2025 – 05 Jan 2026', '2025-12-26', '2026-01-05', 'RO', 17000.00, 62),
(26, 'Junior Suite (4 Pax)', '26 Dec 2025 – 05 Jan 2026', '2025-12-26', '2026-01-05', 'RB', 18000.00, 63),
(26, 'Junior Suite (4 Pax)', '06 Jan – 28 Feb 2026', '2026-01-06', '2026-02-28', 'RO', 15000.00, 64),
(26, 'Junior Suite (4 Pax)', '06 Jan – 28 Feb 2026', '2026-01-06', '2026-02-28', 'RB', 16000.00, 65),
(26, 'Junior Suite (4 Pax)', '01 Mar – 30 Apr 2026', '2026-03-01', '2026-04-30', 'RO', 13000.00, 66),
(26, 'Junior Suite (4 Pax)', '01 Mar – 30 Apr 2026', '2026-03-01', '2026-04-30', 'RB', 14000.00, 67),
(26, 'Junior Suite (4 Pax)', '01 May – 31 Oct 2026', '2026-05-01', '2026-10-31', 'RO', 10000.00, 68),
(26, 'Junior Suite (4 Pax)', '01 May – 31 Oct 2026', '2026-05-01', '2026-10-31', 'RB', 11000.00, 69),
(26, 'Suite (4 Pax)', '01 Nov – 25 Dec 2025', '2025-11-01', '2025-12-25', 'RO', 14000.00, 70),
(26, 'Suite (4 Pax)', '01 Nov – 25 Dec 2025', '2025-11-01', '2025-12-25', 'RB', 15000.00, 71),
(26, 'Suite (4 Pax)', '26 Dec 2025 – 05 Jan 2026', '2025-12-26', '2026-01-05', 'RO', 19000.00, 72),
(26, 'Suite (4 Pax)', '26 Dec 2025 – 05 Jan 2026', '2025-12-26', '2026-01-05', 'RB', 20000.00, 73),
(26, 'Suite (4 Pax)', '06 Jan – 28 Feb 2026', '2026-01-06', '2026-02-28', 'RO', 17000.00, 74),
(26, 'Suite (4 Pax)', '06 Jan – 28 Feb 2026', '2026-01-06', '2026-02-28', 'RB', 18000.00, 75),
(26, 'Suite (4 Pax)', '01 Mar – 30 Apr 2026', '2026-03-01', '2026-04-30', 'RO', 15000.00, 76),
(26, 'Suite (4 Pax)', '01 Mar – 30 Apr 2026', '2026-03-01', '2026-04-30', 'RB', 16000.00, 77),
(26, 'Suite (4 Pax)', '01 May – 31 Oct 2026', '2026-05-01', '2026-10-31', 'RO', 12000.00, 78),
(26, 'Suite (4 Pax)', '01 May – 31 Oct 2026', '2026-05-01', '2026-10-31', 'RB', 14000.00, 79);

-- [24] The Marina Phuket Hotel  (40 rates)
INSERT INTO `hotel_rates` (`hotel_id`,`room_type`,`period_label`,`period_start`,`period_end`,`meal_plan`,`price`,`sort_order`) VALUES
(24, 'Deluxe Double', '01 Nov 25 – 25 Dec 25', '2025-11-01', '2025-12-25', 'RO', 4000.00, 0),
(24, 'Deluxe Double', '01 Nov 25 – 25 Dec 25', '2025-11-01', '2025-12-25', 'RB', 4300.00, 1),
(24, 'Deluxe Twin', '01 Nov 25 – 25 Dec 25', '2025-11-01', '2025-12-25', 'RO', 4200.00, 2),
(24, 'Deluxe Twin', '01 Nov 25 – 25 Dec 25', '2025-11-01', '2025-12-25', 'RB', 4500.00, 3),
(24, 'Premium Deluxe', '01 Nov 25 – 25 Dec 25', '2025-11-01', '2025-12-25', 'RO', 4400.00, 4),
(24, 'Premium Deluxe', '01 Nov 25 – 25 Dec 25', '2025-11-01', '2025-12-25', 'RB', 4700.00, 5),
(24, 'Grand Deluxe', '01 Nov 25 – 25 Dec 25', '2025-11-01', '2025-12-25', 'RO', 4600.00, 6),
(24, 'Grand Deluxe', '01 Nov 25 – 25 Dec 25', '2025-11-01', '2025-12-25', 'RB', 4900.00, 7),
(24, 'Deluxe Double', '26 Dec 25 – 05 Jan 26', '2025-12-26', '2026-01-05', 'RO', 7000.00, 8),
(24, 'Deluxe Double', '26 Dec 25 – 05 Jan 26', '2025-12-26', '2026-01-05', 'RB', 7300.00, 9),
(24, 'Deluxe Twin', '26 Dec 25 – 05 Jan 26', '2025-12-26', '2026-01-05', 'RO', 7200.00, 10),
(24, 'Deluxe Twin', '26 Dec 25 – 05 Jan 26', '2025-12-26', '2026-01-05', 'RB', 7500.00, 11),
(24, 'Premium Deluxe', '26 Dec 25 – 05 Jan 26', '2025-12-26', '2026-01-05', 'RO', 7400.00, 12),
(24, 'Premium Deluxe', '26 Dec 25 – 05 Jan 26', '2025-12-26', '2026-01-05', 'RB', 7700.00, 13),
(24, 'Grand Deluxe', '26 Dec 25 – 05 Jan 26', '2025-12-26', '2026-01-05', 'RO', 7600.00, 14),
(24, 'Grand Deluxe', '26 Dec 25 – 05 Jan 26', '2025-12-26', '2026-01-05', 'RB', 7900.00, 15),
(24, 'Deluxe Double', '06 Jan 26 – 28 Feb 26', '2026-01-06', '2026-02-28', 'RO', 5500.00, 16),
(24, 'Deluxe Double', '06 Jan 26 – 28 Feb 26', '2026-01-06', '2026-02-28', 'RB', 5800.00, 17),
(24, 'Deluxe Twin', '06 Jan 26 – 28 Feb 26', '2026-01-06', '2026-02-28', 'RO', 5700.00, 18),
(24, 'Deluxe Twin', '06 Jan 26 – 28 Feb 26', '2026-01-06', '2026-02-28', 'RB', 6000.00, 19),
(24, 'Premium Deluxe', '06 Jan 26 – 28 Feb 26', '2026-01-06', '2026-02-28', 'RO', 5900.00, 20),
(24, 'Premium Deluxe', '06 Jan 26 – 28 Feb 26', '2026-01-06', '2026-02-28', 'RB', 6200.00, 21),
(24, 'Grand Deluxe', '06 Jan 26 – 28 Feb 26', '2026-01-06', '2026-02-28', 'RO', 6100.00, 22),
(24, 'Grand Deluxe', '06 Jan 26 – 28 Feb 26', '2026-01-06', '2026-02-28', 'RB', 6400.00, 23),
(24, 'Deluxe Double', '01 Mar 26 – 30 Apr 26', '2026-03-01', '2026-04-30', 'RO', 4500.00, 24),
(24, 'Deluxe Double', '01 Mar 26 – 30 Apr 26', '2026-03-01', '2026-04-30', 'RB', 4800.00, 25),
(24, 'Deluxe Twin', '01 Mar 26 – 30 Apr 26', '2026-03-01', '2026-04-30', 'RO', 4700.00, 26),
(24, 'Deluxe Twin', '01 Mar 26 – 30 Apr 26', '2026-03-01', '2026-04-30', 'RB', 5000.00, 27),
(24, 'Premium Deluxe', '01 Mar 26 – 30 Apr 26', '2026-03-01', '2026-04-30', 'RO', 4900.00, 28),
(24, 'Premium Deluxe', '01 Mar 26 – 30 Apr 26', '2026-03-01', '2026-04-30', 'RB', 5200.00, 29),
(24, 'Grand Deluxe', '01 Mar 26 – 30 Apr 26', '2026-03-01', '2026-04-30', 'RO', 5100.00, 30),
(24, 'Grand Deluxe', '01 Mar 26 – 30 Apr 26', '2026-03-01', '2026-04-30', 'RB', 5400.00, 31),
(24, 'Deluxe Double', '01 May 26 – 31 Oct 26', '2026-05-01', '2026-10-31', 'RO', 3000.00, 32),
(24, 'Deluxe Double', '01 May 26 – 31 Oct 26', '2026-05-01', '2026-10-31', 'RB', 3300.00, 33),
(24, 'Deluxe Twin', '01 May 26 – 31 Oct 26', '2026-05-01', '2026-10-31', 'RO', 3200.00, 34),
(24, 'Deluxe Twin', '01 May 26 – 31 Oct 26', '2026-05-01', '2026-10-31', 'RB', 3500.00, 35),
(24, 'Premium Deluxe', '01 May 26 – 31 Oct 26', '2026-05-01', '2026-10-31', 'RO', 3400.00, 36),
(24, 'Premium Deluxe', '01 May 26 – 31 Oct 26', '2026-05-01', '2026-10-31', 'RB', 3700.00, 37),
(24, 'Grand Deluxe', '01 May 26 – 31 Oct 26', '2026-05-01', '2026-10-31', 'RO', 3600.00, 38),
(24, 'Grand Deluxe', '01 May 26 – 31 Oct 26', '2026-05-01', '2026-10-31', 'RB', 3900.00, 39);

-- [23] Clarian Hotel Beach Patong  (40 rates)
INSERT INTO `hotel_rates` (`hotel_id`,`room_type`,`period_label`,`period_start`,`period_end`,`meal_plan`,`price`,`sort_order`) VALUES
(23, 'Superior Standard Balcony', 'Now – 19 Dec 25', NULL, '2025-12-19', 'RO', 5000.00, 0),
(23, 'Superior Standard Balcony', 'Now – 19 Dec 25', NULL, '2025-12-19', 'RB', 6000.00, 1),
(23, 'Superior Standard Balcony', '20 Dec 25 – 10 Jan 26', '2025-12-20', '2026-01-10', 'RO', 8300.00, 2),
(23, 'Superior Standard Balcony', '20 Dec 25 – 10 Jan 26', '2025-12-20', '2026-01-10', 'RB', 9300.00, 3),
(23, 'Superior Standard Balcony', '11 Jan 26 – 31 Mar 26', '2026-01-11', '2026-03-31', 'RO', 5500.00, 4),
(23, 'Superior Standard Balcony', '11 Jan 26 – 31 Mar 26', '2026-01-11', '2026-03-31', 'RB', 6500.00, 5),
(23, 'Superior Standard Balcony', '01 Apr 26 – 31 Oct 26', '2026-04-01', '2026-10-31', 'RO', 3500.00, 6),
(23, 'Superior Standard Balcony', '01 Apr 26 – 31 Oct 26', '2026-04-01', '2026-10-31', 'RB', 4500.00, 7),
(23, 'Deluxe Balcony', 'Now – 19 Dec 25', NULL, '2025-12-19', 'RO', 6100.00, 8),
(23, 'Deluxe Balcony', 'Now – 19 Dec 25', NULL, '2025-12-19', 'RB', 7100.00, 9),
(23, 'Deluxe Balcony', '20 Dec 25 – 10 Jan 26', '2025-12-20', '2026-01-10', 'RO', 8900.00, 10),
(23, 'Deluxe Balcony', '20 Dec 25 – 10 Jan 26', '2025-12-20', '2026-01-10', 'RB', 9900.00, 11),
(23, 'Deluxe Balcony', '11 Jan 26 – 31 Mar 26', '2026-01-11', '2026-03-31', 'RO', 6600.00, 12),
(23, 'Deluxe Balcony', '11 Jan 26 – 31 Mar 26', '2026-01-11', '2026-03-31', 'RB', 7600.00, 13),
(23, 'Deluxe Balcony', '01 Apr 26 – 31 Oct 26', '2026-04-01', '2026-10-31', 'RO', 3900.00, 14),
(23, 'Deluxe Balcony', '01 Apr 26 – 31 Oct 26', '2026-04-01', '2026-10-31', 'RB', 4900.00, 15),
(23, 'Deluxe Balcony City View', 'Now – 19-Dec-25', NULL, '2025-12-19', 'RO', 6200.00, 16),
(23, 'Deluxe Balcony City View', 'Now – 19-Dec-25', NULL, '2025-12-19', 'RB', 7200.00, 17),
(23, 'Deluxe Balcony City View', '20-Dec-25 – 10-Jan-26', '2025-12-20', '2026-01-10', 'RO', 10000.00, 18),
(23, 'Deluxe Balcony City View', '20-Dec-25 – 10-Jan-26', '2025-12-20', '2026-01-10', 'RB', 11000.00, 19),
(23, 'Deluxe Balcony City View', '11-Jan-26 – 31-Mar-26', '2026-01-11', '2026-03-31', 'RO', 6700.00, 20),
(23, 'Deluxe Balcony City View', '11-Jan-26 – 31-Mar-26', '2026-01-11', '2026-03-31', 'RB', 7700.00, 21),
(23, 'Deluxe Balcony City View', '01-Apr-26 – 31-Oct-26', '2026-04-01', '2026-10-31', 'RO', 4300.00, 22),
(23, 'Deluxe Balcony City View', '01-Apr-26 – 31-Oct-26', '2026-04-01', '2026-10-31', 'RB', 5300.00, 23),
(23, 'One Bedroom Suite', 'Now – 19-Dec-25', NULL, '2025-12-19', 'RO', 6900.00, 24),
(23, 'One Bedroom Suite', 'Now – 19-Dec-25', NULL, '2025-12-19', 'RB', 7900.00, 25),
(23, 'One Bedroom Suite', '20-Dec-25 – 10-Jan-26', '2025-12-20', '2026-01-10', 'RO', 11700.00, 26),
(23, 'One Bedroom Suite', '20-Dec-25 – 10-Jan-26', '2025-12-20', '2026-01-10', 'RB', 12700.00, 27),
(23, 'One Bedroom Suite', '11-Jan-26 – 31-Mar-26', '2026-01-11', '2026-03-31', 'RO', 7400.00, 28),
(23, 'One Bedroom Suite', '11-Jan-26 – 31-Mar-26', '2026-01-11', '2026-03-31', 'RB', 8400.00, 29),
(23, 'One Bedroom Suite', '01-Apr-26 – 31-Oct-26', '2026-04-01', '2026-10-31', 'RO', 5000.00, 30),
(23, 'One Bedroom Suite', '01-Apr-26 – 31-Oct-26', '2026-04-01', '2026-10-31', 'RB', 6000.00, 31),
(23, 'One Bedroom Suite City View', 'Now – 19-Dec-25', NULL, '2025-12-19', 'RO', 7400.00, 32),
(23, 'One Bedroom Suite City View', 'Now – 19-Dec-25', NULL, '2025-12-19', 'RB', 8400.00, 33),
(23, 'One Bedroom Suite City View', '20-Dec-25 – 10-Jan-26', '2025-12-20', '2026-01-10', 'RO', 12700.00, 34),
(23, 'One Bedroom Suite City View', '20-Dec-25 – 10-Jan-26', '2025-12-20', '2026-01-10', 'RB', 13700.00, 35),
(23, 'One Bedroom Suite City View', '11-Jan-26 – 31-Mar-26', '2026-01-11', '2026-03-31', 'RO', 7900.00, 36),
(23, 'One Bedroom Suite City View', '11-Jan-26 – 31-Mar-26', '2026-01-11', '2026-03-31', 'RB', 8900.00, 37),
(23, 'One Bedroom Suite City View', '01-Apr-26 – 31-Oct-26', '2026-04-01', '2026-10-31', 'RO', 5500.00, 38),
(23, 'One Bedroom Suite City View', '01-Apr-26 – 31-Oct-26', '2026-04-01', '2026-10-31', 'RB', 6500.00, 39);

-- [22] Quality Beach Resorts and Spa Patong  (56 rates)
INSERT INTO `hotel_rates` (`hotel_id`,`room_type`,`period_label`,`period_start`,`period_end`,`meal_plan`,`price`,`sort_order`) VALUES
(22, 'Deluxe Balcony', 'Now – 19 Dec 2025', NULL, '2025-12-19', 'RO', 5600.00, 0),
(22, 'Deluxe Balcony', 'Now – 19 Dec 2025', NULL, '2025-12-19', 'RB', 6100.00, 1),
(22, 'Deluxe Balcony', '20 Dec 2025 – 10 Jan 2026', '2025-12-20', '2026-01-10', 'RO', 10000.00, 2),
(22, 'Deluxe Balcony', '20 Dec 2025 – 10 Jan 2026', '2025-12-20', '2026-01-10', 'RB', 10500.00, 3),
(22, 'Deluxe Balcony', '11 Jan 2026 – 31 Mar 2026', '2026-01-11', '2026-03-31', 'RO', 6100.00, 4),
(22, 'Deluxe Balcony', '11 Jan 2026 – 31 Mar 2026', '2026-01-11', '2026-03-31', 'RB', 6600.00, 5),
(22, 'Deluxe Balcony', '01 Apr 2026 – 31 Oct 2026', '2026-04-01', '2026-10-31', 'RO', 5000.00, 6),
(22, 'Deluxe Balcony', '01 Apr 2026 – 31 Oct 2026', '2026-04-01', '2026-10-31', 'RB', 5500.00, 7),
(22, 'Deluxe Balcony Garden View', 'Now – 19 Dec 2025', NULL, '2025-12-19', 'RO', 5900.00, 8),
(22, 'Deluxe Balcony Garden View', 'Now – 19 Dec 2025', NULL, '2025-12-19', 'RB', 6400.00, 9),
(22, 'Deluxe Balcony Garden View', '20 Dec 2025 – 10 Jan 2026', '2025-12-20', '2026-01-10', 'RO', 10500.00, 10),
(22, 'Deluxe Balcony Garden View', '20 Dec 2025 – 10 Jan 2026', '2025-12-20', '2026-01-10', 'RB', 11000.00, 11),
(22, 'Deluxe Balcony Garden View', '11 Jan 2026 – 31 Mar 2026', '2026-01-11', '2026-03-31', 'RO', 6400.00, 12),
(22, 'Deluxe Balcony Garden View', '11 Jan 2026 – 31 Mar 2026', '2026-01-11', '2026-03-31', 'RB', 6900.00, 13),
(22, 'Deluxe Balcony Garden View', '01 Apr 2026 – 31 Oct 2026', '2026-04-01', '2026-10-31', 'RO', 5400.00, 14),
(22, 'Deluxe Balcony Garden View', '01 Apr 2026 – 31 Oct 2026', '2026-04-01', '2026-10-31', 'RB', 5900.00, 15),
(22, 'Deluxe Pool Front', 'Now – 19 Dec 2025', NULL, '2025-12-19', 'RO', 6700.00, 16),
(22, 'Deluxe Pool Front', 'Now – 19 Dec 2025', NULL, '2025-12-19', 'RB', 7200.00, 17),
(22, 'Deluxe Pool Front', '20 Dec 2025 – 10 Jan 2026', '2025-12-20', '2026-01-10', 'RO', 11100.00, 18),
(22, 'Deluxe Pool Front', '20 Dec 2025 – 10 Jan 2026', '2025-12-20', '2026-01-10', 'RB', 11600.00, 19),
(22, 'Deluxe Pool Front', '11 Jan 2026 – 31 Mar 2026', '2026-01-11', '2026-03-31', 'RO', 7200.00, 20),
(22, 'Deluxe Pool Front', '11 Jan 2026 – 31 Mar 2026', '2026-01-11', '2026-03-31', 'RB', 7700.00, 21),
(22, 'Deluxe Pool Front', '01 Apr 2026 – 31 Oct 2026', '2026-04-01', '2026-10-31', 'RO', 6100.00, 22),
(22, 'Deluxe Pool Front', '01 Apr 2026 – 31 Oct 2026', '2026-04-01', '2026-10-31', 'RB', 6600.00, 23),
(22, 'Deluxe Premium Balcony Pool View', 'Now – 19 Dec 2025', NULL, '2025-12-19', 'RO', 7800.00, 24),
(22, 'Deluxe Premium Balcony Pool View', 'Now – 19 Dec 2025', NULL, '2025-12-19', 'RB', 8300.00, 25),
(22, 'Deluxe Premium Balcony Pool View', '20 Dec 2025 – 10 Jan 2026', '2025-12-20', '2026-01-10', 'RO', 12200.00, 26),
(22, 'Deluxe Premium Balcony Pool View', '20 Dec 2025 – 10 Jan 2026', '2025-12-20', '2026-01-10', 'RB', 12700.00, 27),
(22, 'Deluxe Premium Balcony Pool View', '11 Jan 2026 – 31 Mar 2026', '2026-01-11', '2026-03-31', 'RO', 8300.00, 28),
(22, 'Deluxe Premium Balcony Pool View', '11 Jan 2026 – 31 Mar 2026', '2026-01-11', '2026-03-31', 'RB', 8800.00, 29),
(22, 'Deluxe Premium Balcony Pool View', '01 Apr 2026 – 31 Oct 2026', '2026-04-01', '2026-10-31', 'RO', 7200.00, 30),
(22, 'Deluxe Premium Balcony Pool View', '01 Apr 2026 – 31 Oct 2026', '2026-04-01', '2026-10-31', 'RB', 7700.00, 31),
(22, 'One Bedroom Premium Suite', 'Now – 19 Dec 2025', NULL, '2025-12-19', 'RO', 9400.00, 32),
(22, 'One Bedroom Premium Suite', 'Now – 19 Dec 2025', NULL, '2025-12-19', 'RB', 9900.00, 33),
(22, 'One Bedroom Premium Suite', '20 Dec 2025 – 10 Jan 2026', '2025-12-20', '2026-01-10', 'RO', 14500.00, 34),
(22, 'One Bedroom Premium Suite', '20 Dec 2025 – 10 Jan 2026', '2025-12-20', '2026-01-10', 'RB', 15000.00, 35),
(22, 'One Bedroom Premium Suite', '11 Jan 2026 – 31 Mar 2026', '2026-01-11', '2026-03-31', 'RO', 9900.00, 36),
(22, 'One Bedroom Premium Suite', '11 Jan 2026 – 31 Mar 2026', '2026-01-11', '2026-03-31', 'RB', 10400.00, 37),
(22, 'One Bedroom Premium Suite', '01 Apr 2026 – 31 Oct 2026', '2026-04-01', '2026-10-31', 'RO', 8900.00, 38),
(22, 'One Bedroom Premium Suite', '01 Apr 2026 – 31 Oct 2026', '2026-04-01', '2026-10-31', 'RB', 9400.00, 39),
(22, 'Premium Quadruple Room', 'Now – 19 Dec 2025', NULL, '2025-12-19', 'RO', 9900.00, 40),
(22, 'Premium Quadruple Room', 'Now – 19 Dec 2025', NULL, '2025-12-19', 'RB', 10400.00, 41),
(22, 'Premium Quadruple Room', '20 Dec 2025 – 10 Jan 2026', '2025-12-20', '2026-01-10', 'RO', 15000.00, 42),
(22, 'Premium Quadruple Room', '20 Dec 2025 – 10 Jan 2026', '2025-12-20', '2026-01-10', 'RB', 15500.00, 43),
(22, 'Premium Quadruple Room', '11 Jan 2026 – 31 Mar 2026', '2026-01-11', '2026-03-31', 'RO', 10400.00, 44),
(22, 'Premium Quadruple Room', '11 Jan 2026 – 31 Mar 2026', '2026-01-11', '2026-03-31', 'RB', 10900.00, 45),
(22, 'Premium Quadruple Room', '01 Apr 2026 – 31 Oct 2026', '2026-04-01', '2026-10-31', 'RO', 9400.00, 46),
(22, 'Premium Quadruple Room', '01 Apr 2026 – 31 Oct 2026', '2026-04-01', '2026-10-31', 'RB', 9900.00, 47),
(22, 'Deluxe Premium Pool Access', 'Now – 19 Dec 2025', NULL, '2025-12-19', 'RO', 10200.00, 48),
(22, 'Deluxe Premium Pool Access', 'Now – 19 Dec 2025', NULL, '2025-12-19', 'RB', 10700.00, 49);
INSERT INTO `hotel_rates` (`hotel_id`,`room_type`,`period_label`,`period_start`,`period_end`,`meal_plan`,`price`,`sort_order`) VALUES
(22, 'Deluxe Premium Pool Access', '20 Dec 2025 – 10 Jan 2026', '2025-12-20', '2026-01-10', 'RO', 15300.00, 50),
(22, 'Deluxe Premium Pool Access', '20 Dec 2025 – 10 Jan 2026', '2025-12-20', '2026-01-10', 'RB', 15800.00, 51),
(22, 'Deluxe Premium Pool Access', '11 Jan 2026 – 31 Mar 2026', '2026-01-11', '2026-03-31', 'RO', 10700.00, 52),
(22, 'Deluxe Premium Pool Access', '11 Jan 2026 – 31 Mar 2026', '2026-01-11', '2026-03-31', 'RB', 11200.00, 53),
(22, 'Deluxe Premium Pool Access', '01 Apr 2026 – 31 Oct 2026', '2026-04-01', '2026-10-31', 'RO', 9700.00, 54),
(22, 'Deluxe Premium Pool Access', '01 Apr 2026 – 31 Oct 2026', '2026-04-01', '2026-10-31', 'RB', 10200.00, 55);

-- [27] The Charm Resort Phuket  (28 rates)
INSERT INTO `hotel_rates` (`hotel_id`,`room_type`,`period_label`,`period_start`,`period_end`,`meal_plan`,`price`,`sort_order`) VALUES
(27, 'Deluxe', '01 Nov – 23 Dec 2025', '2025-11-01', '2025-12-23', NULL, 4200.00, 0),
(27, 'Junior Suite', '01 Nov – 23 Dec 2025', '2025-11-01', '2025-12-23', NULL, 4700.00, 1),
(27, 'Deluxe Pool Access', '01 Nov – 23 Dec 2025', '2025-11-01', '2025-12-23', NULL, 5000.00, 2),
(27, 'Junior Pool Access', '01 Nov – 23 Dec 2025', '2025-11-01', '2025-12-23', NULL, 6000.00, 3),
(27, 'Executive Suite', '01 Nov – 23 Dec 2025', '2025-11-01', '2025-12-23', NULL, 6200.00, 4),
(27, 'Family 1BR Suite', '01 Nov – 23 Dec 2025', '2025-11-01', '2025-12-23', NULL, 10600.00, 5),
(27, 'Family 2BR Suite', '01 Nov – 23 Dec 2025', '2025-11-01', '2025-12-23', NULL, 11600.00, 6),
(27, 'Deluxe', '24 Dec 2025 – 10 Jan 2026', '2025-12-24', '2026-01-10', NULL, 6100.00, 7),
(27, 'Junior Suite', '24 Dec 2025 – 10 Jan 2026', '2025-12-24', '2026-01-10', NULL, 6900.00, 8),
(27, 'Deluxe Pool Access', '24 Dec 2025 – 10 Jan 2026', '2025-12-24', '2026-01-10', NULL, 7200.00, 9),
(27, 'Junior Pool Access', '24 Dec 2025 – 10 Jan 2026', '2025-12-24', '2026-01-10', NULL, 8200.00, 10),
(27, 'Executive Suite', '24 Dec 2025 – 10 Jan 2026', '2025-12-24', '2026-01-10', NULL, 8400.00, 11),
(27, 'Family 1BR Suite', '24 Dec 2025 – 10 Jan 2026', '2025-12-24', '2026-01-10', NULL, 14800.00, 12),
(27, 'Family 2BR Suite', '24 Dec 2025 – 10 Jan 2026', '2025-12-24', '2026-01-10', NULL, 15800.00, 13),
(27, 'Deluxe', '11 Jan – 31 Mar 2026', '2026-01-11', '2026-03-31', NULL, 4700.00, 14),
(27, 'Junior Suite', '11 Jan – 31 Mar 2026', '2026-01-11', '2026-03-31', NULL, 5200.00, 15),
(27, 'Deluxe Pool Access', '11 Jan – 31 Mar 2026', '2026-01-11', '2026-03-31', NULL, 5500.00, 16),
(27, 'Junior Pool Access', '11 Jan – 31 Mar 2026', '2026-01-11', '2026-03-31', NULL, 6500.00, 17),
(27, 'Executive Suite', '11 Jan – 31 Mar 2026', '2026-01-11', '2026-03-31', NULL, 6700.00, 18),
(27, 'Family 1BR Suite', '11 Jan – 31 Mar 2026', '2026-01-11', '2026-03-31', NULL, 11100.00, 19),
(27, 'Family 2BR Suite', '11 Jan – 31 Mar 2026', '2026-01-11', '2026-03-31', NULL, 12100.00, 20),
(27, 'Deluxe', '01 Apr – 31 Oct 2026', '2026-04-01', '2026-10-31', NULL, 3200.00, 21),
(27, 'Junior Suite', '01 Apr – 31 Oct 2026', '2026-04-01', '2026-10-31', NULL, 3700.00, 22),
(27, 'Deluxe Pool Access', '01 Apr – 31 Oct 2026', '2026-04-01', '2026-10-31', NULL, 4000.00, 23),
(27, 'Junior Pool Access', '01 Apr – 31 Oct 2026', '2026-04-01', '2026-10-31', NULL, 5000.00, 24),
(27, 'Executive Suite', '01 Apr – 31 Oct 2026', '2026-04-01', '2026-10-31', NULL, 5200.00, 25),
(27, 'Family 1BR Suite', '01 Apr – 31 Oct 2026', '2026-04-01', '2026-10-31', NULL, 8200.00, 26),
(27, 'Family 2BR Suite', '01 Apr – 31 Oct 2026', '2026-04-01', '2026-10-31', NULL, 9200.00, 27);

-- [21] The Lantern Resorts Patong  (48 rates)
INSERT INTO `hotel_rates` (`hotel_id`,`room_type`,`period_label`,`period_start`,`period_end`,`meal_plan`,`price`,`sort_order`) VALUES
(21, 'Superior', '01 Nov 2025 – 23 Dec 2025', '2025-11-01', '2025-12-23', NULL, 3800.00, 0),
(21, 'Deluxe', '01 Nov 2025 – 23 Dec 2025', '2025-11-01', '2025-12-23', NULL, 4200.00, 1),
(21, 'Deluxe Pool View', '01 Nov 2025 – 23 Dec 2025', '2025-11-01', '2025-12-23', NULL, 4800.00, 2),
(21, 'Junior Suite', '01 Nov 2025 – 23 Dec 2025', '2025-11-01', '2025-12-23', NULL, 5800.00, 3),
(21, 'Executive Suite', '01 Nov 2025 – 23 Dec 2025', '2025-11-01', '2025-12-23', NULL, 6800.00, 4),
(21, 'Superior', '24 Dec 2025 – 10 Jan 2026', '2025-12-24', '2026-01-10', NULL, 5800.00, 5),
(21, 'Deluxe', '24 Dec 2025 – 10 Jan 2026', '2025-12-24', '2026-01-10', NULL, 6200.00, 6),
(21, 'Deluxe Pool View', '24 Dec 2025 – 10 Jan 2026', '2025-12-24', '2026-01-10', NULL, 6800.00, 7),
(21, 'Junior Suite', '24 Dec 2025 – 10 Jan 2026', '2025-12-24', '2026-01-10', NULL, 7800.00, 8),
(21, 'Executive Suite', '24 Dec 2025 – 10 Jan 2026', '2025-12-24', '2026-01-10', NULL, 8800.00, 9),
(21, 'Superior', '11 Jan 2026 – 31 Mar 2026', '2026-01-11', '2026-03-31', NULL, 4200.00, 10),
(21, 'Deluxe', '11 Jan 2026 – 31 Mar 2026', '2026-01-11', '2026-03-31', NULL, 4700.00, 11),
(21, 'Deluxe Pool View', '11 Jan 2026 – 31 Mar 2026', '2026-01-11', '2026-03-31', NULL, 5300.00, 12),
(21, 'Junior Suite', '11 Jan 2026 – 31 Mar 2026', '2026-01-11', '2026-03-31', NULL, 6300.00, 13),
(21, 'Executive Suite', '11 Jan 2026 – 31 Mar 2026', '2026-01-11', '2026-03-31', NULL, 7300.00, 14),
(21, 'Superior', '01 Apr 2026 – 31 Oct 2026', '2026-04-01', '2026-10-31', NULL, 3200.00, 15),
(21, 'Deluxe', '01 Apr 2026 – 31 Oct 2026', '2026-04-01', '2026-10-31', NULL, 3700.00, 16),
(21, 'Deluxe Pool View', '01 Apr 2026 – 31 Oct 2026', '2026-04-01', '2026-10-31', NULL, 4200.00, 17),
(21, 'Junior Suite', '01 Apr 2026 – 31 Oct 2026', '2026-04-01', '2026-10-31', NULL, 5200.00, 18),
(21, 'Executive Suite', '01 Apr 2026 – 31 Oct 2026', '2026-04-01', '2026-10-31', NULL, 6200.00, 19),
(21, 'View Pent', '01 Nov–19 Dec', '2025-11-01', '2025-12-19', NULL, 5940.00, 20),
(21, 'View Pent', '20 Dec–10 Jan', '2025-12-20', '2026-01-10', NULL, 9000.00, 21),
(21, 'View Pent', '11 Jan–15 Apr', '2026-01-11', '2026-04-15', NULL, 6300.00, 22),
(21, 'View Pent', '16 Apr–31 Oct', '2026-04-16', '2026-10-31', NULL, 4400.00, 23),
(21, 'View Pent Balcony', '01 Nov–19 Dec', '2025-11-01', '2025-12-19', NULL, 6660.00, 24),
(21, 'View Pent Balcony', '20 Dec–10 Jan', '2025-12-20', '2026-01-10', NULL, 9700.00, 25),
(21, 'View Pent Balcony', '11 Jan–15 Apr', '2026-01-11', '2026-04-15', NULL, 7200.00, 26),
(21, 'View Pent Balcony', '16 Apr–31 Oct', '2026-04-16', '2026-10-31', NULL, 5150.00, 27),
(21, 'View Pent Triple', '01 Nov–19 Dec', '2025-11-01', '2025-12-19', NULL, 7920.00, 28),
(21, 'View Pent Triple', '20 Dec–10 Jan', '2025-12-20', '2026-01-10', NULL, 11000.00, 29),
(21, 'View Pent Triple', '11 Jan–15 Apr', '2026-01-11', '2026-04-15', NULL, 8450.00, 30),
(21, 'View Pent Triple', '16 Apr–31 Oct', '2026-04-16', '2026-10-31', NULL, 6400.00, 31),
(21, 'View Pent Quad', '01 Nov–19 Dec', '2025-11-01', '2025-12-19', NULL, 9000.00, 32),
(21, 'View Pent Quad', '20 Dec–10 Jan', '2025-12-20', '2026-01-10', NULL, 12200.00, 33),
(21, 'View Pent Quad', '11 Jan–15 Apr', '2026-01-11', '2026-04-15', NULL, 9900.00, 34),
(21, 'View Pent Quad', '16 Apr–31 Oct', '2026-04-16', '2026-10-31', NULL, 7500.00, 35),
(21, 'Pool Pent', '01 Nov–19 Dec', '2025-11-01', '2025-12-19', NULL, 9200.00, 36),
(21, 'Pool Pent', '20 Dec–10 Jan', '2025-12-20', '2026-01-10', NULL, 12200.00, 37),
(21, 'Pool Pent', '11 Jan–15 Apr', '2026-01-11', '2026-04-15', NULL, 10250.00, 38),
(21, 'Pool Pent', '16 Apr–31 Oct', '2026-04-16', '2026-10-31', NULL, 7660.00, 39),
(21, 'Luxury Pent 1BR', '01 Nov–19 Dec', '2025-11-01', '2025-12-19', NULL, 9550.00, 40),
(21, 'Luxury Pent 1BR', '20 Dec–10 Jan', '2025-12-20', '2026-01-10', NULL, 12600.00, 41),
(21, 'Luxury Pent 1BR', '11 Jan–15 Apr', '2026-01-11', '2026-04-15', NULL, 10600.00, 42),
(21, 'Luxury Pent 1BR', '16 Apr–31 Oct', '2026-04-16', '2026-10-31', NULL, 8000.00, 43),
(21, 'Luxury Pent 2BR', '01 Nov–19 Dec', '2025-11-01', '2025-12-19', NULL, 11500.00, 44),
(21, 'Luxury Pent 2BR', '20 Dec–10 Jan', '2025-12-20', '2026-01-10', NULL, 16400.00, 45),
(21, 'Luxury Pent 2BR', '11 Jan–15 Apr', '2026-01-11', '2026-04-15', NULL, 12600.00, 46),
(21, 'Luxury Pent 2BR', '16 Apr–31 Oct', '2026-04-16', '2026-10-31', NULL, 10000.00, 47);

-- [20] Amora Beach Resort Phuket  (10 rates)
INSERT INTO `hotel_rates` (`hotel_id`,`room_type`,`period_label`,`period_start`,`period_end`,`meal_plan`,`price`,`sort_order`) VALUES
(20, 'Superior Garden View (32 sqm)', '01–06 Apr 2026', '2026-04-01', '2026-04-06', NULL, 4700.00, 0),
(20, 'Superior Garden View (32 sqm)', '07 Apr – 31 Oct 2026', '2026-04-07', '2026-10-31', NULL, 2300.00, 1),
(20, 'Deluxe Garden View (36 sqm)', '01–06 Apr 2026', '2026-04-01', '2026-04-06', NULL, 5000.00, 2),
(20, 'Deluxe Garden View (36 sqm)', '07 Apr – 31 Oct 2026', '2026-04-07', '2026-10-31', NULL, 2600.00, 3),
(20, 'Amora Superior Pool View (32 sqm)', '01–06 Apr 2026', '2026-04-01', '2026-04-06', NULL, 5200.00, 4),
(20, 'Amora Superior Pool View (32 sqm)', '07 Apr – 31 Oct 2026', '2026-04-07', '2026-10-31', NULL, 2800.00, 5),
(20, 'Deluxe Pool View (40 sqm)', '01–06 Apr 2026', '2026-04-01', '2026-04-06', NULL, 5500.00, 6),
(20, 'Deluxe Pool View (40 sqm)', '07 Apr – 31 Oct 2026', '2026-04-07', '2026-10-31', NULL, 3000.00, 7),
(20, 'Amora Ocean (32 sqm)', '01–06 Apr 2026', '2026-04-01', '2026-04-06', NULL, 5700.00, 8),
(20, 'Amora Ocean (32 sqm)', '07 Apr – 31 Oct 2026', '2026-04-07', '2026-10-31', NULL, 3200.00, 9);

-- [17] Ratri Hotel Phuket Old Town  (12 rates)
INSERT INTO `hotel_rates` (`hotel_id`,`room_type`,`period_label`,`period_start`,`period_end`,`meal_plan`,`price`,`sort_order`) VALUES
(17, 'Classic King', 'Low Season (18 Apr – 31 Oct)', '2026-04-18', '2026-10-31', NULL, 1800.00, 0),
(17, 'Classic King', 'High Season (01 Nov – 24 Dec / 05 Jan – 11 Apr)', '2025-11-01', '2026-04-11', NULL, 3500.00, 1),
(17, 'Classic King', 'Peak Season (25 Dec – 04 Jan / 12–17 Apr)', '2025-12-25', '2026-04-17', NULL, 6000.00, 2),
(17, 'Classic Twin', 'Low Season (18 Apr – 31 Oct)', '2026-04-18', '2026-10-31', NULL, 1800.00, 3),
(17, 'Classic Twin', 'High Season (01 Nov – 24 Dec / 05 Jan – 11 Apr)', '2025-11-01', '2026-04-11', NULL, 3500.00, 4),
(17, 'Classic Twin', 'Peak Season (25 Dec – 04 Jan / 12–17 Apr)', '2025-12-25', '2026-04-17', NULL, 6000.00, 5),
(17, 'Deluxe Pool Access', 'Low Season (18 Apr – 31 Oct)', '2026-04-18', '2026-10-31', NULL, 2500.00, 6),
(17, 'Deluxe Pool Access', 'High Season (01 Nov – 24 Dec / 05 Jan – 11 Apr)', '2025-11-01', '2026-04-11', NULL, 4500.00, 7),
(17, 'Deluxe Pool Access', 'Peak Season (25 Dec – 04 Jan / 12–17 Apr)', '2025-12-25', '2026-04-17', NULL, 8000.00, 8),
(17, 'Premier King', 'Low Season (18 Apr – 31 Oct)', '2026-04-18', '2026-10-31', NULL, 2800.00, 9),
(17, 'Premier King', 'High Season (01 Nov – 24 Dec / 05 Jan – 11 Apr)', '2025-11-01', '2026-04-11', NULL, 5000.00, 10),
(17, 'Premier King', 'Peak Season (25 Dec – 04 Jan / 12–17 Apr)', '2025-12-25', '2026-04-17', NULL, 9000.00, 11);

-- [15] Kora Beach Resort Phuket  (12 rates)
INSERT INTO `hotel_rates` (`hotel_id`,`room_type`,`period_label`,`period_start`,`period_end`,`meal_plan`,`price`,`sort_order`) VALUES
(15, 'Deluxe Room (Extra Bed not Allowed)', 'Low Season (01 Apr - 31 Oct 2026)', '2026-04-01', '2026-10-31', NULL, 2200.00, 0),
(15, 'Premier Pool View', 'Low Season (01 Apr - 31 Oct 2026)', '2026-04-01', '2026-10-31', NULL, 2700.00, 1),
(15, 'Premier Plus Pool View', 'Low Season (01 Apr - 31 Oct 2026)', '2026-04-01', '2026-10-31', NULL, 3700.00, 2),
(15, 'Premier Seaview', 'Low Season (01 Apr - 31 Oct 2026)', '2026-04-01', '2026-10-31', NULL, 3200.00, 3),
(15, 'Premier Plus Sea View', 'Low Season (01 Apr - 31 Oct 2026)', '2026-04-01', '2026-10-31', NULL, 4200.00, 4),
(15, 'Premier Pool Access', 'Low Season (01 Apr - 31 Oct 2026)', '2026-04-01', '2026-10-31', NULL, 3700.00, 5),
(15, 'Premier Plus Pool Access', 'Low Season (01 Apr - 31 Oct 2026)', '2026-04-01', '2026-10-31', NULL, 4700.00, 6),
(15, 'Premier Family Room', 'Low Season (01 Apr - 31 Oct 2026)', '2026-04-01', '2026-10-31', NULL, 5680.00, 7),
(15, 'Premier Two Bedroom', 'Low Season (01 Apr - 31 Oct 2026)', '2026-04-01', '2026-10-31', NULL, 6800.00, 8),
(15, 'Two Bedroom Grand Suite', 'Low Season (01 Apr - 31 Oct 2026)', '2026-04-01', '2026-10-31', NULL, 9000.00, 9),
(15, 'Two Bedroom Executive Suite', 'Low Season (01 Apr - 31 Oct 2026)', '2026-04-01', '2026-10-31', NULL, 9800.00, 10),
(15, 'Two Bedroom Imperial Suite', 'Low Season (01 Apr - 31 Oct 2026)', '2026-04-01', '2026-10-31', NULL, 13000.00, 11);

-- [16] Centara Grand Beach Resort Phuket  (40 rates)
INSERT INTO `hotel_rates` (`hotel_id`,`room_type`,`period_label`,`period_start`,`period_end`,`meal_plan`,`price`,`sort_order`) VALUES
(16, 'Deluxe', '02 Feb - 13 Feb 26; 22 Feb - 28 Feb 26', '2026-02-02', '2026-02-13', NULL, 9800.00, 0),
(16, 'Deluxe', '01 Mar - 02 Apr 26; 15 Apr - 30 Apr 26', '2026-03-01', '2026-04-02', NULL, 7900.00, 1),
(16, 'Deluxe', '01 May - 30 Jun 26; 01 Sep - 31 Oct 26', '2026-05-01', '2026-06-30', NULL, 3900.00, 2),
(16, 'Deluxe', '01 Jul - 31 Aug 26', '2026-07-01', '2026-08-31', NULL, 4200.00, 3),
(16, 'Deluxe Ocean View', '02 Feb - 13 Feb 26; 22 Feb - 28 Feb 26', '2026-02-02', '2026-02-13', NULL, 10200.00, 4),
(16, 'Deluxe Ocean View', '01 Mar - 02 Apr 26; 15 Apr - 30 Apr 26', '2026-03-01', '2026-04-02', NULL, 8300.00, 5),
(16, 'Deluxe Ocean View', '01 May - 30 Jun 26; 01 Sep - 31 Oct 26', '2026-05-01', '2026-06-30', NULL, 4100.00, 6),
(16, 'Deluxe Ocean View', '01 Jul - 31 Aug 26', '2026-07-01', '2026-08-31', NULL, 4400.00, 7),
(16, 'Premium Deluxe', '02 Feb - 13 Feb 26; 22 Feb - 28 Feb 26', '2026-02-02', '2026-02-13', NULL, 10400.00, 8),
(16, 'Premium Deluxe', '01 Mar - 02 Apr 26; 15 Apr - 30 Apr 26', '2026-03-01', '2026-04-02', NULL, 8500.00, 9),
(16, 'Premium Deluxe', '01 May - 30 Jun 26; 01 Sep - 31 Oct 26', '2026-05-01', '2026-06-30', NULL, 4200.00, 10),
(16, 'Premium Deluxe', '01 Jul - 31 Aug 26', '2026-07-01', '2026-08-31', NULL, 4500.00, 11),
(16, 'Deluxe Spa', '02 Feb - 13 Feb 26; 22 Feb - 28 Feb 26', '2026-02-02', '2026-02-13', NULL, 10600.00, 12),
(16, 'Deluxe Spa', '01 Mar - 02 Apr 26; 15 Apr - 30 Apr 26', '2026-03-01', '2026-04-02', NULL, 8700.00, 13),
(16, 'Deluxe Spa', '01 May - 30 Jun 26; 01 Sep - 31 Oct 26', '2026-05-01', '2026-06-30', NULL, 4300.00, 14),
(16, 'Deluxe Spa', '01 Jul - 31 Aug 26', '2026-07-01', '2026-08-31', NULL, 4600.00, 15),
(16, 'Deluxe Spa Ocean View', '02 Feb - 13 Feb 26; 22 Feb - 28 Feb 26', '2026-02-02', '2026-02-13', NULL, 11100.00, 16),
(16, 'Deluxe Spa Ocean View', '01 Mar - 02 Apr 26; 15 Apr - 30 Apr 26', '2026-03-01', '2026-04-02', NULL, 9000.00, 17),
(16, 'Deluxe Spa Ocean View', '01 May - 30 Jun 26; 01 Sep - 31 Oct 26', '2026-05-01', '2026-06-30', NULL, 4500.00, 18),
(16, 'Deluxe Spa Ocean View', '01 Jul - 31 Aug 26', '2026-07-01', '2026-08-31', NULL, 4800.00, 19),
(16, 'Premier Spa', '02 Feb - 13 Feb 26; 22 Feb - 28 Feb 26', '2026-02-02', '2026-02-13', NULL, 11300.00, 20),
(16, 'Premier Spa', '01 Mar - 02 Apr 26; 15 Apr - 30 Apr 26', '2026-03-01', '2026-04-02', NULL, 9300.00, 21),
(16, 'Premier Spa', '01 May - 30 Jun 26; 01 Sep - 31 Oct 26', '2026-05-01', '2026-06-30', NULL, 4700.00, 22),
(16, 'Premier Spa', '01 Jul - 31 Aug 26', '2026-07-01', '2026-08-31', NULL, 5000.00, 23),
(16, 'Deluxe Suite Private Pool', '02 Feb - 13 Feb 26; 22 Feb - 28 Feb 26', '2026-02-02', '2026-02-13', NULL, 12000.00, 24),
(16, 'Deluxe Suite Private Pool', '01 Mar - 02 Apr 26; 15 Apr - 30 Apr 26', '2026-03-01', '2026-04-02', NULL, 9900.00, 25),
(16, 'Deluxe Suite Private Pool', '01 May - 30 Jun 26; 01 Sep - 31 Oct 26', '2026-05-01', '2026-06-30', NULL, 5000.00, 26),
(16, 'Deluxe Suite Private Pool', '01 Jul - 31 Aug 26', '2026-07-01', '2026-08-31', NULL, 5300.00, 27),
(16, 'Premier Suite Private Pool', '02 Feb - 13 Feb 26; 22 Feb - 28 Feb 26', '2026-02-02', '2026-02-13', NULL, 18600.00, 28),
(16, 'Premier Suite Private Pool', '01 Mar - 02 Apr 26; 15 Apr - 30 Apr 26', '2026-03-01', '2026-04-02', NULL, 15700.00, 29),
(16, 'Premier Suite Private Pool', '01 May - 30 Jun 26; 01 Sep - 31 Oct 26', '2026-05-01', '2026-06-30', NULL, 8100.00, 30),
(16, 'Premier Suite Private Pool', '01 Jul - 31 Aug 26', '2026-07-01', '2026-08-31', NULL, 8400.00, 31),
(16, 'Villa One Bedroom Private Pool', '02 Feb - 13 Feb 26; 22 Feb - 28 Feb 26', '2026-02-02', '2026-02-13', NULL, 31000.00, 32),
(16, 'Villa One Bedroom Private Pool', '01 Mar - 02 Apr 26; 15 Apr - 30 Apr 26', '2026-03-01', '2026-04-02', NULL, 26600.00, 33),
(16, 'Villa One Bedroom Private Pool', '01 May - 30 Jun 26; 01 Sep - 31 Oct 26', '2026-05-01', '2026-06-30', NULL, 13900.00, 34),
(16, 'Villa One Bedroom Private Pool', '01 Jul - 31 Aug 26', '2026-07-01', '2026-08-31', NULL, 14200.00, 35),
(16, 'Villa Two Bedroom Private Pool', '02 Feb - 13 Feb 26; 22 Feb - 28 Feb 26', '2026-02-02', '2026-02-13', NULL, 45800.00, 36),
(16, 'Villa Two Bedroom Private Pool', '01 Mar - 02 Apr 26; 15 Apr - 30 Apr 26', '2026-03-01', '2026-04-02', NULL, 39700.00, 37),
(16, 'Villa Two Bedroom Private Pool', '01 May - 30 Jun 26; 01 Sep - 31 Oct 26', '2026-05-01', '2026-06-30', NULL, 20900.00, 38),
(16, 'Villa Two Bedroom Private Pool', '01 Jul - 31 Aug 26', '2026-07-01', '2026-08-31', NULL, 21200.00, 39);

-- [11] Centara Karon Resort Phuket  (36 rates)
INSERT INTO `hotel_rates` (`hotel_id`,`room_type`,`period_label`,`period_start`,`period_end`,`meal_plan`,`price`,`sort_order`) VALUES
(11, 'Superior City View', '15 Apr - 30 Apr 26', '2026-04-15', '2026-04-30', NULL, 3338.00, 0),
(11, 'Superior City View', '01 May - 30 Jun 26', '2026-05-01', '2026-06-30', NULL, 1980.00, 1),
(11, 'Superior City View', '01 Jul - 31 Aug 26', '2026-07-01', '2026-08-31', NULL, 2893.00, 2),
(11, 'Superior City View', '01 Sep - 30 Sep 26', '2026-09-01', '2026-09-30', NULL, 2145.00, 3),
(11, 'Superior City View', '01 Oct - 31 Oct 26', '2026-10-01', '2026-10-31', NULL, 2475.00, 4),
(11, 'Superior City View', '01 Nov - 30 Nov 26', '2026-11-01', '2026-11-30', NULL, 3995.00, 5),
(11, 'Superior Ocean View', '15 Apr - 30 Apr 26', '2026-04-15', '2026-04-30', NULL, 3525.00, 6),
(11, 'Superior Ocean View', '01 May - 30 Jun 26', '2026-05-01', '2026-06-30', NULL, 2160.00, 7),
(11, 'Superior Ocean View', '01 Jul - 31 Aug 26', '2026-07-01', '2026-08-31', NULL, 3055.00, 8),
(11, 'Superior Ocean View', '01 Sep - 30 Sep 26', '2026-09-01', '2026-09-30', NULL, 2340.00, 9),
(11, 'Superior Ocean View', '01 Oct - 31 Oct 26', '2026-10-01', '2026-10-31', NULL, 2700.00, 10),
(11, 'Superior Ocean View', '01 Nov - 30 Nov 26', '2026-11-01', '2026-11-30', NULL, 4250.00, 11),
(11, 'Deluxe City View', '15 Apr - 30 Apr 26', '2026-04-15', '2026-04-30', NULL, 3675.00, 12),
(11, 'Deluxe City View', '01 May - 30 Jun 26', '2026-05-01', '2026-06-30', NULL, 2280.00, 13),
(11, 'Deluxe City View', '01 Jul - 31 Aug 26', '2026-07-01', '2026-08-31', NULL, 3185.00, 14),
(11, 'Deluxe City View', '01 Sep - 30 Sep 26', '2026-09-01', '2026-09-30', NULL, 2470.00, 15),
(11, 'Deluxe City View', '01 Oct - 31 Oct 26', '2026-10-01', '2026-10-31', NULL, 2850.00, 16),
(11, 'Deluxe City View', '01 Nov - 30 Nov 26', '2026-11-01', '2026-11-30', NULL, 4420.00, 17),
(11, 'Deluxe Pool View', '15 Apr - 30 Apr 26', '2026-04-15', '2026-04-30', NULL, 3900.00, 18),
(11, 'Deluxe Pool View', '01 May - 30 Jun 26', '2026-05-01', '2026-06-30', NULL, 2430.00, 19),
(11, 'Deluxe Pool View', '01 Jul - 31 Aug 26', '2026-07-01', '2026-08-31', NULL, 3380.00, 20),
(11, 'Deluxe Pool View', '01 Sep - 30 Sep 26', '2026-09-01', '2026-09-30', NULL, 2633.00, 21),
(11, 'Deluxe Pool View', '01 Oct - 31 Oct 26', '2026-10-01', '2026-10-31', NULL, 3038.00, 22),
(11, 'Deluxe Pool View', '01 Nov - 30 Nov 26', '2026-11-01', '2026-11-30', NULL, 4633.00, 23),
(11, 'Premium Deluxe Pool View', '15 Apr - 30 Apr 26', '2026-04-15', '2026-04-30', NULL, 4163.00, 24),
(11, 'Premium Deluxe Pool View', '01 May - 30 Jun 26', '2026-05-01', '2026-06-30', NULL, 2670.00, 25),
(11, 'Premium Deluxe Pool View', '01 Jul - 31 Aug 26', '2026-07-01', '2026-08-31', NULL, 3608.00, 26),
(11, 'Premium Deluxe Pool View', '01 Sep - 30 Sep 26', '2026-09-01', '2026-09-30', NULL, 2893.00, 27),
(11, 'Premium Deluxe Pool View', '01 Oct - 31 Oct 26', '2026-10-01', '2026-10-31', NULL, 3338.00, 28),
(11, 'Premium Deluxe Pool View', '01 Nov - 30 Nov 26', '2026-11-01', '2026-11-30', NULL, 4973.00, 29),
(11, 'Deluxe Family Suite', '15 Apr - 30 Apr 26', '2026-04-15', '2026-04-30', NULL, 4650.00, 30),
(11, 'Deluxe Family Suite', '01 May - 30 Jun 26', '2026-05-01', '2026-06-30', NULL, 3060.00, 31),
(11, 'Deluxe Family Suite', '01 Jul - 31 Aug 26', '2026-07-01', '2026-08-31', NULL, 4030.00, 32),
(11, 'Deluxe Family Suite', '01 Sep - 30 Sep 26', '2026-09-01', '2026-09-30', NULL, 3315.00, 33),
(11, 'Deluxe Family Suite', '01 Oct - 31 Oct 26', '2026-10-01', '2026-10-31', NULL, 3825.00, 34),
(11, 'Deluxe Family Suite', '01 Nov - 30 Nov 26', '2026-11-01', '2026-11-30', NULL, 5525.00, 35);

-- [13] Centara Kata Resort Phuket  (30 rates)
INSERT INTO `hotel_rates` (`hotel_id`,`room_type`,`period_label`,`period_start`,`period_end`,`meal_plan`,`price`,`sort_order`) VALUES
(13, 'Deluxe Garden View', '02 Feb - 28 Feb 26', '2026-02-02', '2026-02-28', NULL, 4905.00, 0),
(13, 'Deluxe Garden View', '01 Mar - 31 Mar 26', '2026-03-01', '2026-03-31', NULL, 3150.00, 1),
(13, 'Deluxe Garden View', '01 Apr - 30 Apr 26', '2026-04-01', '2026-04-30', NULL, 2975.00, 2),
(13, 'Deluxe Garden View', '01 May - 30 Jun 26; 01 Sep - 31 Oct 26', '2026-05-01', '2026-06-30', NULL, 1590.00, 3),
(13, 'Deluxe Garden View', '01 Jul - 31 Aug 26', '2026-07-01', '2026-08-31', NULL, 2100.00, 4),
(13, 'Deluxe Garden View', '01 Nov - 23 Dec 26', '2026-11-01', '2026-12-23', NULL, 3060.00, 5),
(13, 'Deluxe Pool Access', '02 Feb - 28 Feb 26', '2026-02-02', '2026-02-28', NULL, 5175.00, 6),
(13, 'Deluxe Pool Access', '01 Mar - 31 Mar 26', '2026-03-01', '2026-03-31', NULL, 3420.00, 7),
(13, 'Deluxe Pool Access', '01 Apr - 30 Apr 26', '2026-04-01', '2026-04-30', NULL, 3230.00, 8),
(13, 'Deluxe Pool Access', '01 May - 30 Jun 26; 01 Sep - 31 Oct 26', '2026-05-01', '2026-06-30', NULL, 1770.00, 9),
(13, 'Deluxe Pool Access', '01 Jul - 31 Aug 26', '2026-07-01', '2026-08-31', NULL, 2280.00, 10),
(13, 'Deluxe Pool Access', '01 Nov - 23 Dec 26', '2026-11-01', '2026-12-23', NULL, 3273.00, 11),
(13, 'Family Room Garden View', '02 Feb - 28 Feb 26', '2026-02-02', '2026-02-28', NULL, 5445.00, 12),
(13, 'Family Room Garden View', '01 Mar - 31 Mar 26', '2026-03-01', '2026-03-31', NULL, 3645.00, 13),
(13, 'Family Room Garden View', '01 Apr - 30 Apr 26', '2026-04-01', '2026-04-30', NULL, 3443.00, 14),
(13, 'Family Room Garden View', '01 May - 30 Jun 26; 01 Sep - 31 Oct 26', '2026-05-01', '2026-06-30', NULL, 1920.00, 15),
(13, 'Family Room Garden View', '01 Jul - 31 Aug 26', '2026-07-01', '2026-08-31', NULL, 2430.00, 16),
(13, 'Family Room Garden View', '01 Nov - 23 Dec 26', '2026-11-01', '2026-12-23', NULL, 3528.00, 17),
(13, 'Family Room Pool Access', '02 Feb - 28 Feb 26', '2026-02-02', '2026-02-28', NULL, 5625.00, 18),
(13, 'Family Room Pool Access', '01 Mar - 31 Mar 26', '2026-03-01', '2026-03-31', NULL, 3870.00, 19),
(13, 'Family Room Pool Access', '01 Apr - 30 Apr 26', '2026-04-01', '2026-04-30', NULL, 3655.00, 20),
(13, 'Family Room Pool Access', '01 May - 30 Jun 26; 01 Sep - 31 Oct 26', '2026-05-01', '2026-06-30', NULL, 2070.00, 21),
(13, 'Family Room Pool Access', '01 Jul - 31 Aug 26', '2026-07-01', '2026-08-31', NULL, 2580.00, 22),
(13, 'Family Room Pool Access', '01 Nov - 23 Dec 26', '2026-11-01', '2026-12-23', NULL, 3740.00, 23),
(13, 'One Bedroom Premium Suite Garden View', '02 Feb - 28 Feb 26', '2026-02-02', '2026-02-28', NULL, 7380.00, 24),
(13, 'One Bedroom Premium Suite Garden View', '01 Mar - 31 Mar 26', '2026-03-01', '2026-03-31', NULL, 5175.00, 25),
(13, 'One Bedroom Premium Suite Garden View', '01 Apr - 30 Apr 26', '2026-04-01', '2026-04-30', NULL, 4888.00, 26),
(13, 'One Bedroom Premium Suite Garden View', '01 May - 30 Jun 26; 01 Sep - 31 Oct 26', '2026-05-01', '2026-06-30', NULL, 2670.00, 27),
(13, 'One Bedroom Premium Suite Garden View', '01 Jul - 31 Aug 26', '2026-07-01', '2026-08-31', NULL, 3450.00, 28),
(13, 'One Bedroom Premium Suite Garden View', '01 Nov - 23 Dec 26', '2026-11-01', '2026-12-23', NULL, 4888.00, 29);

-- [12] Centara Villas Phuket  (6 rates)
INSERT INTO `hotel_rates` (`hotel_id`,`room_type`,`period_label`,`period_start`,`period_end`,`meal_plan`,`price`,`sort_order`) VALUES
(12, 'Deluxe Villa Garden Room', '01 Mar 2026 - 30 Apr 2026', '2026-03-01', '2026-04-30', NULL, 3450.00, 0),
(12, 'Deluxe Villa Garden Room', '01 May 2026 - 30 Jun 2026; 01 Sep 2026 - 31 Oct 2026', '2026-05-01', '2026-06-30', NULL, 2240.00, 1),
(12, 'Deluxe Villa Garden Room', '01 Jul 2026 - 31 Aug 2026', '2026-07-01', '2026-08-31', NULL, 3220.00, 2),
(12, 'Deluxe Villa Ocean View', '01 Mar 2026 - 30 Apr 2026', '2026-03-01', '2026-04-30', NULL, 3638.00, 3),
(12, 'Deluxe Villa Ocean View', '01 May 2026 - 30 Jun 2026; 01 Sep 2026 - 31 Oct 2026', '2026-05-01', '2026-06-30', NULL, 2450.00, 4),
(12, 'Deluxe Villa Ocean View', '01 Jul 2026 - 31 Aug 2026', '2026-07-01', '2026-08-31', NULL, 3395.00, 5);

-- [14] Wyndham Garden Naithon Phuket  (20 rates)
INSERT INTO `hotel_rates` (`hotel_id`,`room_type`,`period_label`,`period_start`,`period_end`,`meal_plan`,`price`,`sort_order`) VALUES
(14, 'Standard Room', 'Low Season (18 Apr – 31 Oct)', '2026-04-18', '2026-10-31', NULL, 2200.00, 0),
(14, 'Standard Room', 'High Season (21 Jan – 11 Apr)', '2026-01-21', '2026-04-11', NULL, 4200.00, 1),
(14, 'Superior Room', 'Low Season (18 Apr – 31 Oct)', '2026-04-18', '2026-10-31', NULL, 2500.00, 2),
(14, 'Superior Room', 'High Season (21 Jan – 11 Apr)', '2026-01-21', '2026-04-11', NULL, 4500.00, 3),
(14, 'Deluxe Pool View', 'Low Season (18 Apr – 31 Oct)', '2026-04-18', '2026-10-31', NULL, 2800.00, 4),
(14, 'Deluxe Pool View', 'High Season (21 Jan – 11 Apr)', '2026-01-21', '2026-04-11', NULL, 4800.00, 5),
(14, 'One Bedroom Suite', 'Low Season (18 Apr – 31 Oct)', '2026-04-18', '2026-10-31', NULL, 4500.00, 6),
(14, 'One Bedroom Suite', 'High Season (21 Jan – 11 Apr)', '2026-01-21', '2026-04-11', NULL, 7500.00, 7),
(14, 'Deluxe Room', '1 Apr 2026 - 30 Apr 2026', '2026-04-01', '2026-04-30', NULL, 2700.00, 8),
(14, 'Deluxe Room', '1 May - 30 Jun 2026 / 1 Sep - 31 Oct 2026', '2026-05-01', '2026-10-31', NULL, 2000.00, 9),
(14, 'Deluxe Room', '1 Jul - 31 Aug 2026', '2026-07-01', '2026-08-31', NULL, 2200.00, 10),
(14, 'Premium Deluxe', '1 Apr 2026 - 30 Apr 2026', '2026-04-01', '2026-04-30', NULL, 3200.00, 11),
(14, 'Premium Deluxe', '1 May - 30 Jun 2026 / 1 Sep - 31 Oct 2026', '2026-05-01', '2026-10-31', NULL, 2500.00, 12),
(14, 'Premium Deluxe', '1 Jul - 31 Aug 2026', '2026-07-01', '2026-08-31', NULL, 2700.00, 13),
(14, 'Deluxe Pool Access', '1 Apr 2026 - 30 Apr 2026', '2026-04-01', '2026-04-30', NULL, 3700.00, 14),
(14, 'Deluxe Pool Access', '1 May - 30 Jun 2026 / 1 Sep - 31 Oct 2026', '2026-05-01', '2026-10-31', NULL, 3000.00, 15),
(14, 'Deluxe Pool Access', '1 Jul - 31 Aug 2026', '2026-07-01', '2026-08-31', NULL, 3200.00, 16),
(14, 'One Bedroom Suite', '1 Apr 2026 - 30 Apr 2026', '2026-04-01', '2026-04-30', NULL, 5500.00, 17),
(14, 'One Bedroom Suite', '1 May - 30 Jun 2026 / 1 Sep - 31 Oct 2026', '2026-05-01', '2026-10-31', NULL, 4500.00, 18),
(14, 'One Bedroom Suite', '1 Jul - 31 Aug 2026', '2026-07-01', '2026-08-31', NULL, 4700.00, 19);

-- [10] Woraburi Phuket Resort & Spa  (16 rates)
INSERT INTO `hotel_rates` (`hotel_id`,`room_type`,`period_label`,`period_start`,`period_end`,`meal_plan`,`price`,`sort_order`) VALUES
(10, 'Superior Room', 'Low Season (01 May - 31 Oct)', '2026-05-01', '2026-10-31', NULL, 2100.00, 0),
(10, 'Superior Room', 'Shoulder Season (01 Mar - 30 Apr)', '2026-03-01', '2026-04-30', NULL, 2700.00, 1),
(10, 'Superior Room', 'High Season (01 Nov - 23 Dec / 11 Jan - 28 Feb)', '2025-11-01', '2026-02-28', NULL, 3300.00, 2),
(10, 'Superior Room', 'Peak Season (24 Dec - 10 Jan)', '2025-12-24', '2026-01-10', NULL, 4200.00, 3),
(10, 'Deluxe Room', 'Low Season (01 May - 31 Oct)', '2026-05-01', '2026-10-31', NULL, 2400.00, 4),
(10, 'Deluxe Room', 'Shoulder Season (01 Mar - 30 Apr)', '2026-03-01', '2026-04-30', NULL, 3000.00, 5),
(10, 'Deluxe Room', 'High Season (01 Nov - 23 Dec / 11 Jan - 28 Feb)', '2025-11-01', '2026-02-28', NULL, 3600.00, 6),
(10, 'Deluxe Room', 'Peak Season (24 Dec - 10 Jan)', '2025-12-24', '2026-01-10', NULL, 4500.00, 7),
(10, 'Deluxe Pool Access', 'Low Season (01 May - 31 Oct)', '2026-05-01', '2026-10-31', NULL, 3200.00, 8),
(10, 'Deluxe Pool Access', 'Shoulder Season (01 Mar - 30 Apr)', '2026-03-01', '2026-04-30', NULL, 4200.00, 9),
(10, 'Deluxe Pool Access', 'High Season (01 Nov - 23 Dec / 11 Jan - 28 Feb)', '2025-11-01', '2026-02-28', NULL, 5200.00, 10),
(10, 'Deluxe Pool Access', 'Peak Season (24 Dec - 10 Jan)', '2025-12-24', '2026-01-10', NULL, 6500.00, 11),
(10, 'Junior Suite', 'Low Season (01 May - 31 Oct)', '2026-05-01', '2026-10-31', NULL, 4500.00, 12),
(10, 'Junior Suite', 'Shoulder Season (01 Mar - 30 Apr)', '2026-03-01', '2026-04-30', NULL, 6000.00, 13),
(10, 'Junior Suite', 'High Season (01 Nov - 23 Dec / 11 Jan - 28 Feb)', '2025-11-01', '2026-02-28', NULL, 7500.00, 14),
(10, 'Junior Suite', 'Peak Season (24 Dec - 10 Jan)', '2025-12-24', '2026-01-10', NULL, 9000.00, 15);

-- [18] NH Boat Lagoon Phuket Resort  (5 rates)
INSERT INTO `hotel_rates` (`hotel_id`,`room_type`,`period_label`,`period_start`,`period_end`,`meal_plan`,`price`,`sort_order`) VALUES
(18, 'Deluxe Room', '01 April 2026 - 31 Oct 2026', '2026-04-01', '2026-10-31', NULL, 2100.00, 0),
(18, 'Grand Deluxe Room', '01 April 2026 - 31 Oct 2026', '2026-04-01', '2026-10-31', NULL, 2600.00, 1),
(18, 'Premier Room', '01 April 2026 - 31 Oct 2026', '2026-04-01', '2026-10-31', NULL, 2600.00, 2),
(18, 'Deluxe Lagoon View', '01 April 2026 - 31 Oct 2026', '2026-04-01', '2026-10-31', NULL, 2900.00, 3),
(18, 'Family Suite (2 Bedrooms)', '01 April 2026 - 31 Oct 2026', '2026-04-01', '2026-10-31', NULL, 5500.00, 4);

-- [29] The Nature Phuket  (14 rates)
INSERT INTO `hotel_rates` (`hotel_id`,`room_type`,`period_label`,`period_start`,`period_end`,`meal_plan`,`price`,`sort_order`) VALUES
(29, 'Deluxe', 'Now – 31 March 2026', NULL, '2026-03-31', NULL, 5100.00, 0),
(29, 'Deluxe', '01 April – 31 October 2026', '2026-04-01', '2026-10-31', NULL, 3400.00, 1),
(29, 'Deluxe Pool View', 'Now – 31 March 2026', NULL, '2026-03-31', NULL, 5500.00, 2),
(29, 'Deluxe Pool View', '01 April – 31 October 2026', '2026-04-01', '2026-10-31', NULL, 3800.00, 3),
(29, 'Deluxe Partial Sea View', 'Now – 31 March 2026', NULL, '2026-03-31', NULL, 6100.00, 4),
(29, 'Deluxe Partial Sea View', '01 April – 31 October 2026', '2026-04-01', '2026-10-31', NULL, 4400.00, 5),
(29, 'Deluxe Pool Access', 'Now – 31 March 2026', NULL, '2026-03-31', NULL, 6300.00, 6),
(29, 'Deluxe Pool Access', '01 April – 31 October 2026', '2026-04-01', '2026-10-31', NULL, 4600.00, 7),
(29, 'Deluxe Private Jacuzzi', 'Now – 31 March 2026', NULL, '2026-03-31', NULL, 6500.00, 8),
(29, 'Deluxe Private Jacuzzi', '01 April – 31 October 2026', '2026-04-01', '2026-10-31', NULL, 4800.00, 9),
(29, 'Junior Suite', 'Now – 31 March 2026', NULL, '2026-03-31', NULL, 9000.00, 10),
(29, 'Junior Suite', '01 April – 31 October 2026', '2026-04-01', '2026-10-31', NULL, 6300.00, 11),
(29, 'Grand Suite Two-Bedroom', 'Now – 31 March 2026', NULL, '2026-03-31', NULL, 12600.00, 12),
(29, 'Grand Suite Two-Bedroom', '01 April – 31 October 2026', '2026-04-01', '2026-10-31', NULL, 9900.00, 13);

-- Hotel-level conditions (free text)
UPDATE `hotels` SET `rate_validity`=NULL, `child_policy`='- Child: 500 THB
Children Policy:
- 4–11.99 yrs: Pay child rate (can share bed)', `rate_terms`='Terms & Conditions:
- Rates are in THB, inclusive of tax & service charge
- Non-commissionable
- Rates subject to change if government taxes change
- Minimum stay: 3 nights (30 Dec 2025 – 01 Jan 2026)
Cancellation Policy:
**Late cancel / No-show: 100% charge
- Adult: 1,000 THB
- Some room types: No extra bed allowed
- 0–3.99 yrs: Free (incl. breakfast)
- 12+ yrs: Adult
- Chinese New Year: 500 THB/night
- Songkran: 300 THB/night
Check-in / Check-out:
- Check-in: 15:00
- Check-out: 12:00
- Late check-out: 300 THB/hour (after 18:00 = full night)' WHERE `id`=26;
UPDATE `hotels` SET `rate_validity`=NULL, `child_policy`='- Child: 500 THB
Children Policy:
- 4–11.99 yrs: Pay child rate (sharing bed allowed)', `rate_terms`='THE MARINA PHUKET
Terms & Conditions:
Rates in THB, inclusive of tax & service
Cancellation Policy:
➡️ Late cancel / No-show: 100% charge
- Adult: 1,000 THB
- Some room types: No extra bed allowed
- 0–3.99 yrs: Free (incl. breakfast)
- 12+ yrs: Adult
- Chinese New Year: 500 THB/night
- Songkran: 300 THB/night
Check-in / Check-out:
- Check-in: 15:00
- Check-out: 12:00
- Late check-out: 300 THB/hour' WHERE `id`=24;
UPDATE `hotels` SET `rate_validity`='Validity
Validity From', `child_policy`='(For children aged 4–11.99 years old is 50% charge)
Children Policy:
- Maximum children:
- 2 children only in One Bedroom Suite / City View
- 1st child: share bed
- 2nd child: must take extra bed', `rate_terms`='Terms & Conditions:
Supplement charge at THB 1,000 net/room/night will apply for stays during 12th – 19th April 2026.
Extra Bed Supplement is available for One Bedroom Suite & One Bedroom Suite City View ONLY.
THB 1,200 net per person per night, inclusive of breakfast
THB 1,000 net per person per night, without breakfast
General Terms & Conditions:
Rates are inclusive of tax & service charge
Applicable for FIT only (max 15 pax / 8 rooms)
Max 2 breakfasts per room (adults)
Songkran surcharge:
Group & MICE rates: on request
Allotments subject to quarterly review
Check-in / Check-out:
Late check-out (12:01–18:00)
Late check-out (after 18:00)
Full night charge
Cancellation Policy
MEAL RATE PLAN:
Breakfast (Buffet) Adult
Lunch (Set Menu) Adult
Dinner (Set Menu) Adult
Christmas Eve Dinner
New Year’s Eve Dinner
- Below 3 years: Free breakfast (ABF)
- 4–11.99 years:
- Sharing bed → compulsory breakfast 175 THB
- 12+ years: Adult' WHERE `id`=23;
UPDATE `hotels` SET `rate_validity`=NULL, `child_policy`='Children Policy:
- Below 3 years: Free ABF
- 4–11.99 years:
     - Sharing bed → 175 THB breakfast
- Max 2 children per room
    - 1st child: sharing bed
    - 2nd child: must take extra bed
- 12+ years: Adult

Important:
- Pool access / pool front rooms → Hotel not responsible for child safety', `rate_terms`='QUALITY BEACH RESORT & SPA
Terms & Conditions:
Rates are THB / room / night
Inclusive of government tax & service charge
Valid for FIT only (max 15 pax / 8 rooms)
Max 2 breakfasts per room (adults)
Allotments subject to quarterly review
Cancellation Policy:
Late cancellation / No-show / Early departure: 100% charge
Check-in / Check-out:
Late check-out (12:01–18:00)
Full night charge
Songkran (12–19 April 2026): 1,000 THB / room / night
Without breakfast' WHERE `id`=22;
UPDATE `hotels` SET `rate_validity`=NULL, `child_policy`='Children Policy:
- Pool Access rooms NOT allowed for children under 13 yrs
Child (4–11.99 yrs)
1 adult / 2 children', `rate_terms`='Rate Inclusions
- Breakfast included:
       - 2 persons (standard rooms)
       - 4 persons (Family Suites)
- Free Wi-Fi throughout resort
- Inclusive of:
       - 10% Service Charge
       - 7% Government Tax
- 0–3.99 yrs: Free breakfast
- 4–11.99 yrs: Sharing bed → 200 THB breakfast
- 12+ yrs: Adult
CANCELLATION POLICY
Late cancellation / No-show: 100% charge
CHECK-IN & CHECK-OUT
Early Check-in:
- Guaranteed: Full night charge
Full night charge
50% until 18:00
Deposit: 3,000 THB or 100 USD per stay (upon arrival)' WHERE `id`=27;
UPDATE `hotels` SET `rate_validity`=NULL, `child_policy`='Children Policy:', `rate_terms`='CANCELLATION POLICY
Low Season (Apr – Oct)
High Season (Nov – Mar)
Peak Season (24 Dec – 10 Jan)
3 days → 1 night charge
Extra Bed with Breakfast
Extra Bed without Breakfast
- 0–3.99 years: Free
- 4–11.99 years: Sharing bed → breakfast charge applicable
- 12+ years: Adult
Full payment 30 days prior
Full payment 14 days prior
CHECK-IN & CHECK-OUT
Late Check-out:
Until 18:00 → 50% charge
After 18:00 → Full night charge
Rate Inclusions:
- Breakfast included:
- 2 pax (standard)
- 3 pax (Triple)
- 4 pax (Quad / 2BR)
- Inclusive of tax & service
- Non-commissionable
Special Conditions:' WHERE `id`=21;
UPDATE `hotels` SET `rate_validity`='(Asian Market | 01 Apr – 31 Oct 2026)
Applicable for: Asian Market only
Stay period: 01 Apr – 31 Oct 2026', `child_policy`='Value Add Benefits: 1 child (1–11 yrs) stays FREE incl. breakfast (sharing bed)', `rate_terms`='Promotion Conditions
Package use only
Minimum stay: 2 nights
Special Offers: Stay 3 consecutive nights → Free upgrade (subject to availability)
- ISLA Restaurant
- NORA Beach Club (à la carte only)
- 15% discount on Lom Talay Spa
- Free room decoration: Honeymoon / Birthday / Anniversary (on request)
Rate Conditions
- FIT only (1–9 rooms)
- Must be sold as package only
- Includes breakfast at Isla Restaurant
- 10% service charge
- 1% provincial tax
- 7% government tax
- Non-commissionable
- Valid for new bookings only
- Cannot combine with other promotions
- Promo code required: ASPRO' WHERE `id`=20;
UPDATE `hotels` SET `rate_validity`=NULL, `child_policy`='Children Policy
Max 1 child per room
2 Adults + 1 Child', `rate_terms`='Valid for FIT only (max 5 rooms)
Group = 6+ rooms
Group rates: on request
Minimum markup required: 20% for resale
Rates must be sold as package (not standalone)
Strictly confidential rates
≤ 6 years: Free (sharing bed)
≥ 7 years: Considered adult (no bed sharing allowed)
Extra Bed: ❌ No extra bed allowed
Minimum Stay: Peak Season → 3 nights required
Late cancellation / No-show: 100% charge
Important Notes:
Early check-in before 14:00 → full night charge
Guest profile form required before arrival' WHERE `id`=17;
UPDATE `hotels` SET `rate_validity`='Market: Indian Market
Selling Period: 01 April – 31 October 2026
Staying Period: 01 April – 31 October 2026
Booking Code: SPAO26', `child_policy`='Booking Policy:
Allotment: Free Sale with 01 day cut off until receiving of the Stop Sale Schedule.
Upgrade Policy:
Booking made on Deluxe Room will be free upgrade to Premier Pool View.
Child Policy:
Free extra bed or sofa bed includes breakfast for children (5 – 11.99 years), only applicable for the following room categories:
Premier Pool View → free upgrade to Premier Plus Pool View
Premier Sea View → free upgrade to Premier Plus Sea View
Premier Pool Access → free upgrade to Premier Plus Pool Access
The above contract room rates are GROSS per night in Thai Baht, inclusive of:
10% service charge
8% government tax
Non-commissionable
Rates include breakfast for 2 persons (Standard OCC).
Safety Note:
Pool Access room type – children must be supervised at all times while in the room and near the pool area during stay.
Extra Bed (Child)
Child: THB 700 (incl. breakfast)
Child (5–11.99): THB 450 / person / night
Child Policy:', `rate_terms`='SUMMER PROMOTION
General Information:
Extra Bed (Sofa Bed)
Extra Breakfast (Adult)
01st November 2026 – 31st October 2027 (single/double occupancy)
High-season 101st Nov – 24th Dec 26
Peak season25th Dec 26 – 08th Jan 27
High-season 209th Jan – 31st Mar 27
Low-season01st Apr – 31st Oct 27
Extra Bed (Adult)
Meal Supplements:
Key Room & Stay Policies
Extra Bed Pricing
Half Board (Lunch OR Dinner):
Adult: THB 1,400 (incl. breakfast)
Adult (12+): THB 900 / person / night
10% service charge
8% government tax
Max: 1 extra bed per room
Rates are non-commissionable
Full Board (Lunch + Dinner):
Peak Season Rules
Adult (12+): THB 1,800 / person / night
No Extra Bed Allowed In:
Minimum stay: 4 nights
No check-out allowed:
Important Notes:
Rates include breakfast
Excludes drinks (soft drinks, alcohol)
Infants (0–4.99 yrs): Free meals
Separate menus for HB/FB guests
Allotment (Rooms Per Day)
High & Peak Season
Premier Sea View
2BR Grand Suite
2BR Executive Suite
2BR Imperial Suite
Cut-off Periods:
- Peak: 45 days
- High Season 2: 14 days
- High Season 1: 10 days
- Low Season: 5 days
CANCELLATION POLICY
Cancellation Deadline
- 5–12 yrs (no bed): THB 250 (breakfast only)
- 5–12 yrs (extra bed): THB 700 (incl. breakfast)
- 0–4.99 yrs: Free stay
- Baby cot: Free
Value Adds / Benefits:
Special Guest Benefits:
- Daily breakfast (max 2 pax)
- Honeymoon: amenities + bed decor + fruit basket
- Welcome drink + cold towel
- 2BR & Grand Suite: VIP amenities + decor + flowers
- Free shuttle to Boat Avenue
- Executive & Imperial Suites:
- Free high-speed WiFi
- VIP amenities
- Free Kids Club & Fitness Center
- Flower arrangement
- Beach/pool towels provided
- Sparkling wine
- Smart TV / entertainment
- Turndown service
No-Show Policy:
- Peak & High 1: 100% of full stay
- High 2: 100% of full stay
- Low Season: 100% per room
Check-in / Check-out
Check-in: 14:00
Early check-in: 100% charge
Check-out: 12:00
Late Check-out:
Until 18:00 → 50% charge
After 18:00 → 100% charge
Early Check-out: Charged 100% of remaining stay' WHERE `id`=15;
UPDATE `hotels` SET `rate_validity`='Sales Period: 02 Feb 2026 – 30 Apr 2026
Period of Stay: 02 Feb 2026 – 31 Oct 2026
Exception Period: 14 Feb 2026 – 21 Feb 2026 / 03 Apr 2026 – 14 Apr 2026
Market: Worldwide except Chinese speaking and Thai.
Booking Code: CPBR-000639', `child_policy`='Children & Extra Bed Policy:
Children (Under 12 years): Up to 2 children stay free on bed & breakfast basis when sharing existing bedding.
Extra Bed Child (2-11 years)
Child (2-12 years)
- Club Access: Premier Suite and Villas include Club Level access. Other rooms can upgrade for THB 1,000 (Adult) / THB 500 (Child) per night.', `rate_terms`='CENTARA GRAND BEACH ESORT PHUKET
Groups: This offer cannot be applied for Groups.
Package Requirement: Rates must be bundled with a package (Air Ticket, Accommodation, Excursion, etc.).
Advertising: Rates may not be advertised on a room-rate-only basis or via internet distribution without written approval.
New Bookings Only: Cancellation and rebooking of existing reservations are not permitted.
Extra Bed Requirements: Applicable extra bed charges apply if required.
Room Type (Max Occupancy)
Extra Bed Adult
Deluxe (3A or 2A+2C)
Deluxe Ocean View (3A or 2A+2C)
Premium Deluxe (2A)
Deluxe Spa / Deluxe Spa Ocean View (2A)
Premier Spa (3A or 2A+2C)
Deluxe Suite / Premier Suite Private Pool (3A or 2A+2C)
Villa One Bedroom Private Pool (3A or 2A+1C)
Villa Two Bedroom Private Pool (5A or 4A+3C)
Infant (< 2 years)
American Breakfast
Half Board (Lunch or Dinner)
Full Board (Lunch + Dinner)
Christmas Eve Dinner (Optional)
New Year Eve Dinner (Compulsory)
Cancellation Notification (No Charge)
Full Pre-payment Required
At least 7 days prior
Shoulder Season
At least 14 days prior
At least 21 days prior
At least 30 days prior
Important Notes & Club Benefits:
- Club Benefits: Private check-in, continental breakfast, afternoon tea, evening cocktails (5:30 PM - 7:00 PM), and 10% discount at SPA Cenvaree.
- Check-in: Early check-in and room availability are subject to hotel reports.' WHERE `id`=16;
UPDATE `hotels` SET `rate_validity`='Validity:
Sales Period: 02 Feb 2026 – 30 Apr 2026
Period of Stay: 15 Apr 2026 – 30 Nov 2026
Exception Period: N/A
Market: Worldwide except Chinese speaking and Thai.
Booking Code: "CKR-000635"
- Issued Date: 02 February 2026.', `child_policy`=NULL, `rate_terms`='Special Offer Details:
Condition: Apply for new bookings only. Cancellation and rebooking of existing reservations are not permitted.
Exclusions: This offer cannot be applied for Groups. Not combinable with contracted EBO, Super EBO, or tactical deals.
Important Notes:
- Other terms & conditions are as per the main contract.
- Rates are subject to existing stop sales and any new stop sales introduced by the hotel.' WHERE `id`=11;
UPDATE `hotels` SET `rate_validity`='Validity:
Sales Period: 02 Feb 2026 – 30 Apr 2026
Period of Stay: 02 Feb 2026 – 23 Dec 2026
Exception Period: N/A
Market: Worldwide except Chinese speaking and Thai.
Booking Code: "CKT-000527"
Issued Date: 02 February 2026.', `child_policy`=NULL, `rate_terms`='Special Offer Details:
Condition: Apply for new bookings only. Cancellation and rebooking of existing reservations are not permitted.
Exclusions: This offer cannot be applied for Groups. Not combinable with contracted EBO, Super EBO, or tactical deals.
Important Notes:
Other terms & conditions are as per the main contract.
Rates are subject to existing stop sales and any new stop sales introduced by the hotel.' WHERE `id`=13;
UPDATE `hotels` SET `rate_validity`='Validity:
Sales Period: 02 Feb 2026 – 30 Apr 2026
Period of Stay: 01 Mar 2026 – 31 Oct 2026
Blackout date: N/A
Market: Worldwide markets (as per main contract) except Chinese speaking and Thai.
Booking Code: "CVP-000396"
Issued Date: 02 February 2026', `child_policy`=NULL, `rate_terms`='Special Offer Details:
Condition: Apply for new bookings only. Cancellation and rebooking of existing reservations are not permitted; such reservations will be rejected.
Exclusions: This offer cannot be applied for Groups. It is not combinable with contracted EBO, Super EBO offers, or any tactical deals/promotions.
Additional Information:
Other terms and conditions are as per the main contract.
Rates are subject to existing stop sales and any new stop sales introduced by the individual hotel.' WHERE `id`=12;
UPDATE `hotels` SET `rate_validity`='FIT STATIC RATE AGREEMENT - WORLDWIDE MARKET
Validity: 21 January 2026 – 31 October 2026
Market: Worldwide Market
Applicable Market: WW (Worldwide)
Stay Period: 1 April 2026 – 31 October 2026', `child_policy`='Children Policy:
Under 12 years: Free of charge when sharing bed with parents (max 1 child per room).
Breakfast for Child: 50% discount from adult rate (for children 4-12 years).
2 Adults + 1 Child
2 Adults + 2 Children', `rate_terms`='Peak Season (N/A for this offer)
(Note: Seasons for this specific contract are defined as High: 21 Jan - 11 Apr 2026 and Low: 18 Apr - 31 Oct 2026)
Eligibility: Valid for FIT only (max 5 rooms). Group rates (6+ rooms) on request.
Markup: Minimum markup required: 20% for resale.
Condition: Rates must be sold as a package (not standalone).
Confidentiality: Strictly confidential rates.
12 years and above: Considered adult (extra bed required).
Occupancy & Extra Bed
Extra Bed Policy
THB 1,000 (inc. breakfast)
Cancellation & No-Show Policy:
Minimum Stay: 3 nights required during Peak/Festive periods (if applicable).
Cancellation Notification
At least 7 days prior
100% of entire stay if late
At least 14 days prior
At least 30 days prior
Important Notes:
Check-in: 14:00 | Check-out: 12:00.
Early Check-in: Before 14:00 is subject to availability; full night charge for guaranteed early arrival.
Late Check-out: Until 18:00 at 50% charge; after 18:00 at 100% charge.
Payment: Full pre-payment required 14 days prior to arrival for Low/High seasons.
SUMMER PROMOTION
Promotion Details:
Promotion Name: SUMMER PROMO 2026
Promotion Code: SUMMERPRO
Minimum Stay: *Consecutive 2 nights
Terms & Conditions:
Resale Condition: Rates are nett inclusive of 10% Service Charge and 7% Government Tax.
Package Requirement: These rates are confidential and must be sold as part of a package.
Combinability: This promotion is NOT combinable with any other promotions or offers.
Supersedes: This promotion supersedes all previous promotions for all or some of the same period.
Applicability: This promotion applies for FIT up to 9 rooms only.
Rebooking Policy: Any existing bookings that are cancelled and rebooked under the same guest''s name will be confirmed under the original rate booked automatically.
Booking Protocol: If the promotion name "SUMMER PROMO 2026" or code "SUMMERPRO" is not mentioned upon making reservations or stated in the vouchers, bookings will be confirmed under the FIT Static Rate Agreement automatically.
Close Out: The hotel reserves the right to "Close Sale" at any given time within 24 hours written notification.' WHERE `id`=14;
UPDATE `hotels` SET `rate_validity`='Date of Issue: 4 November 2025
Validity: 01 November 2025 – 31 October 2026
Market: Worldwide (FIT Only)', `child_policy`='Extra Bed & Children Policy:
Extra Bed (Child 4-12 yrs): THB 500 per night (includes breakfast).
Child (Under 4 yrs): Free of charge when sharing existing bedding with parents.
Maximum Occupancy: 3 Adults OR 2 Adults + 1 Child per room.
Christmas Eve (24 Dec): Adult THB 3,500 | Child (4-12 yrs) THB 1,750
New Year’s Eve (31 Dec): Adult THB 4,500 | Child (4-12 yrs) THB 2,250', `rate_terms`='General Information
Resort Address: 198, 200 Karon Beach, Patak Road, Karon, Phuket 83100 Thailand
Extra Bed (Adult): THB 1,000 per night (includes breakfast).
Compulsory Gala Dinner:
Terms & Conditions:
Minimum Stay: 3 consecutive nights required during Peak Season (24 Dec - 10 Jan).
Check-in/Out: Check-in 14:00 | Check-out 12:00.
B2C Policy: Hotel does not permit these rates to be promoted on B2C websites. If a rate disparity is found, the agreement will be terminated.
Reservation: Must be made directly to rsvn@phuketworaburi.com.
Cancellation/No Show:
Low Season: 7 days prior (Penalty: 1 night).
High/Shoulder Season: 14 days prior (Penalty: 2 nights).
Peak Season: 30 days prior (Penalty: 100% of entire stay).
No Show: Charge 100% of the entire stay.' WHERE `id`=10;
UPDATE `hotels` SET `rate_validity`='Validity:
Date of Issue: March 23, 2026
Selling Period: Now – 31 October 2026
Stay Period: 01 April 2026 – 31 October 2026
Applicable Market: Worldwide Market
RB Rate Code: 54WA1BN', `child_policy`='Children & Extra Bed Policy:
Extra Bed (Child 4-11 yrs): THB 500 per person per night (includes breakfast).
Child Policy: * Maximum 1 child under 12 years stays free of charge when sharing existing bedding with parents (room only).', `rate_terms`='Extra Bed (Adult): THB 1,000 per person per night (includes breakfast).
Baby cot is provided free of charge (subject to availability).
Terms & Conditions:
FIT Policy: These rates are applicable for FIT bookings only (not for groups).
Cancellation Policy: * Cancellation made less than 3 days prior to arrival will incur a 1 night penalty.
No-shows will be charged 100% of the entire stay.
Payment: * Full payment is required 7 days prior to arrival unless credit facilities have been established.
For wire transfers, make payable to "Phuket Boat Lagoon Co., Ltd."' WHERE `id`=18;
UPDATE `hotels` SET `rate_validity`=NULL, `child_policy`='- Grand Suite Two-Bedroom includes breakfast for 4 persons.  
- Extra Bed: THB 1,500 (until March 31) or THB 1,200 (starting April 1).  
- Child Breakfast (5–11.99 years): THB 250 per day when sharing existing bedding.', `rate_terms`='MARCH 2026  - OCTOBER 2026
Policies & Conditions:

- Occupancy Restrictions: Deluxe Pool Access and Deluxe Private Jacuzzi rooms are strictly for guests 13 years and older.  

- Check-In/Out: Check-in is at 3:00 PM and check-out is at 12:00 PM.  

- Late Check-Out (Low Season): From 3:00 PM to 6:00 PM, a 50% room charge applies.  

- Cancellations (Low Season): 100% charge if cancelled less than 7 days before arrival.  

- Payment: Full pre-payment is required at least 15 days prior to arrival.  

- Arrival Deposit: A cash deposit of 3,000 THB or 100 USD is required per stay at check-in.
Guest Benefits & Facilities:
Honeymooners: Complimentary flower decoration on the bed, guaranteed King-sized bed, and a welcome drink.
General Benefits: Welcome drink, cold towel, in-room coffee/tea, 24-hour fitness access, and complimentary shuttle to Patong Beach.
Internet: Complimentary basic Wi-Fi throughout the resort; high-speed access is available at an additional cost.' WHERE `id`=29;

COMMIT;
-- TOTAL rates inserted: 493