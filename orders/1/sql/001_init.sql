-- Dedicated schema for Autonix order #1 — do not share with other projects.
CREATE DATABASE IF NOT EXISTS `autonix_order_1`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `autonix_order_1`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sessions` (
  `sid` VARCHAR(36) NOT NULL,
  `expires` DATETIME NOT NULL,
  `data` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`sid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `author_name` VARCHAR(120) NOT NULL,
  `role_location` VARCHAR(200) DEFAULT NULL,
  `body` TEXT NOT NULL,
  `rating` TINYINT UNSIGNED NOT NULL DEFAULT 5,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(200) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `excerpt` VARCHAR(500) DEFAULT NULL,
  `body` TEXT NOT NULL,
  `published_at` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `blog_posts_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
