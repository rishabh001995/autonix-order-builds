# Autonix Order #3 — BC Coffee

Standalone Express website for **BC Coffee** (forest visual theme, **Medium** package with **E-Commerce**). Listens on `process.env.PORT` and uses MySQL schema **`autonix_order_3`** only.

## Requirements

- Node.js **20+** (LTS)
- MySQL 8.x (or compatible)
- PM2 (for production-style process management)

## Install

```bash
cd orders/3
cp .env.example .env
# Edit .env: PORT, database credentials, SESSION_SECRET (use a long random string in production)
npm install
```

### Database setup

Create the schema and tables, then seed demo products:

```bash
mysql -h 127.0.0.1 -u root -p < sql/001_init.sql
mysql -h 127.0.0.1 -u root -p < sql/002_seed_products.sql
```

Alternatively, set `SYNC_DB=true` **once** in `.env` if you prefer Sequelize to create tables from models (you should still run `001_init.sql` for the canonical schema, or rely on sync only in empty dev databases).

## Environment variables

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP port (required; must **not** be one of: 80, 443, 2000, 3000, 4000, 5000, 7000, 8000, 9000, 5050, 6060, 6769, 6770, 2020, 4200). Dev preview often uses **3104**. |
| `NODE_ENV` | `development` or `production` |
| `ORDER_DB_HOST`, `ORDER_DB_PORT`, `ORDER_DB_USER`, `ORDER_DB_PASSWORD`, `ORDER_DB_NAME` | MySQL connection (`ORDER_DB_NAME` defaults to `autonix_order_3`) |
| `SESSION_SECRET` | Secret for signed session cookies (cart). **Change in production.** |
| `SYNC_DB` | Set `true` once to sync models to DB (optional) |
| `SITE_URL` | Canonical base URL (e.g. `http://183.82.156.69:3104` for dev) |
| `GA_MEASUREMENT_ID` | Optional Google Analytics 4 ID |
| `WHATSAPP_NUMBER` | Optional; digits only, international format |
| `CONTACT_WEBHOOK_URL` | Optional; POST JSON on contact form submit |
| `ORDER_WEBHOOK_URL` | Optional; POST JSON on successful checkout |
| `PM2_APP_NAME` | `autonix-order-3-dev` (dev) or `autonix-order-3-main` (production) |

Do **not** commit real secrets. Use `.env` locally and keep `.env.example` updated for required keys.

## Run locally

```bash
npm start
# or
npm run dev
```

## Run with PM2

From `orders/3` after configuring `.env`:

```bash
# Dev deploy example
export PM2_APP_NAME=autonix-order-3-dev
pm2 start ecosystem.config.cjs

# Production example
export PM2_APP_NAME=autonix-order-3-main
pm2 start ecosystem.config.cjs
```

Autonix clones **`dev`** to `/home/xor/3-dev/orders/3/` and **`main`** to `/home/xor/3-main/orders/3/`. Use the same relative layout and env patterns in both paths.

## Health check

- **URL:** `GET /health`
- **Example:** `http://183.82.156.69:3104/health` (dev preview shape)

Returns JSON: `{ "ok": true, "service": "autonix-order-3", "time": "..." }`.

## Site map (5 pages + shop flow)

- `/` — Home  
- `/our-coffee` — Roasting & brewing story  
- `/shop`, `/shop/:slug` — E-commerce catalog and product detail  
- `/cart`, `/checkout`, `/checkout/thanks` — Cart and order capture (orders stored in MySQL; no live payment gateway in this build)  
- `/contact` — Lead form  

## License / scope

This directory is scoped to **order #3** only. Do not point it at other Autonix or client databases.
