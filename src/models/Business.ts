import { Schema, model, Document, Types } from 'mongoose';

export interface IBusiness extends Document {
    name: string;
    wabaId: string;
    phoneId: string;
    token: string;
    googleRefreshToken: string;

}

const BusinessSchema = new Schema<IBusiness>(
    {
        name: { type: String, required: true, trim: true },
        wabaId: { type: String, required: true, trim: true },
        phoneId: { type: String, required: true, trim: true },
        token: { type: String, required: true, trim: true },
        googleRefreshToken: { type: String, required: true, trim: true },
    },
    {
        timestamps: true,
    }
);

export const Business = model<IBusiness>('Business', BusinessSchema);
export default Business;