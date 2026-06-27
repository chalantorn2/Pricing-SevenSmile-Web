-- Add email field to suppliers
-- Safe migration: nullable column, existing rows unaffected.
-- Run once against the `suppliers` table.

ALTER TABLE `suppliers`
  ADD COLUMN `email` varchar(150) DEFAULT NULL AFTER `website`;
