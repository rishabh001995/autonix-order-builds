require('dotenv').config();

const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { sequelize } = require('./db');
const { Lead } = require('./models');

const PORT = Number(process.env.PORT || 3102);
const FORBIDDEN_PORTS = new Set([80, 443, 2000, 3000, 4000, 5000, 7000, 8000, 9000, 5050, 6060, 6769, 6770, 2020, 4200]);
if (FORBIDDEN_PORTS.has(PORT)) {
  console.error(`Refusing to listen on forbidden port ${PORT}. Set PORT in .env.`);
  process.exit(1);
}

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'script-src': ["'self'", 'https://www.googletagmanager.com', "'unsafe-inline'"],
        'connect-src': ["'self'", 'https://www.google-analytics.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'style-src': ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
      },
    },
  })
);
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const defaultMeta =
  'Porter — reliable local and regional delivery. Same-day routes, live tracking, and a team that treats every handoff like it matters.';

app.use((req, res, next) => {
  res.locals.siteUrl = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  res.locals.canonicalPath = req.path.split('?')[0] || '/';
  res.locals.gaId = process.env.GA_MEASUREMENT_ID || '';
  res.locals.whatsappNumber = process.env.WHATSAPP_NUMBER || '';
  res.locals.pageTitle = 'Porter';
  res.locals.metaDescription = defaultMeta;
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
    service: 'autonix-order-2',
    time: new Date().toISOString(),
  });
});

app.get('/sitemap.xml', (req, res) => {
  const base = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  const urls = [
    { loc: `${base}/`, changefreq: 'weekly', priority: '1.0' },
    { loc: `${base}/services`, changefreq: 'monthly', priority: '0.9' },
    { loc: `${base}/contact`, changefreq: 'monthly', priority: '0.8' },
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
    pageTitle: 'Porter — Delivery that keeps its word',
    metaDescription: defaultMeta,
  });
});

app.get('/services', (req, res) => {
  res.render('pages/services', {
    pageTitle: 'Services — Porter',
    metaDescription:
      'Porter services: scheduled routes, rush and same-day delivery, fragile and temperature-sensitive handling, and proof of delivery you can trust.',
  });
});

app.get('/contact', (req, res) => {
  res.render('pages/contact', {
    pageTitle: 'Contact — Porter',
    metaDescription:
      'Contact Porter for delivery quotes, route planning, and partnership questions. We respond to serious inquiries with clear next steps.',
    sent: req.query.sent === '1',
    error: req.query.err === '1',
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
          source: 'autonix-order-2-contact',
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
  res.status(404).render('pages/404', { pageTitle: 'Not found — Porter' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('pages/500', { pageTitle: 'Error — Porter' });
});

async function start() {
  await sequelize.authenticate();
  const sync = process.env.SYNC_DB === 'true';
  if (sync) {
    await sequelize.sync({ alter: false });
  }

  app.listen(PORT, () => {
    console.log(`autonix-order-2 listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
