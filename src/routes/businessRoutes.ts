import { patchBusinessWelcome } from "../controller/businessController";
import { Router } from "express";

const router = Router();

router.patch("/:phoneId/welcome", patchBusinessWelcome);

export default router;