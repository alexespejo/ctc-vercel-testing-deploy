import express from "express";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

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
