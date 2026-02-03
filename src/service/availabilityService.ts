import { Types } from "mongoose";
import AvailabilityDay from "../models/AvailabilityDay";
import { setBit } from "../utils/bitset";

function requireAligned(min: number, baseStartMin: number, step: number) {
  if ((min - baseStartMin) % step !== 0) {
    throw new Error("Time must align to slotStepMin");
  }
}

export async function setAvailabilityRange(params: {
  businessId: Types.ObjectId;
  date: string;           // "YYYY-MM-DD"
  fromMin: number;        // minutes from midnight
  toMin: number;          // minutes from midnight (exclusive)
  value: boolean;         // true=available, false=blocked
}) {
  const { businessId, date, fromMin, toMin, value } = params;

  const day = await AvailabilityDay.findOne({ businessId, date });
  if (!day) throw new Error("AvailabilityDay not found");
  if (day.slotCount === 0) throw new Error("Day is closed");

  // 1) basic range validation
  if (toMin <= fromMin) throw new Error("Invalid range");
  if (fromMin < day.startMin || toMin > day.endMin) {
    throw new Error("Range outside working hours");
  }

  // 2) alignment validation (must hit slot boundaries)
  requireAligned(fromMin, day.startMin, day.slotStepMin);
  requireAligned(toMin, day.startMin, day.slotStepMin);

  // 3) convert minutes -> slot indexes
  const startIndex = (fromMin - day.startMin) / day.slotStepMin;
  const endIndex = (toMin - day.startMin) / day.slotStepMin; // exclusive

  // 4) edit bitset
  for (let i = startIndex; i < endIndex; i++) {
    setBit(day.bitset, i, value);
  }

  day.isManuallyEdited = true;
  await day.save();

  return { ok: true };
}
