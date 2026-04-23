-- Dedicated schema for Autonix order #5 — Hippo. Do not share with other projects.
CREATE DATABASE IF NOT EXISTS `autonix_order_5`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `autonix_order_5`;

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

CREATE TABLE IF NOT EXISTS `products` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(80) NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `description` TEXT NOT NULL,
  `price_cents` INT UNSIGNED NOT NULL,
  `category` VARCHAR(80) DEFAULT 'mains',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `image_url` VARCHAR(512) DEFAULT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_slug` (`slug`),
  KEY `products_active_sort` (`is_active`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(160) NOT NULL,
  `phone` VARCHAR(40) DEFAULT NULL,
  `address_line1` VARCHAR(200) NOT NULL,
  `address_line2` VARCHAR(200) DEFAULT NULL,
  `city` VARCHAR(120) NOT NULL,
  `region` VARCHAR(120) DEFAULT NULL,
  `postal` VARCHAR(32) NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `total_cents` INT UNSIGNED NOT NULL,
  `status` VARCHAR(40) NOT NULL DEFAULT 'received',
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `orders_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED DEFAULT NULL,
  `product_name` VARCHAR(160) NOT NULL,
  `unit_price_cents` INT UNSIGNED NOT NULL,
  `quantity` INT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_order_id` (`order_id`),
  CONSTRAINT `order_items_order_fk` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
