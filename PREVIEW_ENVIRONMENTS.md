# Preview Environments

This project runs two separate Vercel projects — **client** (`client/`) and **server** (`server/`) — from the same repo. This document explains how preview deployments are configured so client preview builds always call the right server.

---

## Goals

| Scenario | Client preview calls |
|----------|---------------------|
| PR touches `server/` files | Associated **server preview** deployment |
| PR touches `client/` files only | **Production server** (`ctc-vercel-testing-deploy-server.vercel.app`) |

---

## How It Works

### Layer 1 — Vercel-native URL construction (fallback / always active)

`client/vercel.json` uses a build command that calls `scripts/get-server-url.sh` to resolve `VITE_API_URL` at build time:

```
VITE_API_URL=$(sh scripts/get-server-url.sh) yarn build
```

The script (`client/scripts/get-server-url.sh`) resolves the URL in priority order:

1. **`$VITE_API_URL` already set** (e.g., exported by GitHub Actions) → use it as-is.
2. **`VERCEL_ENV=production`** → use the production server URL.
3. **`VERCEL_ENV=preview` + `VERCEL_BRANCH_URL` available** → derive the server preview URL by swapping the client project name prefix for the server project name in the branch URL.

   Vercel branch URLs follow this pattern (no `https://` prefix):
   ```
   ctc-vercel-testing-deploy-client-git-{branch}-{scope}.vercel.app
   ```
   The script swaps `ctc-vercel-testing-deploy-client` → `ctc-vercel-testing-deploy-server`, producing:
   ```
   https://ctc-vercel-testing-deploy-server-git-{branch}-{scope}.vercel.app
   ```

4. **Fallback** → `http://localhost:3001` (local dev).

**Limitation of the Vercel-native approach alone:** Both projects always build on every PR push, even for client-only changes. The server preview URL is always constructed and used. If the server hasn't deployed yet (race condition on first push), the client preview may momentarily fail until both builds finish.

---

### Layer 2 — GitHub Actions workflow (recommended / full control)

`.github/workflows/preview-deploy.yml` provides precise control:

1. **Detect changed paths** — compares base and head SHAs to determine if `server/` files changed.
2. **Server-changed path:**
   - Deploys the server preview via Vercel CLI.
   - Sets `VITE_API_URL` = the server preview URL.
3. **Client-only path:**
   - Skips server deployment.
   - Sets `VITE_API_URL` = production server URL.
4. Deploys the client preview with the resolved `VITE_API_URL`.
5. Posts a comment on the PR with both preview URLs.

The `VITE_API_URL` exported in the GitHub Actions environment is picked up by `get-server-url.sh` (priority 1), so the Vercel-native script and the GitHub Actions workflow work in concert — no duplication.

---

## Required Setup

### 1. GitHub Secrets

Add these in **GitHub repo → Settings → Secrets and variables → Actions**:

| Secret | Where to find it |
|--------|-----------------|
| `VERCEL_TOKEN` | Vercel dashboard → Account Settings → Tokens |
| `VERCEL_ORG_ID` | `.vercel/project.json` after `vercel link`, or Vercel dashboard → Team Settings |
| `VERCEL_CLIENT_PROJECT_ID` | `.vercel/project.json` inside the `client/` dir after `cd client && vercel link` |
| `VERCEL_SERVER_PROJECT_ID` | `.vercel/project.json` inside the `server/` dir after `cd server && vercel link` |

### 2. Vercel Project Settings — Ignored Build Step

To let GitHub Actions own preview deployments (avoiding duplicate builds), configure each project's **Ignored Build Step** to skip automatic preview builds while keeping production builds automatic.

**In each project's Vercel dashboard → Settings → Git → Ignored Build Step**, enter:

```sh
[ "$VERCEL_ENV" != "production" ]
```

- Exit code `0` → Vercel **skips** the build.
- Exit code `1` (non-zero) → Vercel **runs** the build.

This command exits `0` (skip) for preview and development environments, and exits `1` (run) for production — so pushes to `main` still auto-deploy while PRs are handled by GitHub Actions.

### 3. Environment Variables in Vercel Dashboard

For the **client project**, set under **Settings → Environment Variables**:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_API_URL` | `https://ctc-vercel-testing-deploy-server.vercel.app` | Production |

Preview `VITE_API_URL` is set dynamically by GitHub Actions (or the build script fallback), so it does **not** need to be configured in the dashboard.

---

## CORS

`server/server.js` accepts requests from:

- `http://localhost:5173` and `http://localhost:3000` (local dev)
- `https://ctc-vercel-testing-deploy-client.vercel.app` (production client)
- Any URL matching `^https://ctc-vercel-testing-deploy-client(-[a-z0-9-]+)?\.vercel\.app$` (preview deployments)

No changes needed in the server when adding new preview branches.

---

## Local Development

Nothing changes for local dev. `client/.env` (gitignored) can set:

```
VITE_API_URL=http://localhost:3001
```

The `get-server-url.sh` script falls back to `http://localhost:3001` when no Vercel env vars are present.

---

## Sequence Diagram

```
PR opened / pushed
       │
       ├── server/ changed? ──yes──► Deploy server preview
       │                                      │
       │                              Server preview URL
       │                                      │
       └── client-only? ─────────────► Use prod server URL
                                               │
                                    Deploy client preview
                                    with VITE_API_URL set
                                               │
                                    Post PR comment with URLs
```
