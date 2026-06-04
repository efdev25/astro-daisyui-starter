# astro-daisyui-starter

Starter template for Astro with Cloudflare Workers, DaisyUI, Svelte Islands, Drizzle ORM, and Zod.

## Stack

- [Astro](https://astro.build/) — SSR framework
- [Cloudflare Workers](https://workers.cloudflare.com/) — runtime and deployment target
- [Svelte 5](https://svelte.dev/) — interactive islands
- [Tailwind CSS v4](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/) — styling
- [Drizzle ORM](https://orm.drizzle.team/) + [Cloudflare D1](https://developers.cloudflare.com/d1/) — database
- [Zod](https://zod.dev/) — schema validation

## Features

- Dark/light theme switcher (persisted to `localStorage`)
- REST API routes with Drizzle + Zod validation (`GET`, `POST`, `PATCH`, `DELETE`)
- Svelte Island with full CRUD UI and inline edit form

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Create a D1 database

```bash
npx wrangler d1 create prova-db
```

Copy the `database_id` from the output and update `wrangler.jsonc`:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "prova-db",
    "database_id": "YOUR_DATABASE_ID"
  }
]
```

### 3. Generate Cloudflare types

```bash
npm run generate-types
```

### 4. Run migrations

```bash
npx drizzle-kit generate
npx wrangler d1 migrations apply prova-db --local
```

### 5. Start the dev server

```bash
npm run dev
```

## Deploy

### Manual

```bash
npm run build
npx wrangler d1 migrations apply prova-db --remote
npx wrangler deploy
```

### GitHub Actions (CI/CD)

The workflow in `.github/workflows/deploy.yml` deploys automatically on every push to `main`.

Add these two secrets in **Settings → Secrets and variables → Actions**:

| Secret | Where to find it |
|--------|-----------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Dashboard → My Profile → API Tokens → Create Token (*Edit Cloudflare Workers* template) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard → sidebar (Account ID) |

## Project structure

```
src/
├── components/
│   ├── Counter.svelte       # Island with CRUD UI
│   └── ThemeToggle.svelte   # Dark/light switcher
├── db/
│   ├── schema.ts            # Drizzle schema
│   └── index.ts             # createDb helper
├── layouts/
│   └── Layout.astro         # Base layout
├── lib/
│   └── validators.ts        # Zod schemas
├── pages/
│   ├── index.astro
│   └── api/users/
│       ├── index.ts         # GET /api/users, POST /api/users
│       └── [id].ts          # GET, PATCH, DELETE /api/users/:id
└── styles/
    └── global.css
```
