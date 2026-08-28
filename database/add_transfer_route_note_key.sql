-- add_transfer_route_note_key.sql
-- A route's `note` turned out to be part of what makes it a distinct route, not
-- just decoration. Krabi suppliers quote the same origin/destination pair twice
-- at different prices depending on which city the driver stops in on the way --
-- Patong to Ao Nang enroute Krabi City is a different sale from Patong to Ao Nang
-- enroute Phuket City. `uniq_pair (origin_id, destination_id, category)` refused
-- to hold both, so `note` joins the key.
--
-- NULL is no good in a unique key: MariaDB treats every NULL as distinct, so
-- leaving the column nullable would let the same journey be inserted any number
-- of times with no note at all. The column becomes NOT NULL DEFAULT '' first,
-- which is also why routeFields() in api/transfer-manage.php now defaults `note`
-- to '' instead of NULL.
--
-- Every existing row has note IS NULL, so the backfill is total and lossless.
--
-- ALTER TABLE does not roll back in MariaDB, so this is deliberately not wrapped
-- in a transaction: if a step fails, fix it and re-run from that step.

UPDATE `transfer_routes` SET `note` = '' WHERE `note` IS NULL;

ALTER TABLE `transfer_routes`
  MODIFY COLUMN `note` VARCHAR(255) NOT NULL DEFAULT '';

ALTER TABLE `transfer_routes`
  DROP INDEX `uniq_pair`,
  ADD UNIQUE KEY `uniq_pair` (`origin_id`, `destination_id`, `category`, `note`);
