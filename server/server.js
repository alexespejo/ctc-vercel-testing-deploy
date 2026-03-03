import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
 cors({
  origin: [
   "http://localhost:5173",
   "http://localhost:3000",
   "https://ctc-vercel-testing-deploy-client.vercel.app/",
  ],
 }),
);
app.use(express.json());

app.get("/", (req, res) => {
 res.json({ message: "Hello from the server CTC test!" });
});
app.get("/api/health", (req, res) => {
 res.json({ status: "ok", message: "Server is running" });
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
