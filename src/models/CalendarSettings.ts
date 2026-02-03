import { Schema, model } from "mongoose";

const WeeklyDaySchema = new Schema(
  {
    weekday: { type: Number, required: true, min: 0, max: 6 },
    closed: { type: Boolean, required: true, default: false },

    startMin: { type: Number, min: 0, max: 1439 },
    endMin: { type: Number, min: 1, max: 1440 },
  },
  { _id: false }
);

const CalendarSettingsSchema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      unique: true,
      index: true,
    },

    timezone: { type: String, required: true, default: "Asia/Jerusalem" },

    slotStepMin: { type: Number, required: true, default: 15 },

    meeting: {
      defaultDurationMin: {
        type: Number,
        required: true,
        enum: [30, 45, 60, 90],
        default: 30,
      },

      allowedDurationsMin: {
        type: [Number],
        required: true,
        default: [30, 45, 60, 90],
      },

      bufferBeforeMin: { type: Number, required: true, default: 0 },
      bufferAfterMin: { type: Number, required: true, default: 0 },
    },

    weeklyTemplate: {
      type: [WeeklyDaySchema],
      required: true,
      default: [],
    },
  },
  { timestamps: true }
);

export default model("CalendarSettings", CalendarSettingsSchema);
