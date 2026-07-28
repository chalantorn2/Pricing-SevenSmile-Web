-- add_sessions_table.sql
-- Server-side login sessions. Until now "being logged in" was purely a localStorage
-- flag in the browser and every endpoint under api/ answered anyone who asked, so a
-- stranger could read net rates or delete a hotel without logging in.
--
-- api/auth.php issues an opaque token on a successful login and stores it here;
-- api/_auth.php checks it on every protected request. Deleting a user drops their
-- sessions with them.

CREATE TABLE IF NOT EXISTS `sessions` (
  `token` CHAR(64) NOT NULL COMMENT 'random, opaque - never derived from user data',
  `user_id` INT(11) NOT NULL,
  `created_at` DATETIME NOT NULL,
  `last_seen_at` DATETIME NOT NULL,
  `expires_at` DATETIME NOT NULL COMMENT 'slides forward on use',
  `user_agent` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`token`),
  KEY `idx_user` (`user_id`),
  KEY `idx_expires` (`expires_at`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
