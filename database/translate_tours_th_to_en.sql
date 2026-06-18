-- Translate tours.departure_from (province) and tours.pier to English
-- Safe: matches full column values only, does not touch notes/address.
-- Run against the sevensmile_contactrate database.

START TRANSACTION;

-- Provinces (departure_from)
UPDATE `tours` SET `departure_from` = 'Phuket'    WHERE `departure_from` = 'ภูเก็ต';
UPDATE `tours` SET `departure_from` = 'Krabi'     WHERE `departure_from` = 'กระบี่';
UPDATE `tours` SET `departure_from` = 'Phang Nga' WHERE `departure_from` = 'พังงา';

-- Piers
UPDATE `tours` SET `pier` = 'Nopparat Thara Pier' WHERE `pier` = 'ท่าเรือหาดนพรัตน์ธารา';
UPDATE `tours` SET `pier` = 'Laem Nga'            WHERE `pier` = 'แหลมหงา';
UPDATE `tours` SET `pier` = 'Tap Lamu'            WHERE `pier` = 'ทับละมุ';
UPDATE `tours` SET `pier` = 'Ban Nam Khem'        WHERE `pier` = 'บ้านน้ำเค็ม';
UPDATE `tours` SET `pier` = 'Ao Nam Mao'          WHERE `pier` = 'อ่าวน้ำเมา';
UPDATE `tours` SET `pier` = 'Nonthasak Rawai'     WHERE `pier` = 'นนทศักดิ์ ราไวย์';
UPDATE `tours` SET `pier` = 'Nonthasak Koh Sirey' WHERE `pier` = 'นนทศักดิ์ เกาะสิเหร่';

COMMIT;
