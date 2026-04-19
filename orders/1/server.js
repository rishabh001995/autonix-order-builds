require('dotenv').config();

const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const compression = require('compression');
const helmet = require('helmet');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const rateLimit = require('express-rate-limit');

const { sequelize } = require('./db');
const { User } = require('./models');
const { requireGuest, requireUser } = require('./middleware/auth');

const PORT = Number(process.env.PORT || 3100);
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
      },
    },
  })
);
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: 'sessions',
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-only-change-in-production',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use((req, res, next) => {
  res.locals.siteUrl = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  res.locals.canonicalPath = req.path.split('?')[0] || '/';
  res.locals.gaId = process.env.GA_MEASUREMENT_ID || '';
  res.locals.whatsappNumber = process.env.WHATSAPP_NUMBER || '';
  res.locals.currentUser = req.session.userId
    ? { id: req.session.userId, email: req.session.userEmail }
    : null;
  res.locals.pageTitle = '12';
  res.locals.metaDescription =
    '12 — established real estate brand serving 12. Luxury-focused listings, B2B and B2C, with shipping for physical products.';
  next();
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/health', (req, res) => {
  res.status(200).json({ ok: true, service: 'autonix-order-1', time: new Date().toISOString() });
});

app.get('/sitemap.xml', async (req, res, next) => {
  try {
    const base = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const { BlogPost } = require('./models');
    const posts = await BlogPost.findAll({ attributes: ['slug', 'updatedAt'], order: [['updatedAt', 'DESC']] });
    const urls = [
      { loc: `${base}/`, changefreq: 'weekly', priority: '1.0' },
      { loc: `${base}/about`, changefreq: 'monthly', priority: '0.8' },
      { loc: `${base}/blog`, changefreq: 'weekly', priority: '0.9' },
      { loc: `${base}/testimonials`, changefreq: 'monthly', priority: '0.8' },
      { loc: `${base}/contact`, changefreq: 'monthly', priority: '0.7' },
      { loc: `${base}/privacy`, changefreq: 'yearly', priority: '0.3' },
      { loc: `${base}/login`, changefreq: 'yearly', priority: '0.3' },
      { loc: `${base}/register`, changefreq: 'yearly', priority: '0.3' },
    ];
    posts.forEach((p) => {
      const row = p.get({ plain: true });
      urls.push({
        loc: `${base}/blog/${encodeURIComponent(row.slug)}`,
        changefreq: 'monthly',
        priority: '0.7',
        lastmod: row.updatedAt ? new Date(row.updatedAt).toISOString() : undefined,
      });
    });
    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls
        .map((u) => {
          const last = u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : '';
          return (
            `  <url><loc>${u.loc}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority>${last}</url>`
          );
        })
        .join('\n') +
      `\n</urlset>`;
    res.type('application/xml').send(xml);
  } catch (e) {
    next(e);
  }
});

app.get('/', (req, res) => {
  res.render('pages/home', {
    pageTitle: '12 — Luxury real estate & content',
    metaDescription:
      'Established real estate presence for 12: brand storytelling, curated listings, and insights for buyers and partners.',
  });
});

app.get('/about', (req, res) => {
  res.render('pages/about', {
    pageTitle: 'About — 12',
    metaDescription: 'Learn about 12, our market in 12, and how we serve both businesses and individuals.',
  });
});

app.get('/testimonials', async (req, res, next) => {
  try {
    const { Testimonial } = require('./models');
    const rows = await Testimonial.findAll({ order: [['sortOrder', 'ASC'], ['id', 'ASC']] });
    res.render('pages/testimonials', {
      pageTitle: 'Testimonials — 12',
      metaDescription: 'Client and partner feedback for 12 in luxury real estate across 12.',
      testimonials: rows.map((t) => t.get({ plain: true })),
    });
  } catch (e) {
    next(e);
  }
});

app.get('/blog', async (req, res, next) => {
  try {
    const { BlogPost, Op } = require('./models');
    const q = (req.query.q || '').toString().trim();
    const where = q
      ? {
          [Op.or]: [
            { title: { [Op.like]: `%${q}%` } },
            { excerpt: { [Op.like]: `%${q}%` } },
            { body: { [Op.like]: `%${q}%` } },
          ],
        }
      : {};
    const posts = await BlogPost.findAll({
      where,
      order: [['publishedAt', 'DESC']],
    });
    res.render('pages/blog-index', {
      pageTitle: q ? `Search: ${q} — 12` : 'Insights — 12',
      metaDescription: 'Articles and market notes from 12 — luxury real estate and logistics in 12.',
      posts: posts.map((p) => p.get({ plain: true })),
      searchQuery: q,
    });
  } catch (e) {
    next(e);
  }
});

