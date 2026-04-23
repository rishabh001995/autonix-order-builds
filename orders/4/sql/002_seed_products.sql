USE `autonix_order_4`;

INSERT INTO `products` (`slug`, `name`, `description`, `price_cents`, `category`, `is_active`, `sort_order`, `image_url`, `created_at`, `updated_at`)
VALUES
  (
    'seasonal-greens-mix',
    'Seasonal Greens Mix',
    'Washed and ready to use — a rotating blend of tender lettuces and baby greens from local farms.',
    499,
    'produce',
    1,
    10,
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900&q=85&auto=format&fit=crop',
    NOW(),
    NOW()
  ),
  (
    'vine-ripe-tomatoes',
    'Vine-Ripe Tomatoes',
    'Sun-ripened tomatoes with balanced sweetness — ideal for salads, sandwiches, and quick sauces.',
    349,
    'produce',
    1,
    20,
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=900&q=85&auto=format&fit=crop',
    NOW(),
    NOW()
  ),
  (
    'organic-bananas',
    'Organic Bananas (bunch)',
    'Fairly firm, evenly ripening bananas — perfect for breakfast bowls, smoothies, and baking.',
    299,
    'produce',
    1,
    30,
    'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=900&q=85&auto=format&fit=crop',
    NOW(),
    NOW()
  ),
  (
    'whole-milk-greek-yogurt',
    'Whole-Milk Greek Yogurt',
    'Creamy, strained yogurt with live cultures — pairs with fruit, granola, or savory dips.',
    599,
    'dairy',
    1,
    40,
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=900&q=85&auto=format&fit=crop',
    NOW(),
    NOW()
  ),
  (
    'sourdough-loaf',
    'Artisan Sourdough Loaf',
    'Slow-fermented loaf with a crackly crust and open crumb — baked the morning of delivery when possible.',
    799,
    'bakery',
    1,
    50,
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&q=85&auto=format&fit=crop',
    NOW(),
    NOW()
  ),
  (
    'extra-virgin-olive-oil',
    'Extra Virgin Olive Oil (500ml)',
    'Cold-pressed oil for finishing salads, roasting vegetables, and everyday cooking.',
    1299,
    'pantry',
    1,
    60,
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=900&q=85&auto=format&fit=crop',
    NOW(),
    NOW()
  )
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `description` = VALUES(`description`),
  `price_cents` = VALUES(`price_cents`),
  `category` = VALUES(`category`),
  `is_active` = VALUES(`is_active`),
  `sort_order` = VALUES(`sort_order`),
  `image_url` = VALUES(`image_url`),
  `updated_at` = NOW();
