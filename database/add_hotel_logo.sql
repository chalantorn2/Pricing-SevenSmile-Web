-- add_hotel_logo.sql
-- Hotel brand logo, separate from `main_image` (the cover photo). Uploaded through
-- api/hotel-upload.php like every other hotel image, so this stores a public URL.
-- The sync from indosmilesouthservices.com does not touch this column, so a logo
-- set here survives re-syncs.

ALTER TABLE `hotels`
  ADD COLUMN `logo` VARCHAR(500) DEFAULT NULL COMMENT 'brand logo URL' AFTER `main_image`;
