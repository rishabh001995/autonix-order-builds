# Autonix Order #2 — Porter

Standalone **Node.js** + **Express** site for **Porter**, a **delivery** industry brand with a **midnight neon** visual theme. MySQL schema: **`autonix_order_2`** only.

## Requirements

- **Node.js** LTS (v20+)
- **MySQL** with dedicated schema **`autonix_order_2`**

## Install

```bash
cd orders/2
cp .env.example .env
# Edit .env — set ORDER_DB_* and PORT
npm install
```

### Database

Create schema and the `leads` table:

```bash
mysql -u YOUR_USER -p < sql/001_init.sql
```

Alternatively, set `SYNC_DB=true` **once** in `.env` to let Sequelize create the `leads` table, then set it back to `false`.

## Environment variables

See **`.env.example`**. Do **not** commit `.env`.

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP port (example **3102** for dev preview — avoid forbidden ports below) |
| `ORDER_DB_HOST`, `ORDER_DB_USER`, `ORDER_DB_PASSWORD` | MySQL connection |
| `ORDER_DB_PORT` | MySQL port (default **3306**) |
| `ORDER_DB_NAME` | Must be **`autonix_order_2`** |
| `SYNC_DB` | `true` only for initial table creation if not using SQL migrations |
| `SESSION_SECRET` | Reserved for future use |
| `GA_MEASUREMENT_ID` | Google Analytics 4 (`G-…`) |
| `WHATSAPP_NUMBER` | Digits only, international |
| `CONTACT_WEBHOOK_URL` | Optional Zapier/Make webhook — contact form also **stores leads in MySQL** |
| `SITE_URL` | Canonical base URL (no trailing slash) |
| `PM2_APP_NAME` | **`autonix-order-2-dev`** (dev) or **`autonix-order-2-main`** (production) |

**Forbidden ports** (do not bind the app to): 80, 443, 2000, 3000, 4000, 5000, 7000, 8000, 9000, 5050, 6060, 6769, 6770, 2020, 4200.

Legacy `DATABASE_*` variables are still read by `db.js` if `ORDER_DB_*` is not set.

## Run

Development:

```bash
npm run dev
```

Production with **PM2** (`ecosystem.config.cjs`):

```bash
# In .env set PM2_APP_NAME=autonix-order-2-dev   (dev)
# or PM2_APP_NAME=autonix-order-2-main           (production)
pm2 start ecosystem.config.cjs
pm2 save
```

Deploy paths (Autonix): **`dev`** → `/home/xor/2-dev/orders/2/`, **`main`** → `/home/xor/2-main/orders/2/`.

Preview URL shape (dev): `http://183.82.156.69:3102` (or HTTPS if terminated upstream).

## Health check

**`GET /health`** returns JSON, e.g. `{ "ok": true, "service": "autonix-order-2", ... }`.

## Pages

- **Home** — `/`
- **Services** — `/services`
- **Contact** — `/contact` (stores leads in `leads`, optional webhook)

## SEO

- **`GET /sitemap.xml`** — Home, Services, Contact

---

*Autonix custom website order — repository path `orders/2/` only.*
