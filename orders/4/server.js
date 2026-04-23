require('dotenv').config();

const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieSession = require('cookie-session');

const { sequelize } = require('./db');
const { Lead, Product, Order, OrderItem } = require('./models');

const PORT = Number(process.env.PORT || 3106);
const FORBIDDEN_PORTS = new Set([80, 443, 2000, 3000, 4000, 5000, 7000, 8000, 9000, 5050, 6060, 6769, 6770, 2020, 4200]);
if (FORBIDDEN_PORTS.has(PORT)) {
  console.error(`Refusing to listen on forbidden port ${PORT}. Set PORT in .env.`);
  process.exit(1);
}

const app = express();

const siteUsesHttps = (process.env.SITE_URL || '').trim().toLowerCase().startsWith('https:');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

const helmetBase = {
  strictTransportSecurity: siteUsesHttps,
  contentSecurityPolicy: siteUsesHttps
    ? {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'script-src': ["'self'", 'https://www.googletagmanager.com', "'unsafe-inline'"],
          'connect-src': ["'self'", 'https://www.google-analytics.com'],
          'font-src': ["'self'", 'https://fonts.gstatic.com'],
          'img-src': ["'self'", 'data:', 'https://images.unsplash.com'],
          'style-src': ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
        },
      }
    : {
        useDefaults: false,
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          formAction: ["'self'"],
          frameAncestors: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https://images.unsplash.com'],
          objectSrc: ["'none'"],
          scriptSrc: ["'self'", 'https://www.googletagmanager.com', "'unsafe-inline'"],
          scriptSrcAttr: ["'none'"],
          styleSrc: ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
          connectSrc: ["'self'", 'https://www.google-analytics.com'],
        },
      },
};

app.use(helmet(helmetBase));
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const sessionSecret = process.env.SESSION_SECRET || 'development-only-set-SESSION_SECRET';
app.use(
  cookieSession({
    name: 'deliveru_session',
    keys: [sessionSecret],
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    httpOnly: true,
    secure: siteUsesHttps,
  })
);

function formatMoney(cents) {
  return (Number(cents) / 100).toFixed(2);
}

function categoryLabel(slug) {
  const map = {
    produce: 'Produce',
    dairy: 'Dairy',
    bakery: 'Bakery',
    pantry: 'Pantry',
  };
  return map[slug] || (slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Groceries');
}

function productImageUrl(product) {
  if (!product) return '';
  if (product.imageUrl) return product.imageUrl;
  return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&q=85&auto=format&fit=crop';
}

function normalizeCart(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [k, v] of Object.entries(raw)) {
    const id = parseInt(k, 10);
    if (!id) continue;
    const qty = Math.min(99, Math.max(0, parseInt(v, 10) || 0));
    if (qty > 0) out[id] = qty;
  }
  return out;
}

async function getCartSummary(req) {
  const cart = normalizeCart(req.session.cart);
  req.session.cart = cart;
  const ids = Object.keys(cart).map((x) => parseInt(x, 10));
  if (!ids.length) {
    return { lines: [], subtotalCents: 0, count: 0 };
  }
  const products = await Product.findAll({
    where: { id: ids, isActive: true },
    order: [['sortOrder', 'ASC']],
  });
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const lines = [];
  let subtotalCents = 0;
  let count = 0;
  for (const id of ids) {
    const qty = cart[id];
    const p = byId[id];
    if (!p || !qty) continue;
    const lineTotal = p.priceCents * qty;
    subtotalCents += lineTotal;
    count += qty;
    lines.push({ product: p, quantity: qty, lineTotalCents: lineTotal });
  }
  return { lines, subtotalCents, count };
}

const defaultMeta =
  'Deliveru brings fresh groceries to your door — curated staples, produce, and pantry picks with clear delivery windows.';

