import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "https://ctc-vercel-testing-deploy-client.vercel.app" }));

app.get("/", (req, res) => {
 res.json({ message: "Hello World" });
});

if (process.env.NODE_ENV !== "production") {
 app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
 });
}

export default app;
