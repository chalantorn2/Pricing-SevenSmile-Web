-- ตาราง package_tours: เก็บข้อมูลหลักของแพ็กเกจทัวร์
CREATE TABLE `package_tours` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL COMMENT 'ชื่อแพ็กเกจ',
  `days` INT NOT NULL COMMENT 'จำนวนวัน',
  `nights` INT NOT NULL COMMENT 'จำนวนคืน',
  `description` TEXT COMMENT 'คำอธิบายแพ็กเกจ',
  `total_cost` DECIMAL(10,2) DEFAULT 0 COMMENT 'ต้นทุนรวมทั้งหมด',
  `created_by` INT COMMENT 'ผู้สร้าง (user_id)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตาราง package_tour_items: เก็บรายการในแต่ละช่องของตาราง
CREATE TABLE `package_tour_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `package_tour_id` INT NOT NULL COMMENT 'อ้างอิงถึง package_tours.id',
  `day_number` INT NOT NULL COMMENT 'วันที่ (Day 1, Day 2, ...)',
  `time_slot` VARCHAR(50) NOT NULL COMMENT 'ช่วงเวลา: breakfast, morning_tour, lunch, evening_tour, dinner, hotel',
  `tour_id` INT NULL COMMENT 'อ้างอิงถึง tours.id (ถ้าเลือกจากฐานข้อมูล)',
  `custom_name` VARCHAR(255) NULL COMMENT 'ชื่อที่กรอกเอง (ถ้าไม่เลือกจาก tours)',
  `price` DECIMAL(10,2) DEFAULT 0 COMMENT 'ราคา/ต้นทุน',
  `unit` VARCHAR(100) NULL COMMENT 'หน่วย (คน, วัน, กลุ่ม, ฯลฯ)',
  `notes` TEXT NULL COMMENT 'หมายเหตุ',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`package_tour_id`) REFERENCES `package_tours`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON DELETE SET NULL,
  INDEX `idx_package_tour_id` (`package_tour_id`),
  INDEX `idx_day_time` (`day_number`, `time_slot`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตาราง package_tour_shares: เก็บข้อมูลการแชร์ให้ลูกค้าดู (optional)
CREATE TABLE `package_tour_shares` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `package_tour_id` INT NOT NULL,
  `share_token` VARCHAR(64) UNIQUE NOT NULL COMMENT 'Token สำหรับแชร์ลิงก์',
  `expires_at` TIMESTAMP NULL COMMENT 'วันหมดอายุ (ถ้ามี)',
  `view_count` INT DEFAULT 0 COMMENT 'จำนวนครั้งที่ดู',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`package_tour_id`) REFERENCES `package_tours`(`id`) ON DELETE CASCADE,
  INDEX `idx_share_token` (`share_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