app.use(async (req, res, next) => {
  res.locals.siteUrl = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  res.locals.canonicalPath = req.path.split('?')[0] || '/';
  res.locals.gaId = process.env.GA_MEASUREMENT_ID || '';
  res.locals.whatsappNumber = process.env.WHATSAPP_NUMBER || '';
  res.locals.pageTitle = 'Deliveru';
  res.locals.metaDescription = defaultMeta;
  res.locals.formatMoney = formatMoney;
  res.locals.productImageUrl = productImageUrl;
  res.locals.categoryLabel = categoryLabel;
  try {
    const cartSum = await getCartSummary(req);
    res.locals.cartCount = cartSum.count;
    res.locals.cartSubtotalCents = cartSum.subtotalCents;
  } catch (e) {
    res.locals.cartCount = 0;
    res.locals.cartSubtotalCents = 0;
  }
  next();
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
});

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    service: 'autonix-order-4',
    time: new Date().toISOString(),
  });
});

app.get('/sitemap.xml', (req, res) => {
  const base = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  const urls = [{ loc: `${base}/`, changefreq: 'weekly', priority: '1.0' }];
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url><loc>${u.loc}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
      )
      .join('\n') +
    `\n</urlset>`;
  res.type('application/xml').send(xml);
});

app.get('/', async (req, res, next) => {
  try {
    const products = await Product.findAll({
      where: { isActive: true },
      order: [
        ['category', 'ASC'],
        ['sortOrder', 'ASC'],
      ],
    });
    res.render('pages/home', {
      pageTitle: 'Deliveru — Grocery delivery, simplified',
      metaDescription: defaultMeta,
      products,
      contactSent: req.query.sent === '1',
      contactError: req.query.err === '1',
    });
  } catch (e) {
    next(e);
  }
});

app.get('/p/:slug', async (req, res, next) => {
  try {
    const product = await Product.findOne({
      where: { slug: req.params.slug, isActive: true },
    });
    if (!product) {
      return res.status(404).render('pages/404', { pageTitle: 'Not found — Deliveru' });
    }
    res.render('pages/product', {
      pageTitle: `${product.name} — Deliveru`,
      metaDescription: product.description.slice(0, 160),
      product,
    });
  } catch (e) {
    next(e);
  }
});

app.post('/cart/add', async (req, res, next) => {
  try {
    const productId = parseInt(req.body.product_id, 10);
    const qty = Math.min(99, Math.max(1, parseInt(req.body.quantity, 10) || 1));
    const redirectTo = (req.body.redirect || '/').toString().slice(0, 200) || '/';
    if (!productId) return res.redirect('/');
    const p = await Product.findOne({ where: { id: productId, isActive: true } });
    if (!p) return res.redirect('/');
    req.session.cart = normalizeCart(req.session.cart);
    const prev = req.session.cart[productId] || 0;
    req.session.cart[productId] = Math.min(99, prev + qty);
    return res.redirect(redirectTo.startsWith('/') ? redirectTo : '/');
  } catch (e) {
    next(e);
  }
});

app.post('/cart/update', (req, res) => {
  const nextCart = {};
  const body = req.body;
  if (body && typeof body === 'object') {
    for (const [k, v] of Object.entries(body)) {
      if (!k.startsWith('qty_')) continue;
      const id = parseInt(k.slice(4), 10);
      if (!id) continue;
      const qty = Math.min(99, Math.max(0, parseInt(v, 10) || 0));
      if (qty > 0) nextCart[id] = qty;
    }
  }
  req.session.cart = nextCart;
  return res.redirect('/cart');
});

app.post('/cart/remove', (req, res) => {
  const productId = parseInt(req.body.product_id, 10);
  req.session.cart = normalizeCart(req.session.cart);
  if (productId && req.session.cart[productId]) {
    delete req.session.cart[productId];
  }
  return res.redirect('/cart');
});

app.get('/cart', async (req, res, next) => {
  try {
    const summary = await getCartSummary(req);
    res.render('pages/cart', {
      pageTitle: 'Cart — Deliveru',
      metaDescription: 'Review your Deliveru cart and choose a delivery window at checkout.',
      lines: summary.lines,
      subtotalCents: summary.subtotalCents,
    });
  } catch (e) {
    next(e);
  }
});

