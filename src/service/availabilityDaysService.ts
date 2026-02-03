import { DateTime } from "luxon";
import { Types } from "mongoose";
import CalendarSettings from "../models/CalendarSettings";
import AvailabilityDay from "../models/AvailabilityDay";
import { makeAllTrueBitset } from "../utils/bitset";

function slotCountFromWindow(startMin: number, endMin: number, step: number) {
  const diff = endMin - startMin;
  if (diff <= 0) throw new Error("Invalid window: endMin must be > startMin");
  if (diff % step !== 0) throw new Error("Window must divide evenly by slotStepMin");
  return diff / step;
}

function luxonToWeekday0Sun(dt: DateTime) {
  return dt.weekday === 7 ? 0 : dt.weekday;
}

export async function ensureAvailabilityDays(businessId: Types.ObjectId, days = 14) {
  const settings = await CalendarSettings.findOne({ businessId }).lean();
  if (!settings) throw new Error("CalendarSettings not found for business");

  const tz = settings.timezone;
  const step = settings.slotStepMin;

  const today = DateTime.now().setZone(tz).startOf("day");

  const from = today.toFormat("yyyy-LL-dd");
  const to = today.plus({ days: days - 1 }).toFormat("yyyy-LL-dd");

  const existing = await AvailabilityDay.find({
    businessId,
    date: { $gte: from, $lte: to },
  })
    .select("date")
    .lean();

  const existingSet = new Set(existing.map((d) => d.date));

  const docsToInsert: any[] = [];

  for (let i = 0; i < days; i++) {
    const day = today.plus({ days: i });
    const date = day.toFormat("yyyy-LL-dd");

    if (existingSet.has(date)) continue;

    const weekday = luxonToWeekday0Sun(day); // 0..6

    const rule = settings.weeklyTemplate.find((w: any) => w.weekday === weekday);
    const closed = rule?.closed ?? false;

    if (closed) {
      docsToInsert.push({
        businessId,
        date,
        startMin: 0,
        endMin: 0,
        slotStepMin: step,
        slotCount: 0,
        bitset: Buffer.alloc(0),
        isManuallyEdited: false,
      });
      continue;
    }

    const startMin = rule?.startMin ?? 540;
    const endMin = rule?.endMin ?? 1020;

    const slotCount = slotCountFromWindow(startMin, endMin, step);
    const bitset = makeAllTrueBitset(slotCount);

    docsToInsert.push({
      businessId,
      date,
      startMin,
      endMin,
      slotStepMin: step,
      slotCount,
      bitset,
      isManuallyEdited: false,
    });
  }

  if (docsToInsert.length > 0) {
    await AvailabilityDay.insertMany(docsToInsert, { ordered: false });
  }
}