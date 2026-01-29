import { verifyWebhook } from "../service/whatsappHandler";
import { Router } from "express";

const router = Router();

router.get("/webhook", verifyWebhook);

export default router;
