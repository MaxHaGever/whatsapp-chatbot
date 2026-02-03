import { verifyWebhook , handleWhatsappWebhook } from "../service/whatsappHandler";
import { Router } from "express";

const router = Router();

router.get("/webhook", verifyWebhook);
router.post("/webhook", handleWhatsappWebhook);

export default router;
