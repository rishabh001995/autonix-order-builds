# Deliveru — Autonix order #4

Standalone Express site for **Deliveru** (grocery delivery): mono minimal UI, single-page storefront with product detail URLs, cart, checkout, and MySQL persistence in schema **`autonix_order_4`**.

## Requirements

- Node.js **20+** (LTS)
- MySQL 8+ (dedicated database for this order only)

## Install

```bash
cd orders/4
npm install
```

## Database

Create tables and seed products (adjust connection flags for your environment):

```bash
mysql -h 127.0.0.1 -u root -p < sql/001_init.sql
mysql -h 127.0.0.1 -u root -p < sql/002_seed_products.sql
```

Alternatively, set `SYNC_DB=true` **once** in `.env` to let Sequelize create tables from models (you still need the schema and seed data for a realistic shop).

## Environment variables

Copy `.env.example` to `.env` and edit:

| Variable | Purpose |
|----------|---------|
| `PORT` | HTTP port (**required**). Do **not** use: 80, 443, 2000, 3000, 4000, 5000, 7000, 8000, 9000, 5050, 6060, 6769, 6770, 2020, 4200. Dev preview often uses **3106** (see deploy note below). |
| `NODE_ENV` | `development` or `production` |
| `ORDER_DB_HOST`, `ORDER_DB_PORT`, `ORDER_DB_USER`, `ORDER_DB_PASSWORD`, `ORDER_DB_NAME` | MySQL connection. **`ORDER_DB_NAME` must be `autonix_order_4`** |
| `SESSION_SECRET` | Long random string for cookie sessions (cart) |
| `SYNC_DB` | Optional: `true` once to sync models to DB if not using SQL files |
| `SITE_URL` | Canonical base URL (no trailing slash), e.g. `http://183.82.156.69:3106` |
| `GA_MEASUREMENT_ID` | Optional Google Analytics 4 ID |
| `WHATSAPP_NUMBER` | Optional digits-only number for wa.me links |
| `CONTACT_WEBHOOK_URL` | Optional POST URL for contact form JSON |
| `ORDER_WEBHOOK_URL` | Optional POST URL for successful checkout JSON |
| `PM2_APP_NAME` | `autonix-order-4-dev` (dev) or `autonix-order-4-main` (production) |

Legacy aliases `DATABASE_*` are supported (see `.env.example`).

Do **not** commit real secrets; keep them in `.env` on the server.

## Run locally

```bash
npm start
# or
npm run dev
```

## PM2

Set `PM2_APP_NAME` in `.env` (`autonix-order-4-dev` on branch `dev`, `autonix-order-4-main` on production), then:

```bash
pm2 start ecosystem.config.cjs
pm2 save
```

The ecosystem file loads `.env` from this directory (`cwd` is `orders/4`).

## Deploy paths

Autonix clones:

- **`dev`** → `/home/xor/4-dev/orders/4/`
- **`main`** → `/home/xor/4-main/orders/4/`

Use the same relative layout and env vars in both environments; only `PORT`, `SITE_URL`, `PM2_APP_NAME`, and DB credentials may differ.

## Health check

After the app is listening:

- **`GET /health`** — JSON: `{ "ok": true, "service": "autonix-order-4", "time": "..." }`

Example (dev preview): `http://183.82.156.69:3106/health`

## Project metadata

- **Client:** John Doe — Custom Website Creation — John’s Workspace  
- **Package:** Medium + E-Commerce  
- **Order total:** $387  
