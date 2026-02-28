# CTC Vercel Full-Stack Test

Full-stack React (Vite) + Express app for testing **separate** Vercel deployments of client and server.

## Stack

- **Client**: React 18, Vite 5, Yarn
- **Server**: Express, Node 18+
- **Monorepo**: Yarn workspaces (`client`, `server`)

## Local development

```bash
yarn install
yarn dev
```

- Client: http://localhost:5173 (Vite proxy forwards `/api` to server)
- Server: http://localhost:3001

## Deploying to Vercel (separate projects)

**→ Full step-by-step guide: [DEPLOYMENT.md](./DEPLOYMENT.md)**

### 1. Deploy the server (do this first)

- **Vercel project**: e.g. `ctc-vercel-server`
- **Root directory**: set to `server`
- **Build**: none required (serverless functions)
- Note the deployed URL; the client will need `https://<that-url>/api`

### 2. Deploy the client

- **Vercel project**: e.g. `ctc-vercel-client`
- **Root directory**: `.` (repo root)
- **Build command**: `yarn install && yarn workspace client build`
- **Output directory**: `client/dist`
- **Environment variable**: `VITE_API_URL` = `https://<your-server-url>.vercel.app/api`
- Redeploy after setting env vars so the client gets the correct API URL at build time.

## Env and config

- **Root**: `.env.example` – copy to `.env` for local overrides.
- **Client**: `client/.env.example` → `client/.env.local`; only `VITE_*` vars are exposed to the client.
- **Server**: `server/.env.example` → `server/.env` for local; on Vercel use Project → Settings → Environment Variables.

## Optional: Postgres

If you add a Postgres DB later, set `DATABASE_URL` in the server project on Vercel (and in `server/.env` locally). The app is ready for you to add DB logic when needed.
