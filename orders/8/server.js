require('dotenv').config();

const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { sequelize } = require('./db');
const { Lead } = require('./models');

const PORT = Number(process.env.PORT || 3114);
const FORBIDDEN_PORTS = new Set([80, 443, 2000, 3000, 4000, 5000, 7000, 8000, 9000, 5050, 6060, 6769, 6770, 2020, 4200]);
if (FORBIDDEN_PORTS.has(PORT)) {
  console.error(`Refusing to listen on forbidden port ${PORT}. Set PORT in .env.`);
  process.exit(1);
}

const app = express();

const siteUsesHttps = (process.env.SITE_URL || '').trim().toLowerCase().startsWith('https:');

const assetsBase = (process.env.CLIENT_ASSETS_BASE || '/uploads/website-client-assets/8').replace(/\/$/, '');
const defaultLogoPath = `${assetsBase}/1777098886598-qalvenn3-sood-mort-logo.png`;
const clientLogoUrl = (process.env.CLIENT_LOGO_URL || defaultLogoPath).trim();

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
  'Sood Mortgages Group is a mortgage brokerage focused on clear options, disciplined documentation, and a calm path from application to closing.';

app.use((req, res, next) => {
  res.locals.siteUrl = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  res.locals.canonicalPath = req.path.split('?')[0] || '/';
  res.locals.gaId = process.env.GA_MEASUREMENT_ID || '';
  res.locals.whatsappNumber = process.env.WHATSAPP_NUMBER || '';
  res.locals.contactEmail = (process.env.CONTACT_EMAIL || '').trim();
  res.locals.pageTitle = 'Sood Mortgages Group';
  res.locals.metaDescription = defaultMeta;
  res.locals.clientAssetsBase = assetsBase;
  res.locals.clientLogoUrl = clientLogoUrl;
  res.locals.ogImageUrl = absoluteAssetUrl(req, clientLogoUrl) || `${res.locals.siteUrl}/favicon.svg`;
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
    service: 'autonix-order-8',
    time: new Date().toISOString(),
  });
});

app.get('/sitemap.xml', (req, res) => {
  const base = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  const urls = [
    { loc: `${base}/`, changefreq: 'weekly', priority: '1.0' },
    { loc: `${base}/services`, changefreq: 'monthly', priority: '0.9' },
    { loc: `${base}/about`, changefreq: 'monthly', priority: '0.85' },
    { loc: `${base}/resources`, changefreq: 'monthly', priority: '0.8' },
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
    pageTitle: 'Sood Mortgages Group — Mortgage brokerage with clarity',
    metaDescription: defaultMeta,
  });
});

app.get('/services', (req, res) => {
  res.render('pages/services', {
    pageTitle: 'Loan programs & services — Sood Mortgages Group',
    metaDescription:
      'Purchase financing, refinancing, and specialty programs — structured underwriting support and plain-language guidance from Sood Mortgages Group.',
  });
});

app.get('/about', (req, res) => {
  res.render('pages/about', {
    pageTitle: 'About us — Sood Mortgages Group',
    metaDescription:
      'Learn how Sood Mortgages Group approaches mortgage advisory: integrity, documentation discipline, and client-first communication.',
  });
});

app.get('/resources', (req, res) => {
  res.render('pages/resources', {
    pageTitle: 'Mortgage resources — Sood Mortgages Group',
    metaDescription:
      'Key mortgage terms and FAQs: pre-approval, rates vs. APR, debt-to-income, and what to expect before closing.',
  });
});

app.get('/contact', (req, res) => {
  const topic = (req.query.topic || '').toString().trim().slice(0, 200);
  const initialMessage = topic
    ? `I would like to discuss: ${topic}\n\n`
    : '';
  res.render('pages/contact', {
    pageTitle: 'Contact — Sood Mortgages Group',
    metaDescription:
      'Request a consultation with Sood Mortgages Group for purchase, refinance, or general mortgage questions. We respond with clear next steps.',
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
          source: 'autonix-order-8-contact',
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
  res.status(404).render('pages/404', { pageTitle: 'Not found — Sood Mortgages Group' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('pages/500', { pageTitle: 'Error — Sood Mortgages Group' });
});

async function start() {
  await sequelize.authenticate();
  const sync = process.env.SYNC_DB === 'true';
  if (sync) {
    await sequelize.sync({ alter: false });
  }

  app.listen(PORT, () => {
    console.log(`autonix-order-8 listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
