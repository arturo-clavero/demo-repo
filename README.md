# Shopfloor

A small storefront: an Express web app and JSON API (Node.js, Sequelize on MySQL) for the catalogue, cart, checkout and admin screens, plus a Python worker (Flask) that builds CSV/ZIP exports and imports supplier catalogues.

> **Demo fixture.** This repository is used to showcase rule-based static analysis in 16signals. The Node app is in decent shape; the Python worker still has known security problems (it is the part of the codebase that was never reviewed). Do not deploy it.

## Layout

| Path | What |
|---|---|
| `app.js`, `server.js` | Express app factory and process entrypoint |
| `routes/` | HTML routes (`/login`, `/app/...`) and the JSON API (`/api/cart`, `/api/orders`, `/api/addresses`, `/api/exports`, `/api/stats`) |
| `services/` | Business logic: accounts, password reset, catalogue, cart, checkout, coupons, inventory, shipping, audit log |
| `models/` | Sequelize models |
| `lib/`, `middleware/` | Validation, money and date helpers, tokens, rate limiting, error handling, security headers |
| `test/` | Unit tests (`npm test`, Node's built-in test runner) |
| `worker/` | Python reports worker (`pip install -r worker/requirements-dev.txt && pytest worker/tests`) |
| `scripts/` | Container entrypoint, database backup, local seed data |
| `views/` | EJS templates |

## Running it

Create `vars.env`:

```bash
MYSQL_USER=shopfloor
MYSQL_DATABASE=shopfloor
MYSQL_PASSWORD=change-me
MYSQL_RANDOM_ROOT_PASSWORD=yes
MYSQL_HOST=mysql-db
MYSQL_PORT=3306
SESSION_SECRET=a-long-random-string
WORKER_API_KEY=another-long-random-string
WORKER_URL=http://worker:8000
```

Then `docker compose up`, and once: `docker compose exec -e SEED_PASSWORD=... app node scripts/seed.js`. The shop is on <http://localhost:9090>.

## Credits

The project started from [appsecco/dvna](https://github.com/appsecco/dvna) (MIT, see `LICENSE`). The Node application has since been rewritten; the EJS templates still carry DVNA's markup.
