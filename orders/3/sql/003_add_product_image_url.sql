-- Add product images (idempotent). Safe to re-run.
USE `autonix_order_3`;

SET @has_col := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'products'
    AND COLUMN_NAME = 'image_url'
);

SET @ddl := IF(
  @has_col = 0,
  'ALTER TABLE `products` ADD COLUMN `image_url` VARCHAR(512) DEFAULT NULL AFTER `sort_order`',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE `products` SET `image_url` = 'https://images.unsplash.com/photo-1559056199-641bd0d8a3e92?w=900&q=85&auto=format&fit=crop' WHERE `slug` = 'trailhead-blend';
UPDATE `products` SET `image_url` = 'https://images.unsplash.com/photo-1497936358523-2966f92d8ee2?w=900&q=85&auto=format&fit=crop' WHERE `slug` = 'cedar-single-origin';
UPDATE `products` SET `image_url` = 'https://images.unsplash.com/photo-1510591508518-65db6f17e6f8?w=900&q=85&auto=format&fit=crop' WHERE `slug` = 'campfire-espresso';
UPDATE `products` SET `image_url` = 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93b?w=900&q=85&auto=format&fit=crop' WHERE `slug` = 'bc-enamel-mug';
