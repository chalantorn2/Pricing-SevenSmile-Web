-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jun 18, 2026 at 08:57 AM
-- Server version: 11.8.6-MariaDB-0+deb13u1 from Debian-log
-- PHP Version: 8.4.19

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sevensmile_contactrate`
--

-- --------------------------------------------------------

--
-- Table structure for table `package_tours`
--

CREATE TABLE `package_tours` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL COMMENT 'ชื่อแพ็กเกจ',
  `days` int(11) NOT NULL COMMENT 'จำนวนวัน',
  `nights` int(11) NOT NULL COMMENT 'จำนวนคืน',
  `description` text DEFAULT NULL COMMENT 'คำอธิบายแพ็กเกจ',
  `total_cost` decimal(10,2) DEFAULT 0.00 COMMENT 'ต้นทุนรวมทั้งหมด',
  `created_by` int(11) DEFAULT NULL COMMENT 'ผู้สร้าง (user_id)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `package_tour_items`
--

CREATE TABLE `package_tour_items` (
  `id` int(11) NOT NULL,
  `package_tour_id` int(11) NOT NULL COMMENT 'อ้างอิงถึง package_tours.id',
  `day_number` int(11) NOT NULL COMMENT 'วันที่ (Day 1, Day 2, ...)',
  `time_slot` varchar(50) NOT NULL COMMENT 'ช่วงเวลา: breakfast, morning_tour, lunch, evening_tour, dinner, hotel',
  `tour_id` int(11) DEFAULT NULL COMMENT 'อ้างอิงถึง tours.id (ถ้าเลือกจากฐานข้อมูล)',
  `custom_name` varchar(255) DEFAULT NULL COMMENT 'ชื่อที่กรอกเอง (ถ้าไม่เลือกจาก tours)',
  `price` decimal(10,2) DEFAULT 0.00 COMMENT 'ราคา/ต้นทุน',
  `unit` varchar(100) DEFAULT NULL COMMENT 'หน่วย (คน, วัน, กลุ่ม, ฯลฯ)',
  `notes` text DEFAULT NULL COMMENT 'หมายเหตุ',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `package_tour_shares`
--

CREATE TABLE `package_tour_shares` (
  `id` int(11) NOT NULL,
  `package_tour_id` int(11) NOT NULL,
  `share_token` varchar(64) NOT NULL COMMENT 'Token สำหรับแชร์ลิงก์',
  `expires_at` timestamp NULL DEFAULT NULL COMMENT 'วันหมดอายุ (ถ้ามี)',
  `view_count` int(11) DEFAULT 0 COMMENT 'จำนวนครั้งที่ดู',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `line` varchar(100) DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `whatsapp` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `website` varchar(255) DEFAULT NULL,
  `phone_2` varchar(50) DEFAULT NULL,
  `phone_3` varchar(50) DEFAULT NULL,
  `phone_4` varchar(50) DEFAULT NULL,
  `phone_5` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `address`, `phone`, `line`, `facebook`, `whatsapp`, `created_at`, `updated_at`, `website`, `phone_2`, `phone_3`, `phone_4`, `phone_5`) VALUES
(7, 'Orchid', '20/1 หมู่ที่ 2 ตำบลอ่าวนาง อำเภอเมืองกระบี่ จ.กระบี่ 81000', '0984541233', '', 'https://www.facebook.com/p/Aonang-Orchid-Tour-%E0%B8%AD%E0%B9%88%E0%B8%B2%E0%B8%A7%E0%B8%99%E0%B8%B2%E0%B8%87%E0%B8%AD%E0%B8%AD%E0%B8%84%E0%B8%B4%E0%B8%94%E0%B8%97%E0%B8%B1%E0%B8%A7%E0%B8%A3%E0%B9%8C-100063988156981/', '', '2025-08-17 09:18:51', '2025-09-01 03:49:38', '', '', '', '', ''),
(8, 'Sawasdee Travel', 'Leamnganusorn Road, Ratsada, Mueang Phuket District, Phuket 83000', '0824199858', '', 'https://www.facebook.com/sawasdeetravelguide/?locale=th_TH', '', '2025-08-17 10:17:44', '2025-08-26 04:53:54', 'https://sawasdee-travel.com/', '0960969574', '', '', ''),
(10, 'Seastar', '112/151 Udomsuk Village, Paklok, Thalang, Phuket 83110 THAILAND', '076 350 144', '', 'https://www.facebook.com/SeastarHappyJourney', '', '2025-08-19 10:07:54', '2025-08-27 04:17:39', 'https://seastarandaman.com/', '093 582 2897', '', '', ''),
(11, 'Cattery', '', '0897241213', '', 'https://www.facebook.com/kh.th.the.xri.thrawel.x.nd.thawr', '', '2025-08-26 04:02:08', '2025-08-26 04:02:08', '', '0993180777', '0985340555', '', ''),
(12, 'SunBright Tour', '65/454 ตันหยงวิลล่า 7, หมู่ 1, ตำบลวิชิต, อำเภอเมืองภูเก็ต 83000', '0824322702', '', 'https://www.facebook.com/PhuketSunbrightTour', '', '2025-08-27 04:12:37', '2025-08-27 04:12:37', '', '0611747421', '076375532', '', ''),
(13, 'Mariam Travel and Tour', '230 หมู่ 5 ตำบลไสไทย อำเภอเมือง จังหวัดกระบี่ ประเทศไทย', '0869954919', '', 'https://www.facebook.com/p/Mariam-Travel-and-Tour-%E0%B8%A1%E0%B8%B2%E0%B9%80%E0%B8%A3%E0%B8%B5%E0%B8%A2%E0%B8%A1%E0%B8%97%E0%B8%A3%E0%B8%B2%E0%B9%80%E0%B8%A7%E0%B8%A5%E0%B9%81%E0%B8%AD%E0%B8%99%E0%B8%94%E0%B9%8C%E0%B8%97%E0%B8%B1%E0%B8%A7%E0%B8%A3%E0%B9%', '', '2025-08-27 04:35:18', '2025-08-27 04:35:18', '', '0815977072', '', '', ''),
(14, 'Krabi Suanpalm Kayaking Klongrud', '14/1 หมู่บ้านแหลมสวน หมู่ที่ 4 ต.หนองทะเล อ.เมือง จ.กระบี่', '0813213465', '', 'https://www.facebook.com/profile.php?id=100089487804999', '', '2025-08-27 04:46:21', '2025-08-27 04:46:21', '', '0854730073', '', '', ''),
(15, 'MEKA Catamaran', '945 Moo.2, T.Aonang, Muang, Ban Ao Nang, , Krabi, Thailand', '0926953365', '', 'https://www.facebook.com/MekaCatamaran/?locale=th_TH', '', '2025-08-27 09:07:27', '2025-08-27 09:07:27', 'https://mekacatamaran.com/', '0611766160', '0652561136', '0652561138', ''),
(16, 'Sawanu Travel', 'Royal Phuket Marina 68 Moo 2, Thepkasattri Rd Kohkaew, Muang, Phuket 83000', '0657161670', '@sawanutravel', 'https://www.facebook.com/profile.php?id=100088268286839&locale=th_TH', '+66 97 982 0999', '2025-08-27 09:43:07', '2025-08-27 09:43:07', 'https://www.sawanutravel.com/HOME/6450aaee49d7e0050c2aea01', '0657161620', '0979820999', '', ''),
(17, 'Sea Angel', '20/79 ซอยพันเทพ 3 ถนนแม่หลวน ตำบลตลาดเหนือ อำเภอเมือง จังหวัดภูเก็ต 83000', '0898733814', '@seaangel', 'https://www.facebook.com/seaangelthailand/?locale=th_TH', '', '2025-08-31 14:57:38', '2025-08-31 14:57:38', 'https://www.seaangelcruise.com', '076218557', '0956342333', '0954299255', '0902824542'),
(18, 'Thai\'d Up Adventures ', '95/2 หมู่ 2 ตำบลไสไทย อำเภอเมือง จังหวัดกระบี่ 81000', '0849201548', 'athaidup', 'https://www.facebook.com/Thaidupadventures/?locale=th_TH', '+66849201548', '2025-08-31 15:14:30', '2025-08-31 15:17:23', 'https://thaidupadventures.com/', '0612375435', '', '', ''),
(19, 'Krabi Elephant Shelter Aonang', '344 หมู่ 4 อ่าวนาง เมืองกระบี่ กระบี่ 81180', '098 671 5336', '', 'https://www.facebook.com/krabielephantshelter/', '', '2025-08-31 15:23:35', '2025-08-31 15:23:35', 'https://krabielephantshelter.com/', '', '', '', ''),
(20, 'Nonthasak Travel', '3/3 หมู่ 6, ถนน วิเศษ, ตำบล ราไวย์, อำเภอ เมือง, ภูเก็ต 83130', '0815696777', '', 'https://www.facebook.com/nonthasaktravel/?locale=th_TH', '+66816959969', '2025-09-01 01:56:12', '2025-09-01 01:56:12', 'https://www.nonthasaktravel.com/th', '0826307778', '076 375 530', '', ''),
(21, 'Hanuman World', '105 หมู่ 4 ถนนเจ้าฟ้า ต.วิชิต เมือง ภูเก็ต ประเทศไทย 83000', '062 979 5533', '', 'https://www.facebook.com/HanumanWorld/?locale=th_TH', '', '2025-09-01 02:34:11', '2025-09-01 02:46:16', 'https://hanumanworldphuket.com/', '0629794333', '0819792332', '', ''),
(22, 'The Lake Phuket Elephant Home', '201/1 หมู่ 5 ต.เทพกระษัตรี อ.ถลาง ภูเก็ต ประเทศไทย 83110', '0986700982', '', 'https://www.facebook.com/Thelakephuketelephanthome/?locale=th_TH', '', '2025-09-01 02:53:11', '2025-09-01 02:57:28', 'https://www.thelakephuketelephanthome.com/', '0632395142', '', '', ''),
(23, 'Phuket Raina', '258/1 หมู่ที่ 5 ตำบลเชิงทะเล อำเภอถลาง จ.ภูเก็ต 83110', '0981922366', '', 'https://www.facebook.com/PhuketRainaTourJamesBondIsland/?locale=th_TH', '', '2025-09-01 03:02:46', '2025-09-01 03:02:46', '', '0896518823', '', '', ''),
(24, 'AM Travel&Tour', '6/27 หมู่ที่ 1 ตำบลรัษฎา อำเภอเมืองภูเก็ต จ.ภูเก็ต 83000', '092 536 9915', 'amtravel.tour', 'https://www.facebook.com/p/AM-travel-tour-100067182914594/', '', '2025-09-01 04:38:54', '2025-09-01 04:38:54', '', '06-3184-0192', '', '', ''),
(25, 'Seanery', '59/75 ตำบลกะทู้ อำเภอกะทู้ ภูเก็ต 83120', '062 956 6124', '', 'https://www.facebook.com/THESEANERY/', '', '2025-09-25 09:31:06', '2025-09-25 09:31:06', 'https://www.theseanery.com/', '', '', '', ''),
(26, 'Krabi Lazanya Tour', '594 ม 1 ถ.หนองทะเล ต.หนองทะเล อ.เมืองกระบี่ จ.กระบี่ 81000', '062 087 4357', '', 'https://www.facebook.com/p/Krabi-Lazanya-Tour-%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B9%80%E0%B8%A3%E0%B8%B7%E0%B8%AD%E0%B8%84%E0%B8%B2%E0%B8%A2%E0%B8%B1%E0%B8%84-100063785220138/?locale=th_TH', '', '2025-09-29 02:48:31', '2025-09-29 02:48:31', '', '', '', '', ''),
(27, 'WIN INTER GROUP', 'WIN INTERGROUP TH COMPANY LIMITED\n9/2 WAT-PHO RD. MUANGSURATTHANI SURATTHANI THAILAND 84130', '061-0907151', 'POM_PAWAN', '', '', '2026-06-17 09:18:47', '2026-06-17 09:18:47', '', '', '', '', ''),
(28, 'PHET AOW THAI', 'PHET AOW THAI TRAVEL AND TOUR\n37/4 MOO4 BOPHUT KOH SAMUI SURATTANI THAILAND 84320', '098-6933537', '', '', '', '2026-06-17 11:48:47', '2026-06-17 11:48:47', '', '', '', '', '');

-- --------------------------------------------------------

--
-- Table structure for table `supplier_files`
--

CREATE TABLE `supplier_files` (
  `id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` enum('pdf','image') NOT NULL,
  `file_size` int(11) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `label` varchar(255) DEFAULT NULL,
  `uploaded_by` varchar(255) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `file_category` enum('contact_rate','qr_code','general') DEFAULT 'general'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Dumping data for table `supplier_files`
--

INSERT INTO `supplier_files` (`id`, `supplier_id`, `file_name`, `original_name`, `file_path`, `file_type`, `file_size`, `mime_type`, `label`, `uploaded_by`, `uploaded_at`, `file_category`) VALUES
(5, 7, '68a1ab6bb4658_1755425643.png', 'Screenshot 2025-08-17 171333.png', 'uploads/suppliers/images/68a1ab6bb4658_1755425643.png', 'image', 20411, 'image/png', 'Contact Rate', 'test', '2025-08-17 10:14:03', 'general'),
(6, 8, '68a1ac600a80d_1755425888.png', 'Screenshot 2025-08-17 171758.png', 'uploads/suppliers/images/68a1ac600a80d_1755425888.png', 'image', 25485, 'image/png', 'Contact Rate', 'test', '2025-08-17 10:18:08', 'general'),
(9, 10, '68abd89ad107a_1756092570.pdf', 'Indo Smile South Service CONTRACT 24-25 no vat Worldwide market.pdf', 'uploads/suppliers/pdfs/68abd89ad107a_1756092570.pdf', 'pdf', 1120753, 'application/pdf', 'Contact Rate', 'admin', '2025-08-25 03:29:30', 'contact_rate'),
(10, 7, '68abdd42d2b24_1756093762.jpg', 'my_group_1756093722797.jpg', 'uploads/suppliers/images/68abdd42d2b24_1756093762.jpg', 'image', 16529, 'image/jpeg', 'QR code Line Group', 'admin', '2025-08-25 03:49:22', 'qr_code'),
(11, 11, '68ad31c9671a9_1756180937.jpg', 'LINE_NOTE_250826_2.jpg', 'uploads/suppliers/images/68ad31c9671a9_1756180937.jpg', 'image', 365662, 'image/jpeg', '', 'admin', '2025-08-26 04:02:17', 'contact_rate'),
(12, 11, '68ad31c9becc6_1756180937.jpg', 'messageImage_1756108142244.jpg', 'uploads/suppliers/images/68ad31c9becc6_1756180937.jpg', 'image', 212081, 'image/jpeg', '', 'admin', '2025-08-26 04:02:17', 'contact_rate'),
(13, 11, '68ad31c9c0718_1756180937.png', 'Screenshot 2025-08-26 105654.png', 'uploads/suppliers/images/68ad31c9c0718_1756180937.png', 'image', 134846, 'image/png', '', 'admin', '2025-08-26 04:02:17', 'contact_rate'),
(14, 11, '68ad31c9c057c_1756180937.jpg', 'LINE_NOTE_250826_1.jpg', 'uploads/suppliers/images/68ad31c9c057c_1756180937.jpg', 'image', 627433, 'image/jpeg', '', 'admin', '2025-08-26 04:02:17', 'contact_rate'),
(15, 11, '68ad31ca49f3b_1756180938.jpg', '515267156_4009837172495843_6177234699947410509_n.jpg', 'uploads/suppliers/images/68ad31ca49f3b_1756180938.jpg', 'image', 2363127, 'image/jpeg', '', 'admin', '2025-08-26 04:02:18', 'contact_rate'),
(16, 11, '68ad31cf693bd_1756180943.png', 'Screenshot 2025-08-26 105751.png', 'uploads/suppliers/images/68ad31cf693bd_1756180943.png', 'image', 28043, 'image/png', '', 'admin', '2025-08-26 04:02:23', 'contact_rate'),
(17, 12, '68ae85c8c689e_1756267976.jpg', 'LINE_ALBUM_Net price city tour_250826_5.jpg', 'uploads/suppliers/images/68ae85c8c689e_1756267976.jpg', 'image', 386556, 'image/jpeg', 'Contact Rate', 'admin', '2025-08-27 04:12:56', 'contact_rate'),
(18, 12, '68ae85cea0dcc_1756267982.jpg', 'LINE_ALBUM_Net price city tour tiger 1.jpg', 'uploads/suppliers/images/68ae85cea0dcc_1756267982.jpg', 'image', 3573648, 'image/jpeg', '', 'admin', '2025-08-27 04:13:02', 'contact_rate'),
(19, 12, '68ae85cf0ba16_1756267983.jpg', 'LINE_ALBUM_Net price city tour tiger 2.jpg', 'uploads/suppliers/images/68ae85cf0ba16_1756267983.jpg', 'image', 3455243, 'image/jpeg', '', 'admin', '2025-08-27 04:13:03', 'contact_rate'),
(20, 12, '68ae85cf95202_1756267983.jpg', 'LINE_ALBUM_Net price city tour 2.jpg', 'uploads/suppliers/images/68ae85cf95202_1756267983.jpg', 'image', 3302788, 'image/jpeg', '', 'admin', '2025-08-27 04:13:03', 'contact_rate'),
(21, 12, '68ae85cfd17dd_1756267983.jpg', 'LINE_ALBUM_Net price city tour 1.jpg', 'uploads/suppliers/images/68ae85cfd17dd_1756267983.jpg', 'image', 3349719, 'image/jpeg', '', 'admin', '2025-08-27 04:13:03', 'contact_rate'),
(22, 13, '68ae8b319e6a4_1756269361.jpg', 'timeline_20231108_1614513.jpg', 'uploads/suppliers/images/68ae8b319e6a4_1756269361.jpg', 'image', 130431, 'image/jpeg', 'Contact Rate', 'admin', '2025-08-27 04:36:01', 'contact_rate'),
(23, 13, '68ae8b5e4d9f1_1756269406.jpg', 'Brochure 2.jpg', 'uploads/suppliers/images/68ae8b5e4d9f1_1756269406.jpg', 'image', 197570, 'image/jpeg', '', 'admin', '2025-08-27 04:36:46', 'contact_rate'),
(24, 13, '68ae8b5e9308c_1756269406.jpg', 'Brochure 3.jpg', 'uploads/suppliers/images/68ae8b5e9308c_1756269406.jpg', 'image', 273050, 'image/jpeg', '', 'admin', '2025-08-27 04:36:46', 'contact_rate'),
(25, 13, '68ae8b5e941ca_1756269406.jpg', 'Brochure 4.jpg', 'uploads/suppliers/images/68ae8b5e941ca_1756269406.jpg', 'image', 310643, 'image/jpeg', '', 'admin', '2025-08-27 04:36:46', 'contact_rate'),
(26, 13, '68ae8b5eb08fd_1756269406.jpg', 'Brochure 1.jpg', 'uploads/suppliers/images/68ae8b5eb08fd_1756269406.jpg', 'image', 187416, 'image/jpeg', '', 'admin', '2025-08-27 04:36:46', 'contact_rate'),
(27, 14, '68ae8db39bf95_1756270003.jpg', '29210.jpg', 'uploads/suppliers/images/68ae8db39bf95_1756270003.jpg', 'image', 102319, 'image/jpeg', 'Contact Rate', 'admin', '2025-08-27 04:46:43', 'contact_rate'),
(28, 14, '68ae8dcc22a1f_1756270028.jpg', 'Brochure 1.jpg', 'uploads/suppliers/images/68ae8dcc22a1f_1756270028.jpg', 'image', 382561, 'image/jpeg', '', 'admin', '2025-08-27 04:47:08', 'contact_rate'),
(29, 14, '68ae8dcc506b0_1756270028.jpg', 'Brochure 2.jpg', 'uploads/suppliers/images/68ae8dcc506b0_1756270028.jpg', 'image', 386865, 'image/jpeg', '', 'admin', '2025-08-27 04:47:08', 'contact_rate'),
(30, 14, '68ae8dcc7405c_1756270028.jpg', 'TAT.jpg', 'uploads/suppliers/images/68ae8dcc7405c_1756270028.jpg', 'image', 193788, 'image/jpeg', '', 'admin', '2025-08-27 04:47:08', 'contact_rate'),
(31, 15, '68aecb0f62b50_1756285711.pdf', 'Meka Catamaran Main Agreement 2025.pdf', 'uploads/suppliers/pdfs/68aecb0f62b50_1756285711.pdf', 'pdf', 442092, 'application/pdf', '', 'dev_lay', '2025-08-27 09:08:31', 'contact_rate'),
(32, 15, '68aecb0fa76f1_1756285711.pdf', 'Meka Catamaran Main Agreement Phi Phi Island and 4 Island trip.pdf', 'uploads/suppliers/pdfs/68aecb0fa76f1_1756285711.pdf', 'pdf', 834727, 'application/pdf', '', 'dev_lay', '2025-08-27 09:08:31', 'contact_rate'),
(33, 16, '68aed34d4b284_1756287821.jpg', 'LINE_NOTE_250827_1.jpg', 'uploads/suppliers/images/68aed34d4b284_1756287821.jpg', 'image', 236446, 'image/jpeg', 'Contact Rate', 'dev_lay', '2025-08-27 09:43:41', 'contact_rate'),
(34, 17, '68b4641896126_1756652568.jpg', 'Contact Rate 2.jpg', 'uploads/suppliers/images/68b4641896126_1756652568.jpg', 'image', 1087908, 'image/jpeg', '', 'dev_lay', '2025-08-31 15:02:48', 'contact_rate'),
(35, 17, '68b46418d94d8_1756652568.jpg', 'Contact Rate 1.jpg', 'uploads/suppliers/images/68b46418d94d8_1756652568.jpg', 'image', 1069160, 'image/jpeg', '', 'dev_lay', '2025-08-31 15:02:48', 'contact_rate'),
(36, 18, '68b467367f66f_1756653366.jpg', 'Contact Rate 1.jpg', 'uploads/suppliers/images/68b467367f66f_1756653366.jpg', 'image', 156077, 'image/jpeg', '', 'dev_lay', '2025-08-31 15:16:06', 'contact_rate'),
(37, 18, '68b4673688fba_1756653366.jpg', 'Contact Rate 2.jpg', 'uploads/suppliers/images/68b4673688fba_1756653366.jpg', 'image', 157298, 'image/jpeg', '', 'dev_lay', '2025-08-31 15:16:06', 'contact_rate'),
(38, 18, '68b467569f4b6_1756653398.png', 'Brochure 2.png', 'uploads/suppliers/images/68b467569f4b6_1756653398.png', 'image', 2442645, 'image/png', '', 'dev_lay', '2025-08-31 15:16:38', 'contact_rate'),
(39, 18, '68b46757015f9_1756653399.png', 'Brochure 1.png', 'uploads/suppliers/images/68b46757015f9_1756653399.png', 'image', 2784994, 'image/png', '', 'dev_lay', '2025-08-31 15:16:39', 'contact_rate'),
(40, 19, '68b46912c99ea_1756653842.pdf', 'KES  -General Contract .docx.pdf', 'uploads/suppliers/pdfs/68b46912c99ea_1756653842.pdf', 'pdf', 260577, 'application/pdf', '', 'dev_lay', '2025-08-31 15:24:02', 'contact_rate'),
(41, 19, '68b469147d812_1756653844.jpg', 'Poster Tour Shelter A3_20250606_143039_0000 (2)_Page_1.jpg', 'uploads/suppliers/images/68b469147d812_1756653844.jpg', 'image', 3345159, 'image/jpeg', '', 'dev_lay', '2025-08-31 15:24:04', 'contact_rate'),
(42, 19, '68b46914d2e8e_1756653844.jpg', 'Poster Tour Shelter A3_20250606_143039_0000 (2)_Page_2.jpg', 'uploads/suppliers/images/68b46914d2e8e_1756653844.jpg', 'image', 4117871, 'image/jpeg', '', 'dev_lay', '2025-08-31 15:24:04', 'contact_rate'),
(43, 20, '68b4fd6d96e1b_1756691821.jpg', 'timeline_20241023_130103.jpg', 'uploads/suppliers/images/68b4fd6d96e1b_1756691821.jpg', 'image', 107701, 'image/jpeg', 'Contact Rate', 'dev_lay', '2025-09-01 01:57:01', 'contact_rate'),
(46, 21, '68b508f4eab64_1756694772.pdf', 'Contact Rate 1.pdf', 'uploads/suppliers/pdfs/68b508f4eab64_1756694772.pdf', 'pdf', 1741269, 'application/pdf', '', 'dev_lay', '2025-09-01 02:46:12', 'contact_rate'),
(47, 21, '68b508f574327_1756694773.pdf', 'Contact Rate 2.pdf', 'uploads/suppliers/pdfs/68b508f574327_1756694773.pdf', 'pdf', 3469614, 'application/pdf', '', 'dev_lay', '2025-09-01 02:46:13', 'contact_rate'),
(48, 22, '68b50ac6b02bd_1756695238.jpg', 'LINE_NOTE_250901_1.jpg', 'uploads/suppliers/images/68b50ac6b02bd_1756695238.jpg', 'image', 193804, 'image/jpeg', 'Contact Rate', 'dev_lay', '2025-09-01 02:53:58', 'contact_rate'),
(49, 22, '68b50ace17be0_1756695246.jpg', 'LINE_NOTE_250901_2.jpg', 'uploads/suppliers/images/68b50ace17be0_1756695246.jpg', 'image', 136647, 'image/jpeg', 'Pick Up', 'dev_lay', '2025-09-01 02:54:06', 'contact_rate'),
(50, 23, '68b50ce277bfb_1756695778.jpg', 'LINE_NOTE_250901_3.jpg', 'uploads/suppliers/images/68b50ce277bfb_1756695778.jpg', 'image', 156368, 'image/jpeg', 'Contact Rate', 'dev_lay', '2025-09-01 03:02:58', 'contact_rate'),
(51, 24, '68b52390dbfaa_1756701584.png', 'Screenshot 2025-09-01 113907.png', 'uploads/suppliers/images/68b52390dbfaa_1756701584.png', 'image', 397177, 'image/png', 'Contact Rate', 'dev_lay', '2025-09-01 04:39:44', 'contact_rate'),
(52, 25, '68d50bea0872f_1758792682.jpg', '1758792511892.jpg', 'uploads/suppliers/images/68d50bea0872f_1758792682.jpg', 'image', 154834, 'image/jpeg', 'Contact Rate', 'dev_lay', '2025-09-25 09:31:22', 'contact_rate'),
(53, 27, '6a3266c125dee_1781688001.jpg', 'S__28557362.jpg', 'uploads/suppliers/images/6a3266c125dee_1781688001.jpg', 'image', 97454, 'image/jpeg', '', 'lay', '2026-06-17 09:20:01', 'contact_rate'),
(54, 27, '6a3266c126700_1781688001.jpg', '248207.jpg', 'uploads/suppliers/images/6a3266c126700_1781688001.jpg', 'image', 185792, 'image/jpeg', '', 'lay', '2026-06-17 09:20:01', 'contact_rate'),
(55, 28, '6a3289c75bf57_1781696967.jpg', 'LINE_ALBUM_Contract Transfer_260617_1.jpg', 'uploads/suppliers/images/6a3289c75bf57_1781696967.jpg', 'image', 76530, 'image/jpeg', '', 'lay', '2026-06-17 11:49:27', 'contact_rate'),
(56, 28, '6a3289c76132b_1781696967.jpg', 'LINE_ALBUM_Contact_260617_1.jpg', 'uploads/suppliers/images/6a3289c76132b_1781696967.jpg', 'image', 183480, 'image/jpeg', '', 'lay', '2026-06-17 11:49:27', 'contact_rate'),
(57, 28, '6a3289c762e26_1781696967.jpg', 'LINE_ALBUM_Contact_260617_2.jpg', 'uploads/suppliers/images/6a3289c762e26_1781696967.jpg', 'image', 229738, 'image/jpeg', '', 'lay', '2026-06-17 11:49:27', 'contact_rate'),
(58, 28, '6a3289c76836b_1781696967.jpg', 'LINE_ALBUM_โปรแกรมทัวร์_260617_2.jpg', 'uploads/suppliers/images/6a3289c76836b_1781696967.jpg', 'image', 343350, 'image/jpeg', '', 'lay', '2026-06-17 11:49:27', 'contact_rate'),
(59, 28, '6a3289c76973a_1781696967.jpg', 'LINE_ALBUM_โปรแกรมทัวร์_260617_1.jpg', 'uploads/suppliers/images/6a3289c76973a_1781696967.jpg', 'image', 314130, 'image/jpeg', '', 'lay', '2026-06-17 11:49:27', 'contact_rate'),
(60, 28, '6a328d920917a_1781697938.jpg', 'LINE_ALBUM_โปรแกรมทัวร์_260617_3.jpg', 'uploads/suppliers/images/6a328d920917a_1781697938.jpg', 'image', 477827, 'image/jpeg', '', 'lay', '2026-06-17 12:05:38', 'contact_rate'),
(61, 28, '6a328d920a84f_1781697938.jpg', 'LINE_ALBUM_โปรแกรมทัวร์_260617_4.jpg', 'uploads/suppliers/images/6a328d920a84f_1781697938.jpg', 'image', 463613, 'image/jpeg', '', 'lay', '2026-06-17 12:05:38', 'contact_rate');

-- --------------------------------------------------------

--
-- Table structure for table `tours`
--

CREATE TABLE `tours` (
  `id` int(11) NOT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `tour_name` varchar(255) NOT NULL,
  `departure_from` varchar(255) DEFAULT NULL,
  `pier` varchar(255) DEFAULT NULL,
  `adult_price` decimal(10,2) DEFAULT 0.00,
  `child_price` decimal(10,2) DEFAULT 0.00,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `park_fee_included` tinyint(1) DEFAULT 0,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `map_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tours`
--

INSERT INTO `tours` (`id`, `supplier_id`, `tour_name`, `departure_from`, `pier`, `adult_price`, `child_price`, `start_date`, `end_date`, `notes`, `park_fee_included`, `updated_by`, `created_at`, `updated_at`, `map_url`) VALUES
(19, 7, '4 Islands Speed Boat', 'กระบี่', 'ท่าเรือหาดนพรัตน์ธารา', 500.00, 400.00, '2025-05-15', '2026-05-15', '', 0, 'dev_lay', '2025-08-17 09:21:37', '2025-09-08 09:36:47', ''),
(20, 7, '4 Island Longtail Boat', 'กระบี่', 'ท่าเรือหาดนพรัตน์ธารา', 400.00, 300.00, '2025-05-15', '2026-05-15', 'โซนในเมือง คลองม่วง +100/คน\nทับแขก +200/คน', 0, 'dev_lay', '2025-08-17 10:09:07', '2025-09-08 09:36:10', ''),
(21, 7, 'Hong Island Speed Boat', 'กระบี่', 'ท่าเรือหาดนพรัตน์ธารา', 700.00, 600.00, '2025-05-15', '2026-05-15', 'โซนในเมือง คลองม่วง +100/คน\nทับแขก +200/คน', 0, 'dev_lay', '2025-08-17 10:09:07', '2025-09-03 09:55:40', ''),
(22, 7, 'Hong Island Longtail Boat', 'กระบี่', 'ท่าเรือหาดนพรัตน์ธารา', 600.00, 500.00, '2025-05-15', '2026-05-15', 'โซนในเมือง คลองม่วง +100/คน\nทับแขก +200/คน', 0, 'dev_lay', '2025-08-17 10:09:07', '2025-09-08 09:29:12', ''),
(23, 7, 'Phi Phi Island', 'กระบี่', 'ท่าเรือหาดนพรัตน์ธารา', 800.00, 700.00, '2025-05-15', '2026-05-15', 'โซนในเมือง คลองม่วง +100/คน\nทับแขก +200/คน', 0, 'dev_lay', '2025-08-17 10:09:07', '2025-09-08 09:35:02', ''),
(24, 8, 'Phi Phi + Khai Island Speed Boat', 'ภูเก็ต', '', 1200.00, 1000.00, '2025-01-25', '2026-02-25', '', 0, 'test', '2025-08-17 10:22:50', '2025-08-17 10:22:50', NULL),
(25, 8, 'James Bond Speed Boat', 'ภูเก็ต', '', 1200.00, 1000.00, '2025-01-25', '2026-01-25', '', 0, 'test', '2025-08-17 10:22:50', '2025-08-17 10:22:50', NULL),
(26, 8, '3 Khai Island Speed Boat', 'ภูเก็ต', '', 550.00, 500.00, '2025-01-25', '2026-01-25', '', 0, 'test', '2025-08-17 10:22:50', '2025-08-17 10:22:50', NULL),
(30, 10, 'Phi Phi-Bamboo-Pileh-Maya (Speed boat)', 'ภูเก็ต', 'แหลมหงา', 1800.00, 1300.00, '2024-10-15', '2025-10-14', 'Everyday (Exclude: Towel, Fins, Longtail boat)', 0, 'admin', '2025-08-19 10:10:56', '2025-08-25 08:56:39', 'https://maps.app.goo.gl/qb9XcCmNNVy1NiMt6'),
(31, 10, 'Phi Phi-Khai-Pileh-Maya (Speed boat)', 'ภูเก็ต', 'แหลมหงา', 1500.00, 1000.00, '2024-10-15', '2025-10-14', 'Everyday (Exclude: Towel, Fins, Longtail boat)', 0, 'admin', '2025-08-19 10:10:56', '2025-08-25 08:47:24', 'https://maps.app.goo.gl/qb9XcCmNNVy1NiMt6'),
(32, 10, 'Phi Phi-Khai-Pileh-Maya (Catamaran 2 storeys)', 'ภูเก็ต', 'แหลมหงา', 1800.00, 1300.00, '2024-10-15', '2025-10-14', '20 May–10 Oct 25 Only (Exclude: Towel, Fins, Longtail boat)', 0, 'admin', '2025-08-19 10:10:56', '2025-08-25 08:45:07', 'https://maps.app.goo.gl/qb9XcCmNNVy1NiMt6'),
(33, 10, 'James bond-Khai (Speed boat)', 'ภูเก็ต', 'แหลมหงา', 1500.00, 1000.00, '2024-10-15', '2025-10-14', 'Everyday (Exclude: Towel, Fins)', 0, 'admin', '2025-08-19 10:10:56', '2025-08-25 08:57:11', 'https://maps.app.goo.gl/qb9XcCmNNVy1NiMt6'),
(34, 10, 'Raya Noi-Raya-Maiton (Speed boat)', 'ภูเก็ต', 'แหลมหงา', 1500.00, 1000.00, '2024-10-15', '2025-10-14', 'Tue, Thu, Sun', 0, 'admin', '2025-08-19 10:10:56', '2025-08-25 08:57:33', 'https://maps.app.goo.gl/FhFDEcUwoPZ97Y4R7'),
(35, 10, 'Lazy Phi Phi-Bamboo-Pileh-Maya (Catamaran 2 storeys)', 'ภูเก็ต', 'แหลมหงา', 2100.00, 1600.00, '2024-10-15', '2025-10-14', 'Everyday 10:30 AM (Exclude: Towel, Fins, Longtail boat)', 0, 'admin', '2025-08-19 10:10:56', '2025-08-25 08:31:52', 'https://maps.app.goo.gl/FhFDEcUwoPZ97Y4R7'),
(36, 10, 'Lazy Phi Phi-Khai-Pileh-Maya (Speed boat)', 'ภูเก็ต', 'แหลมหงา', 1500.00, 1000.00, '2024-10-15', '2025-10-14', 'Everyday 10:30 AM (Exclude: Towel, Fins, Longtail boat)', 0, 'admin', '2025-08-19 10:10:56', '2025-08-25 08:37:27', 'https://maps.app.goo.gl/FhFDEcUwoPZ97Y4R7'),
(37, 10, 'Lazy Phi Phi-Khai-Pileh-Maya (Catamaran 2 storeys)', 'ภูเก็ต', 'แหลมหงา', 1800.00, 1300.00, '2024-10-15', '2025-10-14', 'Everyday 10:30 AM (Exclude: Towel, Fins, Longtail boat)', 0, 'admin', '2025-08-19 10:10:56', '2025-08-25 09:07:36', 'https://maps.app.goo.gl/FhFDEcUwoPZ97Y4R7'),
(38, 10, 'Lazy James bond - Koh Yao (Speed boat)', 'ภูเก็ต', 'แหลมหงา', 1500.00, 1000.00, '2024-10-15', '2025-10-14', 'Everyday 10:30 AM (Exclude: Towel, Fins)', 0, 'admin', '2025-08-19 10:10:56', '2025-08-25 09:10:44', 'https://maps.app.goo.gl/FhFDEcUwoPZ97Y4R7'),
(39, 10, 'Rok+Haa (Speed boat)', 'ภูเก็ต', 'แหลมหงา', 2500.00, 1800.00, '2024-10-15', '2025-10-14', 'Wed, Sat (30 Oct 24 – 10 May 25)', 0, 'admin', '2025-08-19 10:10:56', '2025-08-25 09:15:22', 'https://maps.app.goo.gl/FhFDEcUwoPZ97Y4R7'),
(40, 10, 'Similan daytrip (Speed boat)', 'พังงา', 'ทับละมุ', 2300.00, 1600.00, '2024-10-15', '2025-10-14', 'Everyday', 0, 'admin', '2025-08-19 10:10:56', '2025-08-25 09:25:25', 'https://maps.app.goo.gl/cHYUZHdfL5gGPTTL6'),
(41, 10, 'Similan daytrip (Catamaran 2 storeys)', 'พังงา', 'ทับละมุ', 2600.00, 1900.00, '2024-10-15', '2025-10-14', 'Everyday', 0, 'admin', '2025-08-19 10:10:56', '2025-08-25 09:28:21', ''),
(42, 10, 'Lazy Similan (Speed boat)', 'พังงา', 'ทับละมุ', 2300.00, 1600.00, '2024-10-15', '2025-10-14', 'Everyday 10:30 AM', 0, 'admin', '2025-08-19 10:10:56', '2025-08-25 09:30:36', 'https://maps.app.goo.gl/cHYUZHdfL5gGPTTL6'),
(43, 10, 'Lazy Similan (Catamaran 2 storeys)', 'พังงา', 'ทับละมุ', 2600.00, 1900.00, '2024-10-15', '2025-10-14', 'Everyday 10:30 AM', 0, 'admin', '2025-08-19 10:10:56', '2025-08-26 03:36:31', 'https://maps.app.goo.gl/cHYUZHdfL5gGPTTL6'),
(44, 10, 'Similan 2D1N onboard MV KOON1 + Scuba Diving (4 dives)', 'พังงา', 'ทับละมุ', 10200.00, 10200.00, '2024-10-15', '2025-10-14', 'Include Dive leader & gears (Exclude: Dive computer 500฿/trip)', 0, 'admin', '2025-08-19 10:10:56', '2025-08-26 03:37:47', 'https://maps.app.goo.gl/cHYUZHdfL5gGPTTL6'),
(45, 10, 'Similan 2D1N onboard MV KOON1 Non-dive', 'พังงา', 'ทับละมุ', 7200.00, 7200.00, '2024-10-15', '2025-10-14', 'Single stay surcharge 1500฿/night', 0, 'admin', '2025-08-19 10:10:56', '2025-08-26 03:34:50', 'https://maps.app.goo.gl/cHYUZHdfL5gGPTTL6'),
(46, 10, 'Surin daytrip (Speed boat)', 'พังงา', 'บ้านน้ำเค็ม', 2500.00, 1800.00, '2024-10-15', '2025-10-14', 'Everyday (Bungalow 2000฿/night max2, 3000฿/night max4)', 1, 'admin', '2025-08-19 10:10:56', '2025-08-26 03:42:09', 'https://maps.app.goo.gl/ksuqcrpsfGAutrUn8'),
(47, 10, 'Surin 2D1N (Tent)', 'พังงา', 'บ้านน้ำเค็ม', 5200.00, 3600.00, '2024-10-15', '2025-10-14', '', 0, 'admin', '2025-08-19 10:10:56', '2025-08-26 03:45:11', 'https://maps.app.goo.gl/ksuqcrpsfGAutrUn8'),
(48, 10, 'Surin 3D2N (Tent)', 'พังงา', 'บ้านน้ำเค็ม', 6700.00, 4700.00, '2024-10-15', '2025-10-14', '', 0, 'admin', '2025-08-19 10:10:56', '2025-08-26 03:45:56', 'https://maps.app.goo.gl/ksuqcrpsfGAutrUn8'),
(49, 11, '4 Island Speed Boat', 'กระบี่', 'ท่าเรือหาดนพรัตน์ธารา', 500.00, 400.00, '2025-08-26', '2025-10-31', 'ราคาพิเศษ low season วันนี้ - 31 Oct 2025', 0, 'admin', '2025-08-26 04:31:50', '2025-08-26 04:31:50', 'https://maps.app.goo.gl/SGsqB6qFKGkLzKcg6'),
(50, 11, '7 Island Speed Boat', 'กระบี่', 'ท่าเรือหาดนพรัตน์ธารา', 900.00, 800.00, '2025-08-26', '2025-10-31', 'ราคาพิเศษ low season วันนี้ - 31 Oct 2025', 0, 'admin', '2025-08-26 04:31:50', '2025-08-26 04:31:50', 'https://maps.app.goo.gl/SGsqB6qFKGkLzKcg6'),
(51, 11, 'Krabi Jungle Tour C1', 'กระบี่', 'ท่าเรือหาดนพรัตน์ธารา', 800.00, 600.00, '2025-08-26', NULL, 'Hotspring + Emerald Pool (No Food)\nPick up time:\n08.00 – 08.15 am: Pick up time from Klong Muang\n08.30 – 08.45 am: Pick up time from Aonang\n09.00 – 09.15 am: Pick up time from Krabi Town', 0, 'admin', '2025-08-26 04:31:50', '2025-08-26 04:31:50', 'https://maps.app.goo.gl/SGsqB6qFKGkLzKcg6'),
(52, 11, 'Krabi Jungle Tour C2', 'กระบี่', 'ท่าเรือหาดนพรัตน์ธารา', 900.00, 700.00, '2025-08-26', NULL, 'Hotspring + Emerald Pool + Tiger cave temple + Food\nPick up time:\n08.00 – 08.15 am: Pick up time from Klong Muang\n08.30 – 08.45 am: Pick up time from Aonang\n09.00 – 09.15 am: Pick up time from Krabi Town', 0, 'admin', '2025-08-26 04:31:50', '2025-08-26 04:31:50', 'https://maps.app.goo.gl/SGsqB6qFKGkLzKcg6'),
(53, 11, 'Krabi Jungle Tour C3', 'กระบี่', 'ท่าเรือหาดนพรัตน์ธารา', 1400.00, 1200.00, '2025-08-26', NULL, 'Hotspring + Emerald Pool + ATV 40 min + Food\nPick up time:\n08.00 – 08.15 am: Pick up time from Klong Muang\n08.30 – 08.45 am: Pick up time from Aonang\n09.00 – 09.15 am: Pick up time from Krabi Town', 0, 'admin', '2025-08-26 04:31:50', '2025-08-26 04:31:50', 'https://maps.app.goo.gl/SGsqB6qFKGkLzKcg6'),
(54, 11, 'Krabi Jungle Tour C4', 'กระบี่', 'ท่าเรือหาดนพรัตน์ธารา', 1400.00, 1200.00, '2025-08-26', NULL, 'Hotspring + Emerald Pool + Tiger cave temple + ATV 40 min + Food\nPick up time:\n08.00 – 08.15 am: Pick up time from Klong Muang\n08.30 – 08.45 am: Pick up time from Aonang\n09.00 – 09.15 am: Pick up time from Krabi Town', 0, 'admin', '2025-08-26 04:31:50', '2025-08-26 04:31:50', 'https://maps.app.goo.gl/SGsqB6qFKGkLzKcg6'),
(55, 11, 'Krabi Jungle Tour C5', 'กระบี่', 'ท่าเรือหาดนพรัตน์ธารา', 1400.00, 1200.00, '2025-08-26', NULL, 'Hotspring + Emerald Pool + Kayaking + Food\nPick up time:\n08.00 – 08.15 am: Pick up time from Klong Muang\n08.30 – 08.45 am: Pick up time from Aonang\n09.00 – 09.15 am: Pick up time from Krabi Town', 0, 'admin', '2025-08-26 04:31:50', '2025-08-26 04:31:50', 'https://maps.app.goo.gl/SGsqB6qFKGkLzKcg6'),
(56, 12, 'Phuket City Tour A', 'ภูเก็ต', NULL, 900.00, 800.00, NULL, NULL, 'Jungle Walk & Dragon Stair, Zipline Cable 3 Stations, Abseil (Weight limit 120 kg)\n\nIncluded in every program:\n- Insurance\n- English-speaking tour guide\n- Soft drink\n- Round-trip transfer\n- Every tour depends on the weather.', 0, NULL, '2025-08-27 04:24:37', '2025-08-27 04:26:49', NULL),
(57, 12, 'Phuket City Tour B', 'ภูเก็ต', NULL, 800.00, 600.00, NULL, NULL, 'Elephant Trekking, Elephant Show, Monkey Show\n\nIncluded in every program:\n- Insurance\n- English-speaking tour guide\n- Soft drink\n- Round-trip transfer\n- Every tour depends on the weather.', 0, NULL, '2025-08-27 04:24:37', '2025-08-27 04:26:49', NULL),
(58, 12, 'Phuket City Tour C', 'ภูเก็ต', NULL, 1000.00, 900.00, NULL, NULL, 'Elephant Trekking 30 Mins. + ATV 30 Mins\n\nIncluded in every program:\n- Insurance\n- English-speaking tour guide\n- Soft drink\n- Round-trip transfer\n- Every tour depends on the weather.', 0, NULL, '2025-08-27 04:24:37', '2025-08-27 04:26:49', NULL),
(59, 12, 'Phuket City Tour D', 'ภูเก็ต', NULL, 600.00, 500.00, NULL, NULL, 'Elephant Trekking 30 Mins.\n\nIncluded in every program:\n- Insurance\n- English-speaking tour guide\n- Soft drink\n- Round-trip transfer\n- Every tour depends on the weather.', 0, NULL, '2025-08-27 04:24:37', '2025-08-27 04:26:49', NULL),
(60, 12, 'Phuket City Tour E', 'ภูเก็ต', NULL, 400.00, 300.00, NULL, NULL, 'Sightseeing Tour + Night Market everyday\n\nIncluded in every program:\n- Insurance\n- English-speaking tour guide\n- Soft drink\n- Round-trip transfer\n- Every tour depends on the weather.', 0, NULL, '2025-08-27 04:24:37', '2025-08-27 04:26:49', NULL),
(61, 12, 'Phuket City Tour Tiger 1', 'ภูเก็ต', NULL, 1100.00, 1000.00, NULL, NULL, 'Tiger, Elephant Trekking 30 Mins.\n\nIncluded in every program:\n- Insurance\n- English-speaking tour guide\n- Soft drink\n- Round-trip transfer\n- Every tour depends on the weather.\n\nAge policy:\n- From 16 years old up: 1 size of tiger included (Smallest, Small, Medium, or Big)\n- Under 16 years: allowed to see smallest tiger only', 0, NULL, '2025-08-27 04:29:53', '2025-08-27 04:29:59', NULL),
(62, 12, 'Phuket City Tour Tiger 2', 'ภูเก็ต', NULL, 900.00, 800.00, NULL, NULL, 'Tiger Only\n\nIncluded in every program:\n- Insurance\n- English-speaking tour guide\n- Soft drink\n- Round-trip transfer\n- Every tour depends on the weather.\n\nAge policy:\n- From 16 years old up: 1 size of tiger included (Smallest, Small, Medium, or Big)\n- Under 16 years: allowed to see smallest tiger only', 0, NULL, '2025-08-27 04:29:53', '2025-08-27 04:29:59', NULL),
(63, 12, 'Phuket City Tour Tiger 3', 'ภูเก็ต', NULL, 1300.00, 1200.00, NULL, NULL, 'Tiger, ATV 30 Mins.\n\nIncluded in every program:\n- Insurance\n- English-speaking tour guide\n- Soft drink\n- Round-trip transfer\n- Every tour depends on the weather.\n\nAge policy:\n- From 16 years old up: 1 size of tiger included (Smallest, Small, Medium, or Big)\n- Under 16 years: allowed to see smallest tiger only', 0, NULL, '2025-08-27 04:29:53', '2025-08-27 04:29:59', NULL),
(64, 12, 'Phuket City Tour Tiger 4', 'ภูเก็ต', NULL, 1500.00, 1300.00, NULL, NULL, 'Tiger, Elephant Trekking 30 Mins. + ATV 30 Mins.\n\nIncluded in every program:\n- Insurance\n- English-speaking tour guide\n- Soft drink\n- Round-trip transfer\n- Every tour depends on the weather.\n\nAge policy:\n- From 16 years old up: 1 size of tiger included (Smallest, Small, Medium, or Big)\n- Under 16 years: allowed to see smallest tiger only', 0, NULL, '2025-08-27 04:29:53', '2025-08-27 04:29:59', NULL),
(65, 12, 'Phuket City Tour Tiger 5', 'ภูเก็ต', NULL, 1000.00, 900.00, NULL, NULL, 'Tiger, Snake Show 20 Mins.\n\nIncluded in every program:\n- Insurance\n- English-speaking tour guide\n- Soft drink\n- Round-trip transfer\n- Every tour depends on the weather.\n\nAge policy:\n- From 16 years old up: 1 size of tiger included (Smallest, Small, Medium, or Big)\n- Under 16 years: allowed to see smallest tiger only', 0, NULL, '2025-08-27 04:29:53', '2025-08-27 04:29:59', NULL),
(66, 13, '7 Islands Speed Boat', 'กระบี่', 'อ่าวน้ำเมา', 1000.00, 800.00, '2025-08-27', NULL, 'Khongmueng + 100\n\nราคานี้ไม่รวมอุทยาน (not includes national park fee)\n- นักท่องเที่ยวต่างชาติจ่ายค่าธรรมเนียมอุทยาน ผู้ใหญ่ 200 บาทต่อคน เด็ก 100 บาทต่อคน\n- นักท่องเที่ยวชาวไทยรวมค่าธรรมเนียมเรียบร้อย (ผู้ใหญ่ 40 บาทต่อคน เด็ก 20 บาท)\n\nราคานี้รวม (Includes):\n- Mask & snorkel\n- Life jacket\n- Drinking water\n- Fruit\n- Dinner menu set at Sand Sea Resort Restaurant\n- Insurance guide\n\nเวลารับลูกค้า (Pick up time)\n- คลองม่วง / ในเมือง / Klong Muang / Krabi Town: 12.30 PM\n- อ่าวนาง / Ao Nang: 12.30 – 1.20 PM\n\nหมายเหตุ (Remarks):\n- ในกรณีชำระไม่ทำกับภาษี บวกเพิ่ม 7%\n- ในกรณีลูกค้ายกเลิก (ทุกกรณี) จะต้องแจ้งก่อนเวลา 11.00 น. หากแจ้งหลังจากนั้น ทางบริษัทขอเก็บราคาเต็ม 100%', 0, 'dev_lay', '2025-08-27 04:40:58', '2025-09-08 09:52:18', 'https://maps.app.goo.gl/w537ADQj2jxBrpsN8'),
(67, 13, '7 Islands Longtail Boat', 'กระบี่', 'อ่าวน้ำเมา', 700.00, 500.00, '2025-08-27', NULL, 'Khongmueng + 100\n\nราคานี้ไม่รวมอุทยาน (not includes national park fee)\n- นักท่องเที่ยวต่างชาติจ่ายค่าธรรมเนียมอุทยาน ผู้ใหญ่ 200 บาทต่อคน เด็ก 100 บาทต่อคน\n- นักท่องเที่ยวชาวไทยรวมค่าธรรมเนียมเรียบร้อย (ผู้ใหญ่ 40 บาทต่อคน เด็ก 20 บาท)\n\nราคานี้รวม (Includes):\n- Mask & snorkel\n- Life jacket\n- Drinking water\n- Fruit\n- Dinner menu set at Sand Sea Resort Restaurant\n- Insurance guide\n\nเวลารับลูกค้า (Pick up time)\n- คลองม่วง / ในเมือง / Klong Muang / Krabi Town: 12.30 PM\n- อ่าวนาง / Ao Nang: 12.30 – 1.20 PM\n\nหมายเหตุ (Remarks):\n- ในกรณีชำระไม่ทำกับภาษี บวกเพิ่ม 7%\n- ในกรณีลูกค้ายกเลิก (ทุกกรณี) จะต้องแจ้งก่อนเวลา 11.00 น. หากแจ้งหลังจากนั้น ทางบริษัทขอเก็บราคาเต็ม 100%', 0, 'admin', '2025-08-27 04:40:58', '2025-08-27 04:40:58', 'https://maps.app.goo.gl/w537ADQj2jxBrpsN8'),
(68, 14, 'Kayak A', 'กระบี่', NULL, 300.00, 200.00, NULL, NULL, '- บริการทุกโปรแกรม รวม น้ำดื่ม / ผลไม้ / ไกด์ / ประกัน / กระเป๋ากันน้ำ / เสื้อชูชีพ / รถรับ-ส่ง\n- เวลารับ: 08:30 น. / 13:00 น. / 15:30 น. (ในเมืองและคลองม่วงมีค่ารับ-ส่งเพิ่ม 100 บาท)', 0, NULL, '2025-08-27 06:14:43', '2025-08-27 06:14:43', NULL),
(69, 14, 'Kayak B (Feed)', 'กระบี่', NULL, 600.00, 400.00, NULL, NULL, '- บริการทุกโปรแกรม รวม น้ำดื่ม / ผลไม้ / ไกด์ / ประกัน / กระเป๋ากันน้ำ / เสื้อชูชีพ / รถรับ-ส่ง\n- เวลารับ: 08:30 น. / 13:00 น. / 15:30 น. (ในเมืองและคลองม่วงมีค่ารับ-ส่งเพิ่ม 100 บาท)', 0, NULL, '2025-08-27 06:14:43', '2025-08-27 06:14:43', NULL),
(70, 14, 'Kayak C (Trekking)', 'กระบี่', NULL, 1000.00, 600.00, NULL, NULL, '- บริการทุกโปรแกรม รวม น้ำดื่ม / ผลไม้ / ไกด์ / ประกัน / กระเป๋ากันน้ำ / เสื้อชูชีพ / รถรับ-ส่ง\n- เวลารับ: 08:30 น. / 13:00 น. / 15:30 น. (ในเมืองและคลองม่วงมีค่ารับ-ส่งเพิ่ม 100 บาท)', 0, NULL, '2025-08-27 06:14:43', '2025-08-27 06:14:43', NULL),
(71, 14, 'Kayak D (Bathing)', 'กระบี่', NULL, 1200.00, 700.00, NULL, NULL, '- บริการทุกโปรแกรม รวม น้ำดื่ม / ผลไม้ / ไกด์ / ประกัน / กระเป๋ากันน้ำ / เสื้อชูชีพ / รถรับ-ส่ง\n- เวลารับ: 08:30 น. / 13:00 น. / 15:30 น. (ในเมืองและคลองม่วงมีค่ารับ-ส่งเพิ่ม 100 บาท)', 0, NULL, '2025-08-27 06:14:43', '2025-08-27 06:14:43', NULL),
(72, 14, 'Kayak E (ATV)', 'กระบี่', NULL, 1000.00, 600.00, NULL, NULL, '- บริการทุกโปรแกรม รวม น้ำดื่ม / ผลไม้ / ไกด์ / ประกัน / กระเป๋ากันน้ำ / เสื้อชูชีพ / รถรับ-ส่ง\n- เวลารับ: 08:30 น. / 13:00 น. / 15:30 น. (ในเมืองและคลองม่วงมีค่ารับ-ส่งเพิ่ม 100 บาท)', 0, NULL, '2025-08-27 06:14:43', '2025-08-27 06:14:43', NULL),
(73, 14, 'Kayak F (Trekking + ATV)', 'กระบี่', NULL, 1700.00, 1300.00, NULL, NULL, '- บริการทุกโปรแกรม รวม น้ำดื่ม / ผลไม้ / ไกด์ / ประกัน / กระเป๋ากันน้ำ / เสื้อชูชีพ / รถรับ-ส่ง\n- เฉพาะโปรแกรม F และ G มีข้าวและเครื่องดื่ม\n- เวลารับ: 08:30 น. / 13:00 น. / 15:30 น. (ในเมืองและคลองม่วงมีค่ารับ-ส่งเพิ่ม 100 บาท)', 0, NULL, '2025-08-27 06:14:43', '2025-08-27 06:14:43', NULL),
(74, 14, 'Kayak G (Bathing + ATV)', 'กระบี่', NULL, 1900.00, 1500.00, NULL, NULL, '- บริการทุกโปรแกรม รวม น้ำดื่ม / ผลไม้ / ไกด์ / ประกัน / กระเป๋ากันน้ำ / เสื้อชูชีพ / รถรับ-ส่ง\n- เฉพาะโปรแกรม F และ G มีข้าวและเครื่องดื่ม\n- เวลารับ: 08:30 น. / 13:00 น. / 15:30 น. (ในเมืองและคลองม่วงมีค่ารับ-ส่งเพิ่ม 100 บาท)', 0, NULL, '2025-08-27 06:14:43', '2025-08-27 06:14:43', NULL),
(75, 15, 'Phi Phi Catamaran (Upper Deck)', 'กระบี่', NULL, 2000.00, 1600.00, NULL, NULL, 'Ticket Itinerary: Krabi to Phi Phi Island\nDescription: Full day trip from Ao Nang to Phi Phi Island\nTrip Duration: Approx. 11:30 – 19:30 hrs\nOperating Schedule: Every Monday, Every Saturday, Every First and Third Thursday of the month. Day Off: Every Wednesday (except festive holiday)\n\nAttraction Inclusion and Sunset Cruise: Viking Cave, Tonsai Bay, Monkey Bay, Maya Bay, Nui Bay, Chicken Island, Bamboo Island\n\nMeal Inclusion on board: Welcome Drink, One time Afternoon Refreshment, One time Buffet Lunch, One time Buffet Dinner\n\nSeating: Shared Seating, Capacity: 1–6 persons, No. of Cabana: 8', 0, NULL, '2025-08-27 09:32:58', '2025-09-03 06:11:37', NULL),
(76, 15, 'Phi Phi Catamaran (Main Deck)', 'กระบี่', NULL, 2320.00, 1840.00, NULL, NULL, 'Ticket Itinerary: Krabi to Phi Phi Island\nDescription: Full day trip from Ao Nang to Phi Phi Island\nTrip Duration: Approx. 11:30 – 19:30 hrs\nOperating Schedule: Every Monday, Every Saturday, Every First and Third Thursday of the month. Day Off: Every Wednesday (except festive holiday)\n\nAttraction Inclusion and Sunset Cruise: Viking Cave, Tonsai Bay, Monkey Bay, Maya Bay, Nui Bay, Chicken Island, Bamboo Island\n\nMeal Inclusion on board: Welcome Drink, One time Afternoon Refreshment, One time Buffet Lunch, One time Buffet Dinner\n\nSeating: Shared Seating, Capacity: 1–6 persons, No. of Cabana: 10', 0, NULL, '2025-08-27 09:32:58', '2025-09-03 06:11:37', NULL),
(77, 15, 'Phi Phi Catamaran (VIP Cabana)', 'กระบี่', NULL, 16000.00, 0.00, NULL, NULL, 'Ticket Itinerary: Krabi to Phi Phi Island\nDescription: Full day trip from Ao Nang to Phi Phi Island\nTrip Duration: Approx. 11:30 – 19:30 hrs\nOperating Schedule: Every Monday, Every Saturday, Every First and Third Thursday of the month. Day Off: Every Wednesday (except festive holiday)\n\nAttraction Inclusion and Sunset Cruise: Viking Cave, Tonsai Bay, Monkey Bay, Maya Bay, Nui Bay, Chicken Island, Bamboo Island\n\nMeal Inclusion on board: Welcome Drink, One time Afternoon Refreshment, One time Buffet Lunch, One time Buffet Dinner\n\nSeating: Private Seating, Capacity: 1–5 persons, No. of Cabana: 2', 0, NULL, '2025-08-27 09:32:58', '2025-09-03 06:11:37', NULL),
(78, 15, '4 Island Catamaran (Upper Deck)', 'กระบี่', NULL, 1200.00, 960.00, NULL, NULL, 'Ticket Itinerary: Krabi 4 Island\nDescription: Half day trip within Krabi\nTrip Duration: Approx. 16:00 – 20:00 hrs\nOperating Schedule: Every Sunday, Every Tuesday, Every Friday of the month. Day Off: Every Wednesday (except festive holiday)\n\nAttraction Inclusion and Sunset Cruise: Railay Bay, Poda Island, Tup Island, Chicken Island\n\nMeal Inclusion on board: Welcome Drink, One time Buffet Dinner\n\nSeating: Shared Seating, Capacity: 1–6 persons, No. of Cabana: 8', 0, NULL, '2025-08-27 09:32:58', '2025-09-03 06:11:37', NULL),
(79, 15, '4 Island Catamaran (Main Deck)', 'กระบี่', NULL, 1200.00, 960.00, NULL, NULL, 'Ticket Itinerary: Krabi 4 Island\nDescription: Half day trip within Krabi\nTrip Duration: Approx. 16:00 – 20:00 hrs\nOperating Schedule: Every Sunday, Every Tuesday, Every Friday of the month. Day Off: Every Wednesday (except festive holiday)\n\nAttraction Inclusion and Sunset Cruise: Railay Bay, Poda Island, Tup Island, Chicken Island\n\nMeal Inclusion on board: Welcome Drink, One time Buffet Dinner\n\nSeating: Shared Seating, Capacity: 1–6 persons, No. of Cabana: 10', 0, NULL, '2025-08-27 09:32:58', '2025-09-03 06:11:37', NULL),
(80, 15, '4 Island Catamaran (VIP Cabana)', 'กระบี่', NULL, 4800.00, 0.00, NULL, NULL, 'Ticket Itinerary: Krabi 4 Island\nDescription: Half day trip within Krabi\nTrip Duration: Approx. 16:00 – 20:00 hrs\nOperating Schedule: Every Sunday, Every Tuesday, Every Friday of the month. Day Off: Every Wednesday (except festive holiday)\n\nAttraction Inclusion and Sunset Cruise: Railay Bay, Poda Island, Tup Island, Chicken Island\n\nMeal Inclusion on board: Welcome Drink, One time Buffet Dinner\n\nSeating: Private Seating, Capacity: 1–5 persons, No. of Cabana: 2', 0, NULL, '2025-08-27 09:32:58', '2025-09-03 06:11:37', NULL),
(81, 16, 'Phi Phi - Khai (Catamaran 2 Engines)', 'ภูเก็ต', NULL, 36500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 2 Engines (Max 36 pax).', 0, NULL, '2025-08-27 09:49:19', '2025-08-27 09:49:19', NULL),
(82, 16, 'Phi Phi - Khai (Catamaran 4 Engines)', 'ภูเก็ต', NULL, 63500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 4 Engines (Max 66 pax).', 0, NULL, '2025-08-27 09:49:19', '2025-08-27 09:49:19', NULL),
(83, 16, 'Phi Phi - Khai (Speedboat 3 Engines)', 'ภูเก็ต', NULL, 44500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nSpeedboat 3 Engines (Max 44 pax).', 0, NULL, '2025-08-27 09:49:19', '2025-08-27 09:49:19', NULL),
(84, 16, 'Phi Phi - Khai (Catamaran 2 Engines)', 'ภูเก็ต', NULL, 36500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 2 Engines (Max 36 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(85, 16, 'Phi Phi - Khai (Catamaran 4 Engines)', 'ภูเก็ต', NULL, 63500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 4 Engines (Max 66 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(86, 16, 'Phi Phi - Khai (Speedboat 3 Engines)', 'ภูเก็ต', NULL, 44500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nSpeedboat 3 Engines (Max 44 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(87, 16, 'Phi Phi - Bamboo (Catamaran 2 Engines)', 'ภูเก็ต', NULL, 38500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 2 Engines (Max 36 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(88, 16, 'Phi Phi - Bamboo (Catamaran 4 Engines)', 'ภูเก็ต', NULL, 68500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 4 Engines (Max 66 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(89, 16, 'Phi Phi - Bamboo (Speedboat 3 Engines)', 'ภูเก็ต', NULL, 46500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nSpeedboat 3 Engines (Max 44 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(90, 16, 'Phi Phi - Bamboo - Khai (Catamaran 2 Engines)', 'ภูเก็ต', NULL, 39500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 2 Engines (Max 36 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(91, 16, 'Phi Phi - Bamboo - Khai (Catamaran 4 Engines)', 'ภูเก็ต', NULL, 69500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 4 Engines (Max 66 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(92, 16, 'Phi Phi - Bamboo - Khai (Speedboat 3 Engines)', 'ภูเก็ต', NULL, 47500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nSpeedboat 3 Engines (Max 44 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(93, 16, 'James Bond - Naka Island (Catamaran 2 Engines)', 'ภูเก็ต', NULL, 37500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 2 Engines (Max 36 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(94, 16, 'James Bond - Naka Island (Catamaran 4 Engines)', 'ภูเก็ต', NULL, 64500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 4 Engines (Max 66 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(95, 16, 'James Bond - Naka Island (Speedboat 3 Engines)', 'ภูเก็ต', NULL, 45500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nSpeedboat 3 Engines (Max 44 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(96, 16, 'James Bond - Krabi (Catamaran 2 Engines)', 'ภูเก็ต', NULL, 50000.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 2 Engines (Max 36 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(97, 16, 'James Bond - Krabi (Catamaran 4 Engines)', 'ภูเก็ต', NULL, 84000.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 4 Engines (Max 66 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(98, 16, 'James Bond - Krabi (Speedboat 3 Engines)', 'ภูเก็ต', NULL, 63500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nSpeedboat 3 Engines (Max 44 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(99, 16, 'Phi Phi - Krabi (Chicken-Poda) (Catamaran 2 Engines)', 'ภูเก็ต', NULL, 50000.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 2 Engines (Max 36 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(100, 16, 'Phi Phi - Krabi (Chicken-Poda) (Catamaran 4 Engines)', 'ภูเก็ต', NULL, 84000.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 4 Engines (Max 66 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(101, 16, 'Phi Phi - Krabi (Chicken-Poda) (Speedboat 3 Engines)', 'ภูเก็ต', NULL, 63500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nSpeedboat 3 Engines (Max 44 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(102, 16, 'Phi Phi - James Bond (Catamaran 2 Engines)', 'ภูเก็ต', NULL, 54000.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 2 Engines (Max 36 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(103, 16, 'Phi Phi - James Bond (Catamaran 4 Engines)', 'ภูเก็ต', NULL, 103500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 4 Engines (Max 66 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(104, 16, 'Phi Phi - James Bond (Speedboat 3 Engines)', 'ภูเก็ต', NULL, 82500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nSpeedboat 3 Engines (Max 44 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(105, 16, 'Phi Phi - Krabi - James Bond (Catamaran 2 Engines)', 'ภูเก็ต', NULL, 61500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 2 Engines (Max 36 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(106, 16, 'Phi Phi - Krabi - James Bond (Catamaran 4 Engines)', 'ภูเก็ต', NULL, 121000.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 4 Engines (Max 66 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(107, 16, 'Phi Phi - Krabi - James Bond (Speedboat 3 Engines)', 'ภูเก็ต', NULL, 95500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nSpeedboat 3 Engines (Max 44 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(108, 16, 'Phi Phi (2 Days 1 Night) (Catamaran 2 Engines)', 'ภูเก็ต', NULL, 77500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 2 Engines (Max 36 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(109, 16, 'Phi Phi (2 Days 1 Night) (Catamaran 4 Engines)', 'ภูเก็ต', NULL, 102000.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 4 Engines (Max 66 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(110, 16, 'Phi Phi (2 Days 1 Night) (Speedboat 3 Engines)', 'ภูเก็ต', NULL, 84500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nSpeedboat 3 Engines (Max 44 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(111, 16, 'Phi Phi - Krabi - James Bond (2 Days 1 Night) (Catamaran 2 Engines)', 'ภูเก็ต', NULL, 84500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 2 Engines (Max 36 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(112, 16, 'Phi Phi - Krabi - James Bond (2 Days 1 Night) (Catamaran 4 Engines)', 'ภูเก็ต', NULL, 129500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 4 Engines (Max 66 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(113, 16, 'Phi Phi - Krabi - James Bond (2 Days 1 Night) (Speedboat 3 Engines)', 'ภูเก็ต', NULL, 105500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nSpeedboat 3 Engines (Max 44 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(114, 16, 'Phi Phi - Koh Rok (2 Days 1 Night) (Catamaran 2 Engines)', 'ภูเก็ต', NULL, 89000.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 2 Engines (Max 36 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(115, 16, 'Phi Phi - Koh Rok (2 Days 1 Night) (Catamaran 4 Engines)', 'ภูเก็ต', NULL, 134500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 4 Engines (Max 66 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(116, 16, 'Phi Phi - Koh Rok (2 Days 1 Night) (Speedboat 3 Engines)', 'ภูเก็ต', NULL, 110000.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nSpeedboat 3 Engines (Max 44 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(117, 16, 'Khai Nui - Khai Nok (Catamaran 2 Engines)', 'ภูเก็ต', NULL, 29000.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 2 Engines (Max 36 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(118, 16, 'Khai Nui - Khai Nok (Catamaran 4 Engines)', 'ภูเก็ต', NULL, 41000.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 4 Engines (Max 66 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(119, 16, 'Khai Nui - Khai Nok (Speedboat 3 Engines)', 'ภูเก็ต', NULL, 32500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nSpeedboat 3 Engines (Max 44 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(120, 16, 'Racha (Catamaran 2 Engines)', 'ภูเก็ต', NULL, 37000.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 2 Engines (Max 36 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(121, 16, 'Racha (Catamaran 4 Engines)', 'ภูเก็ต', NULL, 57500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 4 Engines (Max 66 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(122, 16, 'Racha (Speedboat 3 Engines)', 'ภูเก็ต', NULL, 43500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nSpeedboat 3 Engines (Max 44 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(123, 16, 'Coral (Catamaran 2 Engines)', 'ภูเก็ต', NULL, 33500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 2 Engines (Max 36 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(124, 16, 'Coral (Catamaran 4 Engines)', 'ภูเก็ต', NULL, 50500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 4 Engines (Max 66 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(125, 16, 'Coral (Speedboat 3 Engines)', 'ภูเก็ต', NULL, 38000.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nSpeedboat 3 Engines (Max 44 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(126, 16, 'Racha - Coral (Catamaran 2 Engines)', 'ภูเก็ต', NULL, 38500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 2 Engines (Max 36 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(127, 16, 'Racha - Coral (Catamaran 4 Engines)', 'ภูเก็ต', NULL, 59500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 4 Engines (Max 66 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(128, 16, 'Racha - Coral (Speedboat 3 Engines)', 'ภูเก็ต', NULL, 44500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nSpeedboat 3 Engines (Max 44 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(129, 16, 'Racha - Coral - Maithon (Catamaran 2 Engines)', 'ภูเก็ต', NULL, 40000.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 2 Engines (Max 36 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(130, 16, 'Racha - Coral - Maithon (Catamaran 4 Engines)', 'ภูเก็ต', NULL, 65000.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 4 Engines (Max 66 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(131, 16, 'Racha - Coral - Maithon (Speedboat 3 Engines)', 'ภูเก็ต', NULL, 47500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nSpeedboat 3 Engines (Max 44 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(132, 16, 'Similan (from RPM) (Catamaran 2 Engines)', 'ภูเก็ต', NULL, 65500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 2 Engines (Max 36 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(133, 16, 'Similan (from RPM) (Catamaran 4 Engines)', 'ภูเก็ต', NULL, 113000.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 4 Engines (Max 66 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(134, 16, 'Similan (from RPM) (Speedboat 3 Engines)', 'ภูเก็ต', NULL, 87000.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nSpeedboat 3 Engines (Max 44 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(135, 16, 'Phi Phi - Maithon (Catamaran 2 Engines)', 'ภูเก็ต', NULL, 42500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 2 Engines (Max 36 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(136, 16, 'Phi Phi - Maithon (Catamaran 4 Engines)', 'ภูเก็ต', NULL, 69000.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 4 Engines (Max 66 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(137, 16, 'Phi Phi - Maithon (Speedboat 3 Engines)', 'ภูเก็ต', NULL, 52000.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nSpeedboat 3 Engines (Max 44 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(138, 16, 'Phi Phi - Coral (Catamaran 2 Engines)', 'ภูเก็ต', NULL, 45000.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 2 Engines (Max 36 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(139, 16, 'Phi Phi - Coral (Catamaran 4 Engines)', 'ภูเก็ต', NULL, 73500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nPower Catamaran 4 Engines (Max 66 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(140, 16, 'Phi Phi - Coral (Speedboat 3 Engines)', 'ภูเก็ต', NULL, 55500.00, 0.00, NULL, NULL, 'Chartered Empty Boat (Zero Pax)\nSpeedboat 3 Engines (Max 44 pax).', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(141, 16, 'Semi-Yacht Mindy (Phi Phi - Khai)', 'ภูเก็ต', NULL, 81000.00, 0.00, NULL, NULL, 'Chartered Boat Semi-Yacht (Mindy)\nMax 72 pax\nRoute: Phi Phi - Khai.', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(142, 16, 'Semi-Yacht Mindy (Phi Phi - Bamboo)', 'ภูเก็ต', NULL, 88000.00, 0.00, NULL, NULL, 'Chartered Boat Semi-Yacht (Mindy)\nMax 72 pax\nRoute: Phi Phi - Bamboo.', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(143, 16, 'Semi-Yacht Mindy (James Bond - Naka)', 'ภูเก็ต', NULL, 88000.00, 0.00, NULL, NULL, 'Chartered Boat Semi-Yacht (Mindy)\nMax 72 pax\nRoute: James Bond - Naka Island.', 0, NULL, '2025-08-27 09:54:33', '2025-08-27 09:54:33', NULL),
(144, 17, 'Phi Phi Islands by Cruise – Daily Package Tour (Economy Seats)', 'ภูเก็ต', NULL, 800.00, 700.00, '2024-11-01', '2025-10-31', 'Selling Price: Adult 1,800 / Child 1,500\nNet Price: Adult 800 / Child 700\nRemark: Rate not included National Park Fee.\nValid: 1 Nov 2024 – 31 Oct 2025', 0, NULL, '2025-08-31 15:06:45', '2025-08-31 15:06:45', NULL),
(145, 17, 'Phi Phi Islands by Cruise – Daily Package Tour (Silver Seats)', 'ภูเก็ต', NULL, 1300.00, 1100.00, '2024-11-01', '2025-10-31', 'Selling Price: Adult 2,300 / Child 1,800\nNet Price: Adult 1,300 / Child 1,100\nRemark: Rate not included National Park Fee.\nValid: 1 Nov 2024 – 31 Oct 2025', 0, NULL, '2025-08-31 15:06:45', '2025-08-31 15:06:45', NULL),
(146, 17, 'Phi Phi Islands by Cruise – Daily Package Tour (Gold Seats)', 'ภูเก็ต', NULL, 1500.00, 1300.00, '2024-11-01', '2025-10-31', 'Selling Price: Adult 3,200 / Child 2,500\nNet Price: Adult 1,500 / Child 1,300\nRemark: Rate not included National Park Fee.\nValid: 1 Nov 2024 – 31 Oct 2025', 0, NULL, '2025-08-31 15:06:45', '2025-08-31 15:06:45', NULL),
(147, 17, 'Phi Phi Islands by Cruise – Transportation (Economy Seats - One Way)', 'ภูเก็ต', NULL, 400.00, 300.00, '2024-11-01', '2025-10-31', 'Selling Price: Adult 700 / Child 500\nNet Price: Adult 400 / Child 300\nValid: 1 Nov 2024 – 31 Oct 2025', 0, NULL, '2025-08-31 15:06:49', '2025-08-31 15:06:49', NULL),
(148, 17, 'Phi Phi Islands by Cruise – Transportation (Economy Seats - Round Trip)', 'ภูเก็ต', NULL, 700.00, 500.00, '2024-11-01', '2025-10-31', 'Selling Price: Adult 1,200 / Child 1,000\nNet Price: Adult 700 / Child 500\nValid: 1 Nov 2024 – 31 Oct 2025', 0, NULL, '2025-08-31 15:06:49', '2025-08-31 15:06:49', NULL),
(149, 17, 'Phi Phi Islands by Cruise – Transportation (Silver Seats - One Way)', 'ภูเก็ต', NULL, 900.00, 700.00, '2024-11-01', '2025-10-31', 'Selling Price: Adult 1,000 / Child 800\nNet Price: Adult 900 / Child 700\nValid: 1 Nov 2024 – 31 Oct 2025', 0, NULL, '2025-08-31 15:06:49', '2025-08-31 15:06:49', NULL),
(150, 17, 'Phi Phi Islands by Cruise – Transportation (Silver Seats - Round Trip Same Day)', 'ภูเก็ต', NULL, 1200.00, 900.00, '2024-11-01', '2025-10-31', 'Selling Price: Adult 1,500 / Child 1,300\nNet Price: Adult 1,200 / Child 900\nValid: 1 Nov 2024 – 31 Oct 2025', 0, NULL, '2025-08-31 15:06:49', '2025-08-31 15:06:49', NULL),
(151, 17, 'Phi Phi Islands by Cruise – Transportation (Silver Seats - Round Trip Overnight)', 'ภูเก็ต', NULL, 1700.00, 1300.00, '2024-11-01', '2025-10-31', 'Selling Price: Adult 2,000 / Child 1,600\nNet Price: Adult 1,700 / Child 1,300\nValid: 1 Nov 2024 – 31 Oct 2025', 0, NULL, '2025-08-31 15:06:49', '2025-08-31 15:06:49', NULL),
(152, 17, 'Phi Phi Islands by Cruise – Transportation (Gold Seats - One Way)', 'ภูเก็ต', NULL, 1100.00, 900.00, '2024-11-01', '2025-10-31', 'Selling Price: Adult 1,500 / Child 1,300\nNet Price: Adult 1,100 / Child 900\nValid: 1 Nov 2024 – 31 Oct 2025', 0, NULL, '2025-08-31 15:06:49', '2025-08-31 15:06:49', NULL),
(153, 17, 'Phi Phi Islands by Cruise – Transportation (Gold Seats - Round Trip Same Day)', 'ภูเก็ต', NULL, 1400.00, 1100.00, '2024-11-01', '2025-10-31', 'Selling Price: Adult 2,000 / Child 1,800\nNet Price: Adult 1,400 / Child 1,100\nValid: 1 Nov 2024 – 31 Oct 2025', 0, NULL, '2025-08-31 15:06:49', '2025-08-31 15:06:49', NULL),
(154, 17, 'Phi Phi Islands by Cruise – Transportation (Gold Seats - Round Trip Overnight)', 'ภูเก็ต', NULL, 2100.00, 1700.00, '2024-11-01', '2025-10-31', 'Selling Price: Adult 2,500 / Child 2,200\nNet Price: Adult 2,100 / Child 1,700\nValid: 1 Nov 2024 – 31 Oct 2025', 0, NULL, '2025-08-31 15:06:49', '2025-08-31 15:06:49', NULL),
(155, 17, 'Phi Phi Islands by Cruise – Phi Phi + Khai (Speed Boat) [Foreign]', 'ภูเก็ต', NULL, 1400.00, 1200.00, '2024-11-01', '2025-10-31', 'Selling price / Foreign: Adult 3,400, Child (4–10) 2,400\r\nNet price / Foreign: Adult 1,400, Child (4–10) 1,200\r\nDeparture: 09:30\r\nRemark: Everyday', 0, NULL, '2025-08-31 15:08:36', '2025-08-31 15:08:36', NULL),
(156, 17, 'Phi Phi Islands by Cruise – Phi Phi + Khai (Speed Boat) [Thai]', 'ภูเก็ต', NULL, 1200.00, 1000.00, '2024-11-01', '2025-10-31', 'Selling price / Thai: Adult 2,600, Child (4–10) 2,200\r\nNet price / Thai: Adult 1,200, Child (4–10) 1,000\r\nDeparture: 09:30\r\nRemark: Everyday', 0, NULL, '2025-08-31 15:08:36', '2025-08-31 15:08:36', NULL),
(157, 18, 'Adventures – Zone A', 'กระบี่', NULL, 1200.00, 0.00, NULL, NULL, 'Selling Price: 1,500\r\nทุกโปรแกรมของเรารวมถึง น้ำดื่ม, ผลไม้ตามฤดูกาล และรถรับ–ส่งจากโรงแรม (บริการรับ–ส่งต้องอยู่ในพื้นที่: อ่าวนาง, อ่าวน้ำเมา, ตัวเมืองกระบี่)\r\nหากเป็นพื้นที่คลองม่วง จะมีค่าใช้จ่ายเพิ่ม 500 บาท ต่อคัน ต่อกรุ๊ป โดยรถตุ๊กตุ๊กของเรา\r\nโปรแกรมแบบเต็มวันยังรวมถึงกล่องอาหารกลางวันแบบไทยด้วย\r\nตัวเลือกเสริม: เพิ่ม ATV 40 นาที +800 ต่อคน\r\nโปรโมชัน: ทุกๆ 10 คน แถมฟรี 1 คน\n\nProgram details:\n- One zip zone (6 wires)\n- Flexible pick up times (low season)\n- Perfect between hotel check-out and airport transfer\n- Pick up times: 08:30–08:45, 11:30–11:45, 13:30–13:45, 15:00', 0, NULL, '2025-08-31 15:19:23', '2025-08-31 15:21:41', NULL),
(158, 18, 'Adventures – Zone A + Climbing', 'กระบี่', NULL, 1750.00, 0.00, NULL, NULL, 'Selling Price: 2,100\r\nทุกโปรแกรมของเรารวมถึง น้ำดื่ม, ผลไม้ตามฤดูกาล และรถรับ–ส่งจากโรงแรม (บริการรับ–ส่งต้องอยู่ในพื้นที่: อ่าวนาง, อ่าวน้ำเมา, ตัวเมืองกระบี่)\r\nหากเป็นพื้นที่คลองม่วง จะมีค่าใช้จ่ายเพิ่ม 500 บาท ต่อคัน ต่อกรุ๊ป โดยรถตุ๊กตุ๊กของเรา\r\nโปรแกรมแบบเต็มวันยังรวมถึงกล่องอาหารกลางวันแบบไทยด้วย\r\nตัวเลือกเสริม: เพิ่ม ATV 40 นาที +800 ต่อคน\r\nโปรโมชัน: ทุกๆ 10 คน แถมฟรี 1 คน\n\nProgram details:\n- One zip zone A (6 wires)\n- Two hour climbing (2+ routes)\n- Flexible pick up times (low season)\n- Perfect for people who want more\n- Pick up times: 08:30–08:45, 11:30–11:45, 13:30–13:45', 0, NULL, '2025-08-31 15:19:23', '2025-08-31 15:21:41', NULL),
(159, 18, 'Adventures – Zones A & B', 'กระบี่', NULL, 1400.00, 0.00, NULL, NULL, 'Selling Price: 1,700\r\nทุกโปรแกรมของเรารวมถึง น้ำดื่ม, ผลไม้ตามฤดูกาล และรถรับ–ส่งจากโรงแรม (บริการรับ–ส่งต้องอยู่ในพื้นที่: อ่าวนาง, อ่าวน้ำเมา, ตัวเมืองกระบี่)\r\nหากเป็นพื้นที่คลองม่วง จะมีค่าใช้จ่ายเพิ่ม 500 บาท ต่อคัน ต่อกรุ๊ป โดยรถตุ๊กตุ๊กของเรา\r\nโปรแกรมแบบเต็มวันยังรวมถึงกล่องอาหารกลางวันแบบไทยด้วย\r\nตัวเลือกเสริม: เพิ่ม ATV 40 นาที +800 ต่อคน\r\nโปรโมชัน: ทุกๆ 10 คน แถมฟรี 1 คน\n\nProgram details:\n- Zip zones A & B (≈1.2 km of zip lines)\n- Tree ladder climbs 15 m & 30 m\n- Abseil from 60 m platform\n- 250 m zip line, 40 m high\n- Pick up times: 08:30–08:45, 13:30–13:45', 0, NULL, '2025-08-31 15:19:23', '2025-08-31 15:21:41', NULL),
(160, 18, 'Adventures – Full Day', 'กระบี่', NULL, 2200.00, 0.00, NULL, NULL, 'Selling Price: 2,500\r\nทุกโปรแกรมของเรารวมถึง น้ำดื่ม, ผลไม้ตามฤดูกาล และรถรับ–ส่งจากโรงแรม (บริการรับ–ส่งต้องอยู่ในพื้นที่: อ่าวนาง, อ่าวน้ำเมา, ตัวเมืองกระบี่)\r\nหากเป็นพื้นที่คลองม่วง จะมีค่าใช้จ่ายเพิ่ม 500 บาท ต่อคัน ต่อกรุ๊ป โดยรถตุ๊กตุ๊กของเรา\r\nโปรแกรมแบบเต็มวันยังรวมถึงกล่องอาหารกลางวันแบบไทยด้วย\r\nตัวเลือกเสริม: เพิ่ม ATV 40 นาที +800 ต่อคน\r\nโปรโมชัน: ทุกๆ 10 คน แถมฟรี 1 คน\n\nProgram details:\n- See half day experience +\n- Top roped rock climbing\n- Lunch\n- Local fruits\n- Pick up time: 08:30–08:45', 0, NULL, '2025-08-31 15:19:23', '2025-08-31 15:21:41', NULL),
(161, 18, 'Adventures – Half Day Climbing', 'กระบี่', NULL, 1000.00, 0.00, NULL, NULL, 'Selling Price: 1,300\r\nทุกโปรแกรมของเรารวมถึง น้ำดื่ม, ผลไม้ตามฤดูกาล และรถรับ–ส่งจากโรงแรม (บริการรับ–ส่งต้องอยู่ในพื้นที่: อ่าวนาง, อ่าวน้ำเมา, ตัวเมืองกระบี่)\r\nหากเป็นพื้นที่คลองม่วง จะมีค่าใช้จ่ายเพิ่ม 500 บาท ต่อคัน ต่อกรุ๊ป โดยรถตุ๊กตุ๊กของเรา\r\nโปรแกรมแบบเต็มวันยังรวมถึงกล่องอาหารกลางวันแบบไทยด้วย\r\nตัวเลือกเสริม: เพิ่ม ATV 40 นาที +800 ต่อคน\r\nโปรโมชัน: ทุกๆ 10 คน แถมฟรี 1 คน\n\nProgram details:\n- 4+ routes (Beginner basic top rope)\n- Drinking water & seasonal fruit\n- All climbing equipment\n- Insurance\n- Pick up times: 08:30–08:45, 13:30–13:45', 0, NULL, '2025-08-31 15:19:23', '2025-08-31 15:21:41', NULL),
(162, 19, 'Krabi Elephant – Feed Me Up', 'กระบี่', NULL, 200.00, 200.00, '2025-06-27', '2026-06-27', NULL, 0, NULL, '2025-08-31 15:29:22', '2025-08-31 15:29:22', NULL),
(163, 19, 'Krabi Elephant – Cook and Feed', 'กระบี่', NULL, 700.00, 700.00, '2025-06-27', '2026-06-27', NULL, 0, NULL, '2025-08-31 15:29:22', '2025-08-31 15:29:22', NULL),
(164, 19, 'Krabi Elephant – Mini Cake Maker', 'กระบี่', NULL, 700.00, 700.00, '2025-06-27', '2026-06-27', NULL, 0, NULL, '2025-08-31 15:29:22', '2025-08-31 15:29:22', NULL),
(165, 19, 'Krabi Elephant – Dress Up and Feed Me', 'กระบี่', NULL, 490.00, 490.00, '2025-06-27', '2026-06-27', NULL, 0, NULL, '2025-08-31 15:29:22', '2025-08-31 15:29:22', NULL),
(166, 19, 'Krabi Elephant – Get Up Close', 'กระบี่', NULL, 1400.00, 1050.00, '2025-06-27', '2026-06-27', NULL, 0, NULL, '2025-08-31 15:29:22', '2025-08-31 15:29:22', NULL),
(167, 19, 'Krabi Elephant – Bathe With Me', 'กระบี่', NULL, 1050.00, 700.00, '2025-06-27', '2026-06-27', NULL, 0, NULL, '2025-08-31 15:29:22', '2025-08-31 15:29:22', NULL),
(168, 19, 'Krabi Elephant – Private Get Up Close (1–5 pax)', 'กระบี่', NULL, 18000.00, 0.00, '2025-06-27', '2026-06-27', NULL, 0, NULL, '2025-08-31 15:29:22', '2025-08-31 15:29:22', NULL),
(175, 20, 'The Coral Beach Club - Koh Hey (Speedboat)', 'ภูเก็ต', 'นนทศักดิ์ ราไวย์', 650.00, 450.00, '2024-10-01', '2025-09-30', 'Time: 09:00-14:00\nOperate: Everyday', 0, 'dev_lay', '2025-09-01 02:00:19', '2025-09-01 02:03:14', 'https://maps.app.goo.gl/gByQE1KAnKnPVsM57'),
(176, 20, 'Racha + The Coral Beach Club (Speedboat)', 'ภูเก็ต', 'นนทศักดิ์ ราไวย์', 900.00, 700.00, '2024-10-01', '2025-09-30', 'Time: 09:00-16:00\nOperate: Everyday', 0, 'dev_lay', '2025-09-01 02:00:19', '2025-09-01 02:03:24', 'https://maps.app.goo.gl/gByQE1KAnKnPVsM57'),
(177, 20, 'Phi Phi & Khai Nok Island (Speedboat)', 'ภูเก็ต', 'นนทศักดิ์ เกาะสิเหร่', 1300.00, 1100.00, '2024-10-01', '2025-09-30', 'Time: 09:00-16:00\nOperate: Everyday', 0, 'dev_lay', '2025-09-01 02:00:19', '2025-09-01 02:02:28', 'https://maps.app.goo.gl/ym68KTe4WbTRVKaS8'),
(178, 20, 'Khai Nok & Khai Nui (Speedboat)', 'ภูเก็ต', 'นนทศักดิ์ ราไวย์', 850.00, 650.00, '2024-10-01', '2025-09-30', 'Time: 09:00-14:00\nOperate: Everyday', 0, 'dev_lay', '2025-09-01 02:00:19', '2025-09-01 02:03:36', 'https://maps.app.goo.gl/gByQE1KAnKnPVsM57'),
(179, 20, 'Similan Island (Speedboat)', 'ภูเก็ต', NULL, 2200.00, 2000.00, '2024-10-01', '2025-09-30', 'Time: 08:00-16:30\nOperate: Everyday', 0, NULL, '2025-09-01 02:00:19', '2025-09-01 02:00:19', NULL),
(180, 20, 'The Coral Beach Club - Koh Hey + Sunset Promthep (Catamaran)', 'ภูเก็ต', NULL, 1100.00, 1000.00, '2024-10-01', '2025-09-30', 'Time: 14:00-19:00\nOperate: Everyday', 0, NULL, '2025-09-01 02:00:19', '2025-09-01 02:00:19', NULL),
(181, 21, 'Combine World A+ (Zipline 32 Platforms + Roller + Skywalk + Meal)', 'ภูเก็ต', NULL, 2618.00, 0.00, NULL, NULL, 'Selling Price: 3,490\nPlay times: 08:00, 10:00, 13:00, 15:00\nOperate: Everyday', 0, NULL, '2025-09-01 02:47:38', '2025-09-03 06:12:33', NULL),
(182, 21, 'Combine World B+ (Zipline 18 Platforms + Roller + Skywalk + Meal)', 'ภูเก็ต', NULL, 2243.00, 0.00, NULL, NULL, 'Selling Price: 2,990\nPlay times: 08:00, 10:00, 13:00, 15:00\nOperate: Everyday', 0, NULL, '2025-09-01 02:47:38', '2025-09-03 06:12:33', NULL),
(183, 21, 'Combine World C+ (Zipline 10 Platforms + Roller + Skywalk + Meal)', 'ภูเก็ต', NULL, 1868.00, 0.00, NULL, NULL, 'Selling Price: 2,490\nPlay times: 08:00, 10:00, 13:00, 15:00\nOperate: Everyday', 0, NULL, '2025-09-01 02:47:38', '2025-09-03 06:12:33', NULL),
(184, 21, 'Combine World D+ (Luge 2 Rides + Roller + Skywalk)', 'ภูเก็ต', NULL, 1418.00, 0.00, NULL, NULL, 'Selling Price: 1,890\nPlay times: 08:00, 10:00, 13:00, 15:00\nOperate: Everyday', 0, NULL, '2025-09-01 02:47:38', '2025-09-03 06:12:33', NULL),
(185, 21, 'Combine World D (Roller + Skywalk)', 'ภูเก็ต', NULL, 893.00, 0.00, NULL, NULL, 'Selling Price: 1,190\nPlay times: 08:00, 10:00, 13:00, 15:00\nOperate: Everyday', 0, NULL, '2025-09-01 02:47:38', '2025-09-03 06:12:33', NULL),
(186, 21, 'Zipline 32 Platforms', 'ภูเก็ต', NULL, 2175.00, 0.00, NULL, NULL, 'Selling Price: 2,900\nPlay times: 08:00, 10:00, 13:00, 15:00\nOperate: Everyday', 0, NULL, '2025-09-01 02:47:38', '2025-09-03 06:12:33', NULL),
(187, 21, 'Zipline 18 Platforms', 'ภูเก็ต', NULL, 1650.00, 0.00, NULL, NULL, 'Selling Price: 2,200\nPlay times: 08:00, 10:00, 13:00, 15:00\nOperate: Everyday', 0, NULL, '2025-09-01 02:47:38', '2025-09-03 06:12:33', NULL),
(188, 21, 'Zipline 10 Platforms', 'ภูเก็ต', NULL, 1125.00, 0.00, NULL, NULL, 'Selling Price: 1,500\nPlay times: 08:00, 10:00, 13:00, 15:00\nOperate: Everyday', 0, NULL, '2025-09-01 02:47:38', '2025-09-03 06:12:33', NULL),
(189, 22, 'Half Day Elephant Program', 'ภูเก็ต', '', 1800.00, 1300.00, '2025-07-01', '2025-10-31', 'Promotion price: Adult 1,600 / Child 1,100\nNormal net price: Adult 1,800 / Child 1,300\nOperate: Open daily\nIncludes: Elephant awareness talk, feeding walk, wash & swim with elephants, buffet lunch/supper, Thai cooking lesson', 0, 'dev_lay', '2025-09-01 02:56:42', '2025-10-01 08:14:48', ''),
(190, 23, 'James Bond Island + Sea Canoe (Longtail Boat)', 'ภูเก็ต', NULL, 1000.00, 850.00, '2024-11-01', '2025-11-01', 'Selling Price: Adult 2,600 / Child 1,800\nNet Price: Adult 1,000 / Child 850\nIncludes: Hotel transfer, lunch, entrance fee\nCondition: Program subject to change due to weather and tide\nCancellation: On day 100% charge, 1 day before free', 0, NULL, '2025-09-01 03:04:25', '2025-09-01 03:04:25', NULL);
INSERT INTO `tours` (`id`, `supplier_id`, `tour_name`, `departure_from`, `pier`, `adult_price`, `child_price`, `start_date`, `end_date`, `notes`, `park_fee_included`, `updated_by`, `created_at`, `updated_at`, `map_url`) VALUES
(191, 23, 'James Bond Sightseeing (No Canoe, Longtail Boat)', 'ภูเก็ต', NULL, 900.00, 750.00, '2024-11-01', '2025-11-01', 'Selling Price: Adult 2,000 / Child 1,500\nNet Price: Adult 900 / Child 750\nIncludes: Hotel transfer, lunch, entrance fee\nCondition: Program subject to change due to weather and tide\nCancellation: On day 100% charge, 1 day before free', 0, NULL, '2025-09-01 03:04:25', '2025-09-01 03:04:25', NULL),
(192, 24, 'James bond Speed Boat', 'ภูเก็ต', '', 1200.00, 1000.00, '2025-09-01', NULL, '', 0, 'dev_lay', '2025-09-01 04:44:37', '2025-09-01 04:44:37', ''),
(193, 24, 'Phi Phi + Khai Speed Boat', 'ภูเก็ต', '', 1200.00, 1000.00, '2025-09-01', NULL, '', 0, 'dev_lay', '2025-09-01 04:44:37', '2025-09-01 04:44:37', ''),
(194, 26, 'Kayaking + Swimming (Program A)', 'กระบี่', NULL, 300.00, 200.00, '2025-09-29', '2026-09-29', 'Krabi Town, Ao Num Mao, Klong Muang +100 / Pax', 0, 'admin', '2025-09-29 03:08:28', '2025-09-29 03:08:28', NULL),
(195, 26, 'Kayaking + Swimming + ATV (Program B)', 'กระบี่', NULL, 1100.00, 900.00, '2025-09-29', '2026-09-29', 'Krabi Town, Ao Num Mao, Klong Muang +100 / Pax', 0, 'admin', '2025-09-29 03:08:28', '2025-09-29 03:08:28', NULL),
(196, 26, 'Kayaking + Swimming + Elephant (Program C)', 'กระบี่', NULL, 1100.00, 900.00, '2025-09-29', '2026-09-29', 'Krabi Town, Ao Num Mao, Klong Muang +100 / Pax', 0, 'admin', '2025-09-29 03:08:28', '2025-09-29 03:08:28', NULL),
(197, 26, 'Kayaking + Swimming + ATV + Elephant (Program D)', 'กระบี่', NULL, 1300.00, 1100.00, '2025-09-29', '2026-09-29', 'Krabi Town, Ao Num Mao, Klong Muang +100 / Pax', 0, 'admin', '2025-09-29 03:08:28', '2025-09-29 03:08:28', NULL),
(198, 27, 'Koh Tao & Koh Nangyuan BY SPEEDBOAT', 'SAMUI', '', 1400.00, 1300.00, '2026-06-17', '2026-12-31', 'Entrance fee 250/120', 0, 'lay', '2026-06-17 09:40:37', '2026-06-17 09:40:37', ''),
(199, 27, 'Angthong National Marine Park (Sightseeing+Snorkeling+Kayaking) BY SPEED BOAT', 'SAMUI', '', 1400.00, 1300.00, '2026-06-17', '2026-12-31', 'Entrance fee 300/150', 0, 'lay', '2026-06-17 09:40:37', '2026-06-17 09:40:37', ''),
(200, 28, 'KOH TAO - KOH NANGYUAN', 'SAMUI', 'BANGRAK', 1300.00, 1000.00, '2026-06-17', '2026-12-31', 'ENTRANCE FEE 250/120', 0, 'lay', '2026-06-17 12:18:07', '2026-06-17 12:18:07', 'https://maps.app.goo.gl/2cVm94JcZD42v99w5'),
(201, 28, 'ANGTHONG NATIONAL MARINE PARK', 'SAMUI', 'BANGRAK', 1300.00, 1000.00, '2026-06-17', '2026-12-31', 'ENTRANCE FEE 300/150', 0, 'lay', '2026-06-17 12:18:07', '2026-06-17 12:18:07', 'https://maps.app.goo.gl/2cVm94JcZD42v99w5'),
(202, 28, 'KOH TAN - MUDSUM', 'SAMUI', 'BANGRAK', 1200.00, 1000.00, '2026-06-17', '2026-12-31', '', 1, 'lay', '2026-06-17 12:18:07', '2026-06-17 12:18:07', 'https://maps.app.goo.gl/2cVm94JcZD42v99w5'),
(203, 28, 'FULL MOON PARTY', 'SAMUI', 'BANGRAK', 800.00, 0.00, '2026-06-17', '2026-12-31', '', 1, 'lay', '2026-06-17 12:18:07', '2026-06-17 12:18:07', 'https://maps.app.goo.gl/2cVm94JcZD42v99w5');

-- --------------------------------------------------------

--
-- Table structure for table `tour_files`
--

CREATE TABLE `tour_files` (
  `id` int(11) NOT NULL,
  `tour_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` enum('pdf','image') NOT NULL,
  `file_size` int(11) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `uploaded_by` varchar(255) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `file_category` enum('gallery','brochure','general') DEFAULT 'general',
  `shared_with_tour_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of tour IDs that share this gallery file' CHECK (json_valid(`shared_with_tour_ids`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tour_files`
