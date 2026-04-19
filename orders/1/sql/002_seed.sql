USE `autonix_order_1`;

DELETE FROM `testimonials`;
INSERT INTO `testimonials` (`author_name`, `role_location`, `body`, `rating`, `sort_order`, `created_at`, `updated_at`)
VALUES
  ('Alex M.', 'Commercial buyer, 12', '12 made our office search straightforward. Clear communication and listings that matched what we asked for.', 5, 1, NOW(), NOW()),
  ('Jordan K.', 'First-time buyer', 'As someone new to the market, I appreciated the calm guidance and attention to detail throughout.', 5, 2, NOW(), NOW()),
  ('Samira R.', 'Investor', 'Professional from first inquiry to closing. The team understands both B2B and residential needs.', 5, 3, NOW(), NOW());

INSERT INTO `blog_posts` (`slug`, `title`, `excerpt`, `body`, `published_at`, `created_at`, `updated_at`)
VALUES
  (
    'luxury-listings-what-to-expect',
    'What to expect from luxury listings in your region',
    'A practical overview for buyers and partners evaluating premium properties with 12.',
    '<p>Whether you are exploring the market for yourself or on behalf of an organization, clarity matters. We focus on properties that align with your criteria, transparent timelines, and documentation you can rely on.</p><p>This article outlines how we present listings, what questions to ask early, and how we support both individual and business clients across 12.</p>',
    NOW(),
    NOW(),
    NOW()
  ),
  (
    'shipping-and-fulfillment-for-physical-products',
    'Shipping and fulfillment for physical products',
    'How 12 handles shipping when your transaction includes physical goods.',
    '<p>When a deal includes physical products, we coordinate shipping with trusted carriers and keep you informed at each step. Tracking, insurance options, and delivery windows are discussed upfront so there are no surprises.</p><p>Contact us if you have specific logistics needs or regional requirements within 12.</p>',
    NOW(),
    NOW(),
    NOW()
  )
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `excerpt` = VALUES(`excerpt`),
  `body` = VALUES(`body`),
  `updated_at` = VALUES(`updated_at`);
