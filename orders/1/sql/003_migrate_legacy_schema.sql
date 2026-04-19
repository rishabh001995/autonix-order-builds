-- Run once if this database was created by an older `001_init.sql` (users, sessions, blog, testimonials).
-- Safe to run on fresh installs that already only have `leads` (drops are IF EXISTS).

USE `autonix_order_1`;

DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `blog_posts`;
DROP TABLE IF EXISTS `testimonials`;

CREATE TABLE IF NOT EXISTS `leads` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `company` VARCHAR(200) DEFAULT NULL,
  `message` TEXT NOT NULL,
  `source` VARCHAR(80) DEFAULT 'contact',
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `leads_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
