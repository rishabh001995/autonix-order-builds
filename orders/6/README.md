# Autonix order #6 — Hippo Resto

Standalone Node.js website for **Hippo Resto**: a forest-themed **restaurant e-commerce** experience (Express, EJS, MySQL via Sequelize). Public navigation is three pages — **Home**, **Shop**, and **Contact** — with cart and checkout under `/cart`, `/checkout`, and `/checkout/thanks`.

## Requirements

- Node.js **20+** (LTS)
- MySQL 8.x (or compatible) with a dedicated schema **`autonix_order_6`**

## Install

```bash
cd orders/6
npm install
```

Copy environment defaults and edit as needed:

```bash
cp .env.example .env
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP port the app listens on. **Do not** use: 80, 443, 2000, 3000, 4000, 5000, 7000, 8000, 9000, 5050, 6060, 6769, 6770, 2020, 4200. Default in `.env.example`: **3110** (matches dev preview `http://183.82.156.69:3110`). |
| `NODE_ENV` | `development` or `production` |
| `ORDER_DB_HOST`, `ORDER_DB_PORT`, `ORDER_DB_USER`, `ORDER_DB_PASSWORD`, `ORDER_DB_NAME` | MySQL connection. **`ORDER_DB_NAME` must be `autonix_order_6`** on deploy. Aliases `DATABASE_*` are also supported. |
| `SESSION_SECRET` | Long random string for signed session cookies |
| `SYNC_DB` | Set to `true` only for local rescue if tables are missing and SQL migrations were not applied (prefer `sql/*.sql` on deploy) |
| `SITE_URL` | Canonical base URL (SEO, OG). Example: `http://183.82.156.69:3110` |
| `GA_MEASUREMENT_ID` | Optional Google Analytics 4 ID |
| `WHATSAPP_NUMBER` | Optional WhatsApp link (digits only, international format) |
| `CONTACT_EMAIL` | Optional public mailto on contact page |
| `CONTACT_WEBHOOK_URL` | Optional POST JSON on contact form submit |
| `ORDER_WEBHOOK_URL` | Optional POST JSON on successful checkout |
| `CLIENT_ASSETS_BASE`, `CLIENT_LOGO_URL`, `CLIENT_HERO_URL` | Override client image paths (defaults match Autonix uploads for order #6) |
| `PM2_APP_NAME` | `autonix-order-6-dev` (dev) or `autonix-order-6-main` (production) — see PM2 below |

Do **not** commit real secrets; use `.env` locally and keep `.env.example` updated.

## Database

Deploy runs SQL in order: `sql/`, then `sql/migrations/`, then `sql/production/` (alphabetically per folder). This order ships:

- `sql/001_init.sql` — creates schema `autonix_order_6` and tables (`leads`, `products`, `orders`, `order_items`)
- `sql/002_seed_products.sql` — idempotent product upserts

## Run locally

```bash
npm start
```

Or with file watching:

```bash
npm run dev
```

Ensure MySQL is running and credentials in `.env` match your instance.

## PM2

From `orders/6/`:

```bash
# Dev branch deploy example — set in .env on the server:
# PM2_APP_NAME=autonix-order-6-dev
pm2 start ecosystem.config.cjs
pm2 save
```

For production (`main`):

```bash
# PM2_APP_NAME=autonix-order-6-main
pm2 start ecosystem.config.cjs
```

Paths on Autonix servers after clone: **`/home/xor/6-dev/orders/6/`** (dev) and **`/home/xor/6-main/orders/6/`** (main). Run PM2 with `cwd` set to that directory (the ecosystem file uses `__dirname`).

## Health check

```http
GET /health
```

Returns JSON: `{ "ok": true, "service": "autonix-order-6", "time": "..." }`.

## Client assets

Uploaded assets for this order live under `/uploads/website-client-assets/6/` (hero and logo). Override with `CLIENT_HERO_URL` / `CLIENT_LOGO_URL` if your reverse proxy serves them elsewhere.
