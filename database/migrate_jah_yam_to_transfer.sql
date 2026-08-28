-- migrate_jah_yam_to_transfer.sql
-- จ๊ะ หยาม กระบี่ is a transfer vendor, but the supplier was created as `type`
-- 'tour' and its rate sheet was typed into `tours` as 45 rows with
-- tour_type = 'Private Transfer'. This moves the sheet onto the transfer tables
-- and flips the supplier, so the vendor shows up on the Transfers screen instead
-- of sitting in the tour list pretending to be day trips.
--
-- Run add_transfer_route_note_key.sql first: five of these routes share an
-- origin, destination and category with another and are told apart only by the
-- enroute city in `note`.
--
-- The 45 source rows are 10 distinct journeys x 3 vehicles, plus 15 duplicates
-- (ids 403-417 repeat 373-387 at identical prices, with departure_from left
-- NULL). Only the 30 distinct prices are carried over.
--
-- Locations and vehicles are shared by every supplier and all six already exist,
-- so nothing is created here: Phuket Airport (HKT), Patong Beach and
-- Krabi / Ao Nang, against Sedan (CAR), SUV and Van (VAN). The routes are new --
-- the sheet already in the tables is Phuket-internal and never crosses to Krabi
-- from these origins.
--
-- Categories follow the existing vocabulary: a plain province crossing is
-- `inter_province`, and one that stops for a city tour on the way is `city_tour`,
-- the same call route 35 makes. The enroute city goes in the label as well as the
-- note because the Routes tab search reads label, origin, destination and
-- category -- not note.
--
-- Re-running is safe for the routes (the unique key absorbs them) but the price
-- inserts would collide, so this is one transaction: it either lands whole or
-- not at all. Note that seed_transfer_data.sql wipes all four transfer tables,
-- so re-running that file discards this migration along with everyone else's
-- rates.

SET @supplier_name = 'จ๊ะ หยาม กระบี่';
SET @supplier_id = (SELECT `id` FROM `suppliers` WHERE `name` = @supplier_name LIMIT 1);

SET @loc_hkt    = (SELECT `id` FROM `transfer_locations` WHERE `name` = 'Phuket Airport (HKT)' LIMIT 1);
SET @loc_patong = (SELECT `id` FROM `transfer_locations` WHERE `name` = 'Patong Beach' LIMIT 1);
SET @loc_aonang = (SELECT `id` FROM `transfer_locations` WHERE `name` = 'Krabi / Ao Nang' LIMIT 1);

SET @v_sedan = (SELECT `id` FROM `transfer_vehicles` WHERE `name` = 'Sedan' LIMIT 1);
SET @v_suv   = (SELECT `id` FROM `transfer_vehicles` WHERE `name` = 'SUV' LIMIT 1);
SET @v_van   = (SELECT `id` FROM `transfer_vehicles` WHERE `name` = 'Van' LIMIT 1);

START TRANSACTION;

-- Ten journeys: four plain crossings and six with an enroute city tour, both
-- directions. sort_order starts at 100 so the block sits after the sheet that is
-- already in the table (max 59) rather than interleaving with it.
INSERT INTO `transfer_routes`
  (`origin_id`, `destination_id`, `category`, `label`, `note`, `sort_order`) VALUES
  (@loc_hkt,    @loc_aonang, 'inter_province', 'Phuket Airport to Krabi / Ao Nang',                        '',                    100),
  (@loc_patong, @loc_aonang, 'inter_province', 'Patong Beach to Krabi / Ao Nang',                          '',                    101),
  (@loc_hkt,    @loc_aonang, 'city_tour',      'Phuket Airport to Krabi / Ao Nang (Enroute Krabi City)',   'Enroute Krabi City',  102),
  (@loc_patong, @loc_aonang, 'city_tour',      'Patong Beach to Krabi / Ao Nang (Enroute Krabi City)',     'Enroute Krabi City',  103),
  (@loc_patong, @loc_aonang, 'city_tour',      'Patong Beach to Krabi / Ao Nang (Enroute Phuket City)',    'Enroute Phuket City', 104),
  (@loc_aonang, @loc_hkt,    'inter_province', 'Krabi / Ao Nang to Phuket Airport',                        '',                    105),
  (@loc_aonang, @loc_patong, 'inter_province', 'Krabi / Ao Nang to Patong Beach',                          '',                    106),
  (@loc_aonang, @loc_hkt,    'city_tour',      'Krabi / Ao Nang to Phuket Airport (Enroute Krabi City)',   'Enroute Krabi City',  107),
  (@loc_aonang, @loc_patong, 'city_tour',      'Krabi / Ao Nang to Patong Beach (Enroute Krabi City)',     'Enroute Krabi City',  108),
  (@loc_aonang, @loc_patong, 'city_tour',      'Krabi / Ao Nang to Patong Beach (Enroute Phuket City)',    'Enroute Phuket City', 109);

