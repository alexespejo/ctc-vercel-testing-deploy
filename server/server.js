import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

// Allow localhost in dev, the production client URL, and any Vercel preview
// deployment of the client (pattern: ctc-vercel-testing-deploy-client-git-*-*.vercel.app)
const CORS_ORIGINS = [
 "http://localhost:5173",
 "http://localhost:3000",
 /^https:\/\/ctc-vercel-testing-deploy-client(-[a-z0-9-]+)?\.vercel\.app$/,
];

app.use(cors({ origin: CORS_ORIGINS }));

app.get("/", (req, res) => {
 res.json({ message: "Server only change" });
});

app.get("/api/hello", (req, res) => {
 res.json({ message: "Hello from the server CTC test!" });
});

if (process.env.NODE_ENV !== "production") {
 app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
 });
}

export default app;
