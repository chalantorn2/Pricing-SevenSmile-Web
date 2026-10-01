-- add_supplier_active.sql
-- Some suppliers are no longer used but their history (tours, rate sheets, files)
-- is worth keeping, so they are switched off instead of deleted. Everything that
-- exists today is in use, hence the default of 1.
--
-- Run this before deploying the matching api/suppliers.php and api/tours.php:
-- both read the column.

ALTER TABLE `suppliers`
  ADD COLUMN `is_active` TINYINT(1) NOT NULL DEFAULT 1 AFTER `type`,
  ADD KEY `idx_is_active` (`is_active`);