--

INSERT INTO `tour_files` (`id`, `tour_id`, `file_name`, `original_name`, `file_path`, `file_type`, `file_size`, `mime_type`, `uploaded_by`, `uploaded_at`, `file_category`, `shared_with_tour_ids`) VALUES
(6, 30, '68a6c6fa7a3f4_1755760378.jpg', 'PhiPhi_Bamboo_Island_2023-24_1.jpg', 'uploads/tours/images/68a6c6fa7a3f4_1755760378.jpg', 'image', 627429, 'image/jpeg', 'lay', '2025-08-21 07:12:58', 'gallery', NULL),
(7, 30, '68a6c700a578b_1755760384.jpg', 'PhiPhi_Bamboo_Island_2023-24_39.jpg', 'uploads/tours/images/68a6c700a578b_1755760384.jpg', 'image', 239908, 'image/jpeg', 'lay', '2025-08-21 07:13:04', 'gallery', NULL),
(8, 30, '68a6c7013c840_1755760385.jpg', 'PhiPhi_Bamboo_Island_2023-24_16.jpg', 'uploads/tours/images/68a6c7013c840_1755760385.jpg', 'image', 257379, 'image/jpeg', 'lay', '2025-08-21 07:13:05', 'gallery', NULL),
(9, 30, '68a6c701ce809_1755760385.jpg', 'PhiPhi_Bamboo_Island_2023-24_35.jpg', 'uploads/tours/images/68a6c701ce809_1755760385.jpg', 'image', 519245, 'image/jpeg', 'lay', '2025-08-21 07:13:05', 'gallery', NULL),
(10, 30, '68a6c70230724_1755760386.jpg', 'PhiPhi_Bamboo_Island_2023-24_31.jpg', 'uploads/tours/images/68a6c70230724_1755760386.jpg', 'image', 522623, 'image/jpeg', 'lay', '2025-08-21 07:13:06', 'gallery', NULL),
(11, 30, '68a6c7023367d_1755760386.jpg', 'PhiPhi_Bamboo_Island_2023-24_58.jpg', 'uploads/tours/images/68a6c7023367d_1755760386.jpg', 'image', 406807, 'image/jpeg', 'lay', '2025-08-21 07:13:06', 'gallery', NULL),
(12, 30, '68a6c7028b229_1755760386.jpg', 'PhiPhi_Bamboo_Island_2023-24_44.jpg', 'uploads/tours/images/68a6c7028b229_1755760386.jpg', 'image', 577052, 'image/jpeg', 'lay', '2025-08-21 07:13:06', 'gallery', NULL),
(13, 30, '68a6c7028b588_1755760386.jpg', 'PhiPhi_Bamboo_Island_2023-24_21.jpg', 'uploads/tours/images/68a6c7028b588_1755760386.jpg', 'image', 498159, 'image/jpeg', 'lay', '2025-08-21 07:13:06', 'gallery', NULL),
(14, 30, '68a6c7028cee4_1755760386.jpg', 'PhiPhi_Bamboo_Island_2023-24_43.jpg', 'uploads/tours/images/68a6c7028cee4_1755760386.jpg', 'image', 321647, 'image/jpeg', 'lay', '2025-08-21 07:13:06', 'gallery', NULL),
(15, 30, '68a6c7028d672_1755760386.jpg', 'PhiPhi_Bamboo_Island_2023-24_15.jpg', 'uploads/tours/images/68a6c7028d672_1755760386.jpg', 'image', 456333, 'image/jpeg', 'lay', '2025-08-21 07:13:06', 'gallery', NULL),
(16, 30, '68a6c7028d5a0_1755760386.jpg', 'PhiPhi_Bamboo_Island_2023-24_53.jpg', 'uploads/tours/images/68a6c7028d5a0_1755760386.jpg', 'image', 619089, 'image/jpeg', 'lay', '2025-08-21 07:13:06', 'gallery', NULL),
(17, 30, '68a6c7028e269_1755760386.jpg', 'PhiPhi_Bamboo_Island_2023-24_30.jpg', 'uploads/tours/images/68a6c7028e269_1755760386.jpg', 'image', 480636, 'image/jpeg', 'lay', '2025-08-21 07:13:06', 'gallery', NULL),
(18, 30, '68a6c703040a9_1755760387.jpg', 'PhiPhi_Bamboo_Island_2023-24_54.jpg', 'uploads/tours/images/68a6c703040a9_1755760387.jpg', 'image', 832332, 'image/jpeg', 'lay', '2025-08-21 07:13:07', 'gallery', NULL),
(19, 30, '68a6c7033002a_1755760387.jpg', 'PhiPhi_Bamboo_Island_2023-24_9.JPG', 'uploads/tours/images/68a6c7033002a_1755760387.jpg', 'image', 585749, 'image/jpeg', 'lay', '2025-08-21 07:13:07', 'gallery', NULL),
(20, 30, '68a6c703611d8_1755760387.jpg', 'PhiPhi_Bamboo_Island_2023-24_57.jpg', 'uploads/tours/images/68a6c703611d8_1755760387.jpg', 'image', 503182, 'image/jpeg', 'lay', '2025-08-21 07:13:07', 'gallery', NULL),
(21, 30, '68a6c7038b957_1755760387.jpg', 'PhiPhi_Bamboo_Island_2023-24_24.jpg', 'uploads/tours/images/68a6c7038b957_1755760387.jpg', 'image', 470463, 'image/jpeg', 'lay', '2025-08-21 07:13:07', 'gallery', NULL),
(22, 30, '68a6c7039dee0_1755760387.jpg', 'PhiPhi_Bamboo_Island_2023-24_46.jpg', 'uploads/tours/images/68a6c7039dee0_1755760387.jpg', 'image', 335785, 'image/jpeg', 'lay', '2025-08-21 07:13:07', 'gallery', NULL),
(23, 30, '68a6c703c7ad4_1755760387.jpg', 'PhiPhi_Bamboo_Island_2023-24_32.jpg', 'uploads/tours/images/68a6c703c7ad4_1755760387.jpg', 'image', 800948, 'image/jpeg', 'lay', '2025-08-21 07:13:07', 'gallery', NULL),
(24, 30, '68a6c703e972d_1755760387.jpg', 'PhiPhi_Bamboo_Island_2023-24_22.jpg', 'uploads/tours/images/68a6c703e972d_1755760387.jpg', 'image', 728231, 'image/jpeg', 'lay', '2025-08-21 07:13:07', 'gallery', NULL),
(25, 30, '68a6c70414e5d_1755760388.jpg', 'PhiPhi_Bamboo_Island_2023-24_33.jpg', 'uploads/tours/images/68a6c70414e5d_1755760388.jpg', 'image', 502566, 'image/jpeg', 'lay', '2025-08-21 07:13:08', 'gallery', NULL),
(26, 31, '68abc89cc170f_1756088476.jpg', 'PhiPhi_Khai_Island_2023-24_14.jpg', 'uploads/tours/images/68abc89cc170f_1756088476.jpg', 'image', 69158, 'image/jpeg', 'admin', '2025-08-25 02:21:16', 'gallery', NULL),
(27, 31, '68abc89ce4c7b_1756088476.jpg', 'PhiPhi_Khai_Island_2023-24_46.jpg', 'uploads/tours/images/68abc89ce4c7b_1756088476.jpg', 'image', 169932, 'image/jpeg', 'admin', '2025-08-25 02:21:16', 'gallery', NULL),
(28, 31, '68abc89d16ea0_1756088477.jpg', 'PhiPhi_Khai_Island_2023-24_19.jpg', 'uploads/tours/images/68abc89d16ea0_1756088477.jpg', 'image', 185700, 'image/jpeg', 'admin', '2025-08-25 02:21:17', 'gallery', NULL),
(29, 31, '68abc89e03b01_1756088478.jpg', 'PhiPhi_Khai_Island_2023-24_17.jpg', 'uploads/tours/images/68abc89e03b01_1756088478.jpg', 'image', 352001, 'image/jpeg', 'admin', '2025-08-25 02:21:18', 'gallery', NULL),
(30, 31, '68abc89e52ad9_1756088478.jpg', 'PhiPhi_Khai_Island_2023-24_4.jpg', 'uploads/tours/images/68abc89e52ad9_1756088478.jpg', 'image', 305950, 'image/jpeg', 'admin', '2025-08-25 02:21:18', 'gallery', NULL),
(31, 31, '68abc89e54191_1756088478.jpg', 'PhiPhi_Khai_Island_2023-24_45.jpg', 'uploads/tours/images/68abc89e54191_1756088478.jpg', 'image', 337553, 'image/jpeg', 'admin', '2025-08-25 02:21:18', 'gallery', NULL),
(32, 31, '68abc89e547f6_1756088478.jpg', 'PhiPhi_Khai_Island_2023-24_3.jpg', 'uploads/tours/images/68abc89e547f6_1756088478.jpg', 'image', 364705, 'image/jpeg', 'admin', '2025-08-25 02:21:18', 'gallery', NULL),
(33, 31, '68abc89e5514b_1756088478.jpg', 'PhiPhi_Khai_Island_2023-24_7.jpg', 'uploads/tours/images/68abc89e5514b_1756088478.jpg', 'image', 368543, 'image/jpeg', 'admin', '2025-08-25 02:21:18', 'gallery', NULL),
(34, 31, '68abc89feb765_1756088479.jpg', 'PhiPhi_Khai_Island_2023-24_11.jpg', 'uploads/tours/images/68abc89feb765_1756088479.jpg', 'image', 349702, 'image/jpeg', 'admin', '2025-08-25 02:21:19', 'gallery', NULL),
(35, 31, '68abc89feb956_1756088479.jpg', 'PhiPhi_Khai_Island_2023-24_10.jpg', 'uploads/tours/images/68abc89feb956_1756088479.jpg', 'image', 320410, 'image/jpeg', 'admin', '2025-08-25 02:21:19', 'gallery', NULL),
(36, 31, '68abc8a0127db_1756088480.jpg', 'PhiPhi_Khai_Island_2023-24_6.jpg', 'uploads/tours/images/68abc8a0127db_1756088480.jpg', 'image', 233098, 'image/jpeg', 'admin', '2025-08-25 02:21:20', 'gallery', NULL),
(37, 31, '68abc8a060fc0_1756088480.jpg', 'PhiPhi_Khai_Island_2023-24_8.jpg', 'uploads/tours/images/68abc8a060fc0_1756088480.jpg', 'image', 307117, 'image/jpeg', 'admin', '2025-08-25 02:21:20', 'gallery', NULL),
(38, 31, '68abc8a06102e_1756088480.jpg', 'PhiPhi_Khai_Island_2023-24_9.jpg', 'uploads/tours/images/68abc8a06102e_1756088480.jpg', 'image', 370115, 'image/jpeg', 'admin', '2025-08-25 02:21:20', 'gallery', NULL),
(39, 31, '68abc8a0e2f26_1756088480.jpg', 'PhiPhi_Khai_Island_2023-24_26.jpg', 'uploads/tours/images/68abc8a0e2f26_1756088480.jpg', 'image', 236629, 'image/jpeg', 'admin', '2025-08-25 02:21:20', 'gallery', NULL),
(40, 31, '68abc8a0e2e46_1756088480.jpg', 'PhiPhi_Khai_Island_2023-24_16.jpg', 'uploads/tours/images/68abc8a0e2e46_1756088480.jpg', 'image', 557306, 'image/jpeg', 'admin', '2025-08-25 02:21:20', 'gallery', NULL),
(41, 31, '68abc8a0e31b0_1756088480.jpg', 'PhiPhi_Khai_Island_2023-24_42.jpg', 'uploads/tours/images/68abc8a0e31b0_1756088480.jpg', 'image', 305184, 'image/jpeg', 'admin', '2025-08-25 02:21:20', 'gallery', NULL),
(42, 31, '68abc8a0e410c_1756088480.jpg', 'PhiPhi_Khai_Island_2023-24_36.JPG', 'uploads/tours/images/68abc8a0e410c_1756088480.jpg', 'image', 215524, 'image/jpeg', 'admin', '2025-08-25 02:21:20', 'gallery', NULL),
(43, 31, '68abc8a0e43bd_1756088480.jpg', 'PhiPhi_Khai_Island_2023-24_64.JPG', 'uploads/tours/images/68abc8a0e43bd_1756088480.jpg', 'image', 342845, 'image/jpeg', 'admin', '2025-08-25 02:21:20', 'gallery', NULL),
(44, 31, '68abc8a0e51d9_1756088480.jpg', 'PhiPhi_Khai_Island_2023-24_44.jpg', 'uploads/tours/images/68abc8a0e51d9_1756088480.jpg', 'image', 518159, 'image/jpeg', 'admin', '2025-08-25 02:21:20', 'gallery', NULL),
(45, 31, '68abc8a12e84d_1756088481.jpg', 'PhiPhi_Khai_Island_2023-24_40.jpg', 'uploads/tours/images/68abc8a12e84d_1756088481.jpg', 'image', 459186, 'image/jpeg', 'admin', '2025-08-25 02:21:21', 'gallery', NULL),
(46, 31, '68abc8a130015_1756088481.jpg', 'PhiPhi_Khai_Island_2023-24_31.JPG', 'uploads/tours/images/68abc8a130015_1756088481.jpg', 'image', 513830, 'image/jpeg', 'admin', '2025-08-25 02:21:21', 'gallery', NULL),
(47, 31, '68abc8a1ee3ae_1756088481.jpg', 'PhiPhi_Khai_Island_2023-24_38.jpg', 'uploads/tours/images/68abc8a1ee3ae_1756088481.jpg', 'image', 420117, 'image/jpeg', 'admin', '2025-08-25 02:21:21', 'gallery', NULL),
(48, 31, '68abc8a2161ff_1756088482.jpg', 'PhiPhi_Khai_Island_2023-24_41.jpg', 'uploads/tours/images/68abc8a2161ff_1756088482.jpg', 'image', 346660, 'image/jpeg', 'admin', '2025-08-25 02:21:22', 'gallery', NULL),
(49, 31, '68abc8a216243_1756088482.jpg', 'PhiPhi_Khai_Island_2023-24_23.jpg', 'uploads/tours/images/68abc8a216243_1756088482.jpg', 'image', 219966, 'image/jpeg', 'admin', '2025-08-25 02:21:22', 'gallery', NULL),
(50, 31, '68abc8a216291_1756088482.jpg', 'PhiPhi_Khai_Island_2023-24_13.jpg', 'uploads/tours/images/68abc8a216291_1756088482.jpg', 'image', 424778, 'image/jpeg', 'admin', '2025-08-25 02:21:22', 'gallery', NULL),
(51, 31, '68abc8a22f1db_1756088482.jpg', 'PhiPhi_Khai_Island_2023-24_20.jpg', 'uploads/tours/images/68abc8a22f1db_1756088482.jpg', 'image', 280800, 'image/jpeg', 'admin', '2025-08-25 02:21:22', 'gallery', NULL),
(52, 31, '68abc8a28aeb4_1756088482.jpg', 'PhiPhi_Khai_Island_2023-24_37.jpg', 'uploads/tours/images/68abc8a28aeb4_1756088482.jpg', 'image', 512930, 'image/jpeg', 'admin', '2025-08-25 02:21:22', 'gallery', NULL),
(53, 31, '68abc8a2bef49_1756088482.jpg', 'PhiPhi_Khai_Island_2023-24_59.jpg', 'uploads/tours/images/68abc8a2bef49_1756088482.jpg', 'image', 371150, 'image/jpeg', 'admin', '2025-08-25 02:21:22', 'gallery', NULL),
(54, 31, '68abc8a2dbaf4_1756088482.jpg', 'PhiPhi_Khai_Island_2023-24_29.jpg', 'uploads/tours/images/68abc8a2dbaf4_1756088482.jpg', 'image', 573062, 'image/jpeg', 'admin', '2025-08-25 02:21:22', 'gallery', NULL),
(55, 31, '68abc8a3bc9ad_1756088483.jpg', 'PhiPhi_Khai_Island_2023-24_2.jpg', 'uploads/tours/images/68abc8a3bc9ad_1756088483.jpg', 'image', 550997, 'image/jpeg', 'admin', '2025-08-25 02:21:23', 'gallery', NULL),
(56, 31, '68abc8a3bca98_1756088483.jpg', 'PhiPhi_Khai_Island_2023-24_63.jpg', 'uploads/tours/images/68abc8a3bca98_1756088483.jpg', 'image', 462530, 'image/jpeg', 'admin', '2025-08-25 02:21:23', 'gallery', NULL),
(57, 31, '68abc8a3bcb7c_1756088483.jpg', 'PhiPhi_Khai_Island_2023-24_1.jpg', 'uploads/tours/images/68abc8a3bcb7c_1756088483.jpg', 'image', 608105, 'image/jpeg', 'admin', '2025-08-25 02:21:23', 'gallery', NULL),
(58, 31, '68abc8a3bcd04_1756088483.jpg', 'PhiPhi_Khai_Island_2023-24_32.JPG', 'uploads/tours/images/68abc8a3bcd04_1756088483.jpg', 'image', 519653, 'image/jpeg', 'admin', '2025-08-25 02:21:23', 'gallery', NULL),
(59, 31, '68abc8a3c42be_1756088483.jpg', 'PhiPhi_Khai_Island_2023-24_24.jpg', 'uploads/tours/images/68abc8a3c42be_1756088483.jpg', 'image', 283051, 'image/jpeg', 'admin', '2025-08-25 02:21:23', 'gallery', NULL),
(60, 31, '68abc8a3c469f_1756088483.jpg', 'PhiPhi_Khai_Island_2023-24_51.jpg', 'uploads/tours/images/68abc8a3c469f_1756088483.jpg', 'image', 546058, 'image/jpeg', 'admin', '2025-08-25 02:21:23', 'gallery', NULL),
(61, 31, '68abc8a44aa48_1756088484.jpg', 'PhiPhi_Khai_Island_2023-24_65.jpg', 'uploads/tours/images/68abc8a44aa48_1756088484.jpg', 'image', 391487, 'image/jpeg', 'admin', '2025-08-25 02:21:24', 'gallery', NULL),
(62, 31, '68abc8a4a0689_1756088484.jpg', 'PhiPhi_Khai_Island_2023-24_33.JPG', 'uploads/tours/images/68abc8a4a0689_1756088484.jpg', 'image', 433495, 'image/jpeg', 'admin', '2025-08-25 02:21:24', 'gallery', NULL),
(63, 31, '68abc8a4e46bf_1756088484.jpg', 'PhiPhi_Khai_Island_2023-24_58.jpg', 'uploads/tours/images/68abc8a4e46bf_1756088484.jpg', 'image', 653193, 'image/jpeg', 'admin', '2025-08-25 02:21:24', 'gallery', NULL),
(64, 31, '68abc8a502ea4_1756088485.jpg', 'PhiPhi_Khai_Island_2023-24_43.jpg', 'uploads/tours/images/68abc8a502ea4_1756088485.jpg', 'image', 625929, 'image/jpeg', 'admin', '2025-08-25 02:21:25', 'gallery', NULL),
(65, 31, '68abc8a5030b3_1756088485.jpg', 'PhiPhi_Khai_Island_2023-24_50.jpg', 'uploads/tours/images/68abc8a5030b3_1756088485.jpg', 'image', 916288, 'image/jpeg', 'admin', '2025-08-25 02:21:25', 'gallery', NULL),
(66, 31, '68abc8a5235bc_1756088485.jpg', 'PhiPhi_Khai_Island_2023-24_57.jpg', 'uploads/tours/images/68abc8a5235bc_1756088485.jpg', 'image', 551657, 'image/jpeg', 'admin', '2025-08-25 02:21:25', 'gallery', NULL),
(67, 31, '68abc8a55308d_1756088485.jpg', 'PhiPhi_Khai_Island_2023-24_35.jpg', 'uploads/tours/images/68abc8a55308d_1756088485.jpg', 'image', 411005, 'image/jpeg', 'admin', '2025-08-25 02:21:25', 'gallery', NULL),
(68, 31, '68abc8a56ab49_1756088485.jpg', 'PhiPhi_Khai_Island_2023-24_39.jpg', 'uploads/tours/images/68abc8a56ab49_1756088485.jpg', 'image', 390227, 'image/jpeg', 'admin', '2025-08-25 02:21:25', 'gallery', NULL),
(69, 31, '68abc8a58214c_1756088485.jpg', 'PhiPhi_Khai_Island_2023-24_25.jpg', 'uploads/tours/images/68abc8a58214c_1756088485.jpg', 'image', 285239, 'image/jpeg', 'admin', '2025-08-25 02:21:25', 'gallery', NULL),
(71, 31, '68abc8a58214b_1756088485.jpg', 'PhiPhi_Khai_Island_2023-24_5.jpg', 'uploads/tours/images/68abc8a58214b_1756088485.jpg', 'image', 389024, 'image/jpeg', 'admin', '2025-08-25 02:21:25', 'gallery', NULL),
(72, 31, '68abc8a58259a_1756088485.jpg', 'PhiPhi_Khai_Island_2023-24_62.jpg', 'uploads/tours/images/68abc8a58259a_1756088485.jpg', 'image', 589749, 'image/jpeg', 'admin', '2025-08-25 02:21:25', 'gallery', NULL),
(73, 31, '68abc8a591c6b_1756088485.jpg', 'PhiPhi_Khai_Island_2023-24_61.jpg', 'uploads/tours/images/68abc8a591c6b_1756088485.jpg', 'image', 638714, 'image/jpeg', 'admin', '2025-08-25 02:21:25', 'gallery', NULL),
(74, 31, '68abc8a591dd5_1756088485.jpg', 'PhiPhi_Khai_Island_2023-24_21.jpg', 'uploads/tours/images/68abc8a591dd5_1756088485.jpg', 'image', 471952, 'image/jpeg', 'admin', '2025-08-25 02:21:25', 'gallery', NULL),
(75, 31, '68abc8a591db1_1756088485.jpg', 'PhiPhi_Khai_Island_2023-24_34.jpg', 'uploads/tours/images/68abc8a591db1_1756088485.jpg', 'image', 662495, 'image/jpeg', 'admin', '2025-08-25 02:21:25', 'gallery', NULL),
(76, 31, '68abc8a591ec7_1756088485.jpg', 'PhiPhi_Khai_Island_2023-24_30.JPG', 'uploads/tours/images/68abc8a591ec7_1756088485.jpg', 'image', 607826, 'image/jpeg', 'admin', '2025-08-25 02:21:25', 'gallery', NULL),
(77, 31, '68abc8a591dba_1756088485.jpg', 'PhiPhi_Khai_Island_2023-24_27.jpg', 'uploads/tours/images/68abc8a591dba_1756088485.jpg', 'image', 556266, 'image/jpeg', 'admin', '2025-08-25 02:21:25', 'gallery', NULL),
(79, 31, '68abc8a6293ab_1756088486.jpg', 'PhiPhi_Khai_Island_2023-24_28.jpg', 'uploads/tours/images/68abc8a6293ab_1756088486.jpg', 'image', 583508, 'image/jpeg', 'admin', '2025-08-25 02:21:26', 'gallery', NULL),
(80, 31, '68abc8a62963a_1756088486.jpg', 'PhiPhi_Khai_Island_2023-24_49.JPG', 'uploads/tours/images/68abc8a62963a_1756088486.jpg', 'image', 821934, 'image/jpeg', 'admin', '2025-08-25 02:21:26', 'gallery', NULL),
(81, 31, '68abc8a645195_1756088486.jpg', 'PhiPhi_Khai_Island_2023-24_47.jpg', 'uploads/tours/images/68abc8a645195_1756088486.jpg', 'image', 367872, 'image/jpeg', 'admin', '2025-08-25 02:21:26', 'gallery', NULL),
(82, 31, '68abc8a6452b4_1756088486.jpg', 'PhiPhi_Khai_Island_2023-24_56.jpg', 'uploads/tours/images/68abc8a6452b4_1756088486.jpg', 'image', 367100, 'image/jpeg', 'admin', '2025-08-25 02:21:26', 'gallery', NULL),
(83, 31, '68abc8a6451a7_1756088486.jpg', 'PhiPhi_Khai_Island_2023-24_18.jpg', 'uploads/tours/images/68abc8a6451a7_1756088486.jpg', 'image', 443095, 'image/jpeg', 'admin', '2025-08-25 02:21:26', 'gallery', NULL),
(84, 31, '68abc8a64539f_1756088486.jpg', 'PhiPhi_Khai_Island_2023-24_12.jpg', 'uploads/tours/images/68abc8a64539f_1756088486.jpg', 'image', 410071, 'image/jpeg', 'admin', '2025-08-25 02:21:26', 'gallery', NULL),
(85, 31, '68abc8a645476_1756088486.jpg', 'PhiPhi_Khai_Island_2023-24_66.JPG', 'uploads/tours/images/68abc8a645476_1756088486.jpg', 'image', 461124, 'image/jpeg', 'admin', '2025-08-25 02:21:26', 'gallery', NULL),
(86, 31, '68abc8a646bca_1756088486.jpg', 'PhiPhi_Khai_Island_2023-24_22.JPG', 'uploads/tours/images/68abc8a646bca_1756088486.jpg', 'image', 421351, 'image/jpeg', 'admin', '2025-08-25 02:21:26', 'gallery', NULL),
(87, 31, '68abc8a646c0a_1756088486.jpg', 'PhiPhi_Khai_Island_2023-24_48.JPG', 'uploads/tours/images/68abc8a646c0a_1756088486.jpg', 'image', 551296, 'image/jpeg', 'admin', '2025-08-25 02:21:26', 'gallery', NULL),
(88, 31, '68abc8a646f87_1756088486.jpg', 'PhiPhi_Khai_Island_2023-24_53.jpg', 'uploads/tours/images/68abc8a646f87_1756088486.jpg', 'image', 407289, 'image/jpeg', 'admin', '2025-08-25 02:21:26', 'gallery', NULL),
(89, 31, '68abc8a646e2c_1756088486.jpg', 'PhiPhi_Khai_Island_2023-24_52.JPG', 'uploads/tours/images/68abc8a646e2c_1756088486.jpg', 'image', 775629, 'image/jpeg', 'admin', '2025-08-25 02:21:26', 'gallery', NULL),
(90, 31, '68abc8a672974_1756088486.jpg', 'PhiPhi_Khai_Island_2023-24_15.jpg', 'uploads/tours/images/68abc8a672974_1756088486.jpg', 'image', 675765, 'image/jpeg', 'admin', '2025-08-25 02:21:26', 'gallery', NULL),
(91, 31, '68abc8a68d2ca_1756088486.jpg', 'PhiPhi_Khai_Island_2023-24_54.jpg', 'uploads/tours/images/68abc8a68d2ca_1756088486.jpg', 'image', 412112, 'image/jpeg', 'admin', '2025-08-25 02:21:26', 'gallery', NULL),
(116, 33, '68abd77f40718_1756092287.jpg', 'Jamesbond-Khai_Island_2023-24_13.jpg', 'uploads/tours/images/68abd77f40718_1756092287.jpg', 'image', 477327, 'image/jpeg', 'admin', '2025-08-25 03:24:47', 'gallery', NULL),
(117, 33, '68abd77fdd417_1756092287.jpg', 'Jamesbond-Khai_Island_2023-24_1.jpg', 'uploads/tours/images/68abd77fdd417_1756092287.jpg', 'image', 688450, 'image/jpeg', 'admin', '2025-08-25 03:24:47', 'gallery', NULL),
(118, 33, '68abd77fdf19b_1756092287.jpg', 'Jamesbond-Khai_Island_2023-24_4.jpg', 'uploads/tours/images/68abd77fdf19b_1756092287.jpg', 'image', 574865, 'image/jpeg', 'admin', '2025-08-25 03:24:47', 'gallery', NULL),
(119, 33, '68abd77fdf5ca_1756092287.jpg', 'Jamesbond-Khai_Island_2023-24_5.jpg', 'uploads/tours/images/68abd77fdf5ca_1756092287.jpg', 'image', 680709, 'image/jpeg', 'admin', '2025-08-25 03:24:47', 'gallery', NULL),
(120, 33, '68abd78054fb7_1756092288.jpg', 'Jamesbond-Khai_Island_2023-24_8.jpg', 'uploads/tours/images/68abd78054fb7_1756092288.jpg', 'image', 830591, 'image/jpeg', 'admin', '2025-08-25 03:24:48', 'gallery', NULL),
(121, 33, '68abd78b42e28_1756092299.jpg', 'Jamesbond-Khai_Island_2023-24_24.jpg', 'uploads/tours/images/68abd78b42e28_1756092299.jpg', 'image', 355909, 'image/jpeg', 'admin', '2025-08-25 03:24:59', 'gallery', NULL),
(122, 33, '68abd78bbc0c8_1756092299.jpg', 'Jamesbond-Khai_Island_2023-24_21.jpg', 'uploads/tours/images/68abd78bbc0c8_1756092299.jpg', 'image', 457660, 'image/jpeg', 'admin', '2025-08-25 03:24:59', 'gallery', NULL),
(123, 33, '68abd78bbc478_1756092299.jpg', 'Jamesbond-Khai_Island_2023-24_23.jpg', 'uploads/tours/images/68abd78bbc478_1756092299.jpg', 'image', 478861, 'image/jpeg', 'admin', '2025-08-25 03:24:59', 'gallery', NULL),
(124, 33, '68abd78bbe947_1756092299.jpg', 'Jamesbond-Khai_Island_2023-24_25.jpg', 'uploads/tours/images/68abd78bbe947_1756092299.jpg', 'image', 365301, 'image/jpeg', 'admin', '2025-08-25 03:24:59', 'gallery', NULL),
(125, 33, '68abd78c37cd5_1756092300.jpg', 'Jamesbond-Khai_Island_2023-24_18.jpg', 'uploads/tours/images/68abd78c37cd5_1756092300.jpg', 'image', 766947, 'image/jpeg', 'admin', '2025-08-25 03:25:00', 'gallery', NULL),
(126, 33, '68abd794e203e_1756092308.jpg', 'Jamesbond-Khai_Island_2023-24_29.jpg', 'uploads/tours/images/68abd794e203e_1756092308.jpg', 'image', 346319, 'image/jpeg', 'admin', '2025-08-25 03:25:08', 'gallery', NULL),
(127, 33, '68abd794e2080_1756092308.jpg', 'Jamesbond-Khai_Island_2023-24_26.jpg', 'uploads/tours/images/68abd794e2080_1756092308.jpg', 'image', 365266, 'image/jpeg', 'admin', '2025-08-25 03:25:08', 'gallery', NULL),
(128, 33, '68abd794e1ffa_1756092308.jpg', 'Jamesbond-Khai_Island_2023-24_27.jpg', 'uploads/tours/images/68abd794e1ffa_1756092308.jpg', 'image', 373252, 'image/jpeg', 'admin', '2025-08-25 03:25:08', 'gallery', NULL),
(129, 33, '68abd794e3e00_1756092308.jpg', 'Jamesbond-Khai_Island_2023-24_28.jpg', 'uploads/tours/images/68abd794e3e00_1756092308.jpg', 'image', 335140, 'image/jpeg', 'admin', '2025-08-25 03:25:08', 'gallery', NULL),
(130, 33, '68abd79511aa2_1756092309.jpg', 'Jamesbond-Khai_Island_2023-24_30.jpg', 'uploads/tours/images/68abd79511aa2_1756092309.jpg', 'image', 193895, 'image/jpeg', 'admin', '2025-08-25 03:25:09', 'gallery', NULL),
(131, 33, '68abd79c61d34_1756092316.jpg', 'Jamesbond-Khai_Island_2023-24_39.jpg', 'uploads/tours/images/68abd79c61d34_1756092316.jpg', 'image', 289533, 'image/jpeg', 'admin', '2025-08-25 03:25:16', 'gallery', NULL),
(132, 33, '68abd79cad469_1756092316.jpg', 'Jamesbond-Khai_Island_2023-24_33.jpg', 'uploads/tours/images/68abd79cad469_1756092316.jpg', 'image', 520721, 'image/jpeg', 'admin', '2025-08-25 03:25:16', 'gallery', NULL),
(133, 33, '68abd79cad510_1756092316.jpg', 'Jamesbond-Khai_Island_2023-24_36.jpg', 'uploads/tours/images/68abd79cad510_1756092316.jpg', 'image', 390791, 'image/jpeg', 'admin', '2025-08-25 03:25:16', 'gallery', NULL),
(134, 33, '68abd79ce9087_1756092316.jpg', 'Jamesbond-Khai_Island_2023-24_37.jpg', 'uploads/tours/images/68abd79ce9087_1756092316.jpg', 'image', 661914, 'image/jpeg', 'admin', '2025-08-25 03:25:16', 'gallery', NULL),
(135, 33, '68abd79d16474_1756092317.jpg', 'Jamesbond-Khai_Island_2023-24_32.jpg', 'uploads/tours/images/68abd79d16474_1756092317.jpg', 'image', 647093, 'image/jpeg', 'admin', '2025-08-25 03:25:17', 'gallery', NULL),
(136, 33, '68abd7a23045b_1756092322.jpg', 'Jamesbond-Khai_Island_2023-24_44.jpg', 'uploads/tours/images/68abd7a23045b_1756092322.jpg', 'image', 359915, 'image/jpeg', 'admin', '2025-08-25 03:25:22', 'gallery', NULL),
(137, 33, '68abd7a26f2b0_1756092322.jpg', 'Jamesbond-Khai_Island_2023-24_46.jpg', 'uploads/tours/images/68abd7a26f2b0_1756092322.jpg', 'image', 670261, 'image/jpeg', 'admin', '2025-08-25 03:25:22', 'gallery', NULL),
(138, 33, '68abd7a2990f1_1756092322.jpg', 'Jamesbond-Khai_Island_2023-24_42.jpg', 'uploads/tours/images/68abd7a2990f1_1756092322.jpg', 'image', 591900, 'image/jpeg', 'admin', '2025-08-25 03:25:22', 'gallery', NULL),
(139, 33, '68abd7a2b7305_1756092322.jpg', 'Jamesbond-Khai_Island_2023-24_45.jpg', 'uploads/tours/images/68abd7a2b7305_1756092322.jpg', 'image', 544222, 'image/jpeg', 'admin', '2025-08-25 03:25:22', 'gallery', NULL),
(140, 34, '68abd95d61b1c_1756092765.jpg', 'RayaNoi_Island_10.jpg', 'uploads/tours/images/68abd95d61b1c_1756092765.jpg', 'image', 238551, 'image/jpeg', 'admin', '2025-08-25 03:32:45', 'gallery', NULL),
(141, 34, '68abd95dbca79_1756092765.jpg', 'RayaNoi_Island_9.jpg', 'uploads/tours/images/68abd95dbca79_1756092765.jpg', 'image', 367975, 'image/jpeg', 'admin', '2025-08-25 03:32:45', 'gallery', NULL),
(142, 34, '68abd95dbe305_1756092765.jpg', 'RayaNoi_Island_8.jpg', 'uploads/tours/images/68abd95dbe305_1756092765.jpg', 'image', 417791, 'image/jpeg', 'admin', '2025-08-25 03:32:45', 'gallery', NULL),
(143, 34, '68abd95e4ddb1_1756092766.jpg', 'RayaNoi_Island_2.jpg', 'uploads/tours/images/68abd95e4ddb1_1756092766.jpg', 'image', 768892, 'image/jpeg', 'admin', '2025-08-25 03:32:46', 'gallery', NULL),
(144, 34, '68abd95e74a47_1756092766.jpg', 'RayaNoi_Island_1.jpg', 'uploads/tours/images/68abd95e74a47_1756092766.jpg', 'image', 651247, 'image/jpeg', 'admin', '2025-08-25 03:32:46', 'gallery', NULL),
(145, 34, '68abd9653ed4b_1756092773.jpg', 'RayaNoi_Island_16.jpg', 'uploads/tours/images/68abd9653ed4b_1756092773.jpg', 'image', 256635, 'image/jpeg', 'admin', '2025-08-25 03:32:53', 'gallery', NULL),
(146, 34, '68abd9657b192_1756092773.jpg', 'RayaNoi_Island_20.jpg', 'uploads/tours/images/68abd9657b192_1756092773.jpg', 'image', 216563, 'image/jpeg', 'admin', '2025-08-25 03:32:53', 'gallery', NULL),
(147, 34, '68abd9657b420_1756092773.jpg', 'RayaNoi_Island_13.JPG', 'uploads/tours/images/68abd9657b420_1756092773.jpg', 'image', 585749, 'image/jpeg', 'admin', '2025-08-25 03:32:53', 'gallery', NULL),
(148, 34, '68abd965aad0f_1756092773.jpg', 'RayaNoi_Island_19.JPG', 'uploads/tours/images/68abd965aad0f_1756092773.jpg', 'image', 369547, 'image/jpeg', 'admin', '2025-08-25 03:32:53', 'gallery', NULL),
(149, 34, '68abd965ca7eb_1756092773.jpg', 'RayaNoi_Island_18.jpg', 'uploads/tours/images/68abd965ca7eb_1756092773.jpg', 'image', 528538, 'image/jpeg', 'admin', '2025-08-25 03:32:53', 'gallery', NULL),
(150, 34, '68abd96e14cac_1756092782.jpg', 'RayaNoi_Island_27.jpg', 'uploads/tours/images/68abd96e14cac_1756092782.jpg', 'image', 204956, 'image/jpeg', 'admin', '2025-08-25 03:33:02', 'gallery', NULL),
(151, 34, '68abd96e40793_1756092782.jpg', 'RayaNoi_Island_26.jpg', 'uploads/tours/images/68abd96e40793_1756092782.jpg', 'image', 387194, 'image/jpeg', 'admin', '2025-08-25 03:33:02', 'gallery', NULL),
(152, 34, '68abd96e66128_1756092782.jpg', 'RayaNoi_Island_23.jpg', 'uploads/tours/images/68abd96e66128_1756092782.jpg', 'image', 182749, 'image/jpeg', 'admin', '2025-08-25 03:33:02', 'gallery', NULL),
(153, 34, '68abd96e8ed76_1756092782.jpg', 'RayaNoi_Island_29.jpg', 'uploads/tours/images/68abd96e8ed76_1756092782.jpg', 'image', 581287, 'image/jpeg', 'admin', '2025-08-25 03:33:02', 'gallery', NULL),
(154, 34, '68abd96ebb243_1756092782.jpg', 'RayaNoi_Island_24.jpg', 'uploads/tours/images/68abd96ebb243_1756092782.jpg', 'image', 554972, 'image/jpeg', 'admin', '2025-08-25 03:33:02', 'gallery', NULL),
(155, 34, '68abd976387be_1756092790.jpg', 'RayaNoi_Island_32.jpg', 'uploads/tours/images/68abd976387be_1756092790.jpg', 'image', 368391, 'image/jpeg', 'admin', '2025-08-25 03:33:10', 'gallery', NULL),
(156, 34, '68abd9768452a_1756092790.jpg', 'RayaNoi_Island_31.jpg', 'uploads/tours/images/68abd9768452a_1756092790.jpg', 'image', 511650, 'image/jpeg', 'admin', '2025-08-25 03:33:10', 'gallery', NULL),
(157, 34, '68abd9768485a_1756092790.jpg', 'RayaNoi_Island_38.jpg', 'uploads/tours/images/68abd9768485a_1756092790.jpg', 'image', 347439, 'image/jpeg', 'admin', '2025-08-25 03:33:10', 'gallery', NULL),
(158, 34, '68abd976b45cc_1756092790.jpg', 'RayaNoi_Island_34.jpg', 'uploads/tours/images/68abd976b45cc_1756092790.jpg', 'image', 383247, 'image/jpeg', 'admin', '2025-08-25 03:33:10', 'gallery', NULL),
(159, 34, '68abd976d0344_1756092790.jpg', 'RayaNoi_Island_37.jpg', 'uploads/tours/images/68abd976d0344_1756092790.jpg', 'image', 386472, 'image/jpeg', 'admin', '2025-08-25 03:33:10', 'gallery', NULL),
(160, 34, '68abd97fcbac8_1756092799.jpg', 'RayaNoi_Island_39.jpg', 'uploads/tours/images/68abd97fcbac8_1756092799.jpg', 'image', 260892, 'image/jpeg', 'admin', '2025-08-25 03:33:19', 'gallery', NULL),
(161, 34, '68abd9804a258_1756092800.jpg', 'RayaNoi_Island_41.jpg', 'uploads/tours/images/68abd9804a258_1756092800.jpg', 'image', 323991, 'image/jpeg', 'admin', '2025-08-25 03:33:20', 'gallery', NULL),
(162, 34, '68abd9804a3d0_1756092800.jpg', 'RayaNoi_Island_40.jpg', 'uploads/tours/images/68abd9804a3d0_1756092800.jpg', 'image', 420532, 'image/jpeg', 'admin', '2025-08-25 03:33:20', 'gallery', NULL),
(163, 34, '68abd98077539_1756092800.jpg', 'RayaNoi_Island_43.jpg', 'uploads/tours/images/68abd98077539_1756092800.jpg', 'image', 413046, 'image/jpeg', 'admin', '2025-08-25 03:33:20', 'gallery', NULL),
(164, 34, '68abd9808b86b_1756092800.jpg', 'RayaNoi_Island_42.jpg', 'uploads/tours/images/68abd9808b86b_1756092800.jpg', 'image', 428401, 'image/jpeg', 'admin', '2025-08-25 03:33:20', 'gallery', NULL),
(165, 34, '68abd986b30c5_1756092806.jpg', 'RayaNoi_Island_45.jpg', 'uploads/tours/images/68abd986b30c5_1756092806.jpg', 'image', 273267, 'image/jpeg', 'admin', '2025-08-25 03:33:26', 'gallery', NULL),
(166, 34, '68abd9873d705_1756092807.jpg', 'RayaNoi_Island_52.JPG', 'uploads/tours/images/68abd9873d705_1756092807.jpg', 'image', 429630, 'image/jpeg', 'admin', '2025-08-25 03:33:27', 'gallery', NULL),
(167, 34, '68abd9873d856_1756092807.jpg', 'RayaNoi_Island_53.jpg', 'uploads/tours/images/68abd9873d856_1756092807.jpg', 'image', 414622, 'image/jpeg', 'admin', '2025-08-25 03:33:27', 'gallery', NULL),
(168, 34, '68abd9877b35f_1756092807.jpg', 'RayaNoi_Island_48.jpg', 'uploads/tours/images/68abd9877b35f_1756092807.jpg', 'image', 622899, 'image/jpeg', 'admin', '2025-08-25 03:33:27', 'gallery', NULL),
(169, 34, '68abd98793482_1756092807.jpg', 'RayaNoi_Island_47.jpg', 'uploads/tours/images/68abd98793482_1756092807.jpg', 'image', 514714, 'image/jpeg', 'admin', '2025-08-25 03:33:27', 'gallery', NULL),
(171, 34, '68ac1b13842f1_1756109587.jpg', 'Brochure TH-13.jpg', 'uploads/tours/images/68ac1b13842f1_1756109587.jpg', 'image', 1895523, 'image/jpeg', 'test', '2025-08-25 08:13:07', 'brochure', NULL),
(172, 33, '68ac1cce6df60_1756110030.jpg', 'Brochure TH-11.jpg', 'uploads/tours/images/68ac1cce6df60_1756110030.jpg', 'image', 1826734, 'image/jpeg', 'admin', '2025-08-25 08:20:30', 'brochure', NULL),
(173, 30, '68ac1e511ddd4_1756110417.jpg', 'Brochure TH-09.jpg', 'uploads/tours/images/68ac1e511ddd4_1756110417.jpg', 'image', 3000298, 'image/jpeg', 'admin', '2025-08-25 08:26:57', 'brochure', NULL),
(174, 35, '68ac1f34bea14_1756110644.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_5.jpg', 'uploads/tours/images/68ac1f34bea14_1756110644.jpg', 'image', 384883, 'image/jpeg', 'admin', '2025-08-25 08:30:44', 'gallery', NULL),
(175, 35, '68ac1f34bea13_1756110644.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_3.jpg', 'uploads/tours/images/68ac1f34bea13_1756110644.jpg', 'image', 486189, 'image/jpeg', 'admin', '2025-08-25 08:30:44', 'gallery', NULL),
(176, 35, '68ac1f354b5f6_1756110645.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_4.jpg', 'uploads/tours/images/68ac1f354b5f6_1756110645.jpg', 'image', 365618, 'image/jpeg', 'admin', '2025-08-25 08:30:45', 'gallery', NULL),
(177, 35, '68ac1f354b4d7_1756110645.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_1.jpg', 'uploads/tours/images/68ac1f354b4d7_1756110645.jpg', 'image', 627429, 'image/jpeg', 'admin', '2025-08-25 08:30:45', 'gallery', NULL),
(178, 35, '68ac1f35819ed_1756110645.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_2.jpg', 'uploads/tours/images/68ac1f35819ed_1756110645.jpg', 'image', 471588, 'image/jpeg', 'admin', '2025-08-25 08:30:45', 'gallery', NULL),
(179, 35, '68ac1f4497525_1756110660.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_9.jpg', 'uploads/tours/images/68ac1f4497525_1756110660.jpg', 'image', 429178, 'image/jpeg', 'admin', '2025-08-25 08:31:00', 'gallery', NULL),
(180, 35, '68ac1f44c1257_1756110660.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_6.jpg', 'uploads/tours/images/68ac1f44c1257_1756110660.jpg', 'image', 429881, 'image/jpeg', 'admin', '2025-08-25 08:31:00', 'gallery', NULL),
(181, 35, '68ac1f44c2df3_1756110660.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_10.jpg', 'uploads/tours/images/68ac1f44c2df3_1756110660.jpg', 'image', 392937, 'image/jpeg', 'admin', '2025-08-25 08:31:00', 'gallery', NULL),
(182, 35, '68ac1f44e0057_1756110660.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_7.jpg', 'uploads/tours/images/68ac1f44e0057_1756110660.jpg', 'image', 454268, 'image/jpeg', 'admin', '2025-08-25 08:31:00', 'gallery', NULL),
(183, 35, '68ac1f450841a_1756110661.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_8.jpg', 'uploads/tours/images/68ac1f450841a_1756110661.jpg', 'image', 452364, 'image/jpeg', 'admin', '2025-08-25 08:31:01', 'gallery', NULL),
(184, 35, '68ac1f5d06558_1756110685.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_14.jpg', 'uploads/tours/images/68ac1f5d06558_1756110685.jpg', 'image', 470601, 'image/jpeg', 'admin', '2025-08-25 08:31:25', 'gallery', NULL),
(185, 35, '68ac1f5d36034_1756110685.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_11.jpg', 'uploads/tours/images/68ac1f5d36034_1756110685.jpg', 'image', 528402, 'image/jpeg', 'admin', '2025-08-25 08:31:25', 'gallery', NULL),
(186, 35, '68ac1f5d509e3_1756110685.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_13.jpg', 'uploads/tours/images/68ac1f5d509e3_1756110685.jpg', 'image', 554788, 'image/jpeg', 'admin', '2025-08-25 08:31:25', 'gallery', NULL),
(187, 35, '68ac1f5d8c808_1756110685.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_12.jpg', 'uploads/tours/images/68ac1f5d8c808_1756110685.jpg', 'image', 520818, 'image/jpeg', 'admin', '2025-08-25 08:31:25', 'gallery', NULL),
(188, 35, '68ac1f648f7e6_1756110692.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_17.jpg', 'uploads/tours/images/68ac1f648f7e6_1756110692.jpg', 'image', 510876, 'image/jpeg', 'admin', '2025-08-25 08:31:32', 'gallery', NULL),
(189, 35, '68ac1f6491e40_1756110692.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_16.jpg', 'uploads/tours/images/68ac1f6491e40_1756110692.jpg', 'image', 519774, 'image/jpeg', 'admin', '2025-08-25 08:31:32', 'gallery', NULL),
(190, 35, '68ac1f64b77a3_1756110692.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_20.jpg', 'uploads/tours/images/68ac1f64b77a3_1756110692.jpg', 'image', 493539, 'image/jpeg', 'admin', '2025-08-25 08:31:32', 'gallery', NULL),
(191, 35, '68ac1f6537660_1756110693.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_18.jpg', 'uploads/tours/images/68ac1f6537660_1756110693.jpg', 'image', 724229, 'image/jpeg', 'admin', '2025-08-25 08:31:33', 'gallery', NULL),
(192, 35, '68ac1f657111f_1756110693.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_19.jpg', 'uploads/tours/images/68ac1f657111f_1756110693.jpg', 'image', 764362, 'image/jpeg', 'admin', '2025-08-25 08:31:33', 'gallery', NULL),
(193, 35, '68ac1f6b1a12f_1756110699.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_21.jpg', 'uploads/tours/images/68ac1f6b1a12f_1756110699.jpg', 'image', 466179, 'image/jpeg', 'admin', '2025-08-25 08:31:39', 'gallery', NULL),
(194, 35, '68ac1f6bc7635_1756110699.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_24.jpg', 'uploads/tours/images/68ac1f6bc7635_1756110699.jpg', 'image', 524773, 'image/jpeg', 'admin', '2025-08-25 08:31:39', 'gallery', NULL),
(195, 35, '68ac1f6bc79df_1756110699.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_22.jpg', 'uploads/tours/images/68ac1f6bc79df_1756110699.jpg', 'image', 801587, 'image/jpeg', 'admin', '2025-08-25 08:31:39', 'gallery', NULL),
(196, 35, '68ac1f6bc9d80_1756110699.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_25.jpg', 'uploads/tours/images/68ac1f6bc9d80_1756110699.jpg', 'image', 450589, 'image/jpeg', 'admin', '2025-08-25 08:31:39', 'gallery', NULL),
(197, 35, '68ac1f6c39ff0_1756110700.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_23.jpg', 'uploads/tours/images/68ac1f6c39ff0_1756110700.jpg', 'image', 518159, 'image/jpeg', 'admin', '2025-08-25 08:31:40', 'gallery', NULL),
(198, 35, '68ac1f70ecc46_1756110704.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_30.jpg', 'uploads/tours/images/68ac1f70ecc46_1756110704.jpg', 'image', 411490, 'image/jpeg', 'admin', '2025-08-25 08:31:44', 'gallery', NULL),
(199, 35, '68ac1f712f15c_1756110705.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_26.jpg', 'uploads/tours/images/68ac1f712f15c_1756110705.jpg', 'image', 625929, 'image/jpeg', 'admin', '2025-08-25 08:31:45', 'gallery', NULL),
(200, 35, '68ac1f713fd99_1756110705.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_29.jpg', 'uploads/tours/images/68ac1f713fd99_1756110705.jpg', 'image', 407289, 'image/jpeg', 'admin', '2025-08-25 08:31:45', 'gallery', NULL),
(201, 35, '68ac1f716e4c4_1756110705.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_27.jpg', 'uploads/tours/images/68ac1f716e4c4_1756110705.jpg', 'image', 743024, 'image/jpeg', 'admin', '2025-08-25 08:31:45', 'gallery', NULL),
(202, 35, '68ac1f71a1135_1756110705.jpg', 'Lazy_PhiPhi_Bamboo_Island_2024-25_28.jpg', 'uploads/tours/images/68ac1f71a1135_1756110705.jpg', 'image', 771352, 'image/jpeg', 'admin', '2025-08-25 08:31:45', 'gallery', NULL),
(203, 35, '68ac1f96283fd_1756110742.jpg', 'Brochure TH-10.jpg', 'uploads/tours/images/68ac1f96283fd_1756110742.jpg', 'image', 1908956, 'image/jpeg', 'admin', '2025-08-25 08:32:22', 'brochure', NULL),
(204, 36, '68ac1fd4ee155_1756110804.jpg', 'Brochure TH-08.jpg', 'uploads/tours/images/68ac1fd4ee155_1756110804.jpg', 'image', 1983486, 'image/jpeg', 'admin', '2025-08-25 08:33:24', 'brochure', NULL),
(205, 36, '68ac20733f81f_1756110963.jpg', 'LZ_PP_01.JPG', 'uploads/tours/images/68ac20733f81f_1756110963.jpg', 'image', 290044, 'image/jpeg', 'admin', '2025-08-25 08:36:03', 'gallery', NULL),
(206, 36, '68ac20737993c_1756110963.jpg', 'LZ_PP_04.jpg', 'uploads/tours/images/68ac20737993c_1756110963.jpg', 'image', 502566, 'image/jpeg', 'admin', '2025-08-25 08:36:03', 'gallery', NULL),
(207, 36, '68ac20738ff42_1756110963.jpg', 'LZ_PP_03.jpg', 'uploads/tours/images/68ac20738ff42_1756110963.jpg', 'image', 447594, 'image/jpeg', 'admin', '2025-08-25 08:36:03', 'gallery', NULL),
(208, 36, '68ac2073bbdcc_1756110963.jpg', 'LZ_PP_02.JPG', 'uploads/tours/images/68ac2073bbdcc_1756110963.jpg', 'image', 797455, 'image/jpeg', 'admin', '2025-08-25 08:36:03', 'gallery', NULL),
(209, 36, '68ac2073d9288_1756110963.jpg', 'LZ_PP_05.jpg', 'uploads/tours/images/68ac2073d9288_1756110963.jpg', 'image', 512930, 'image/jpeg', 'admin', '2025-08-25 08:36:03', 'gallery', NULL),
(210, 36, '68ac20805ac5e_1756110976.jpg', 'LZ_PP_10.jpg', 'uploads/tours/images/68ac20805ac5e_1756110976.jpg', 'image', 283051, 'image/jpeg', 'admin', '2025-08-25 08:36:16', 'gallery', NULL),
(211, 36, '68ac2080e81ee_1756110976.jpg', 'LZ_PP_07.jpg', 'uploads/tours/images/68ac2080e81ee_1756110976.jpg', 'image', 582528, 'image/jpeg', 'admin', '2025-08-25 08:36:16', 'gallery', NULL),
(212, 36, '68ac2080ea381_1756110976.jpg', 'LZ_PP_08.jpg', 'uploads/tours/images/68ac2080ea381_1756110976.jpg', 'image', 583508, 'image/jpeg', 'admin', '2025-08-25 08:36:16', 'gallery', NULL),
(213, 36, '68ac2080ea425_1756110976.jpg', 'LZ_PP_09.jpg', 'uploads/tours/images/68ac2080ea425_1756110976.jpg', 'image', 637659, 'image/jpeg', 'admin', '2025-08-25 08:36:16', 'gallery', NULL),
(214, 36, '68ac20814ab82_1756110977.jpg', 'LZ_PP_06.JPG', 'uploads/tours/images/68ac20814ab82_1756110977.jpg', 'image', 215524, 'image/jpeg', 'admin', '2025-08-25 08:36:17', 'gallery', NULL),
(215, 36, '68ac20888f9c8_1756110984.jpg', 'LZ_PP_11.jpg', 'uploads/tours/images/68ac20888f9c8_1756110984.jpg', 'image', 226686, 'image/jpeg', 'admin', '2025-08-25 08:36:24', 'gallery', NULL),
(216, 36, '68ac2088b33ee_1756110984.jpg', 'LZ_PP_15.JPG', 'uploads/tours/images/68ac2088b33ee_1756110984.jpg', 'image', 194977, 'image/jpeg', 'admin', '2025-08-25 08:36:24', 'gallery', NULL),
(217, 36, '68ac20892e575_1756110985.jpg', 'LZ_PP_13.jpg', 'uploads/tours/images/68ac20892e575_1756110985.jpg', 'image', 725950, 'image/jpeg', 'admin', '2025-08-25 08:36:25', 'gallery', NULL),
(218, 36, '68ac20894b038_1756110985.jpg', 'LZ_PP_14.jpg', 'uploads/tours/images/68ac20894b038_1756110985.jpg', 'image', 480383, 'image/jpeg', 'admin', '2025-08-25 08:36:25', 'gallery', NULL),
(219, 36, '68ac20896e9a9_1756110985.jpg', 'LZ_PP_12.jpg', 'uploads/tours/images/68ac20896e9a9_1756110985.jpg', 'image', 582022, 'image/jpeg', 'admin', '2025-08-25 08:36:25', 'gallery', NULL),
(220, 36, '68ac2097ab4e5_1756110999.jpg', 'LZ_PP_16.JPG', 'uploads/tours/images/68ac2097ab4e5_1756110999.jpg', 'image', 303770, 'image/jpeg', 'admin', '2025-08-25 08:36:39', 'gallery', NULL),
(221, 36, '68ac2097e84d4_1756110999.jpg', 'LZ_PP_17.JPG', 'uploads/tours/images/68ac2097e84d4_1756110999.jpg', 'image', 520234, 'image/jpeg', 'admin', '2025-08-25 08:36:39', 'gallery', NULL),
(222, 36, '68ac20980f5fa_1756111000.jpg', 'LZ_PP_18.JPG', 'uploads/tours/images/68ac20980f5fa_1756111000.jpg', 'image', 448307, 'image/jpeg', 'admin', '2025-08-25 08:36:40', 'gallery', NULL),
(223, 36, '68ac209828f31_1756111000.jpg', 'LZ_PP_19.JPG', 'uploads/tours/images/68ac209828f31_1756111000.jpg', 'image', 421351, 'image/jpeg', 'admin', '2025-08-25 08:36:40', 'gallery', NULL),
(224, 36, '68ac2098468bb_1756111000.jpg', 'LZ_PP_20.JPG', 'uploads/tours/images/68ac2098468bb_1756111000.jpg', 'image', 478505, 'image/jpeg', 'admin', '2025-08-25 08:36:40', 'gallery', NULL),
(225, 36, '68ac20a0a9b09_1756111008.jpg', 'LZ_PP_23.JPG', 'uploads/tours/images/68ac20a0a9b09_1756111008.jpg', 'image', 306866, 'image/jpeg', 'admin', '2025-08-25 08:36:48', 'gallery', NULL),
(226, 36, '68ac20a0abc5e_1756111008.jpg', 'LZ_PP_24.JPG', 'uploads/tours/images/68ac20a0abc5e_1756111008.jpg', 'image', 351847, 'image/jpeg', 'admin', '2025-08-25 08:36:48', 'gallery', NULL),
(227, 36, '68ac20a0ace61_1756111008.jpg', 'LZ_PP_21.JPG', 'uploads/tours/images/68ac20a0ace61_1756111008.jpg', 'image', 503928, 'image/jpeg', 'admin', '2025-08-25 08:36:48', 'gallery', NULL),
(228, 36, '68ac20a0db76d_1756111008.jpg', 'LZ_PP_22.JPG', 'uploads/tours/images/68ac20a0db76d_1756111008.jpg', 'image', 377943, 'image/jpeg', 'admin', '2025-08-25 08:36:48', 'gallery', NULL),
(229, 36, '68ac20a0f2f24_1756111008.jpg', 'LZ_PP_25.JPG', 'uploads/tours/images/68ac20a0f2f24_1756111008.jpg', 'image', 385704, 'image/jpeg', 'admin', '2025-08-25 08:36:48', 'gallery', NULL),
(230, 36, '68ac20b0217cc_1756111024.jpg', 'LZ_PP_27.JPG', 'uploads/tours/images/68ac20b0217cc_1756111024.jpg', 'image', 370795, 'image/jpeg', 'admin', '2025-08-25 08:37:04', 'gallery', NULL),
(231, 36, '68ac20b0228b7_1756111024.jpg', 'LZ_PP_26.JPG', 'uploads/tours/images/68ac20b0228b7_1756111024.jpg', 'image', 380926, 'image/jpeg', 'admin', '2025-08-25 08:37:04', 'gallery', NULL),
(232, 36, '68ac20b04d1dc_1756111024.jpg', 'LZ_PP_28.jpg', 'uploads/tours/images/68ac20b04d1dc_1756111024.jpg', 'image', 359510, 'image/jpeg', 'admin', '2025-08-25 08:37:04', 'gallery', NULL),
(233, 36, '68ac20b071bf4_1756111024.jpg', 'LZ_PP_30.jpg', 'uploads/tours/images/68ac20b071bf4_1756111024.jpg', 'image', 499931, 'image/jpeg', 'admin', '2025-08-25 08:37:04', 'gallery', NULL),
(234, 36, '68ac20b0891c4_1756111024.jpg', 'LZ_PP_29.JPG', 'uploads/tours/images/68ac20b0891c4_1756111024.jpg', 'image', 359971, 'image/jpeg', 'admin', '2025-08-25 08:37:04', 'gallery', NULL),
(235, 36, '68ac20b8a7d78_1756111032.jpg', 'LZ_PP_31.jpg', 'uploads/tours/images/68ac20b8a7d78_1756111032.jpg', 'image', 536291, 'image/jpeg', 'admin', '2025-08-25 08:37:12', 'gallery', NULL),
(236, 36, '68ac20b8eb6a2_1756111032.jpg', 'LZ_PP_32.jpg', 'uploads/tours/images/68ac20b8eb6a2_1756111032.jpg', 'image', 719657, 'image/jpeg', 'admin', '2025-08-25 08:37:12', 'gallery', NULL),
(237, 36, '68ac20b969ef0_1756111033.jpg', 'LZ_PP_33.jpg', 'uploads/tours/images/68ac20b969ef0_1756111033.jpg', 'image', 832332, 'image/jpeg', 'admin', '2025-08-25 08:37:13', 'gallery', NULL),
(238, 36, '68ac20b98a5fe_1756111033.jpg', 'LZ_PP_35.jpg', 'uploads/tours/images/68ac20b98a5fe_1756111033.jpg', 'image', 766264, 'image/jpeg', 'admin', '2025-08-25 08:37:13', 'gallery', NULL),
(239, 36, '68ac20b99e227_1756111033.jpg', 'LZ_PP_34.JPG', 'uploads/tours/images/68ac20b99e227_1756111033.jpg', 'image', 821934, 'image/jpeg', 'admin', '2025-08-25 08:37:13', 'gallery', NULL),
(240, 36, '68ac20bf1553d_1756111039.jpg', 'LZ_PP_36.jpg', 'uploads/tours/images/68ac20bf1553d_1756111039.jpg', 'image', 537976, 'image/jpeg', 'admin', '2025-08-25 08:37:19', 'gallery', NULL),
(241, 36, '68ac20bf155bb_1756111039.jpg', 'LZ_PP_37.jpg', 'uploads/tours/images/68ac20bf155bb_1756111039.jpg', 'image', 653193, 'image/jpeg', 'admin', '2025-08-25 08:37:19', 'gallery', NULL),
(242, 36, '68ac20bf7dbd7_1756111039.jpg', 'LZ_PP_40.jpg', 'uploads/tours/images/68ac20bf7dbd7_1756111039.jpg', 'image', 421791, 'image/jpeg', 'admin', '2025-08-25 08:37:19', 'gallery', NULL),
(243, 36, '68ac20bf7e1ca_1756111039.jpg', 'LZ_PP_39.jpg', 'uploads/tours/images/68ac20bf7e1ca_1756111039.jpg', 'image', 503440, 'image/jpeg', 'admin', '2025-08-25 08:37:19', 'gallery', NULL),
(244, 36, '68ac20bfbb989_1756111039.jpg', 'LZ_PP_38.jpg', 'uploads/tours/images/68ac20bfbb989_1756111039.jpg', 'image', 635622, 'image/jpeg', 'admin', '2025-08-25 08:37:19', 'gallery', NULL),
(245, 36, '68ac20c3cb2a0_1756111043.jpg', 'LZ_PP_42.jpg', 'uploads/tours/images/68ac20c3cb2a0_1756111043.jpg', 'image', 550999, 'image/jpeg', 'admin', '2025-08-25 08:37:23', 'gallery', NULL),
(246, 36, '68ac20c40ed8e_1756111044.jpg', 'LZ_PP_41.jpg', 'uploads/tours/images/68ac20c40ed8e_1756111044.jpg', 'image', 625852, 'image/jpeg', 'admin', '2025-08-25 08:37:24', 'gallery', NULL),
(247, 36, '68ac20c444b3b_1756111044.jpg', 'LZ_PP_43.JPG', 'uploads/tours/images/68ac20c444b3b_1756111044.jpg', 'image', 511702, 'image/jpeg', 'admin', '2025-08-25 08:37:24', 'gallery', NULL),
(248, 36, '68ac20c4602f3_1756111044.jpg', 'LZ_PP_45.JPG', 'uploads/tours/images/68ac20c4602f3_1756111044.jpg', 'image', 670832, 'image/jpeg', 'admin', '2025-08-25 08:37:24', 'gallery', NULL),
(249, 36, '68ac20c47f8df_1756111044.jpg', 'LZ_PP_44.JPG', 'uploads/tours/images/68ac20c47f8df_1756111044.jpg', 'image', 536959, 'image/jpeg', 'admin', '2025-08-25 08:37:24', 'gallery', NULL),
(250, 37, '68ac25d60aaaf_1756112342.jpg', 'Brochure TH-08.jpg', 'uploads/tours/images/68ac25d60aaaf_1756112342.jpg', 'image', 1983486, 'image/jpeg', 'admin', '2025-08-25 08:59:02', 'brochure', NULL),
(251, 37, '68ac27a44e563_1756112804.jpg', 'LZ_PP_03.jpg', 'uploads/tours/images/68ac27a44e563_1756112804.jpg', 'image', 447594, 'image/jpeg', 'admin', '2025-08-25 09:06:44', 'gallery', NULL),
(252, 37, '68ac27a4872f2_1756112804.jpg', 'LZ_PP_04.jpg', 'uploads/tours/images/68ac27a4872f2_1756112804.jpg', 'image', 502566, 'image/jpeg', 'admin', '2025-08-25 09:06:44', 'gallery', NULL),
(253, 37, '68ac27a4c8fce_1756112804.jpg', 'LZ_PP_09.jpg', 'uploads/tours/images/68ac27a4c8fce_1756112804.jpg', 'image', 637659, 'image/jpeg', 'admin', '2025-08-25 09:06:44', 'gallery', NULL),
(254, 37, '68ac27a50adbd_1756112805.jpg', 'LZ_PP_02.JPG', 'uploads/tours/images/68ac27a50adbd_1756112805.jpg', 'image', 797455, 'image/jpeg', 'admin', '2025-08-25 09:06:45', 'gallery', NULL),
(255, 37, '68ac27a530a52_1756112805.jpg', 'LZ_PP_08.jpg', 'uploads/tours/images/68ac27a530a52_1756112805.jpg', 'image', 583508, 'image/jpeg', 'admin', '2025-08-25 09:06:45', 'gallery', NULL),
(256, 37, '68ac27b5a9925_1756112821.jpg', 'LZ_PP_14.jpg', 'uploads/tours/images/68ac27b5a9925_1756112821.jpg', 'image', 480383, 'image/jpeg', 'admin', '2025-08-25 09:07:01', 'gallery', NULL),
(257, 37, '68ac27b62205b_1756112822.jpg', 'LZ_PP_17.JPG', 'uploads/tours/images/68ac27b62205b_1756112822.jpg', 'image', 520234, 'image/jpeg', 'admin', '2025-08-25 09:07:02', 'gallery', NULL),
(258, 37, '68ac27b623999_1756112822.jpg', 'LZ_PP_18.JPG', 'uploads/tours/images/68ac27b623999_1756112822.jpg', 'image', 448307, 'image/jpeg', 'admin', '2025-08-25 09:07:02', 'gallery', NULL),
(259, 37, '68ac27b623ee6_1756112822.jpg', 'LZ_PP_19.JPG', 'uploads/tours/images/68ac27b623ee6_1756112822.jpg', 'image', 421351, 'image/jpeg', 'admin', '2025-08-25 09:07:02', 'gallery', NULL),
(260, 37, '68ac27b68fb57_1756112822.jpg', 'LZ_PP_13.jpg', 'uploads/tours/images/68ac27b68fb57_1756112822.jpg', 'image', 725950, 'image/jpeg', 'admin', '2025-08-25 09:07:02', 'gallery', NULL),
(261, 37, '68ac27bda3ccd_1756112829.jpg', 'LZ_PP_23.JPG', 'uploads/tours/images/68ac27bda3ccd_1756112829.jpg', 'image', 306866, 'image/jpeg', 'admin', '2025-08-25 09:07:09', 'gallery', NULL),
(262, 37, '68ac27be1b25d_1756112830.jpg', 'LZ_PP_22.JPG', 'uploads/tours/images/68ac27be1b25d_1756112830.jpg', 'image', 377943, 'image/jpeg', 'admin', '2025-08-25 09:07:10', 'gallery', NULL),
(263, 37, '68ac27be1b1e1_1756112830.jpg', 'LZ_PP_24.JPG', 'uploads/tours/images/68ac27be1b1e1_1756112830.jpg', 'image', 351847, 'image/jpeg', 'admin', '2025-08-25 09:07:10', 'gallery', NULL),
(264, 37, '68ac27be1ba2e_1756112830.jpg', 'LZ_PP_20.JPG', 'uploads/tours/images/68ac27be1ba2e_1756112830.jpg', 'image', 478505, 'image/jpeg', 'admin', '2025-08-25 09:07:10', 'gallery', NULL),
(265, 37, '68ac27be87c77_1756112830.jpg', 'LZ_PP_21.JPG', 'uploads/tours/images/68ac27be87c77_1756112830.jpg', 'image', 503928, 'image/jpeg', 'admin', '2025-08-25 09:07:10', 'gallery', NULL),
(266, 37, '68ac27c28c679_1756112834.jpg', 'LZ_PP_25.JPG', 'uploads/tours/images/68ac27c28c679_1756112834.jpg', 'image', 385704, 'image/jpeg', 'admin', '2025-08-25 09:07:14', 'gallery', NULL),
(267, 37, '68ac27c2bcb24_1756112834.jpg', 'LZ_PP_26.JPG', 'uploads/tours/images/68ac27c2bcb24_1756112834.jpg', 'image', 380926, 'image/jpeg', 'admin', '2025-08-25 09:07:14', 'gallery', NULL),
(268, 37, '68ac27c327708_1756112835.jpg', 'LZ_PP_28.jpg', 'uploads/tours/images/68ac27c327708_1756112835.jpg', 'image', 359510, 'image/jpeg', 'admin', '2025-08-25 09:07:15', 'gallery', NULL),
(269, 37, '68ac27c33d26f_1756112835.jpg', 'LZ_PP_27.JPG', 'uploads/tours/images/68ac27c33d26f_1756112835.jpg', 'image', 370795, 'image/jpeg', 'admin', '2025-08-25 09:07:15', 'gallery', NULL),
(270, 37, '68ac27c3555c2_1756112835.jpg', 'LZ_PP_29.JPG', 'uploads/tours/images/68ac27c3555c2_1756112835.jpg', 'image', 359971, 'image/jpeg', 'admin', '2025-08-25 09:07:15', 'gallery', NULL),
(271, 37, '68ac27cf43266_1756112847.jpg', 'LZ_PP_31.jpg', 'uploads/tours/images/68ac27cf43266_1756112847.jpg', 'image', 536291, 'image/jpeg', 'admin', '2025-08-25 09:07:27', 'gallery', NULL),
(272, 37, '68ac27cf818ea_1756112847.jpg', 'LZ_PP_36.jpg', 'uploads/tours/images/68ac27cf818ea_1756112847.jpg', 'image', 537976, 'image/jpeg', 'admin', '2025-08-25 09:07:27', 'gallery', NULL),
(273, 37, '68ac27cfc971c_1756112847.jpg', 'LZ_PP_32.jpg', 'uploads/tours/images/68ac27cfc971c_1756112847.jpg', 'image', 719657, 'image/jpeg', 'admin', '2025-08-25 09:07:27', 'gallery', NULL),
(274, 37, '68ac27d00e6b3_1756112848.jpg', 'LZ_PP_37.jpg', 'uploads/tours/images/68ac27d00e6b3_1756112848.jpg', 'image', 653193, 'image/jpeg', 'admin', '2025-08-25 09:07:28', 'gallery', NULL),
(275, 37, '68ac27d031434_1756112848.jpg', 'LZ_PP_35.jpg', 'uploads/tours/images/68ac27d031434_1756112848.jpg', 'image', 766264, 'image/jpeg', 'admin', '2025-08-25 09:07:28', 'gallery', NULL),
(276, 37, '68ac27d698847_1756112854.jpg', 'LZ_PP_40.jpg', 'uploads/tours/images/68ac27d698847_1756112854.jpg', 'image', 421791, 'image/jpeg', 'admin', '2025-08-25 09:07:34', 'gallery', NULL);
INSERT INTO `tour_files` (`id`, `tour_id`, `file_name`, `original_name`, `file_path`, `file_type`, `file_size`, `mime_type`, `uploaded_by`, `uploaded_at`, `file_category`, `shared_with_tour_ids`) VALUES
(277, 37, '68ac27d6efce9_1756112854.jpg', 'LZ_PP_43.JPG', 'uploads/tours/images/68ac27d6efce9_1756112854.jpg', 'image', 511702, 'image/jpeg', 'admin', '2025-08-25 09:07:34', 'gallery', NULL),
(278, 37, '68ac27d6f0481_1756112854.jpg', 'LZ_PP_42.jpg', 'uploads/tours/images/68ac27d6f0481_1756112854.jpg', 'image', 550999, 'image/jpeg', 'admin', '2025-08-25 09:07:34', 'gallery', NULL),
(279, 37, '68ac27d765e36_1756112855.jpg', 'LZ_PP_45.JPG', 'uploads/tours/images/68ac27d765e36_1756112855.jpg', 'image', 670832, 'image/jpeg', 'admin', '2025-08-25 09:07:35', 'gallery', NULL),
(280, 37, '68ac27d7a5fc0_1756112855.jpg', 'LZ_PP_41.jpg', 'uploads/tours/images/68ac27d7a5fc0_1756112855.jpg', 'image', 625852, 'image/jpeg', 'admin', '2025-08-25 09:07:35', 'gallery', NULL),
(281, 38, '68ac28112f473_1756112913.jpg', 'Brochure TH-12.jpg', 'uploads/tours/images/68ac28112f473_1756112913.jpg', 'image', 1885643, 'image/jpeg', 'admin', '2025-08-25 09:08:33', 'brochure', NULL),
(282, 38, '68ac28438ed2f_1756112963.jpeg', 'LZ_JB_01.jpeg', 'uploads/tours/images/68ac28438ed2f_1756112963.jpeg', 'image', 487957, 'image/jpeg', 'admin', '2025-08-25 09:09:23', 'gallery', NULL),
(283, 38, '68ac2843c56fd_1756112963.jpeg', 'LZ_JB_06.jpeg', 'uploads/tours/images/68ac2843c56fd_1756112963.jpeg', 'image', 529196, 'image/jpeg', 'admin', '2025-08-25 09:09:23', 'gallery', NULL),
(284, 38, '68ac2843e7133_1756112963.jpeg', 'LZ_JB_03.jpeg', 'uploads/tours/images/68ac2843e7133_1756112963.jpeg', 'image', 505181, 'image/jpeg', 'admin', '2025-08-25 09:09:23', 'gallery', NULL),
(285, 38, '68ac284409606_1756112964.jpeg', 'LZ_JB_05.jpeg', 'uploads/tours/images/68ac284409606_1756112964.jpeg', 'image', 375704, 'image/jpeg', 'admin', '2025-08-25 09:09:24', 'gallery', NULL),
(286, 38, '68ac284421a3a_1756112964.jpeg', 'LZ_JB_07.jpeg', 'uploads/tours/images/68ac284421a3a_1756112964.jpeg', 'image', 371011, 'image/jpeg', 'admin', '2025-08-25 09:09:24', 'gallery', NULL),
(287, 38, '68ac2855f4050_1756112981.jpeg', 'LZ_JB_13.jpeg', 'uploads/tours/images/68ac2855f4050_1756112981.jpeg', 'image', 183214, 'image/jpeg', 'admin', '2025-08-25 09:09:42', 'gallery', NULL),
(288, 38, '68ac285644ff5_1756112982.jpeg', 'LZ_JB_10.jpeg', 'uploads/tours/images/68ac285644ff5_1756112982.jpeg', 'image', 532436, 'image/jpeg', 'admin', '2025-08-25 09:09:42', 'gallery', NULL),
(289, 38, '68ac2856467b9_1756112982.jpeg', 'LZ_JB_11.jpeg', 'uploads/tours/images/68ac2856467b9_1756112982.jpeg', 'image', 274320, 'image/jpeg', 'admin', '2025-08-25 09:09:42', 'gallery', NULL),
(290, 38, '68ac285668c15_1756112982.jpeg', 'LZ_JB_14.jpeg', 'uploads/tours/images/68ac285668c15_1756112982.jpeg', 'image', 176844, 'image/jpeg', 'admin', '2025-08-25 09:09:42', 'gallery', NULL),
(291, 38, '68ac2856749fc_1756112982.jpeg', 'LZ_JB_12.jpeg', 'uploads/tours/images/68ac2856749fc_1756112982.jpeg', 'image', 190646, 'image/jpeg', 'admin', '2025-08-25 09:09:42', 'gallery', NULL),
(292, 38, '68ac285c4ed0f_1756112988.jpeg', 'LZ_JB_15.jpeg', 'uploads/tours/images/68ac285c4ed0f_1756112988.jpeg', 'image', 212681, 'image/jpeg', 'admin', '2025-08-25 09:09:48', 'gallery', NULL),
(293, 38, '68ac285c6fb63_1756112988.jpeg', 'LZ_JB_17.jpeg', 'uploads/tours/images/68ac285c6fb63_1756112988.jpeg', 'image', 184592, 'image/jpeg', 'admin', '2025-08-25 09:09:48', 'gallery', NULL),
(294, 38, '68ac285c7917a_1756112988.jpeg', 'LZ_JB_18.jpeg', 'uploads/tours/images/68ac285c7917a_1756112988.jpeg', 'image', 159374, 'image/jpeg', 'admin', '2025-08-25 09:09:48', 'gallery', NULL),
(295, 38, '68ac285c840c8_1756112988.jpeg', 'LZ_JB_16.jpeg', 'uploads/tours/images/68ac285c840c8_1756112988.jpeg', 'image', 181128, 'image/jpeg', 'admin', '2025-08-25 09:09:48', 'gallery', NULL),
(296, 38, '68ac285ca9d68_1756112988.jpeg', 'LZ_JB_19.jpeg', 'uploads/tours/images/68ac285ca9d68_1756112988.jpeg', 'image', 540111, 'image/jpeg', 'admin', '2025-08-25 09:09:48', 'gallery', NULL),
(297, 38, '68ac286a62b1a_1756113002.jpeg', 'LZ_JB_21.jpeg', 'uploads/tours/images/68ac286a62b1a_1756113002.jpeg', 'image', 288367, 'image/jpeg', 'admin', '2025-08-25 09:10:02', 'gallery', NULL),
(298, 38, '68ac286aaf5aa_1756113002.jpeg', 'LZ_JB_24.jpeg', 'uploads/tours/images/68ac286aaf5aa_1756113002.jpeg', 'image', 472543, 'image/jpeg', 'admin', '2025-08-25 09:10:02', 'gallery', NULL),
(299, 38, '68ac286ab0a83_1756113002.jpeg', 'LZ_JB_25.jpeg', 'uploads/tours/images/68ac286ab0a83_1756113002.jpeg', 'image', 417259, 'image/jpeg', 'admin', '2025-08-25 09:10:02', 'gallery', NULL),
(300, 38, '68ac286b2e21f_1756113003.jpeg', 'LZ_JB_23.jpeg', 'uploads/tours/images/68ac286b2e21f_1756113003.jpeg', 'image', 699255, 'image/jpeg', 'admin', '2025-08-25 09:10:03', 'gallery', NULL),
(301, 38, '68ac286b5aefd_1756113003.jpeg', 'LZ_JB_26.jpeg', 'uploads/tours/images/68ac286b5aefd_1756113003.jpeg', 'image', 642289, 'image/jpeg', 'admin', '2025-08-25 09:10:03', 'gallery', NULL),
(302, 38, '68ac286e2ae23_1756113006.jpeg', 'LZ_JB_28.jpeg', 'uploads/tours/images/68ac286e2ae23_1756113006.jpeg', 'image', 651930, 'image/jpeg', 'admin', '2025-08-25 09:10:06', 'gallery', NULL),
(303, 38, '68ac28775cb99_1756113015.jpeg', 'LZ_JB_30.jpeg', 'uploads/tours/images/68ac28775cb99_1756113015.jpeg', 'image', 494051, 'image/jpeg', 'admin', '2025-08-25 09:10:15', 'gallery', NULL),
(304, 38, '68ac2877afac0_1756113015.jpeg', 'LZ_JB_31.jpeg', 'uploads/tours/images/68ac2877afac0_1756113015.jpeg', 'image', 339093, 'image/jpeg', 'admin', '2025-08-25 09:10:15', 'gallery', NULL),
(305, 38, '68ac2877b0edc_1756113015.jpeg', 'LZ_JB_34.jpeg', 'uploads/tours/images/68ac2877b0edc_1756113015.jpeg', 'image', 273401, 'image/jpeg', 'admin', '2025-08-25 09:10:15', 'gallery', NULL),
(306, 38, '68ac2877b202b_1756113015.jpeg', 'LZ_JB_33.jpeg', 'uploads/tours/images/68ac2877b202b_1756113015.jpeg', 'image', 337238, 'image/jpeg', 'admin', '2025-08-25 09:10:15', 'gallery', NULL),
(307, 38, '68ac28782b52a_1756113016.jpeg', 'LZ_JB_36.jpeg', 'uploads/tours/images/68ac28782b52a_1756113016.jpeg', 'image', 158916, 'image/jpeg', 'admin', '2025-08-25 09:10:16', 'gallery', NULL),
(308, 38, '68ac288b5e0dd_1756113035.jpeg', 'LZ_JB_41.jpeg', 'uploads/tours/images/68ac288b5e0dd_1756113035.jpeg', 'image', 298588, 'image/jpeg', 'admin', '2025-08-25 09:10:35', 'gallery', NULL),
(309, 38, '68ac288b8fcd9_1756113035.jpeg', 'LZ_JB_39.jpeg', 'uploads/tours/images/68ac288b8fcd9_1756113035.jpeg', 'image', 446800, 'image/jpeg', 'admin', '2025-08-25 09:10:35', 'gallery', NULL),
(310, 38, '68ac288bca05c_1756113035.jpeg', 'LZ_JB_44.jpeg', 'uploads/tours/images/68ac288bca05c_1756113035.jpeg', 'image', 552467, 'image/jpeg', 'admin', '2025-08-25 09:10:35', 'gallery', NULL),
(311, 38, '68ac288be89dd_1756113035.jpeg', 'LZ_JB_47.jpeg', 'uploads/tours/images/68ac288be89dd_1756113035.jpeg', 'image', 463443, 'image/jpeg', 'admin', '2025-08-25 09:10:35', 'gallery', NULL),
(312, 38, '68ac288c096e4_1756113036.jpeg', 'LZ_JB_46.jpeg', 'uploads/tours/images/68ac288c096e4_1756113036.jpeg', 'image', 327518, 'image/jpeg', 'admin', '2025-08-25 09:10:36', 'gallery', NULL),
(313, 38, '68ac28930fce9_1756113043.jpeg', 'LZ_JB_56.jpeg', 'uploads/tours/images/68ac28930fce9_1756113043.jpeg', 'image', 169562, 'image/jpeg', 'admin', '2025-08-25 09:10:43', 'gallery', NULL),
(314, 38, '68ac28934e58b_1756113043.jpeg', 'LZ_JB_55.jpeg', 'uploads/tours/images/68ac28934e58b_1756113043.jpeg', 'image', 602494, 'image/jpeg', 'admin', '2025-08-25 09:10:43', 'gallery', NULL),
(315, 38, '68ac289376fcd_1756113043.jpeg', 'LZ_JB_54.jpeg', 'uploads/tours/images/68ac289376fcd_1756113043.jpeg', 'image', 559739, 'image/jpeg', 'admin', '2025-08-25 09:10:43', 'gallery', NULL),
(316, 38, '68ac2893a9435_1756113043.jpeg', 'LZ_JB_52.jpeg', 'uploads/tours/images/68ac2893a9435_1756113043.jpeg', 'image', 661657, 'image/jpeg', 'admin', '2025-08-25 09:10:43', 'gallery', NULL),
(317, 38, '68ac2893df7d8_1756113043.jpeg', 'LZ_JB_51.jpeg', 'uploads/tours/images/68ac2893df7d8_1756113043.jpeg', 'image', 836637, 'image/jpeg', 'admin', '2025-08-25 09:10:43', 'gallery', NULL),
(318, 38, '68ac289688ee5_1756113046.jpeg', 'LZ_JB_57.jpeg', 'uploads/tours/images/68ac289688ee5_1756113046.jpeg', 'image', 516752, 'image/jpeg', 'admin', '2025-08-25 09:10:46', 'gallery', NULL),
(319, 39, '68ac28c6be72f_1756113094.jpg', 'Brochure TH-14.jpg', 'uploads/tours/images/68ac28c6be72f_1756113094.jpg', 'image', 1849757, 'image/jpeg', 'admin', '2025-08-25 09:11:34', 'brochure', NULL),
(320, 39, '68ac28ef06b2f_1756113135.jpg', 'Rok_Island_2023-24_1.jpg', 'uploads/tours/images/68ac28ef06b2f_1756113135.jpg', 'image', 438938, 'image/jpeg', 'admin', '2025-08-25 09:12:15', 'gallery', NULL),
(321, 39, '68ac28ef65012_1756113135.jpg', 'Rok_Island_2023-24_3.jpg', 'uploads/tours/images/68ac28ef65012_1756113135.jpg', 'image', 526080, 'image/jpeg', 'admin', '2025-08-25 09:12:15', 'gallery', NULL),
(322, 39, '68ac28ef66c1e_1756113135.jpg', 'Rok_Island_2023-24_5.jpg', 'uploads/tours/images/68ac28ef66c1e_1756113135.jpg', 'image', 489682, 'image/jpeg', 'admin', '2025-08-25 09:12:15', 'gallery', NULL),
(323, 39, '68ac28efa2652_1756113135.jpg', 'Rok_Island_2023-24_2.jpg', 'uploads/tours/images/68ac28efa2652_1756113135.jpg', 'image', 786769, 'image/jpeg', 'admin', '2025-08-25 09:12:15', 'gallery', NULL),
(324, 39, '68ac28efc6667_1756113135.jpg', 'Rok_Island_2023-24_4.jpg', 'uploads/tours/images/68ac28efc6667_1756113135.jpg', 'image', 605306, 'image/jpeg', 'admin', '2025-08-25 09:12:15', 'gallery', NULL),
(325, 39, '68ac297a9b2ab_1756113274.jpg', 'Rok_Island_2023-24_7.jpg', 'uploads/tours/images/68ac297a9b2ab_1756113274.jpg', 'image', 488531, 'image/jpeg', 'admin', '2025-08-25 09:14:34', 'gallery', NULL),
(326, 39, '68ac297ad2d85_1756113274.jpg', 'Rok_Island_2023-24_10.jpg', 'uploads/tours/images/68ac297ad2d85_1756113274.jpg', 'image', 523473, 'image/jpeg', 'admin', '2025-08-25 09:14:34', 'gallery', NULL),
(327, 39, '68ac297b1a3d8_1756113275.jpg', 'Rok_Island_2023-24_12.jpg', 'uploads/tours/images/68ac297b1a3d8_1756113275.jpg', 'image', 646585, 'image/jpeg', 'admin', '2025-08-25 09:14:35', 'gallery', NULL),
(328, 39, '68ac297b4254c_1756113275.jpg', 'Rok_Island_2023-24_8.jpg', 'uploads/tours/images/68ac297b4254c_1756113275.jpg', 'image', 637890, 'image/jpeg', 'admin', '2025-08-25 09:14:35', 'gallery', NULL),
(329, 39, '68ac297b5e388_1756113275.jpg', 'Rok_Island_2023-24_13.jpg', 'uploads/tours/images/68ac297b5e388_1756113275.jpg', 'image', 660851, 'image/jpeg', 'admin', '2025-08-25 09:14:35', 'gallery', NULL),
(330, 39, '68ac297deb2b5_1756113277.jpg', 'Rok_Island_2023-24_14.jpg', 'uploads/tours/images/68ac297deb2b5_1756113277.jpg', 'image', 670243, 'image/jpeg', 'admin', '2025-08-25 09:14:37', 'gallery', NULL),
(331, 39, '68ac29865d000_1756113286.jpg', 'Rok_Island_2023-24_18.jpg', 'uploads/tours/images/68ac29865d000_1756113286.jpg', 'image', 806570, 'image/jpeg', 'admin', '2025-08-25 09:14:46', 'gallery', NULL),
(332, 39, '68ac2986978a3_1756113286.jpg', 'Rok_Island_2023-24_17.jpg', 'uploads/tours/images/68ac2986978a3_1756113286.jpg', 'image', 655742, 'image/jpeg', 'admin', '2025-08-25 09:14:46', 'gallery', NULL),
(333, 39, '68ac298699644_1756113286.jpg', 'Rok_Island_2023-24_20.jpg', 'uploads/tours/images/68ac298699644_1756113286.jpg', 'image', 369499, 'image/jpeg', 'admin', '2025-08-25 09:14:46', 'gallery', NULL),
(334, 39, '68ac2986e4c8d_1756113286.jpg', 'Rok_Island_2023-24_19.jpg', 'uploads/tours/images/68ac2986e4c8d_1756113286.jpg', 'image', 753442, 'image/jpeg', 'admin', '2025-08-25 09:14:46', 'gallery', NULL),
(335, 39, '68ac298724d07_1756113287.jpg', 'Rok_Island_2023-24_21.jpg', 'uploads/tours/images/68ac298724d07_1756113287.jpg', 'image', 812346, 'image/jpeg', 'admin', '2025-08-25 09:14:47', 'gallery', NULL),
(336, 39, '68ac299e8f043_1756113310.jpg', 'Rok_Island_2023-24_23.jpg', 'uploads/tours/images/68ac299e8f043_1756113310.jpg', 'image', 470658, 'image/jpeg', 'admin', '2025-08-25 09:15:10', 'gallery', NULL),
(337, 39, '68ac299ede80b_1756113310.jpg', 'Rok_Island_2023-24_25.jpg', 'uploads/tours/images/68ac299ede80b_1756113310.jpg', 'image', 298634, 'image/jpeg', 'admin', '2025-08-25 09:15:10', 'gallery', NULL),
(338, 39, '68ac299ee006f_1756113310.jpg', 'Rok_Island_2023-24_27.jpg', 'uploads/tours/images/68ac299ee006f_1756113310.jpg', 'image', 261697, 'image/jpeg', 'admin', '2025-08-25 09:15:10', 'gallery', NULL),
(339, 39, '68ac299ee022f_1756113310.jpg', 'Rok_Island_2023-24_28.jpg', 'uploads/tours/images/68ac299ee022f_1756113310.jpg', 'image', 328904, 'image/jpeg', 'admin', '2025-08-25 09:15:10', 'gallery', NULL),
(340, 39, '68ac299f4d926_1756113311.jpg', 'Rok_Island_2023-24_29.jpg', 'uploads/tours/images/68ac299f4d926_1756113311.jpg', 'image', 402276, 'image/jpeg', 'admin', '2025-08-25 09:15:11', 'gallery', NULL),
(341, 39, '68ac29a3b7cfd_1756113315.jpg', 'Rok_Island_2023-24_34.jpg', 'uploads/tours/images/68ac29a3b7cfd_1756113315.jpg', 'image', 279189, 'image/jpeg', 'admin', '2025-08-25 09:15:15', 'gallery', NULL),
(342, 39, '68ac29a3b8002_1756113315.jpg', 'Rok_Island_2023-24_32.jpg', 'uploads/tours/images/68ac29a3b8002_1756113315.jpg', 'image', 261622, 'image/jpeg', 'admin', '2025-08-25 09:15:15', 'gallery', NULL),
(343, 39, '68ac29a440f2d_1756113316.jpg', 'Rok_Island_2023-24_33.jpg', 'uploads/tours/images/68ac29a440f2d_1756113316.jpg', 'image', 332528, 'image/jpeg', 'admin', '2025-08-25 09:15:16', 'gallery', NULL),
(344, 39, '68ac29a454d82_1756113316.jpg', 'Rok_Island_2023-24_30.jpg', 'uploads/tours/images/68ac29a454d82_1756113316.jpg', 'image', 348823, 'image/jpeg', 'admin', '2025-08-25 09:15:16', 'gallery', NULL),
(345, 39, '68ac29a47622d_1756113316.jpg', 'Rok_Island_2023-24_31.jpg', 'uploads/tours/images/68ac29a47622d_1756113316.jpg', 'image', 447007, 'image/jpeg', 'admin', '2025-08-25 09:15:16', 'gallery', NULL),
(346, 39, '68ac29a77dfe8_1756113319.jpg', 'Rok_Island_2023-24_36.jpg', 'uploads/tours/images/68ac29a77dfe8_1756113319.jpg', 'image', 235768, 'image/jpeg', 'admin', '2025-08-25 09:15:19', 'gallery', NULL),
(347, 39, '68ac29a77e38a_1756113319.jpg', 'Rok_Island_2023-24_35.jpg', 'uploads/tours/images/68ac29a77e38a_1756113319.jpg', 'image', 235503, 'image/jpeg', 'admin', '2025-08-25 09:15:19', 'gallery', NULL),
(348, 39, '68ac29a7bfd07_1756113319.jpg', 'Rok_Island_2023-24_38.jpg', 'uploads/tours/images/68ac29a7bfd07_1756113319.jpg', 'image', 712803, 'image/jpeg', 'admin', '2025-08-25 09:15:19', 'gallery', NULL),
(349, 39, '68ac29a8246a8_1756113320.jpg', 'Rok_Island_2023-24_37.jpg', 'uploads/tours/images/68ac29a8246a8_1756113320.jpg', 'image', 221935, 'image/jpeg', 'admin', '2025-08-25 09:15:20', 'gallery', NULL),
(350, 40, '68ac2a0015a41_1756113408.jpg', 'Brochure TH-01.jpg', 'uploads/tours/images/68ac2a0015a41_1756113408.jpg', 'image', 1850477, 'image/jpeg', 'admin', '2025-08-25 09:16:48', 'brochure', NULL),
(384, 41, '68ac2c384e1fd_1756113976.jpg', 'Brochure TH-03.jpg', 'uploads/tours/images/68ac2c384e1fd_1756113976.jpg', 'image', 2004040, 'image/jpeg', 'admin', '2025-08-25 09:26:16', 'brochure', NULL),
(385, 41, '68ac2c66df9fc_1756114022.jpg', 'Diving2D1N_Similan_Island_1.jpg', 'uploads/tours/images/68ac2c66df9fc_1756114022.jpg', 'image', 471147, 'image/jpeg', 'admin', '2025-08-25 09:27:02', 'gallery', '[45,44]'),
(386, 41, '68ac2c674d1d7_1756114023.jpg', 'Diving2D1N_Similan_Island_8.jpg', 'uploads/tours/images/68ac2c674d1d7_1756114023.jpg', 'image', 456957, 'image/jpeg', 'admin', '2025-08-25 09:27:03', 'gallery', '[45,44]'),
(387, 41, '68ac2c674ed8d_1756114023.jpg', 'Diving2D1N_Similan_Island_2.jpg', 'uploads/tours/images/68ac2c674ed8d_1756114023.jpg', 'image', 465013, 'image/jpeg', 'admin', '2025-08-25 09:27:03', 'gallery', '[45,44]'),
(388, 41, '68ac2c676fe55_1756114023.jpg', 'Diving2D1N_Similan_Island_3.jpg', 'uploads/tours/images/68ac2c676fe55_1756114023.jpg', 'image', 415303, 'image/jpeg', 'admin', '2025-08-25 09:27:03', 'gallery', '[45,44]'),
(389, 41, '68ac2c67a372c_1756114023.jpg', 'Diving2D1N_Similan_Island_4.jpg', 'uploads/tours/images/68ac2c67a372c_1756114023.jpg', 'image', 484647, 'image/jpeg', 'admin', '2025-08-25 09:27:03', 'gallery', '[45,44]'),
(390, 41, '68ac2c7a755ea_1756114042.jpg', 'Diving2D1N_Similan_Island_15.jpg', 'uploads/tours/images/68ac2c7a755ea_1756114042.jpg', 'image', 278097, 'image/jpeg', 'admin', '2025-08-25 09:27:22', 'gallery', '[45,44]'),
(391, 41, '68ac2c7a75bc8_1756114042.jpg', 'Diving2D1N_Similan_Island_14.jpg', 'uploads/tours/images/68ac2c7a75bc8_1756114042.jpg', 'image', 289345, 'image/jpeg', 'admin', '2025-08-25 09:27:22', 'gallery', '[45,44]'),
(392, 41, '68ac2c7a94c79_1756114042.jpg', 'Diving2D1N_Similan_Island_10.jpg', 'uploads/tours/images/68ac2c7a94c79_1756114042.jpg', 'image', 171654, 'image/jpeg', 'admin', '2025-08-25 09:27:22', 'gallery', '[45,44]'),
(393, 41, '68ac2c7a9bc61_1756114042.jpg', 'Diving2D1N_Similan_Island_13.jpg', 'uploads/tours/images/68ac2c7a9bc61_1756114042.jpg', 'image', 115891, 'image/jpeg', 'admin', '2025-08-25 09:27:22', 'gallery', '[45,44]'),
(394, 41, '68ac2c7aa7dcc_1756114042.jpg', 'Diving2D1N_Similan_Island_11.jpg', 'uploads/tours/images/68ac2c7aa7dcc_1756114042.jpg', 'image', 190741, 'image/jpeg', 'admin', '2025-08-25 09:27:22', 'gallery', '[45,44]'),
(395, 41, '68ac2c83f056f_1756114051.jpg', 'Diving2D1N_Similan_Island_16.jpg', 'uploads/tours/images/68ac2c83f056f_1756114051.jpg', 'image', 243755, 'image/jpeg', 'admin', '2025-08-25 09:27:31', 'gallery', '[45,44]'),
(396, 41, '68ac2c84207bf_1756114052.jpg', 'Diving2D1N_Similan_Island_17.jpg', 'uploads/tours/images/68ac2c84207bf_1756114052.jpg', 'image', 220165, 'image/jpeg', 'admin', '2025-08-25 09:27:32', 'gallery', '[45,44]'),
(397, 41, '68ac2c8436bf9_1756114052.jpg', 'Diving2D1N_Similan_Island_19.jpg', 'uploads/tours/images/68ac2c8436bf9_1756114052.jpg', 'image', 355265, 'image/jpeg', 'admin', '2025-08-25 09:27:32', 'gallery', '[45,44]'),
(398, 41, '68ac2c844aa2b_1756114052.jpg', 'Diving2D1N_Similan_Island_18.jpg', 'uploads/tours/images/68ac2c844aa2b_1756114052.jpg', 'image', 313766, 'image/jpeg', 'admin', '2025-08-25 09:27:32', 'gallery', '[45,44]'),
(399, 41, '68ac2c8b30bb9_1756114059.jpg', 'Diving2D1N_Similan_Island_21.jpg', 'uploads/tours/images/68ac2c8b30bb9_1756114059.jpg', 'image', 304315, 'image/jpeg', 'admin', '2025-08-25 09:27:39', 'gallery', '[45,44]'),
(400, 41, '68ac2c8b58ace_1756114059.jpg', 'Diving2D1N_Similan_Island_22.jpg', 'uploads/tours/images/68ac2c8b58ace_1756114059.jpg', 'image', 299167, 'image/jpeg', 'admin', '2025-08-25 09:27:39', 'gallery', '[45,44]'),
(401, 41, '68ac2c8b876f3_1756114059.jpg', 'Diving2D1N_Similan_Island_23.jpg', 'uploads/tours/images/68ac2c8b876f3_1756114059.jpg', 'image', 402073, 'image/jpeg', 'admin', '2025-08-25 09:27:39', 'gallery', '[45,44]'),
(402, 41, '68ac2c8b9655c_1756114059.jpg', 'Diving2D1N_Similan_Island_24.jpg', 'uploads/tours/images/68ac2c8b9655c_1756114059.jpg', 'image', 269522, 'image/jpeg', 'admin', '2025-08-25 09:27:39', 'gallery', '[45,44]'),
(403, 41, '68ac2c9031017_1756114064.jpg', 'Diving2D1N_Similan_Island_27.jpg', 'uploads/tours/images/68ac2c9031017_1756114064.jpg', 'image', 230546, 'image/jpeg', 'admin', '2025-08-25 09:27:44', 'gallery', '[45,44]'),
(404, 41, '68ac2c903132d_1756114064.jpg', 'Diving2D1N_Similan_Island_26.jpg', 'uploads/tours/images/68ac2c903132d_1756114064.jpg', 'image', 213724, 'image/jpeg', 'admin', '2025-08-25 09:27:44', 'gallery', '[45,44]'),
(405, 41, '68ac2c905b84e_1756114064.jpg', 'Diving2D1N_Similan_Island_29.jpg', 'uploads/tours/images/68ac2c905b84e_1756114064.jpg', 'image', 237388, 'image/jpeg', 'admin', '2025-08-25 09:27:44', 'gallery', '[45,44]'),
(406, 41, '68ac2c9081275_1756114064.jpg', 'Diving2D1N_Similan_Island_28.jpg', 'uploads/tours/images/68ac2c9081275_1756114064.jpg', 'image', 215486, 'image/jpeg', 'admin', '2025-08-25 09:27:44', 'gallery', '[45,44]'),
(407, 41, '68ac2c9a1b337_1756114074.jpg', 'Diving2D1N_Similan_Island_31.jpg', 'uploads/tours/images/68ac2c9a1b337_1756114074.jpg', 'image', 282974, 'image/jpeg', 'admin', '2025-08-25 09:27:54', 'gallery', '[45,44]'),
(408, 41, '68ac2c9a460db_1756114074.jpg', 'Diving2D1N_Similan_Island_32.jpg', 'uploads/tours/images/68ac2c9a460db_1756114074.jpg', 'image', 348214, 'image/jpeg', 'admin', '2025-08-25 09:27:54', 'gallery', '[45,44]'),
(409, 41, '68ac2c9a762a3_1756114074.jpg', 'Diving2D1N_Similan_Island_34.jpg', 'uploads/tours/images/68ac2c9a762a3_1756114074.jpg', 'image', 592595, 'image/jpeg', 'admin', '2025-08-25 09:27:54', 'gallery', '[45,44]'),
(410, 41, '68ac2c9aa11f0_1756114074.jpg', 'Diving2D1N_Similan_Island_35.jpg', 'uploads/tours/images/68ac2c9aa11f0_1756114074.jpg', 'image', 633607, 'image/jpeg', 'admin', '2025-08-25 09:27:54', 'gallery', '[45,44]'),
(411, 41, '68ac2c9ab5be2_1756114074.jpg', 'Diving2D1N_Similan_Island_36.jpg', 'uploads/tours/images/68ac2c9ab5be2_1756114074.jpg', 'image', 457085, 'image/jpeg', 'admin', '2025-08-25 09:27:54', 'gallery', '[45,44]'),
(412, 41, '68ac2ca0e6fa1_1756114080.jpg', 'Diving2D1N_Similan_Island_37.jpg', 'uploads/tours/images/68ac2ca0e6fa1_1756114080.jpg', 'image', 298078, 'image/jpeg', 'admin', '2025-08-25 09:28:00', 'gallery', '[45,44]'),
(413, 41, '68ac2ca1256e8_1756114081.jpg', 'Diving2D1N_Similan_Island_38.jpg', 'uploads/tours/images/68ac2ca1256e8_1756114081.jpg', 'image', 427428, 'image/jpeg', 'admin', '2025-08-25 09:28:01', 'gallery', '[45,44]'),
(414, 41, '68ac2ca159b14_1756114081.jpg', 'Diving2D1N_Similan_Island_40.jpg', 'uploads/tours/images/68ac2ca159b14_1756114081.jpg', 'image', 450049, 'image/jpeg', 'admin', '2025-08-25 09:28:01', 'gallery', '[45,44]'),
(415, 41, '68ac2ca17589f_1756114081.jpg', 'Diving2D1N_Similan_Island_42.jpg', 'uploads/tours/images/68ac2ca17589f_1756114081.jpg', 'image', 531373, 'image/jpeg', 'admin', '2025-08-25 09:28:01', 'gallery', '[45,44]'),
(416, 41, '68ac2ca1ab8a7_1756114081.jpg', 'Diving2D1N_Similan_Island_41.jpg', 'uploads/tours/images/68ac2ca1ab8a7_1756114081.jpg', 'image', 549962, 'image/jpeg', 'admin', '2025-08-25 09:28:01', 'gallery', '[45,44]'),
(417, 41, '68ac2ca811be1_1756114088.jpg', 'Diving2D1N_Similan_Island_43.jpg', 'uploads/tours/images/68ac2ca811be1_1756114088.jpg', 'image', 572887, 'image/jpeg', 'admin', '2025-08-25 09:28:08', 'gallery', '[45,44]'),
(418, 41, '68ac2ca83e89d_1756114088.jpg', 'Diving2D1N_Similan_Island_45.jpg', 'uploads/tours/images/68ac2ca83e89d_1756114088.jpg', 'image', 351825, 'image/jpeg', 'admin', '2025-08-25 09:28:08', 'gallery', '[45,44]'),
(419, 41, '68ac2ca856964_1756114088.jpg', 'Diving2D1N_Similan_Island_46.jpg', 'uploads/tours/images/68ac2ca856964_1756114088.jpg', 'image', 391877, 'image/jpeg', 'admin', '2025-08-25 09:28:08', 'gallery', '[45,44]'),
(420, 41, '68ac2ca888ba3_1756114088.jpg', 'Diving2D1N_Similan_Island_44.jpg', 'uploads/tours/images/68ac2ca888ba3_1756114088.jpg', 'image', 717227, 'image/jpeg', 'admin', '2025-08-25 09:28:08', 'gallery', '[45,44]'),
(421, 41, '68ac2ca8967e3_1756114088.jpg', 'Diving2D1N_Similan_Island_47.jpg', 'uploads/tours/images/68ac2ca8967e3_1756114088.jpg', 'image', 216625, 'image/jpeg', 'admin', '2025-08-25 09:28:08', 'gallery', '[45,44]'),
(422, 41, '68ac2caddfcdf_1756114093.jpg', 'Diving2D1N_Similan_Island_48.jpg', 'uploads/tours/images/68ac2caddfcdf_1756114093.jpg', 'image', 325729, 'image/jpeg', 'admin', '2025-08-25 09:28:13', 'gallery', '[45,44]'),
(423, 41, '68ac2cae28371_1756114094.jpg', 'Diving2D1N_Similan_Island_49.jpg', 'uploads/tours/images/68ac2cae28371_1756114094.jpg', 'image', 268524, 'image/jpeg', 'admin', '2025-08-25 09:28:14', 'gallery', '[45,44]'),
(424, 41, '68ac2cae28429_1756114094.jpg', 'Diving2D1N_Similan_Island_51.jpg', 'uploads/tours/images/68ac2cae28429_1756114094.jpg', 'image', 398523, 'image/jpeg', 'admin', '2025-08-25 09:28:14', 'gallery', '[45,44]'),
(425, 41, '68ac2cae61e94_1756114094.jpg', 'Diving2D1N_Similan_Island_50.jpg', 'uploads/tours/images/68ac2cae61e94_1756114094.jpg', 'image', 569563, 'image/jpeg', 'admin', '2025-08-25 09:28:14', 'gallery', '[45,44]'),
(427, 41, '68ac2cb14c145_1756114097.jpg', 'Diving2D1N_Similan_Island_54.jpg', 'uploads/tours/images/68ac2cb14c145_1756114097.jpg', 'image', 245310, 'image/jpeg', 'admin', '2025-08-25 09:28:17', 'gallery', '[45,44]'),
(428, 41, '68ac2cb15df56_1756114097.jpg', 'Diving2D1N_Similan_Island_52.jpg', 'uploads/tours/images/68ac2cb15df56_1756114097.jpg', 'image', 276939, 'image/jpeg', 'admin', '2025-08-25 09:28:17', 'gallery', '[45,44]'),
(429, 42, '68ac2d16e6239_1756114198.jpg', 'Similan_Island_2023-24_4.jpg', 'uploads/tours/images/68ac2d16e6239_1756114198.jpg', 'image', 288386, 'image/jpeg', 'admin', '2025-08-25 09:29:58', 'gallery', '[40,43]'),
(430, 42, '68ac2d172ae83_1756114199.jpg', 'Similan_Island_2023-24_1.jpg', 'uploads/tours/images/68ac2d172ae83_1756114199.jpg', 'image', 858772, 'image/jpeg', 'admin', '2025-08-25 09:29:59', 'gallery', '[40,43]'),
(431, 42, '68ac2d175bd0a_1756114199.jpg', 'Similan_Island_2023-24_8.jpg', 'uploads/tours/images/68ac2d175bd0a_1756114199.jpg', 'image', 459813, 'image/jpeg', 'admin', '2025-08-25 09:29:59', 'gallery', '[40,43]'),
(432, 42, '68ac2d176ffaf_1756114199.jpg', 'Similan_Island_2023-24_5.jpg', 'uploads/tours/images/68ac2d176ffaf_1756114199.jpg', 'image', 297396, 'image/jpeg', 'admin', '2025-08-25 09:29:59', 'gallery', '[40,43]'),
(433, 42, '68ac2d1788a53_1756114199.jpg', 'Similan_Island_2023-24_6.jpg', 'uploads/tours/images/68ac2d1788a53_1756114199.jpg', 'image', 457110, 'image/jpeg', 'admin', '2025-08-25 09:29:59', 'gallery', '[40,43]'),
(434, 42, '68ac2d2036be8_1756114208.jpg', 'Similan_Island_2023-24_13.jpg', 'uploads/tours/images/68ac2d2036be8_1756114208.jpg', 'image', 545421, 'image/jpeg', 'admin', '2025-08-25 09:30:08', 'gallery', '[40,43]'),
(435, 42, '68ac2d209949e_1756114208.jpg', 'Similan_Island_2023-24_14.jpg', 'uploads/tours/images/68ac2d209949e_1756114208.jpg', 'image', 636467, 'image/jpeg', 'admin', '2025-08-25 09:30:08', 'gallery', '[40,43]'),
(436, 42, '68ac2d209ae01_1756114208.jpg', 'Similan_Island_2023-24_15.jpg', 'uploads/tours/images/68ac2d209ae01_1756114208.jpg', 'image', 594530, 'image/jpeg', 'admin', '2025-08-25 09:30:08', 'gallery', '[40,43]'),
(437, 42, '68ac2d20d6074_1756114208.jpg', 'Similan_Island_2023-24_17.jpg', 'uploads/tours/images/68ac2d20d6074_1756114208.jpg', 'image', 682689, 'image/jpeg', 'admin', '2025-08-25 09:30:08', 'gallery', '[40,43]'),
(438, 42, '68ac2d20f2e9b_1756114208.jpg', 'Similan_Island_2023-24_16.jpg', 'uploads/tours/images/68ac2d20f2e9b_1756114208.jpg', 'image', 533732, 'image/jpeg', 'admin', '2025-08-25 09:30:08', 'gallery', '[40,43]'),
(439, 42, '68ac2d2523027_1756114213.jpg', 'Similan_Island_2023-24_21.jpg', 'uploads/tours/images/68ac2d2523027_1756114213.jpg', 'image', 362411, 'image/jpeg', 'admin', '2025-08-25 09:30:13', 'gallery', '[40,43]'),
(440, 42, '68ac2d257a863_1756114213.jpg', 'Similan_Island_2023-24_19.JPG', 'uploads/tours/images/68ac2d257a863_1756114213.jpg', 'image', 549727, 'image/jpeg', 'admin', '2025-08-25 09:30:13', 'gallery', '[40,43]'),
(441, 42, '68ac2d257ab23_1756114213.jpg', 'Similan_Island_2023-24_23.jpg', 'uploads/tours/images/68ac2d257ab23_1756114213.jpg', 'image', 631333, 'image/jpeg', 'admin', '2025-08-25 09:30:13', 'gallery', '[40,43]'),
(442, 42, '68ac2d25b41fc_1756114213.jpg', 'Similan_Island_2023-24_24.jpg', 'uploads/tours/images/68ac2d25b41fc_1756114213.jpg', 'image', 505834, 'image/jpeg', 'admin', '2025-08-25 09:30:13', 'gallery', '[40,43]'),
(443, 42, '68ac2d25c14fb_1756114213.jpg', 'Similan_Island_2023-24_22.jpg', 'uploads/tours/images/68ac2d25c14fb_1756114213.jpg', 'image', 202084, 'image/jpeg', 'admin', '2025-08-25 09:30:13', 'gallery', '[40,43]'),
(444, 42, '68ac2d29f0292_1756114217.jpg', 'Similan_Island_2023-24_26.jpg', 'uploads/tours/images/68ac2d29f0292_1756114217.jpg', 'image', 359836, 'image/jpeg', 'admin', '2025-08-25 09:30:17', 'gallery', '[40,43]'),
(445, 42, '68ac2d2a21490_1756114218.jpg', 'Similan_Island_2023-24_28.jpg', 'uploads/tours/images/68ac2d2a21490_1756114218.jpg', 'image', 244954, 'image/jpeg', 'admin', '2025-08-25 09:30:18', 'gallery', '[40,43]'),
(446, 42, '68ac2d2a4da1d_1756114218.jpg', 'Similan_Island_2023-24_31.jpg', 'uploads/tours/images/68ac2d2a4da1d_1756114218.jpg', 'image', 373139, 'image/jpeg', 'admin', '2025-08-25 09:30:18', 'gallery', '[40,43]'),
(447, 42, '68ac2d2a610f8_1756114218.jpg', 'Similan_Island_2023-24_30.JPG', 'uploads/tours/images/68ac2d2a610f8_1756114218.jpg', 'image', 346366, 'image/jpeg', 'admin', '2025-08-25 09:30:18', 'gallery', '[40,43]'),
(448, 42, '68ac2d2a8f76c_1756114218.jpg', 'Similan_Island_2023-24_27.jpg', 'uploads/tours/images/68ac2d2a8f76c_1756114218.jpg', 'image', 804362, 'image/jpeg', 'admin', '2025-08-25 09:30:18', 'gallery', '[40,43]'),
(449, 42, '68ac2d3236085_1756114226.jpg', 'Similan_Island_2023-24_32.jpg', 'uploads/tours/images/68ac2d3236085_1756114226.jpg', 'image', 551550, 'image/jpeg', 'admin', '2025-08-25 09:30:26', 'gallery', '[40,43]'),
(450, 42, '68ac2d327b1f6_1756114226.jpg', 'Similan_Island_2023-24_34.jpg', 'uploads/tours/images/68ac2d327b1f6_1756114226.jpg', 'image', 336501, 'image/jpeg', 'admin', '2025-08-25 09:30:26', 'gallery', '[40,43]'),
(451, 42, '68ac2d327b250_1756114226.jpg', 'Similan_Island_2023-24_33.jpg', 'uploads/tours/images/68ac2d327b250_1756114226.jpg', 'image', 324190, 'image/jpeg', 'admin', '2025-08-25 09:30:26', 'gallery', '[40,43]'),
(452, 42, '68ac2d32b1cab_1756114226.jpeg', 'Similan_Island_2023-24_36.jpeg', 'uploads/tours/images/68ac2d32b1cab_1756114226.jpeg', 'image', 477855, 'image/jpeg', 'admin', '2025-08-25 09:30:26', 'gallery', '[40,43]'),
(453, 42, '68ac2d32c77db_1756114226.jpg', 'Similan_Island_2023-24_35.jpg', 'uploads/tours/images/68ac2d32c77db_1756114226.jpg', 'image', 342196, 'image/jpeg', 'admin', '2025-08-25 09:30:26', 'gallery', '[40,43]'),
(454, 42, '68ac2d363eab8_1756114230.jpg', 'Similan_Island_2023-24_40.jpg', 'uploads/tours/images/68ac2d363eab8_1756114230.jpg', 'image', 250772, 'image/jpeg', 'admin', '2025-08-25 09:30:30', 'gallery', '[40,43]'),
(455, 42, '68ac2d367b735_1756114230.jpg', 'Similan_Island_2023-24_37.jpg', 'uploads/tours/images/68ac2d367b735_1756114230.jpg', 'image', 322675, 'image/jpeg', 'admin', '2025-08-25 09:30:30', 'gallery', '[40,43]'),
(456, 42, '68ac2d367b8a4_1756114230.jpg', 'Similan_Island_2023-24_38.jpg', 'uploads/tours/images/68ac2d367b8a4_1756114230.jpg', 'image', 313194, 'image/jpeg', 'admin', '2025-08-25 09:30:30', 'gallery', '[40,43]'),
(457, 42, '68ac2d36aa637_1756114230.jpg', 'Similan_Island_2023-24_39.jpg', 'uploads/tours/images/68ac2d36aa637_1756114230.jpg', 'image', 347001, 'image/jpeg', 'admin', '2025-08-25 09:30:30', 'gallery', '[40,43]'),
(458, 42, '68ac2d36bc2f5_1756114230.jpg', 'Similan_Island_2023-24_41.jpg', 'uploads/tours/images/68ac2d36bc2f5_1756114230.jpg', 'image', 283682, 'image/jpeg', 'admin', '2025-08-25 09:30:30', 'gallery', '[40,43]'),
(459, 42, '68ac2d3c76fc5_1756114236.jpg', 'Brochure TH-02.jpg', 'uploads/tours/images/68ac2d3c76fc5_1756114236.jpg', 'image', 1776216, 'image/jpeg', 'admin', '2025-08-25 09:30:36', 'gallery', '[40,43]'),
(461, 45, '68ad2a8b49826_1756179083.jpg', 'Brochure TH-03.jpg', 'uploads/tours/images/68ad2a8b49826_1756179083.jpg', 'image', 2004040, 'image/jpeg', 'admin', '2025-08-26 03:31:23', 'brochure', NULL),
(462, 43, '68ad2bbd62e41_1756179389.jpg', 'Brochure TH-02.jpg', 'uploads/tours/images/68ad2bbd62e41_1756179389.jpg', 'image', 1776216, 'image/jpeg', 'admin', '2025-08-26 03:36:29', 'gallery', NULL),
(463, 44, '68ad2c0a7c50b_1756179466.jpg', 'Brochure TH-03.jpg', 'uploads/tours/images/68ad2c0a7c50b_1756179466.jpg', 'image', 2004040, 'image/jpeg', 'admin', '2025-08-26 03:37:46', 'brochure', NULL),
(464, 46, '68ad2c68bbf99_1756179560.jpg', 'Brochure TH-04.jpg', 'uploads/tours/images/68ad2c68bbf99_1756179560.jpg', 'image', 2016279, 'image/jpeg', 'admin', '2025-08-26 03:39:20', 'brochure', NULL),
(465, 46, '68ad2cce05573_1756179662.jpg', 'Surin_Island_2023-24_2.jpg', 'uploads/tours/images/68ad2cce05573_1756179662.jpg', 'image', 373788, 'image/jpeg', 'admin', '2025-08-26 03:41:02', 'gallery', '[47,48]'),
(466, 46, '68ad2cce3fe50_1756179662.jpg', 'Surin_Island_2023-24_7.jpg', 'uploads/tours/images/68ad2cce3fe50_1756179662.jpg', 'image', 587878, 'image/jpeg', 'admin', '2025-08-26 03:41:02', 'gallery', '[47,48]'),
(467, 46, '68ad2cce63f5a_1756179662.jpg', 'Surin_Island_2023-24_4.jpg', 'uploads/tours/images/68ad2cce63f5a_1756179662.jpg', 'image', 596550, 'image/jpeg', 'admin', '2025-08-26 03:41:02', 'gallery', '[47,48]'),
(468, 46, '68ad2cce8661c_1756179662.jpg', 'Surin_Island_2023-24_5.jpg', 'uploads/tours/images/68ad2cce8661c_1756179662.jpg', 'image', 671323, 'image/jpeg', 'admin', '2025-08-26 03:41:02', 'gallery', '[47,48]'),
(469, 46, '68ad2cda64866_1756179674.jpg', 'Surin_Island_2023-24_8.jpg', 'uploads/tours/images/68ad2cda64866_1756179674.jpg', 'image', 320495, 'image/jpeg', 'admin', '2025-08-26 03:41:14', 'gallery', '[47,48]'),
(470, 46, '68ad2cda64d9b_1756179674.jpg', 'Surin_Island_2023-24_9.jpg', 'uploads/tours/images/68ad2cda64d9b_1756179674.jpg', 'image', 374417, 'image/jpeg', 'admin', '2025-08-26 03:41:14', 'gallery', '[47,48]'),
(471, 46, '68ad2cda8f18b_1756179674.jpg', 'Surin_Island_2023-24_10.jpg', 'uploads/tours/images/68ad2cda8f18b_1756179674.jpg', 'image', 307072, 'image/jpeg', 'admin', '2025-08-26 03:41:14', 'gallery', '[47,48]'),
(472, 46, '68ad2cdab3708_1756179674.jpg', 'Surin_Island_2023-24_11.JPG', 'uploads/tours/images/68ad2cdab3708_1756179674.jpg', 'image', 175416, 'image/jpeg', 'admin', '2025-08-26 03:41:14', 'gallery', '[47,48]'),
(473, 46, '68ad2cdee0437_1756179678.jpg', 'Surin_Island_2023-24_12.jpg', 'uploads/tours/images/68ad2cdee0437_1756179678.jpg', 'image', 362015, 'image/jpeg', 'admin', '2025-08-26 03:41:18', 'gallery', '[47,48]'),
(474, 46, '68ad2cdf5399a_1756179679.jpg', 'Surin_Island_2023-24_13.jpg', 'uploads/tours/images/68ad2cdf5399a_1756179679.jpg', 'image', 735382, 'image/jpeg', 'admin', '2025-08-26 03:41:19', 'gallery', '[47,48]'),
(475, 46, '68ad2cdf5447e_1756179679.jpg', 'Surin_Island_2023-24_15.jpg', 'uploads/tours/images/68ad2cdf5447e_1756179679.jpg', 'image', 603279, 'image/jpeg', 'admin', '2025-08-26 03:41:19', 'gallery', '[47,48]'),
(476, 46, '68ad2cdfa0bc9_1756179679.jpg', 'Surin_Island_2023-24_14.jpg', 'uploads/tours/images/68ad2cdfa0bc9_1756179679.jpg', 'image', 817185, 'image/jpeg', 'admin', '2025-08-26 03:41:19', 'gallery', '[47,48]'),
(477, 46, '68ad2ce4995ad_1756179684.jpg', 'Surin_Island_2023-24_16.jpg', 'uploads/tours/images/68ad2ce4995ad_1756179684.jpg', 'image', 474551, 'image/jpeg', 'admin', '2025-08-26 03:41:24', 'gallery', '[47,48]'),
(478, 46, '68ad2ce4cba6b_1756179684.jpg', 'Surin_Island_2023-24_17.jpg', 'uploads/tours/images/68ad2ce4cba6b_1756179684.jpg', 'image', 417515, 'image/jpeg', 'admin', '2025-08-26 03:41:24', 'gallery', '[47,48]'),
(479, 46, '68ad2ce54c114_1756179685.jpg', 'Surin_Island_2023-24_19.jpg', 'uploads/tours/images/68ad2ce54c114_1756179685.jpg', 'image', 783103, 'image/jpeg', 'admin', '2025-08-26 03:41:25', 'gallery', '[47,48]'),
(480, 46, '68ad2ce574a65_1756179685.jpg', 'Surin_Island_2023-24_18.jpg', 'uploads/tours/images/68ad2ce574a65_1756179685.jpg', 'image', 705158, 'image/jpeg', 'admin', '2025-08-26 03:41:25', 'gallery', '[47,48]'),
(481, 46, '68ad2cee09793_1756179694.jpg', 'Surin_Island_2023-24_21.jpg', 'uploads/tours/images/68ad2cee09793_1756179694.jpg', 'image', 575001, 'image/jpeg', 'admin', '2025-08-26 03:41:34', 'gallery', '[47,48]'),
(482, 46, '68ad2cee6bc49_1756179694.jpg', 'Surin_Island_2023-24_23.jpg', 'uploads/tours/images/68ad2cee6bc49_1756179694.jpg', 'image', 672375, 'image/jpeg', 'admin', '2025-08-26 03:41:34', 'gallery', '[47,48]'),
(483, 46, '68ad2cee6be8d_1756179694.jpg', 'Surin_Island_2023-24_25.jpg', 'uploads/tours/images/68ad2cee6be8d_1756179694.jpg', 'image', 535743, 'image/jpeg', 'admin', '2025-08-26 03:41:34', 'gallery', '[47,48]'),
(484, 46, '68ad2ceeb6b28_1756179694.jpg', 'Surin_Island_2023-24_24.jpg', 'uploads/tours/images/68ad2ceeb6b28_1756179694.jpg', 'image', 810504, 'image/jpeg', 'admin', '2025-08-26 03:41:34', 'gallery', '[47,48]'),
(485, 46, '68ad2cf308c64_1756179699.jpg', 'Surin_Island_2023-24_28.JPG', 'uploads/tours/images/68ad2cf308c64_1756179699.jpg', 'image', 376788, 'image/jpeg', 'admin', '2025-08-26 03:41:39', 'gallery', '[47,48]'),
(486, 46, '68ad2cf33baaa_1756179699.jpg', 'Surin_Island_2023-24_27.jpg', 'uploads/tours/images/68ad2cf33baaa_1756179699.jpg', 'image', 514666, 'image/jpeg', 'admin', '2025-08-26 03:41:39', 'gallery', '[47,48]'),
(487, 46, '68ad2cf3547f4_1756179699.jpg', 'Surin_Island_2023-24_30.JPG', 'uploads/tours/images/68ad2cf3547f4_1756179699.jpg', 'image', 396342, 'image/jpeg', 'admin', '2025-08-26 03:41:39', 'gallery', '[47,48]'),
(488, 46, '68ad2cf3653db_1756179699.jpg', 'Surin_Island_2023-24_29.JPG', 'uploads/tours/images/68ad2cf3653db_1756179699.jpg', 'image', 473003, 'image/jpeg', 'admin', '2025-08-26 03:41:39', 'gallery', '[47,48]'),
(489, 46, '68ad2cfbe785c_1756179707.jpg', 'Surin_Island_2023-24_35.jpg', 'uploads/tours/images/68ad2cfbe785c_1756179707.jpg', 'image', 524951, 'image/jpeg', 'admin', '2025-08-26 03:41:47', 'gallery', '[47,48]'),
(490, 46, '68ad2cfc18d6e_1756179708.jpg', 'Surin_Island_2023-24_36.jpg', 'uploads/tours/images/68ad2cfc18d6e_1756179708.jpg', 'image', 356239, 'image/jpeg', 'admin', '2025-08-26 03:41:48', 'gallery', '[47,48]'),
(491, 46, '68ad2cfc2e915_1756179708.jpg', 'Surin_Island_2023-24_37.jpg', 'uploads/tours/images/68ad2cfc2e915_1756179708.jpg', 'image', 575093, 'image/jpeg', 'admin', '2025-08-26 03:41:48', 'gallery', '[47,48]'),
(492, 46, '68ad2cfc42576_1756179708.jpg', 'Surin_Island_2023-24_33.jpg', 'uploads/tours/images/68ad2cfc42576_1756179708.jpg', 'image', 364711, 'image/jpeg', 'admin', '2025-08-26 03:41:48', 'gallery', '[47,48]'),
(493, 46, '68ad2cfc65a92_1756179708.jpg', 'Surin_Island_2023-24_31.jpg', 'uploads/tours/images/68ad2cfc65a92_1756179708.jpg', 'image', 530486, 'image/jpeg', 'admin', '2025-08-26 03:41:48', 'gallery', '[47,48]'),
(494, 46, '68ad2d018821b_1756179713.jpg', 'Surin_Island_2023-24_38.jpg', 'uploads/tours/images/68ad2d018821b_1756179713.jpg', 'image', 570394, 'image/jpeg', 'admin', '2025-08-26 03:41:53', 'gallery', '[47,48]'),
(495, 46, '68ad2d01aee84_1756179713.jpg', 'Surin_Island_2023-24_42.jpg', 'uploads/tours/images/68ad2d01aee84_1756179713.jpg', 'image', 267378, 'image/jpeg', 'admin', '2025-08-26 03:41:53', 'gallery', '[47,48]'),
(496, 46, '68ad2d01c0c40_1756179713.jpg', 'Surin_Island_2023-24_40.jpg', 'uploads/tours/images/68ad2d01c0c40_1756179713.jpg', 'image', 324849, 'image/jpeg', 'admin', '2025-08-26 03:41:53', 'gallery', '[47,48]'),
(497, 46, '68ad2d01cfab8_1756179713.jpg', 'Surin_Island_2023-24_41.jpg', 'uploads/tours/images/68ad2d01cfab8_1756179713.jpg', 'image', 334300, 'image/jpeg', 'admin', '2025-08-26 03:41:53', 'gallery', '[47,48]'),
(498, 46, '68ad2d01e149d_1756179713.jpg', 'Surin_Island_2023-24_39.jpg', 'uploads/tours/images/68ad2d01e149d_1756179713.jpg', 'image', 301594, 'image/jpeg', 'admin', '2025-08-26 03:41:53', 'gallery', '[47,48]'),
(499, 46, '68ad2d0df11ab_1756179725.jpg', 'Surin_Island_2023-24_43.jpg', 'uploads/tours/images/68ad2d0df11ab_1756179725.jpg', 'image', 255853, 'image/jpeg', 'admin', '2025-08-26 03:42:05', 'gallery', '[47,48]'),
(500, 46, '68ad2d0e59276_1756179726.jpg', 'Surin_Island_2023-24_45.jpg', 'uploads/tours/images/68ad2d0e59276_1756179726.jpg', 'image', 464706, 'image/jpeg', 'admin', '2025-08-26 03:42:06', 'gallery', '[47,48]'),
(501, 46, '68ad2d0e5b81d_1756179726.jpg', 'Surin_Island_2023-24_48.jpg', 'uploads/tours/images/68ad2d0e5b81d_1756179726.jpg', 'image', 343535, 'image/jpeg', 'admin', '2025-08-26 03:42:06', 'gallery', '[47,48]'),
(502, 46, '68ad2d0e5b6e0_1756179726.jpg', 'Surin_Island_2023-24_46.jpg', 'uploads/tours/images/68ad2d0e5b6e0_1756179726.jpg', 'image', 418220, 'image/jpeg', 'admin', '2025-08-26 03:42:06', 'gallery', '[47,48]'),
(503, 46, '68ad2d0e9a287_1756179726.jpg', 'Surin_Island_2023-24_47.jpg', 'uploads/tours/images/68ad2d0e9a287_1756179726.jpg', 'image', 636279, 'image/jpeg', 'admin', '2025-08-26 03:42:06', 'gallery', '[47,48]'),
(504, 47, '68ad2d2d4a44e_1756179757.jpg', 'Brochure TH-05.jpg', 'uploads/tours/images/68ad2d2d4a44e_1756179757.jpg', 'image', 2279162, 'image/jpeg', 'admin', '2025-08-26 03:42:37', 'brochure', NULL),
(509, 47, '68ad2d9c96ada_1756179868.jpg', 'Bungalow with Air Condition_3.jpg', 'uploads/tours/images/68ad2d9c96ada_1756179868.jpg', 'image', 445059, 'image/jpeg', 'admin', '2025-08-26 03:44:28', 'gallery', '[48]'),
(510, 47, '68ad2d9c97200_1756179868.jpg', 'Bungalow with Air Condition_1.jpg', 'uploads/tours/images/68ad2d9c97200_1756179868.jpg', 'image', 988382, 'image/jpeg', 'admin', '2025-08-26 03:44:28', 'gallery', '[48]'),
(511, 47, '68ad2d9c98328_1756179868.jpg', 'Bungalow with Air Condition_4.jpg', 'uploads/tours/images/68ad2d9c98328_1756179868.jpg', 'image', 444559, 'image/jpeg', 'admin', '2025-08-26 03:44:28', 'gallery', '[48]'),
(512, 47, '68ad2d9cbd377_1756179868.jpg', 'Bungalow with Air Condition_6.JPG', 'uploads/tours/images/68ad2d9cbd377_1756179868.jpg', 'image', 234259, 'image/jpeg', 'admin', '2025-08-26 03:44:28', 'gallery', '[48]'),
(513, 47, '68ad2da34c643_1756179875.jpg', 'Bungalow with Air Condition_8.jpg', 'uploads/tours/images/68ad2da34c643_1756179875.jpg', 'image', 395176, 'image/jpeg', 'admin', '2025-08-26 03:44:35', 'gallery', '[48]'),
(514, 47, '68ad2da3b5e5a_1756179875.jpg', 'Bungalow with Air Condition_10.jpg', 'uploads/tours/images/68ad2da3b5e5a_1756179875.jpg', 'image', 553458, 'image/jpeg', 'admin', '2025-08-26 03:44:35', 'gallery', '[48]'),
(515, 47, '68ad2da3b61bc_1756179875.jpg', 'Bungalow with Air Condition_11.jpg', 'uploads/tours/images/68ad2da3b61bc_1756179875.jpg', 'image', 728338, 'image/jpeg', 'admin', '2025-08-26 03:44:35', 'gallery', '[48]'),
(516, 47, '68ad2da40fbd3_1756179876.jpg', 'Bungalow with Air Condition_9.JPG', 'uploads/tours/images/68ad2da40fbd3_1756179876.jpg', 'image', 186387, 'image/jpeg', 'admin', '2025-08-26 03:44:36', 'gallery', '[48]'),
(517, 47, '68ad2da75160a_1756179879.jpg', 'Bungalow with Air Condition_15.JPG', 'uploads/tours/images/68ad2da75160a_1756179879.jpg', 'image', 274686, 'image/jpeg', 'admin', '2025-08-26 03:44:39', 'gallery', '[48]'),
(518, 47, '68ad2da75e5bd_1756179879.jpg', 'Bungalow with Air Condition_16.JPG', 'uploads/tours/images/68ad2da75e5bd_1756179879.jpg', 'image', 225944, 'image/jpeg', 'admin', '2025-08-26 03:44:39', 'gallery', '[48]'),
(519, 47, '68ad2db4a8d37_1756179892.jpg', 'Sunset_2 - Copy.JPG', 'uploads/tours/images/68ad2db4a8d37_1756179892.jpg', 'image', 345113, 'image/jpeg', 'admin', '2025-08-26 03:44:52', 'gallery', '[48]'),
(520, 47, '68ad2dc63c1b3_1756179910.jpg', 'Tent Surin Island_3 - Copy.JPG', 'uploads/tours/images/68ad2dc63c1b3_1756179910.jpg', 'image', 433478, 'image/jpeg', 'admin', '2025-08-26 03:45:10', 'gallery', '[48]'),
(521, 48, '68ad2de6ef6b8_1756179942.jpg', 'Brochure TH-06.jpg', 'uploads/tours/images/68ad2de6ef6b8_1756179942.jpg', 'image', 2268891, 'image/jpeg', 'admin', '2025-08-26 03:45:42', 'brochure', NULL),
(522, 20, '68b8106a4ce3f_1756893290.jpg', 'A4 4 Islands Longtailboat TH.jpg', 'uploads/tours/images/68b8106a4ce3f_1756893290.jpg', 'image', 6195799, 'image/jpeg', 'dev_lay', '2025-09-03 09:54:50', 'brochure', NULL),
(523, 20, '68b8106d917e4_1756893293.jpg', 'A4 4 Islands Longtailboat EN.jpg', 'uploads/tours/images/68b8106d917e4_1756893293.jpg', 'image', 6416659, 'image/jpeg', 'dev_lay', '2025-09-03 09:54:53', 'brochure', NULL),
(526, 23, '68b810b6ab8ff_1756893366.jpg', 'A4 Phi Phi Islands EN.jpg', 'uploads/tours/images/68b810b6ab8ff_1756893366.jpg', 'image', 8085503, 'image/jpeg', 'dev_lay', '2025-09-03 09:56:06', 'brochure', NULL),
(527, 23, '68b810b707b0a_1756893367.jpg', 'A4 Phi Phi Islands TH.jpg', 'uploads/tours/images/68b810b707b0a_1756893367.jpg', 'image', 8062832, 'image/jpeg', 'dev_lay', '2025-09-03 09:56:07', 'brochure', NULL),
(528, 19, '68b810d3bd551_1756893395.jpg', 'A4 4 Islands Speedboat TH.jpg', 'uploads/tours/images/68b810d3bd551_1756893395.jpg', 'image', 6269939, 'image/jpeg', 'dev_lay', '2025-09-03 09:56:35', 'brochure', NULL),
(529, 19, '68b810d465854_1756893396.jpg', 'A4 4 Islands Speedboat EN.jpg', 'uploads/tours/images/68b810d465854_1756893396.jpg', 'image', 6472475, 'image/jpeg', 'dev_lay', '2025-09-03 09:56:36', 'brochure', NULL),
(530, 21, '68b810f284a17_1756893426.jpg', 'A4 Hong Islands Speedboat TH.jpg', 'uploads/tours/images/68b810f284a17_1756893426.jpg', 'image', 7035688, 'image/jpeg', 'dev_lay', '2025-09-03 09:57:06', 'brochure', NULL),
(531, 21, '68b810f2e69e8_1756893426.jpg', 'A4 Hong Islands Speedboat EN.jpg', 'uploads/tours/images/68b810f2e69e8_1756893426.jpg', 'image', 7184301, 'image/jpeg', 'dev_lay', '2025-09-03 09:57:06', 'brochure', NULL),
(532, 22, '68b8110cc0670_1756893452.jpg', 'A4 Hong Islands Longtailboat EN.jpg', 'uploads/tours/images/68b8110cc0670_1756893452.jpg', 'image', 7149298, 'image/jpeg', 'dev_lay', '2025-09-03 09:57:32', 'brochure', NULL),
(533, 22, '68b8110d294a5_1756893453.jpg', 'A4 Hong Islands Longtailboat TH.jpg', 'uploads/tours/images/68b8110d294a5_1756893453.jpg', 'image', 6988783, 'image/jpeg', 'dev_lay', '2025-09-03 09:57:33', 'brochure', NULL),
(534, 22, '68bea1da8df66_1757323738.jpg', 'Hong Island (5).jpg', 'uploads/tours/images/68bea1da8df66_1757323738.jpg', 'image', 305101, 'image/jpeg', 'dev_lay', '2025-09-08 09:28:58', 'gallery', NULL),
(535, 22, '68bea1dae39a1_1757323738.jpg', 'Hong Island (2).jpg', 'uploads/tours/images/68bea1dae39a1_1757323738.jpg', 'image', 415104, 'image/jpeg', 'dev_lay', '2025-09-08 09:28:58', 'gallery', NULL),
(536, 22, '68bea1dae525e_1757323738.jpg', 'Hong Island (4).jpg', 'uploads/tours/images/68bea1dae525e_1757323738.jpg', 'image', 339232, 'image/jpeg', 'dev_lay', '2025-09-08 09:28:58', 'gallery', NULL),
(537, 22, '68bea1dae5a92_1757323738.jpg', 'Hong Island (1).jpg', 'uploads/tours/images/68bea1dae5a92_1757323738.jpg', 'image', 457823, 'image/jpeg', 'dev_lay', '2025-09-08 09:28:58', 'gallery', NULL),
(538, 22, '68bea1db650fd_1757323739.jpg', 'Hong Island (3).jpg', 'uploads/tours/images/68bea1db650fd_1757323739.jpg', 'image', 746594, 'image/jpeg', 'dev_lay', '2025-09-08 09:28:59', 'gallery', NULL),
(539, 22, '68bea1ddb7c89_1757323741.jpg', 'Hong Island (6).jpg', 'uploads/tours/images/68bea1ddb7c89_1757323741.jpg', 'image', 665659, 'image/jpeg', 'dev_lay', '2025-09-08 09:29:01', 'gallery', NULL),
(540, 22, '68bea1de2b61e_1757323742.jpg', 'Hong Island (10).jpg', 'uploads/tours/images/68bea1de2b61e_1757323742.jpg', 'image', 491016, 'image/jpeg', 'dev_lay', '2025-09-08 09:29:02', 'gallery', NULL),
(541, 22, '68bea1de506fc_1757323742.jpg', 'Hong Island (9).jpg', 'uploads/tours/images/68bea1de506fc_1757323742.jpg', 'image', 544113, 'image/jpeg', 'dev_lay', '2025-09-08 09:29:02', 'gallery', NULL),
(542, 22, '68bea1de6f0d8_1757323742.jpg', 'Hong Island (7).jpg', 'uploads/tours/images/68bea1de6f0d8_1757323742.jpg', 'image', 566462, 'image/jpeg', 'dev_lay', '2025-09-08 09:29:02', 'gallery', NULL),
(543, 22, '68bea1de96d98_1757323742.jpg', 'Hong Island (8).jpg', 'uploads/tours/images/68bea1de96d98_1757323742.jpg', 'image', 590656, 'image/jpeg', 'dev_lay', '2025-09-08 09:29:02', 'gallery', NULL),
(544, 22, '68bea1e0e3d53_1757323744.jpg', 'Hong Island (11).jpg', 'uploads/tours/images/68bea1e0e3d53_1757323744.jpg', 'image', 522634, 'image/jpeg', 'dev_lay', '2025-09-08 09:29:04', 'gallery', NULL),
(545, 22, '68bea1e12aaea_1757323745.jpg', 'Hong Island (12).jpg', 'uploads/tours/images/68bea1e12aaea_1757323745.jpg', 'image', 496592, 'image/jpeg', 'dev_lay', '2025-09-08 09:29:05', 'gallery', NULL),
(546, 22, '68bea1e163b3e_1757323745.jpg', 'Hong Island (14).jpg', 'uploads/tours/images/68bea1e163b3e_1757323745.jpg', 'image', 625348, 'image/jpeg', 'dev_lay', '2025-09-08 09:29:05', 'gallery', NULL),
(547, 22, '68bea1e17dbb2_1757323745.jpg', 'Hong Island (15).jpg', 'uploads/tours/images/68bea1e17dbb2_1757323745.jpg', 'image', 445144, 'image/jpeg', 'dev_lay', '2025-09-08 09:29:05', 'gallery', NULL),
(548, 22, '68bea1e1a25ca_1757323745.jpg', 'Hong Island (13).jpg', 'uploads/tours/images/68bea1e1a25ca_1757323745.jpg', 'image', 519881, 'image/jpeg', 'dev_lay', '2025-09-08 09:29:05', 'gallery', NULL),
(549, 19, '68bea2a5e5f48_1757323941.jpg', 'people-summer-vacations.jpg', 'uploads/tours/images/68bea2a5e5f48_1757323941.jpg', 'image', 329315, 'image/jpeg', 'dev_lay', '2025-09-08 09:32:21', 'gallery', '[20]'),
(550, 19, '68bea2a676d0e_1757323942.jpg', 'Chicken island 2.jpg', 'uploads/tours/images/68bea2a676d0e_1757323942.jpg', 'image', 550260, 'image/jpeg', 'dev_lay', '2025-09-08 09:32:22', 'gallery', '[20]'),
(551, 19, '68bea2a678a5f_1757323942.jpg', 'Chicken island.jpg', 'uploads/tours/images/68bea2a678a5f_1757323942.jpg', 'image', 587367, 'image/jpeg', 'dev_lay', '2025-09-08 09:32:22', 'gallery', '[20]'),
(552, 19, '68bea2a679575_1757323942.jpg', 'Phranang Cave.jpg', 'uploads/tours/images/68bea2a679575_1757323942.jpg', 'image', 505542, 'image/jpeg', 'dev_lay', '2025-09-08 09:32:22', 'gallery', '[20]'),
(553, 19, '68bea2a6bd9e5_1757323942.jpg', 'IMG_0065240831100101.jpg', 'uploads/tours/images/68bea2a6bd9e5_1757323942.jpg', 'image', 710869, 'image/jpeg', 'dev_lay', '2025-09-08 09:32:22', 'gallery', '[20]'),
(554, 19, '68bea2a92a56e_1757323945.jpg', 'woman-bikini-poda-island-thailand 2.jpg', 'uploads/tours/images/68bea2a92a56e_1757323945.jpg', 'image', 370743, 'image/jpeg', 'dev_lay', '2025-09-08 09:32:25', 'gallery', '[20]'),
(555, 19, '68bea2a951176_1757323945.jpg', 'Tup island 2.jpg', 'uploads/tours/images/68bea2a951176_1757323945.jpg', 'image', 214390, 'image/jpeg', 'dev_lay', '2025-09-08 09:32:25', 'gallery', '[20]'),
(556, 23, '68bea3222abee_1757324066.jpg', 'beautiful-scenery-maya-bay-beach-phi-phi-island-krabi-thailand-landmark-destination-southeast-asia-travel-vacation-holiday-concept.jpg', 'uploads/tours/images/68bea3222abee_1757324066.jpg', 'image', 383525, 'image/jpeg', 'dev_lay', '2025-09-08 09:34:26', 'gallery', NULL),
(557, 23, '68bea3226b3bc_1757324066.jpg', 'aerial-drone-view-tropical-ko-phi-phi-island (1).jpg', 'uploads/tours/images/68bea3226b3bc_1757324066.jpg', 'image', 631660, 'image/jpeg', 'dev_lay', '2025-09-08 09:34:26', 'gallery', NULL);
INSERT INTO `tour_files` (`id`, `tour_id`, `file_name`, `original_name`, `file_path`, `file_type`, `file_size`, `mime_type`, `uploaded_by`, `uploaded_at`, `file_category`, `shared_with_tour_ids`) VALUES
(558, 23, '68bea322a7f26_1757324066.jpg', 'long-boat-tourist-maya-bay-phi-phi-island-photo-taken-december-1-2016-krabi-thailand.jpg', 'uploads/tours/images/68bea322a7f26_1757324066.jpg', 'image', 702868, 'image/jpeg', 'dev_lay', '2025-09-08 09:34:26', 'gallery', NULL),
(559, 23, '68bea322d621d_1757324066.jpg', 'beautiful-view-phi-phi-island-located-thailand (1).jpg', 'uploads/tours/images/68bea322d621d_1757324066.jpg', 'image', 840884, 'image/jpeg', 'dev_lay', '2025-09-08 09:34:26', 'gallery', NULL),
(560, 23, '68bea323173e3_1757324067.jpg', 'beautiful-view-phi-phi-island-located-thailand.jpg', 'uploads/tours/images/68bea323173e3_1757324067.jpg', 'image', 870435, 'image/jpeg', 'dev_lay', '2025-09-08 09:34:27', 'gallery', NULL),
(561, 23, '68bea32580f07_1757324069.jpg', 'maya-bay-phi-phi-leh-island 3.jpg', 'uploads/tours/images/68bea32580f07_1757324069.jpg', 'image', 572086, 'image/jpeg', 'dev_lay', '2025-09-08 09:34:29', 'gallery', NULL),
(562, 23, '68bea3261726f_1757324070.jpg', 'เกาะพีพีดอน 2.jpg', 'uploads/tours/images/68bea3261726f_1757324070.jpg', 'image', 764469, 'image/jpeg', 'dev_lay', '2025-09-08 09:34:30', 'gallery', NULL),
(563, 23, '68bea3261733d_1757324070.jpg', 'tropical-sandy-beach-maya-bay-with-turquoise-water-ocean-phi-phi-islands-krabi-thailand-with.jpg', 'uploads/tours/images/68bea3261733d_1757324070.jpg', 'image', 634141, 'image/jpeg', 'dev_lay', '2025-09-08 09:34:30', 'gallery', NULL),
(564, 23, '68bea326a37c8_1757324070.jpg', 'ถ้ำไวกิ้ง 2.jpg', 'uploads/tours/images/68bea326a37c8_1757324070.jpg', 'image', 596557, 'image/jpeg', 'dev_lay', '2025-09-08 09:34:30', 'gallery', NULL),
(565, 23, '68bea326c4e1f_1757324070.jpg', 'อ่าวปิเละ 2.jpg', 'uploads/tours/images/68bea326c4e1f_1757324070.jpg', 'image', 501226, 'image/jpeg', 'dev_lay', '2025-09-08 09:34:30', 'gallery', NULL),
(566, 23, '68bea329abbeb_1757324073.jpg', 'อ่าวลิง2.jpg', 'uploads/tours/images/68bea329abbeb_1757324073.jpg', 'image', 648006, 'image/jpeg', 'dev_lay', '2025-09-08 09:34:33', 'gallery', NULL),
(568, 20, '68bea3825f404_1757324162.jpg', 'remove 2.jpg', 'uploads/tours/images/68bea3825f404_1757324162.jpg', 'image', 4471881, 'image/jpeg', 'dev_lay', '2025-09-08 09:36:02', 'gallery', NULL),
(569, 19, '68bea39d48211_1757324189.jpg', '130696787_105213234796724_5211311483604376909_n2.jpg', 'uploads/tours/images/68bea39d48211_1757324189.jpg', 'image', 1143283, 'image/jpeg', 'dev_lay', '2025-09-08 09:36:29', 'gallery', NULL),
(570, 66, '68bea74dcc36e_1757325133.jpg', 'A4 7 Islands sunset BBQ Speed boat TH.jpg', 'uploads/tours/images/68bea74dcc36e_1757325133.jpg', 'image', 5027763, 'image/jpeg', 'dev_lay', '2025-09-08 09:52:13', 'brochure', NULL),
(571, 66, '68bea74e2a681_1757325134.jpg', 'A4 7 Islands sunset BBQ Speed boat EN.jpg', 'uploads/tours/images/68bea74e2a681_1757325134.jpg', 'image', 5122602, 'image/jpeg', 'dev_lay', '2025-09-08 09:52:14', 'brochure', NULL),
(572, 67, '68bea76f47345_1757325167.jpg', 'A4 7 Islands sunset BBQ Longtail boat TH.jpg', 'uploads/tours/images/68bea76f47345_1757325167.jpg', 'image', 1789203, 'image/jpeg', 'dev_lay', '2025-09-08 09:52:47', 'brochure', NULL),
(573, 67, '68bea76fa8c02_1757325167.jpg', 'A4 7 Islands sunset BBQ Longtail boat EN.jpg', 'uploads/tours/images/68bea76fa8c02_1757325167.jpg', 'image', 1814765, 'image/jpeg', 'dev_lay', '2025-09-08 09:52:47', 'brochure', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `created_at`) VALUES
(1, 'dev_lay', 'admin123', 'admin', '2025-07-19 08:42:11'),
(3, 'lay', '01112567', 'admin', '2025-05-25 21:03:29'),
(5, 'nui', '123456789', 'user', '2025-08-27 07:28:33'),
(6, 'sevensmile', 'sevensmile2025', 'user', '2025-08-31 15:35:03');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `package_tours`
--
ALTER TABLE `package_tours`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_created_by` (`created_by`);

--
-- Indexes for table `package_tour_items`
--
ALTER TABLE `package_tour_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tour_id` (`tour_id`),
  ADD KEY `idx_package_tour_id` (`package_tour_id`),
  ADD KEY `idx_day_time` (`day_number`,`time_slot`);

--
-- Indexes for table `package_tour_shares`
--
ALTER TABLE `package_tour_shares`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `share_token` (`share_token`),
  ADD KEY `package_tour_id` (`package_tour_id`),
  ADD KEY `idx_share_token` (`share_token`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_name` (`name`);