app.get('/checkout', async (req, res, next) => {
  try {
    const summary = await getCartSummary(req);
    if (!summary.lines.length) {
      return res.redirect('/cart');
    }
    res.render('pages/checkout', {
      pageTitle: 'Checkout — Deliveru',
      metaDescription: 'Complete your grocery order — address, delivery window, and contact details.',
      lines: summary.lines,
      subtotalCents: summary.subtotalCents,
      error: req.query.err === '1',
    });
  } catch (e) {
    next(e);
  }
});

app.post('/checkout', checkoutLimiter, async (req, res, next) => {
  const summary = await getCartSummary(req);
  if (!summary.lines.length) {
    return res.redirect('/cart');
  }

  const email = (req.body.email || '').toString().trim();
  const fullName = (req.body.full_name || '').toString().trim();
  const phone = (req.body.phone || '').toString().trim();
  const addressLine1 = (req.body.address_line1 || '').toString().trim();
  const addressLine2 = (req.body.address_line2 || '').toString().trim();
  const city = (req.body.city || '').toString().trim();
  const region = (req.body.region || '').toString().trim();
  const postal = (req.body.postal || '').toString().trim();
  const notes = (req.body.notes || '').toString().trim();
  const deliveryWindow = (req.body.delivery_window || '').toString().trim();

  if (!email || !fullName || !addressLine1 || !city || !postal) {
    return res.redirect('/checkout?err=1');
  }

  const t = await sequelize.transaction();
  try {
    const order = await Order.create(
      {
        email,
        fullName,
        phone: phone || null,
        addressLine1,
        addressLine2: addressLine2 || null,
        city,
        region: region || null,
        postal,
        notes: notes || null,
        deliveryWindow: deliveryWindow || null,
        totalCents: summary.subtotalCents,
        status: 'received',
      },
      { transaction: t }
    );

    for (const line of summary.lines) {
      await OrderItem.create(
        {
          orderId: order.id,
          productId: line.product.id,
          productName: line.product.name,
          unitPriceCents: line.product.priceCents,
          quantity: line.quantity,
        },
        { transaction: t }
      );
    }

    await t.commit();
  } catch (e) {
    await t.rollback();
    console.error(e);
    return res.redirect('/checkout?err=1');
  }

  req.session.cart = {};

  const webhook = process.env.ORDER_WEBHOOK_URL || process.env.CONTACT_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'autonix-order-4-checkout',
          email,
          fullName,
          deliveryWindow: deliveryWindow || null,
          totalCents: summary.subtotalCents,
          items: summary.lines.map((l) => ({
            name: l.product.name,
            quantity: l.quantity,
            unitPriceCents: l.product.priceCents,
          })),
          at: new Date().toISOString(),
        }),
      });
    } catch (_) {
      /* non-fatal */
    }
  }

  return res.redirect('/checkout/thanks');
});

app.get('/checkout/thanks', (req, res) => {
  res.render('pages/checkout-thanks', {
    pageTitle: 'Thank you — Deliveru',
    metaDescription: 'Your Deliveru order was received. We will confirm your delivery window by email.',
  });
});

app.post('/contact', contactLimiter, async (req, res) => {
  const name = (req.body.name || '').toString().trim();
  const email = (req.body.email || '').toString().trim();
  const company = (req.body.company || '').toString().trim();
  const message = (req.body.message || '').toString().trim();
  if (!name || !email || !message) {
    return res.redirect('/?err=1#contact');
  }

  try {
    await Lead.create({
      name,
      email,
      company: company || null,
      message,
      source: 'contact',
    });
  } catch (e) {
    console.error(e);
    return res.redirect('/?err=1#contact');
  }

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'autonix-order-4-contact',
          name,
          email,
          company: company || null,
          message,
          at: new Date().toISOString(),
        }),
      });
    } catch (_) {
      /* non-fatal */
    }
  }
  return res.redirect('/?sent=1#contact');
});

app.use((req, res) => {
  res.status(404).render('pages/404', { pageTitle: 'Not found — Deliveru' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('pages/500', { pageTitle: 'Error — Deliveru' });
});

async function start() {
  await sequelize.authenticate();
  const sync = process.env.SYNC_DB === 'true';
  if (sync) {
    await sequelize.sync({ alter: false });
  }

  app.listen(PORT, () => {
    console.log(`autonix-order-4 listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
