import { Router } from "express";
import { getAvailabilityDayDebug, patchAvailabilityRange } from "../controller/calendarController"

const router = Router();

// PATCH /calendar/:businessId/days/:date/range
router.patch("/:businessId/days/:date/range", patchAvailabilityRange);
router.get("/:businessId/days/:date/debug", getAvailabilityDayDebug);
    


export default router;
