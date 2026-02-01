import { Router } from "express";
import {
  googleOAuthStart,
  googleOAuthCallback,
  googleStatus,
  googleDisconnect,
} from "../controller/googleOAuthController";

const router = Router();

router.get("/oauth/start", googleOAuthStart);
router.get("/oauth/callback", googleOAuthCallback);
router.get("/status", googleStatus);
router.post("/disconnect", googleDisconnect);

export default router;
