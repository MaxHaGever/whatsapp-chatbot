import { Schema, model, Document, Types } from 'mongoose';

export interface IBusiness extends Document {
    name: string;
    wabaId: string;
    phoneId: string;
    token: string;
}

const BusinessSchema = new Schema<IBusiness>(
    {
        wabaId: { type: String, required: true, trim: true },
    },
    {
        timestamps: true,
    }
);

export const Business = model<IBusiness>('Business', BusinessSchema);
export default Business;