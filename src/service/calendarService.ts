import CalendarSettings from "../models/CalendarSettings";
import { Types } from "mongoose";

function defaultWeeklyTemplate() {
  return [
    { weekday: 0, closed: false, startMin: 540, endMin: 1020 }, // Sun
    { weekday: 1, closed: false, startMin: 540, endMin: 1020 }, // Mon
    { weekday: 2, closed: false, startMin: 540, endMin: 1020 }, // Tue
    { weekday: 3, closed: false, startMin: 540, endMin: 1020 }, // Wed
    { weekday: 4, closed: false, startMin: 540, endMin: 1020 }, // Thu
    { weekday: 5, closed: false, startMin: 540, endMin: 780 },  // Fri
    { weekday: 6, closed: true },                               // Sat
  ];
}

export async function ensureCalendarSettings(businessId: Types.ObjectId) {
  await CalendarSettings.updateOne(
    { businessId },
    {
      $setOnInsert: {
        businessId,
        timezone: "Asia/Jerusalem",
        slotStepMin: 15,
        meeting: {
          defaultDurationMin: 30,
          allowedDurationsMin: [30, 45, 60, 90],
          bufferBeforeMin: 0,
          bufferAfterMin: 0,
        },
        weeklyTemplate: defaultWeeklyTemplate(),
      },
    },
    { upsert: true }
  );
}
