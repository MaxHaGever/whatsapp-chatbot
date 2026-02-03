import { Request, Response } from "express";
import { Types } from "mongoose";
import { setAvailabilityRange } from "../service/availabilityService";
import { ensureAvailabilityDays } from "../service/availabilityDaysService";
import AvailabilityDay from "../models/AvailabilityDay";
import { getBit } from "../utils/bitset";

export async function patchAvailabilityRange(req: Request, res: Response) {
  try {
    // --- businessId param (string | string[] -> string) ---
    const businessIdParam = req.params.businessId;
    const businessIdStr = Array.isArray(businessIdParam)
      ? businessIdParam[0]
      : businessIdParam;

    if (typeof businessIdStr !== "string" || !Types.ObjectId.isValid(businessIdStr)) {
      return res.status(400).json({ error: "Invalid businessId" });
    }

    const businessId = new Types.ObjectId(businessIdStr);

    // --- date param (string | string[] -> string) ---
    const dateParam = req.params.date;
    const date = Array.isArray(dateParam) ? dateParam[0] : dateParam;

    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: "date must be YYYY-MM-DD" });
    }

    const { fromMin, toMin, durationMin, value } = req.body;

    if (typeof fromMin !== "number") {
      return res.status(400).json({ error: "fromMin must be a number" });
    }
    if (typeof value !== "boolean") {
      return res.status(400).json({ error: "value must be boolean" });
    }

    const finalToMin =
      typeof toMin === "number"
        ? toMin
        : typeof durationMin === "number"
          ? fromMin + durationMin
          : null;

    if (finalToMin === null) {
      return res.status(400).json({ error: "Provide toMin or durationMin" });
    }

    // ✅ IMPORTANT: guarantee rolling window exists before toggling
    await ensureAvailabilityDays(businessId, 14);

    await setAvailabilityRange({
      businessId,
      date,
      fromMin,
      toMin: finalToMin,
      value,
    });

    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Bad request" });
  }
}

export async function getAvailabilityDayDebug(req: Request, res: Response) {
  try {
    const businessIdParam = req.params.businessId;
    const businessIdStr = Array.isArray(businessIdParam) ? businessIdParam[0] : businessIdParam;
    if (typeof businessIdStr !== "string" || !Types.ObjectId.isValid(businessIdStr)) {
      return res.status(400).json({ error: "Invalid businessId" });
    }
    const businessId = new Types.ObjectId(businessIdStr);

    const dateParam = req.params.date;
    const date = Array.isArray(dateParam) ? dateParam[0] : dateParam;
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: "date must be YYYY-MM-DD" });
    }

    const day = await AvailabilityDay.findOne({ businessId, date });
    if (!day) return res.status(404).json({ error: "Not found" });

    const blocked: number[] = [];
    for (let i = 0; i < day.slotCount; i++) {
      if (!getBit(day.bitset, i)) blocked.push(i);
    }

    return res.json({
      date: day.date,
      startMin: day.startMin,
      endMin: day.endMin,
      slotStepMin: day.slotStepMin,
      slotCount: day.slotCount,
      isManuallyEdited: day.isManuallyEdited,
      blockedSlots: blocked,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Bad request" });
  }
}
