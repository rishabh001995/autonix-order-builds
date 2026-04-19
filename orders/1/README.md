# Autonix Order #1 — Stark Industries

Standalone Node.js + Express site for **Stark Industries** (“Connect People”): a dark, tech-forward **B2B landing page** for **physical products** with **USA** shipping, **lead generation**, and **Pricing** + **Contact** flows. Schema: **`autonix_order_1`** only.

## Requirements

- **Node.js** LTS (v20+)
- **MySQL** with dedicated schema **`autonix_order_1`**

## Install

```bash
cd orders/1
cp .env.example .env
# Edit .env — set ORDER_DB_* and PORT
npm install
```

### Database

Create schema and the `leads` table:

```bash
mysql -u YOUR_USER -p < sql/001_init.sql
```

If this database was created by an older order template (users, blog, sessions), run once:

```bash
mysql -u YOUR_USER -p < sql/003_migrate_legacy_schema.sql
```

Alternatively, set `SYNC_DB=true` **once** in `.env` to let Sequelize create the `leads` table, then set it back to `false`.

## Environment variables

See **`.env.example`**. Do **not** commit `.env`.

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP port (example **3100** — avoid forbidden ports listed below) |
| `ORDER_DB_HOST`, `ORDER_DB_USER`, `ORDER_DB_PASSWORD` | MySQL admin connection (on Autonix servers these align with `ORDER_MYSQL_ADMIN_*` unless overridden) |
| `ORDER_DB_PORT` | MySQL port (default **3306**) |
| `ORDER_DB_NAME` | Must be **`autonix_order_1`** |
| `SYNC_DB` | `true` only for initial table creation if not using SQL migrations |
| `SESSION_SECRET` | Reserved / optional for future features |
| `GA_MEASUREMENT_ID` | Google Analytics 4 (`G-…`) |
| `WHATSAPP_NUMBER` | Digits only, international |
| `CONTACT_WEBHOOK_URL` | Optional Zapier/Make webhook — contact form also **stores leads in MySQL** |
| `SITE_URL` | Canonical base URL (no trailing slash) |
| `PM2_APP_NAME` | e.g. **`autonix-order-1-dev`** (dev) or **`autonix-order-1-main`** (production) |

**Forbidden ports** (do not bind the app to): 80, 443, 2000, 3000, 4000, 5000, 7000, 8000, 9000, 5050, 6060, 6769, 6770, 2020, 4200.

Legacy `DATABASE_*` variables are still read by `db.js` if `ORDER_DB_*` is not set.

## Run

Development:

```bash
npm run dev
```

Production with **PM2** (`ecosystem.config.cjs`):

```bash
# In .env set PM2_APP_NAME=autonix-order-1-dev   (dev server)
# or PM2_APP_NAME=autonix-order-1-main          (production)
pm2 start ecosystem.config.cjs
pm2 save
```

Deploy paths (Autonix): **`dev`** → `/home/xor/1-dev/orders/1/`, **`main`** → `/home/xor/1-main/orders/1/`.

Preview URL shape (dev): `http://183.82.156.69:3100` (or HTTPS if terminated upstream).

## Health check

**`GET /health`** returns JSON, e.g. `{ "ok": true, "service": "autonix-order-1", ... }`.

## SEO

- **`GET /sitemap.xml`** — includes Home, Pricing, Contact
- Per-page `<title>`, meta description, canonical, and Open Graph tags (set `SITE_URL` for correct absolute URLs)

## Pages

- **Home** — `/`
- **Pricing** — `/pricing`
- **Contact** — `/contact` (stores leads in `leads`, optional webhook)

---

*Autonix custom website order — repository path `orders/1/` only.*
