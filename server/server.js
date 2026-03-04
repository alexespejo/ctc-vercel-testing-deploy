import express from "express";

const app = express();
const PORT = process.env.PORT || 3001;

app.get("/", (req, res) => {
 res.json({ message: "Hello World" });
});

if (process.env.NODE_ENV !== "production") {
 app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
 });
}

export default app;
