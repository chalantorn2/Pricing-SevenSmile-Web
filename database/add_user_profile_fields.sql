-- Add profile fields to users: real name, nickname, office and position.
-- office: which company the user belongs to. 'both' is used for staff that
-- work across companies (e.g. GM).

ALTER TABLE `users`
  ADD COLUMN `full_name` VARCHAR(255) NULL DEFAULT NULL AFTER `username`,
  ADD COLUMN `nickname` VARCHAR(100) NULL DEFAULT NULL AFTER `full_name`,
  ADD COLUMN `office` ENUM('sevensmile','indosmile','both') NOT NULL DEFAULT 'sevensmile' AFTER `nickname`,
  -- free text, may hold more than one position (e.g. "GM, Sales Manager")
  ADD COLUMN `position` VARCHAR(255) NULL DEFAULT NULL AFTER `office`,
  ADD KEY `idx_office` (`office`);

-- Backfill office from the existing username prefix.
UPDATE `users` SET `office` = 'indosmile' WHERE `username` LIKE 'indosmile%';
UPDATE `users` SET `office` = 'sevensmile' WHERE `office` <> 'indosmile';
