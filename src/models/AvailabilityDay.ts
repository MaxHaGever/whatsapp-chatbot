import { model, Schema } from 'mongoose';

const AvailabilityDaySchema = new Schema({
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    date: { type: String, required: true },
    startMin: { type: Number, required: true },
    endMin: { type: Number, required: true },
    slotStepMin: { type: Number, required: true, default: 15 },
    slotCount: { type: Number, required: true },
    bitset: { type: Buffer, required: true },
    isManuallyEdited: { type: Boolean, default: false },
}, { timestamps: true });

AvailabilityDaySchema.index({ businessId: 1, date: 1 }, { unique: true });

export default model("AvailabilityDay", AvailabilityDaySchema);