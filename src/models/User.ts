import { Schema, model, Document, Types } from 'mongoose';

interface IUser extends Document {
  welcome: string;
  Business: Types.ObjectId;
}

const userSchema = new Schema<IUser>({
  welcome: { type: String, required: true },
  Business: { type: Types.ObjectId, ref: 'Business', required: true },
}, { timestamps: true });

const User = model<IUser>('User', userSchema);

export default User;
