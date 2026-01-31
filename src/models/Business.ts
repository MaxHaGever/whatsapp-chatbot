import { Schema, model, Document, Types } from 'mongoose';

export interface IBusiness extends Document {
    name: string;
    wabaId: string;
    phoneId: string;
    token: string;
    googleRefreshToken: string;
    welcome: string;

}

const BusinessSchema = new Schema<IBusiness>(
    {
        name: { type: String, required: true, trim: true },
        wabaId: { type: String, required: true, trim: true },
        phoneId: { type: String, required: true, trim: true },
        token: { type: String, required: true, trim: true },
        googleRefreshToken: { type: String, trim: true },
        welcome: { type: String, required: true, trim: true, default: "Hi 👋 How can we help you today?" },
    },
    {
        timestamps: true,
    }
);

export const Business = model<IBusiness>('Business', BusinessSchema);
export default Business;