# Vercel Deployment Guide

This app uses **two separate Vercel projects**: one for the React client and one for the Express API server.

---

## Prerequisites

- [Vercel account](https://vercel.com/signup)
- Repo connected to Vercel (GitHub/GitLab/Bitbucket), or use Vercel CLI
- Yarn installed locally (for `yarn build`)

---

## Step 1: Deploy the server first

You need the server URL before deploying the client so you can set `VITE_API_URL`.

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. Import your repo and create the project.
3. **Important**: In project settings, set **Root Directory** to `server`.
   - Click the repo name → **Settings** → **General** → **Root Directory** → set to `server` → Save.
4. **Build & Development**:
   - **Build Command**: leave empty (or `echo 'No build'`).
   - **Output Directory**: leave empty.
   - **Install Command**: `yarn install` (or leave default).
5. Add **Environment Variables** if needed (e.g. `DATABASE_URL` later). None required for the basic `/api/health` and `/api/hello` routes.
6. Click **Deploy**.
7. After deploy, note the project URL, e.g. `https://ctc-vercel-server-xxx.vercel.app`. Your API base URL is that + `/api`, e.g. `https://ctc-vercel-server-xxx.vercel.app/api`.

### Option B: Deploy via Vercel CLI

```bash
cd server
vercel
```

When prompted:

- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No
- **Project name?** e.g. `ctc-vercel-server`
- **In which directory is your code?** `./` (you're already in `server`)

Then:

```bash
vercel --prod
```

Copy the production URL (e.g. `https://ctc-vercel-server-xxx.vercel.app`). Your API base URL is **`<that-url>/api`**.

### Verify the server

- `https://<your-server-url>.vercel.app/api/health` → `{"status":"ok","message":"Server is running"}`
- `https://<your-server-url>.vercel.app/api/hello` → `{"message":"Hello from the server!"}`

---

## Step 2: Deploy the client

The client must know the server URL at **build time** (Vite inlines `import.meta.env.VITE_API_URL`).

Choose **one** of these setups:

### Option A: Client as root (recommended – uses `client/vercel.json`)

1. **Add New** → **Project** and import the **same repo**.
2. **Root Directory**: set to **`client`**.
3. **Build & Development**: leave defaults (or override if needed):
   - **Build Command**: `yarn install && yarn build`
   - **Output Directory**: `dist`
   - **Install Command**: `yarn install`
4. **Environment Variables** (required for production):
   - Name: `VITE_API_URL`  
   - Value: `https://<your-server-url>.vercel.app/api`
5. **Deploy**.

### Option B: Repo root (uses root `vercel.json`)

1. **Add New** → **Project** and import the **same repo**.
2. **Root Directory**: leave as **.** (repo root).
3. **Build & Development**:
   - **Build Command**: `yarn install && yarn workspace client build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `yarn install`
4. **Environment Variables** (required for production):
   - Name: `VITE_API_URL`  
   - Value: `https://<your-server-url>.vercel.app/api`  
   (Use the URL from Step 1, e.g. `https://ctc-vercel-server-xxx.vercel.app/api`.)
5. **Deploy**.

### Option C: Deploy via Vercel CLI (from repo root)

```bash
cd /path/to/ctc-vercel-testing-deployment
vercel
```

- **Link to existing project?** No
- **Project name?** e.g. `ctc-vercel-client`

Then set the env var and deploy to production:

```bash
vercel env add VITE_API_URL production
# Enter value: https://<your-server-url>.vercel.app/api

vercel --prod
```

If the project already exists and you only need to set the env var:

1. **Vercel Dashboard** → your client project → **Settings** → **Environment Variables**.
2. Add `VITE_API_URL` = `https://<your-server-url>.vercel.app/api` for **Production** (and optionally Preview/Development).
3. Trigger a new deploy (e.g. **Deployments** → **Redeploy**).

### Verify the client

Open the client URL (e.g. `https://ctc-vercel-client-xxx.vercel.app`). You should see **"CTC Vercel Deployment Test"** and the message from the server: **"Hello from the server!"**.

---

## Summary

| Project | Root Directory | Build Command | Output Directory | Env |
|--------|----------------|---------------|------------------|-----|
| **Server** | `server` | (none) | — | Optional: `DATABASE_URL` |
| **Client** | `client` (recommended) | `yarn install && yarn build` | `dist` | `VITE_API_URL` = server API URL |
| **Client** | `.` (repo root) | `yarn install && yarn workspace client build` | `client/dist` | `VITE_API_URL` = server API URL |

---

## Troubleshooting

- **No Output Directory named "dist" found**  
  You have **Root Directory** set to `client`. Then the output directory must be **`dist`** (not `client/dist`). In **Project Settings** → **General** → **Output Directory**, set to `dist`. The repo’s `client/vercel.json` already sets this. Redeploy after fixing.

- **Build fails: `cd client && yarn install && yarn build` exited with 1**  
  Use the workspace-aware build command: `yarn install && yarn workspace client build` only when **Root Directory** is `.` (repo root). If Root Directory is `client`, use `yarn install && yarn build` and Output Directory `dist`.

- **Client shows "Error" or wrong API URL**  
  - Ensure `VITE_API_URL` is set in the **client** Vercel project and that it ends with `/api` (no trailing slash).  
  - Redeploy the client after changing env vars (Vite bakes env into the build).

- **CORS errors in browser**  
  - The server doesn’t set CORS headers. If you need to allow the client origin, add a CORS middleware in `server/server.js` (e.g. `cors` package) and deploy the server again.

- **Server 404 on /api/hello**  
  - Confirm Root Directory of the server project is `server` so that `server/api/*.js` are the serverless functions.

- **Build fails: "Cannot find module 'react'"**  
  - Ensure **Install Command** runs from repo root so workspaces are installed: e.g. `yarn install` at root, then Build Command is `cd client && yarn build`.
