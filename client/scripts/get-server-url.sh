#!/bin/sh
# Determines the correct VITE_API_URL for the current build context.
#
# Priority:
#   1. $VITE_API_URL already set (e.g., injected by GitHub Actions) → echo it back.
#   2. VERCEL_ENV=production → use the production server URL.
#   3. VERCEL_ENV=preview + VERCEL_BRANCH_URL set → derive the server preview URL
#      by swapping the client project name for the server project name in the
#      branch URL. Vercel branch URLs follow the pattern:
#        {project}-git-{sanitized-branch}-{scope}.vercel.app
#      so swapping the prefix gives the paired server preview deployment URL.
#   4. Fallback → localhost for local development.

CLIENT_PROJECT="ctc-vercel-testing-deploy-client"
SERVER_PROJECT="ctc-vercel-testing-deploy-server"
PROD_URL="https://ctc-vercel-testing-deploy-server.vercel.app"

if [ -n "$VITE_API_URL" ]; then
  # Already set externally (GitHub Actions passes the correct URL this way).
  echo "$VITE_API_URL"
elif [ "$VERCEL_ENV" = "production" ]; then
  echo "$PROD_URL"
elif [ "$VERCEL_ENV" = "preview" ] && [ -n "$VERCEL_BRANCH_URL" ]; then
  # VERCEL_BRANCH_URL has no scheme, e.g.:
  #   ctc-vercel-testing-deploy-client-git-my-branch-abc123.vercel.app
  # Swap the client project prefix for the server project prefix.
  echo "https://$(echo "$VERCEL_BRANCH_URL" | sed "s/^$CLIENT_PROJECT/$SERVER_PROJECT/")"
else
  echo "http://localhost:3001"
fi
