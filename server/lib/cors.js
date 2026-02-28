const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  /\.vercel\.app$/,
];

function getCorsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.some((o) =>
    typeof o === 'string' ? o === origin : o.test(origin)
  );
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export function withCors(handler) {
  return (req, res) => {
    const headers = getCorsHeaders(req.headers.origin || '');
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    return handler(req, res);
  };
}
