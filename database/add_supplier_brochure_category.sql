-- Add 'brochure_supplier' to the tour_files.file_category enum.
-- Existing 'brochure' rows remain "Our Brochure" (Seven Smile's own).
-- Run this once against the sevensmile_contactrate database.

ALTER TABLE `tour_files`
  MODIFY `file_category`
  ENUM('gallery','brochure','brochure_supplier','general')
  DEFAULT 'general';