app.get('/blog/:slug', async (req, res, next) => {
  try {
    const { BlogPost } = require('./models');
    const post = await BlogPost.findOne({ where: { slug: req.params.slug } });
    if (!post) {
      res.status(404).render('pages/404', { pageTitle: 'Not found — 12' });
      return;
    }
    const plain = post.get({ plain: true });
    res.render('pages/blog-post', {
      pageTitle: `${plain.title} — 12`,
      metaDescription: plain.excerpt || plain.title,
      post: plain,
    });
  } catch (e) {
    next(e);
  }
});

app.get('/contact', (req, res) => {
  res.render('pages/contact', {
    pageTitle: 'Contact — 12',
    metaDescription: 'Reach 12 for luxury real estate inquiries in 12. WhatsApp and form available.',
    sent: req.query.sent === '1',
    error: req.query.err === '1',
  });
});

app.post('/contact', async (req, res) => {
  const name = (req.body.name || '').toString().trim();
  const email = (req.body.email || '').toString().trim();
  const message = (req.body.message || '').toString().trim();
  if (!name || !email || !message) {
    return res.redirect('/contact?err=1');
  }
  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'autonix-order-1-contact',
          name,
          email,
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

app.get('/privacy', (req, res) => {
  res.render('pages/privacy', {
    pageTitle: 'Privacy — 12',
    metaDescription: 'Privacy policy for the 12 website.',
  });
});

app.get('/login', requireGuest, (req, res) => {
  res.render('pages/login', {
    pageTitle: 'Sign in — 12',
    metaDescription: 'Sign in to your 12 account.',
    error: null,
    nextUrl: (req.query.next || '/account').toString(),
  });
});

app.post('/login', authLimiter, requireGuest, async (req, res, next) => {
  try {
    const email = (req.body.email || '').toString().trim().toLowerCase();
    const password = (req.body.password || '').toString();
    const nextUrl = (req.body.next || '/account').toString();
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).render('pages/login', {
        pageTitle: 'Sign in — 12',
        metaDescription: 'Sign in to your 12 account.',
        error: 'Invalid email or password.',
        nextUrl,
      });
    }
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    return res.redirect(nextUrl.startsWith('/') ? nextUrl : '/account');
  } catch (e) {
    return next(e);
  }
});

app.get('/register', requireGuest, (req, res) => {
  res.render('pages/register', {
    pageTitle: 'Create account — 12',
    metaDescription: 'Create your 12 account.',
    error: null,
  });
});

app.post('/register', authLimiter, requireGuest, async (req, res, next) => {
  try {
    const email = (req.body.email || '').toString().trim().toLowerCase();
    const password = (req.body.password || '').toString();
    const confirm = (req.body.confirm || '').toString();
    if (!email || password.length < 8) {
      return res.status(400).render('pages/register', {
        pageTitle: 'Create account — 12',
        metaDescription: 'Create your 12 account.',
        error: 'Use a valid email and a password of at least 8 characters.',
      });
    }
    if (password !== confirm) {
      return res.status(400).render('pages/register', {
        pageTitle: 'Create account — 12',
        metaDescription: 'Create your 12 account.',
        error: 'Passwords do not match.',
      });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).render('pages/register', {
        pageTitle: 'Create account — 12',
        metaDescription: 'Create your 12 account.',
        error: 'An account with this email already exists.',
      });
    }
    const user = User.build({ email });
    await user.setPassword(password);
    await user.save();
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    return res.redirect('/account');
  } catch (e) {
    return next(e);
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.get('/account', requireUser, (req, res) => {
  res.render('pages/account', {
    pageTitle: 'Your account — 12',
    metaDescription: 'Manage your 12 account settings.',
  });
});

app.use((req, res) => {
  res.status(404).render('pages/404', { pageTitle: 'Not found — 12' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('pages/500', { pageTitle: 'Error — 12' });
});

async function start() {
  await sequelize.authenticate();
  const sync = process.env.SYNC_DB === 'true';
  if (sync) {
    await sequelize.sync({ alter: false });
  }
  await sessionStore.sync();

  app.listen(PORT, () => {
    console.log(`autonix-order-1 listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
