USE `autonix_order_3`;

INSERT INTO `products` (`slug`, `name`, `description`, `price_cents`, `category`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES
  (
    'trailhead-blend',
    'Trailhead Blend',
    'Medium roast with milk chocolate, toasted hazelnut, and a clean citrus finish. Roasted for drip and pour-over.',
    1899,
    'beans',
    1,
    10,
    NOW(),
    NOW()
  ),
  (
    'cedar-single-origin',
    'Cedar Ridge Single Origin',
    'Seasonal washed lot: bright red berry, panela sweetness, silky body. Whole bean; grind notes at checkout.',
    2299,
    'beans',
    1,
    20,
    NOW(),
    NOW()
  ),
  (
    'campfire-espresso',
    'Campfire Espresso',
    'Bold, low-acid espresso with dark cocoa and smoked caramel. Pulls rich shots and stands up in milk drinks.',
    1999,
    'beans',
    1,
    30,
    NOW(),
    NOW()
  ),
  (
    'bc-enamel-mug',
    'BC Coffee Enamel Mug',
    '12 oz forest-green camp mug with BC wordmark. Dishwasher-safe enamel on steel.',
    2499,
    'gear',
    1,
    40,
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
  `updated_at` = NOW();
