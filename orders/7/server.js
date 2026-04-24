require('dotenv').config();

const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { sequelize } = require('./db');
const { Lead } = require('./models');

const PORT = Number(process.env.PORT || 3112);
const FORBIDDEN_PORTS = new Set([80, 443, 2000, 3000, 4000, 5000, 7000, 8000, 9000, 5050, 6060, 6769, 6770, 2020, 4200]);
if (FORBIDDEN_PORTS.has(PORT)) {
  console.error(`Refusing to listen on forbidden port ${PORT}. Set PORT in .env.`);
  process.exit(1);
}

const app = express();

const siteUsesHttps = (process.env.SITE_URL || '').trim().toLowerCase().startsWith('https:');

const assetsBase = (process.env.CLIENT_ASSETS_BASE || '/uploads/website-client-assets/7').replace(/\/$/, '');
const clientLogoUrl = (process.env.CLIENT_LOGO_URL || '').trim();
const clientHeroUrl = (process.env.CLIENT_HERO_URL || '').trim();

function absoluteAssetUrl(req, urlPath) {
  const u = (urlPath || '').toString().trim();
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  const base = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  const pathPart = u.startsWith('/') ? u : `/${u}`;
  return `${base}${pathPart}`;
}

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
          'img-src': ["'self'", 'data:', 'https:', 'https://images.unsplash.com'],
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
          imgSrc: ["'self'", 'data:', 'https:', 'https://images.unsplash.com'],
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

const defaultMeta =
  'Landzer helps buyers and sellers move with clarity — curated listings, market insight, and a real estate team focused on outcomes, not noise.';

app.use((req, res, next) => {
  res.locals.siteUrl = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  res.locals.canonicalPath = req.path.split('?')[0] || '/';
  res.locals.gaId = process.env.GA_MEASUREMENT_ID || '';
  res.locals.whatsappNumber = process.env.WHATSAPP_NUMBER || '';
  res.locals.contactEmail = (process.env.CONTACT_EMAIL || '').trim();
  res.locals.pageTitle = 'Landzer';
  res.locals.metaDescription = defaultMeta;
  res.locals.clientAssetsBase = assetsBase;
  res.locals.clientLogoUrl = clientLogoUrl;
  res.locals.clientHeroUrl = clientHeroUrl;
  res.locals.ogImageUrl =
    absoluteAssetUrl(req, clientHeroUrl) ||
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=85&auto=format&fit=crop';
  next();
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    service: 'autonix-order-7',
    time: new Date().toISOString(),
  });
});

app.get('/sitemap.xml', (req, res) => {
  const base = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  const urls = [
    { loc: `${base}/`, changefreq: 'weekly', priority: '1.0' },
    { loc: `${base}/listings`, changefreq: 'weekly', priority: '0.95' },
    { loc: `${base}/contact`, changefreq: 'monthly', priority: '0.85' },
  ];
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

app.get('/', (req, res) => {
  res.render('pages/home', {
    pageTitle: 'Landzer — Real estate with a sharper edge',
    metaDescription: defaultMeta,
  });
});

const featuredListings = [
  {
    slug: 'skyline-loft-district',
    title: 'Skyline loft — District views',
    priceLabel: '$1.125M',
    beds: 2,
    baths: 2,
    sqft: 1480,
    tag: 'Urban',
    image:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=85&auto=format&fit=crop',
    blurb: 'Floor-to-ceiling glass, private terrace, and walkable access to dining and transit.',
  },
  {
    slug: 'harbor-townhome',
    title: 'Harbor townhome with roof deck',
    priceLabel: '$875K',
    beds: 3,
    baths: 2.5,
    sqft: 1920,
    tag: 'Waterfront',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=85&auto=format&fit=crop',
    blurb: 'Three levels of light-filled living, garage parking, and sunset views over the marina.',
  },
  {
    slug: 'oak-avenue-estate',
    title: 'Oak Avenue estate — mature trees',
    priceLabel: '$2.4M',
    beds: 5,
    baths: 4,
    sqft: 4100,
    tag: 'Estate',
    image:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=85&auto=format&fit=crop',
    blurb: 'Chef’s kitchen, dedicated office wing, and a backyard made for long weekends at home.',
  },
];

app.get('/listings', (req, res) => {
  res.render('pages/listings', {
    pageTitle: 'Featured listings — Landzer',
    metaDescription:
      'Explore Landzer featured properties: lofts, townhomes, and estates — each vetted for location, condition, and long-term value.',
    listings: featuredListings,
  });
});

app.get('/contact', (req, res) => {
  const propertyHint = (req.query.property || '').toString().trim().slice(0, 200);
  const initialMessage = propertyHint
    ? `I'd like to schedule a private tour or learn more about: ${propertyHint}\n\n`
    : '';
  res.render('pages/contact', {
    pageTitle: 'Contact — Landzer',
    metaDescription:
      'Reach Landzer for a private showing, a seller consultation, or questions about the market. We reply with clear next steps.',
    sent: req.query.sent === '1',
    error: req.query.err === '1',
    initialMessage,
  });
});

app.post('/contact', contactLimiter, async (req, res) => {
  const name = (req.body.name || '').toString().trim();
  const email = (req.body.email || '').toString().trim();
  const company = (req.body.company || '').toString().trim();
  const message = (req.body.message || '').toString().trim();
  if (!name || !email || !message) {
    return res.redirect('/contact?err=1');
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
    return res.redirect('/contact?err=1');
  }

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'autonix-order-7-contact',
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
  return res.redirect('/contact?sent=1');
});

app.use((req, res) => {
  res.status(404).render('pages/404', { pageTitle: 'Not found — Landzer' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('pages/500', { pageTitle: 'Error — Landzer' });
});

async function start() {
  await sequelize.authenticate();
  const sync = process.env.SYNC_DB === 'true';
  if (sync) {
    await sequelize.sync({ alter: false });
  }

  app.listen(PORT, () => {
    console.log(`autonix-order-7 listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
