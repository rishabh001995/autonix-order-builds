# Landzer — Autonix order #7

Standalone **Node.js** website for **Landzer** (Real Estate): Express, EJS, MySQL (`autonix_order_7`), PM2. Deploy paths: dev clone at `/home/xor/7-dev/orders/7/`, production at `/home/xor/7-main/orders/7/` after merge.

## Requirements

- Node.js **20+** (LTS)
- MySQL 8.x (or compatible)
- PM2 (global): `npm install -g pm2`

## Install

```bash
cd orders/7
npm install
cp .env.example .env
# Edit .env — set PORT, DB credentials, SITE_URL, optional PM2_APP_NAME
```

Apply SQL (or rely on your deploy pipeline that runs `sql/`, then `sql/migrations/`, then `sql/production/` in order):

```bash
mysql -h 127.0.0.1 -u root -p < sql/001_init.sql
```

Optional one-time table sync if you are not applying migrations by hand:

```bash
SYNC_DB=true npm start
# Then set SYNC_DB=false again
```

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Listen port. **Do not** use: 80, 443, 2000, 3000, 4000, 5000, 7000, 8000, 9000, 5050, 6060, 6769, 6770, 2020, 4200. Dev preview often uses **3112**. |
| `ORDER_DB_HOST` | Yes* | MySQL host (default `127.0.0.1`) |
| `ORDER_DB_PORT` | No | MySQL port (default `3306`) |
| `ORDER_DB_USER` | Yes* | MySQL user |
| `ORDER_DB_PASSWORD` | Yes* | MySQL password (empty allowed locally) |
| `ORDER_DB_NAME` | Yes* | Schema name — must be **`autonix_order_7`** |
| `SITE_URL` | Recommended | Canonical base URL (e.g. `http://183.82.156.69:3112` for dev) |
| `SYNC_DB` | No | Set `true` only for local/dev if tables are missing |
| `CONTACT_WEBHOOK_URL` | No | POST JSON on contact form submit |
| `CONTACT_EMAIL` | No | Shown as mailto in footer when set |
| `GA_MEASUREMENT_ID` | No | Google Analytics 4 |
| `WHATSAPP_NUMBER` | No | Digits only for wa.me link |
| `CLIENT_ASSETS_BASE` | No | Default `/uploads/website-client-assets/7` |
| `CLIENT_LOGO_URL` | No | Logo image URL or path |
| `CLIENT_HERO_URL` | No | Hero image URL or path |
| `PM2_APP_NAME` | No | `autonix-order-7-dev` (dev) or `autonix-order-7-main` (production) |

\*Aliases: `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` work the same way.

**Secrets:** Do not commit `.env`. Copy from `.env.example` only.

## Run locally

```bash
npm start
# or
npm run dev
```

## Run with PM2

From `orders/7` (same directory as `ecosystem.config.cjs`):

```bash
# In .env:
# PM2_APP_NAME=autonix-order-7-dev   # dev branch deploy
# PM2_APP_NAME=autonix-order-7-main  # production

pm2 start ecosystem.config.cjs
pm2 save
```

## Health check

- **URL:** `GET /health`
- **Example:** `http://183.82.156.69:3112/health`

Returns JSON: `{ "ok": true, "service": "autonix-order-7", "time": "..." }`.

## Pages

1. **Home** (`/`) — hero, value proposition, process
2. **Listings** (`/listings`) — three featured properties (demo content; tours route to contact)
3. **Contact** (`/contact`) — form persisted to `leads` table; optional webhook

## Client metadata

- **Service:** Custom Website Creation  
- **Client:** John Doe &lt;user@example.com&gt;  
- **Workspace:** John’s Workspace  
- **Order total:** $149  
