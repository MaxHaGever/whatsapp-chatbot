import { Schema, model, Document, Types } from 'mongoose';
export const CLIENT_STAGES = [ "welcome" ,"idle", "booking", "updating", "canceling", "waiting-for-date"] as const;
export type ClientStage = (typeof CLIENT_STAGES)[number];
export const LANGS = ["he", "en", "fr", "ru"] as const;
export type Lang = (typeof LANGS)[number];

export interface IClient extends Document {
    name?: string;
    phone: string;
    businessId: Types.ObjectId;
    stage: ClientStage;
    lang: Lang;
}

const ClientSchema = new Schema<IClient>(
    {
        name: { type: String, trim: true },
        phone: { type: String, required: true, trim: true },
        businessId: { type: Schema.Types.ObjectId, required: true, ref: 'Business' },
        stage: { type: String, enum: CLIENT_STAGES, default: "welcome" },
        lang: { type: String, enum: ["he", "en", "fr", "ru"], default: "en" }
    },
    {
        timestamps: true,
    }
);

ClientSchema.index({ businessId: 1, phone: 1 }, { unique: true });

export const Client = model<IClient>('Client', ClientSchema);
export default Client;
