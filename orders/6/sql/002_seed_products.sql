USE `autonix_order_6`;

INSERT INTO `products` (`slug`, `name`, `description`, `price_cents`, `category`, `is_active`, `sort_order`, `image_url`, `created_at`, `updated_at`)
VALUES
  (
    'forest-bowl',
    'Forest Grain Bowl',
    'Warm farro, roasted seasonal vegetables, lemon-herb dressing, and toasted seeds. Hearty and bright.',
    1499,
    'mains',
    1,
    10,
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&q=85&auto=format&fit=crop',
    NOW(),
    NOW()
  ),
  (
    'hippo-smash-burger',
    'Hippo Smash Burger',
    'Two patties, aged cheddar, caramelized onions, house pickles, and forest aioli on a toasted brioche bun.',
    1699,
    'mains',
    1,
    20,
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=85&auto=format&fit=crop',
    NOW(),
    NOW()
  ),
  (
    'wild-mushroom-flatbread',
    'Wild Mushroom Flatbread',
    'Wood-fired crust with cremini and shiitake, fontina, thyme, and a drizzle of truffle oil.',
    1399,
    'mains',
    1,
    30,
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&q=85&auto=format&fit=crop',
    NOW(),
    NOW()
  ),
  (
    'river-salad',
    'Riverbank Green Salad',
    'Little gems, cucumber, avocado, herbs, and a green goddess dressing. Add grilled chicken in order notes if you like.',
    1199,
    'sides',
    1,
    40,
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&q=85&auto=format&fit=crop',
    NOW(),
    NOW()
  ),
  (
    'moss-chocolate-tart',
    'Moss Chocolate Tart',
    'Dark chocolate ganache, oat crust, and sea salt. Baked in small batches.',
    799,
    'dessert',
    1,
    50,
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=900&q=85&auto=format&fit=crop',
    NOW(),
    NOW()
  ),
  (
    'canopy-cold-brew',
    'Canopy Cold Brew',
    'Slow-steeped, smooth, and chocolatey. 16 oz bottle.',
    549,
    'drinks',
    1,
    60,
    'https://images.unsplash.com/photo-1461023058943-07fc16a2880a?w=900&q=85&auto=format&fit=crop',
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
