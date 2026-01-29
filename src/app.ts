import express from "express";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.post("/whatsapp", (req, res) => {
  console.log("INCOMING /whatsapp:", req.body);
  res.sendStatus(200);
});

export default app;
