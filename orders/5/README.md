# Autonix Order #5 — Hippo

Standalone Express website for **Hippo**, a food restaurant with an e-commerce style online shop. Forest-inspired visual theme, five primary pages (home, menu, shop, about, contact), plus cart and checkout.

## Requirements

- Node.js **20+** (LTS)
- MySQL 8.x (or compatible) with a dedicated schema **`autonix_order_5`** — do not point this app at Autonix core or other client databases.

## Install

From this directory (`orders/5/`):

```bash
npm install
```

Copy environment template and edit values:

```bash
cp .env.example .env
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP port (required pattern: use `.env`; **do not** use forbidden ports: 80, 443, 2000, 3000, 4000, 5000, 7000, 8000, 9000, 5050, 6060, 6769, 6770, 2020, 4200). Dev preview often uses **3108**. |
| `NODE_ENV` | `development` or `production` |
| `ORDER_DB_HOST` | MySQL host (default `127.0.0.1`) |
| `ORDER_DB_PORT` | MySQL port (default `3306`) |
| `ORDER_DB_USER` | MySQL user |
| `ORDER_DB_PASSWORD` | MySQL password |
| `ORDER_DB_NAME` | Schema name — default **`autonix_order_5`** |
| `SESSION_SECRET` | Long random string for cookie sessions |
| `SYNC_DB` | Set to `true` only if you need Sequelize to create tables without running SQL deploys (prefer `sql/` migrations on server) |
| `SITE_URL` | Public base URL for canonical links (e.g. `http://183.82.156.69:3108` on dev) |
| `CLIENT_ASSETS_BASE` | Base path for uploaded client images (default `/uploads/website-client-assets/5`) |
| `CLIENT_LOGO_URL` | Optional full URL override for logo |
| `CLIENT_HERO_URL` | Optional full URL override for hero image |
| `GA_MEASUREMENT_ID` | Optional Google Analytics 4 ID |
| `WHATSAPP_NUMBER` | Optional digits-only international number for footer link |
| `CONTACT_WEBHOOK_URL` | Optional POST JSON on contact form submit |
| `CONTACT_EMAIL` | Optional public inbox shown on the contact page (mailto link) |
| `ORDER_WEBHOOK_URL` | Optional POST JSON on successful checkout |
| `PM2_APP_NAME` | `autonix-order-5-dev` (dev) or `autonix-order-5-main` (production) — see PM2 below |

Legacy aliases `DATABASE_*` are supported in `db.js` (same as other Autonix order apps).

## Database

Deploy runs SQL in order: `sql/*.sql`, then `sql/migrations/`, then `sql/production/` (alphabetically within each folder). This repo ships:

- `sql/001_init.sql` — creates schema `autonix_order_5` and tables (`leads`, `products`, `orders`, `order_items`)
- `sql/002_seed_products.sql` — idempotent product upserts for the demo menu / shop

Re-deploys re-run scripts: DDL uses `CREATE TABLE IF NOT EXISTS`; seeds use `ON DUPLICATE KEY UPDATE`.

## Run locally

```bash
npm start
```

Or with file watching:

```bash
npm run dev
```

## PM2

Use the ecosystem file in this folder. Set `PM2_APP_NAME` in `.env`:

- **Dev branch deploy:** `PM2_APP_NAME=autonix-order-5-dev`
- **Production (`main`):** `PM2_APP_NAME=autonix-order-5-main`

```bash
pm2 start ecosystem.config.cjs
pm2 save
```

Paths on Autonix servers after merge:

- Dev: `/home/xor/5-dev/orders/5/`
- Prod: `/home/xor/5-main/orders/5/`

Run PM2 from the matching `orders/5` directory so `cwd` resolves correctly.

## Health check

`GET /health` returns JSON:

```json
{"ok":true,"service":"autonix-order-5","time":"…"}
```

## Preview URL (dev)

Example dev deploy base: `http://183.82.156.69:3108` (set `PORT` and `SITE_URL` accordingly).

## Pages

| Path | Purpose |
|------|---------|
| `/` | Home — hero using client assets, intro |
| `/menu` | Full menu (grouped by category) |
| `/shop` | E-commerce listing with add-to-cart |
| `/shop/:slug` | Product detail |
| `/cart` | Cart |
| `/checkout` | Checkout (persists order to MySQL) |
| `/checkout/thanks` | Confirmation |
| `/about` | About Hippo |
| `/contact` | Contact form (stores `leads`) |

## Security

Do not commit real secrets. Use `.env` locally and keep `.env.example` updated for required variables only.

## Project owner (internal)

Order metadata (client name, workspace, package tier) is for Autonix delivery records — it is documented here rather than on the public contact page.

- **Client:** John Doe \<user@example.com\>
- **Workspace:** John's Workspace
- **Service:** Custom Website Creation · Medium · **$499**
