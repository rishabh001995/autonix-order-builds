-- Dedicated schema for Autonix order #2 — Porter. Do not share with other projects.
CREATE DATABASE IF NOT EXISTS `autonix_order_2`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `autonix_order_2`;

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
