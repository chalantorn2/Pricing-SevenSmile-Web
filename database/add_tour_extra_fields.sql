-- Add extra tour fields: tour_type, destination, park_fee_adult, park_fee_child
-- Safe migration: all columns nullable with default, existing rows unaffected.
-- Run once against the `tours` table.

ALTER TABLE `tours`
  ADD COLUMN `tour_type`      varchar(50)   DEFAULT NULL AFTER `pier`,
  ADD COLUMN `destination`    varchar(100)  DEFAULT NULL AFTER `departure_from`,
  ADD COLUMN `park_fee_adult` decimal(10,2) DEFAULT NULL AFTER `park_fee_included`,
  ADD COLUMN `park_fee_child` decimal(10,2) DEFAULT NULL AFTER `park_fee_adult`;
