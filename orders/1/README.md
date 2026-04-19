# Autonix Order #1 — 12 (Real Estate)

Standalone Node.js website for client **John Doe** — luxury real estate and content site for **12**, region **12**, serving B2B and B2C audiences with authentication, blog search, testimonials, and integration hooks (Google Analytics, WhatsApp, Zapier/Make).

## Requirements

- **Node.js** LTS (v20+)
- **MySQL** with dedicated schema **`autonix_order_1`** only

## Install

```bash
cd orders/1
cp .env.example .env
# Edit .env — set DATABASE_* and SESSION_SECRET
npm install
```

### Database

Create the schema and tables (recommended):

```bash
mysql -u YOUR_USER -p < sql/001_init.sql
mysql -u YOUR_USER -p < sql/002_seed.sql
```

Alternatively, after `001_init.sql`, set `SYNC_DB=true` once in `.env` to let Sequelize create tables from models, then set it back to `false`.

## Environment variables

See **`.env.example`** for all variables. Important:

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP port (default **3100** in example) |
| `DATABASE_*` | MySQL connection — database name must be **`autonix_order_1`** |
| `SESSION_SECRET` | Random string for signed cookies (required in production) |
| `SYNC_DB` | `true` only for initial table creation if not using SQL migrations |
| `GA_MEASUREMENT_ID` | Google Analytics 4 ID (`G-…`) |
| `WHATSAPP_NUMBER` | Digits only, international (e.g. `15551234567`) |
| `CONTACT_WEBHOOK_URL` | Optional Zapier/Make webhook — contact form POSTs JSON |
| `SITE_URL` | Canonical base URL (no trailing slash) |

Do **not** commit `.env`; only `.env.example` belongs in git.

## Run

Development:

```bash
npm run dev
```

Production with **PM2** (ecosystem file: `ecosystem.config.cjs`, app name **`autonix-order-1`**):

```bash
pm2 start ecosystem.config.cjs
pm2 save
```

Ensure `PORT=3100` (or your chosen allowed port) is set in `.env`.

## Health check

After deploy: **`GET /health`** — returns JSON `{ "ok": true, "service": "autonix-order-1", ... }`.

Example: `http://YOUR_HOST:3100/health`

## Site map & SEO

- **`GET /sitemap.xml`** — dynamic sitemap (set `SITE_URL` for correct absolute URLs).
- Meta descriptions and canonical URLs are set per page; GA loads when `GA_MEASUREMENT_ID` is set.

## Pages

- Home, About, Insights (blog with search), Testimonials, Contact, Privacy
- Login, Register, Account (session-based auth)

---

*Autonix custom website order — repository path `orders/1/` only.*