-- Resolved by the unique key rather than LAST_INSERT_ID() so the price inserts
-- below stay correct if the routes were already present from an earlier run.
SET @r_hkt_aonang        = (SELECT `id` FROM `transfer_routes` WHERE `origin_id`=@loc_hkt    AND `destination_id`=@loc_aonang AND `category`='inter_province' AND `note`='' LIMIT 1);
SET @r_patong_aonang     = (SELECT `id` FROM `transfer_routes` WHERE `origin_id`=@loc_patong AND `destination_id`=@loc_aonang AND `category`='inter_province' AND `note`='' LIMIT 1);
SET @r_hkt_aonang_kbv    = (SELECT `id` FROM `transfer_routes` WHERE `origin_id`=@loc_hkt    AND `destination_id`=@loc_aonang AND `category`='city_tour' AND `note`='Enroute Krabi City' LIMIT 1);
SET @r_patong_aonang_kbv = (SELECT `id` FROM `transfer_routes` WHERE `origin_id`=@loc_patong AND `destination_id`=@loc_aonang AND `category`='city_tour' AND `note`='Enroute Krabi City' LIMIT 1);
SET @r_patong_aonang_hkt = (SELECT `id` FROM `transfer_routes` WHERE `origin_id`=@loc_patong AND `destination_id`=@loc_aonang AND `category`='city_tour' AND `note`='Enroute Phuket City' LIMIT 1);
SET @r_aonang_hkt        = (SELECT `id` FROM `transfer_routes` WHERE `origin_id`=@loc_aonang AND `destination_id`=@loc_hkt    AND `category`='inter_province' AND `note`='' LIMIT 1);
SET @r_aonang_patong     = (SELECT `id` FROM `transfer_routes` WHERE `origin_id`=@loc_aonang AND `destination_id`=@loc_patong AND `category`='inter_province' AND `note`='' LIMIT 1);
SET @r_aonang_hkt_kbv    = (SELECT `id` FROM `transfer_routes` WHERE `origin_id`=@loc_aonang AND `destination_id`=@loc_hkt    AND `category`='city_tour' AND `note`='Enroute Krabi City' LIMIT 1);
SET @r_aonang_patong_kbv = (SELECT `id` FROM `transfer_routes` WHERE `origin_id`=@loc_aonang AND `destination_id`=@loc_patong AND `category`='city_tour' AND `note`='Enroute Krabi City' LIMIT 1);
SET @r_aonang_patong_hkt = (SELECT `id` FROM `transfer_routes` WHERE `origin_id`=@loc_aonang AND `destination_id`=@loc_patong AND `category`='city_tour' AND `note`='Enroute Phuket City' LIMIT 1);

-- The rate sheet itself: prices are per supplier, the routes above are not.
INSERT INTO `transfer_route_prices`
  (`route_id`, `supplier_id`, `vehicle_id`, `price`, `currency`) VALUES
  (@r_hkt_aonang,        @supplier_id, @v_sedan, 1800.00, 'THB'),
  (@r_hkt_aonang,        @supplier_id, @v_suv,   1900.00, 'THB'),
  (@r_hkt_aonang,        @supplier_id, @v_van,   2000.00, 'THB'),
  (@r_patong_aonang,     @supplier_id, @v_sedan, 2200.00, 'THB'),
  (@r_patong_aonang,     @supplier_id, @v_suv,   2300.00, 'THB'),
  (@r_patong_aonang,     @supplier_id, @v_van,   2400.00, 'THB'),
  (@r_hkt_aonang_kbv,    @supplier_id, @v_sedan, 2600.00, 'THB'),
  (@r_hkt_aonang_kbv,    @supplier_id, @v_suv,   2700.00, 'THB'),
  (@r_hkt_aonang_kbv,    @supplier_id, @v_van,   2800.00, 'THB'),
  (@r_patong_aonang_kbv, @supplier_id, @v_sedan, 3000.00, 'THB'),
  (@r_patong_aonang_kbv, @supplier_id, @v_suv,   3100.00, 'THB'),
  (@r_patong_aonang_kbv, @supplier_id, @v_van,   3200.00, 'THB'),
  (@r_patong_aonang_hkt, @supplier_id, @v_sedan, 3200.00, 'THB'),
  (@r_patong_aonang_hkt, @supplier_id, @v_suv,   3300.00, 'THB'),
  (@r_patong_aonang_hkt, @supplier_id, @v_van,   3500.00, 'THB'),
  (@r_aonang_hkt,        @supplier_id, @v_sedan, 1800.00, 'THB'),
  (@r_aonang_hkt,        @supplier_id, @v_suv,   1900.00, 'THB'),
  (@r_aonang_hkt,        @supplier_id, @v_van,   2000.00, 'THB'),
  (@r_aonang_patong,     @supplier_id, @v_sedan, 2200.00, 'THB'),
  (@r_aonang_patong,     @supplier_id, @v_suv,   2300.00, 'THB'),
  (@r_aonang_patong,     @supplier_id, @v_van,   2400.00, 'THB'),
  (@r_aonang_hkt_kbv,    @supplier_id, @v_sedan, 2600.00, 'THB'),
  (@r_aonang_hkt_kbv,    @supplier_id, @v_suv,   2700.00, 'THB'),
  (@r_aonang_hkt_kbv,    @supplier_id, @v_van,   2800.00, 'THB'),
  (@r_aonang_patong_kbv, @supplier_id, @v_sedan, 3000.00, 'THB'),
  (@r_aonang_patong_kbv, @supplier_id, @v_suv,   3100.00, 'THB'),
  (@r_aonang_patong_kbv, @supplier_id, @v_van,   3200.00, 'THB'),
  (@r_aonang_patong_hkt, @supplier_id, @v_sedan, 3200.00, 'THB'),
  (@r_aonang_patong_hkt, @supplier_id, @v_suv,   3300.00, 'THB'),
  (@r_aonang_patong_hkt, @supplier_id, @v_van,   3500.00, 'THB');

UPDATE `suppliers` SET `type` = 'transfer' WHERE `id` = @supplier_id;

-- The tour rows are now duplicated in the transfer tables, and a transfer
-- supplier's tours are unreachable from either screen, so they go.
DELETE FROM `tours` WHERE `supplier_id` = @supplier_id;

COMMIT;
