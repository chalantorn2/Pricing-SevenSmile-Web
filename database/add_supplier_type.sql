-- add_supplier_type.sql
-- Tour suppliers and transfer suppliers are different companies: the ones already
-- in the table are all tour vendors, and nobody appears in both lists. `type` is
-- therefore one value per supplier, not a pair of flags.
--
-- Everything existing becomes 'tour', which is also the default, so the tour side
-- of the app keeps working without passing the new column anywhere.

ALTER TABLE `suppliers`
  ADD COLUMN `type` ENUM('tour', 'transfer') NOT NULL DEFAULT 'tour' AFTER `name`,
  ADD KEY `idx_type` (`type`);

-- The placeholder that add_transfer_price_supplier.sql parked the imported
-- transfer rates on is, by definition, a transfer supplier.
UPDATE `suppliers`
   SET `type` = 'transfer'
 WHERE `name` = 'Unknown Transfer Supplier';
