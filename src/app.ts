import express from "express";
import whatsAppRoutes from "./routes/whatsappRoutes";
import googleOAuthRoutes from "./routes/googleOAuthRoutes";
import calendarRoutes from "./routes/calendarRoutes"

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/whatsapp", whatsAppRoutes);
app.use("/google", googleOAuthRoutes);
app.use("/calendar", calendarRoutes);
app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

export default app;
