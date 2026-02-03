import { Router } from "express";
import { patchAvailabilityRange } from "../controller/calendarController"

const router = Router();

// PATCH /calendar/:businessId/days/:date/range
router.patch("/:businessId/days/:date/range", patchAvailabilityRange);

export default router;