--
-- Indexes for table `supplier_files`
--
ALTER TABLE `supplier_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sub_agent_id` (`supplier_id`);

--
-- Indexes for table `tours`
--
ALTER TABLE `tours`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tour_name` (`tour_name`),
  ADD KEY `idx_dates` (`start_date`,`end_date`),
  ADD KEY `idx_updated` (`updated_at`),
  ADD KEY `sub_agent_id` (`supplier_id`);

--
-- Indexes for table `tour_files`
--
ALTER TABLE `tour_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tour_id` (`tour_id`),
  ADD KEY `idx_file_type` (`file_type`),
  ADD KEY `idx_uploaded_at` (`uploaded_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_role` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `package_tours`
--
ALTER TABLE `package_tours`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `package_tour_items`
--
ALTER TABLE `package_tour_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `package_tour_shares`
--
ALTER TABLE `package_tour_shares`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `supplier_files`
--
ALTER TABLE `supplier_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `tours`
--
ALTER TABLE `tours`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=204;

--
-- AUTO_INCREMENT for table `tour_files`
--
ALTER TABLE `tour_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=574;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `package_tour_items`
--
ALTER TABLE `package_tour_items`
  ADD CONSTRAINT `package_tour_items_ibfk_1` FOREIGN KEY (`package_tour_id`) REFERENCES `package_tours` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `package_tour_items_ibfk_2` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `package_tour_shares`
--
ALTER TABLE `package_tour_shares`
  ADD CONSTRAINT `package_tour_shares_ibfk_1` FOREIGN KEY (`package_tour_id`) REFERENCES `package_tours` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tour_files`
--
ALTER TABLE `tour_files`
  ADD CONSTRAINT `fk_tour_files_tour_id` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
