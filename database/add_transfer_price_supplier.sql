-- add_transfer_price_supplier.sql
-- Transfer rates turned out to be per supplier: every supplier sells the same
-- journeys (Phuket Airport to Patong is the same trip whoever drives it), so the
-- routes stay shared and only the price is theirs. This moves an existing
-- transfer_route_prices onto that shape.
--
-- Skip this file on a fresh install: add_transfer_tables.sql already creates the
-- column. Run it only where the transfer tables were created before supplier_id
-- existed.
--
-- The rows have to belong to somebody. The rates already in the table came from
-- the INDO SMILE sheet with no vendor recorded, so they are parked on a supplier
-- named below, created if it is missing. Renaming that supplier later is safe —
-- the prices point at its id, not its name.
--
-- ALTER TABLE does not roll back in MariaDB, so this is deliberately not wrapped
-- in a transaction: if a step fails, fix it and re-run from that step.

SET @existing_supplier_name = 'Unknown Transfer Supplier';

INSERT INTO `suppliers` (`name`)
SELECT @existing_supplier_name
 WHERE NOT EXISTS (SELECT 1 FROM `suppliers` WHERE `name` = @existing_supplier_name);

ALTER TABLE `transfer_route_prices`
  ADD COLUMN `supplier_id` INT(11) NOT NULL DEFAULT 0 AFTER `route_id`;

UPDATE `transfer_route_prices`
   SET `supplier_id` = (
       SELECT `id` FROM `suppliers` WHERE `name` = @existing_supplier_name LIMIT 1
   );

ALTER TABLE `transfer_route_prices`
  DROP INDEX `uniq_route_vehicle`,
  ADD UNIQUE KEY `uniq_route_supplier_vehicle` (`route_id`, `supplier_id`, `vehicle_id`),
  ADD KEY `idx_supplier` (`supplier_id`),
  ALTER COLUMN `supplier_id` DROP DEFAULT;

-- Added last: it fails loudly if the UPDATE above matched no supplier, which is
-- the point — better a refused migration than rate rows pointing at nobody.
ALTER TABLE `transfer_route_prices`
  ADD CONSTRAINT `fk_transfer_price_supplier` FOREIGN KEY (`supplier_id`)
    REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
