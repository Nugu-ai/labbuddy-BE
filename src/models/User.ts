import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    phone_number?: string;
    email?: string;
    google_user_id?: string;
    created_at: Date;
    source_path?: string;
}

const UserSchema: Schema<IUser> = new Schema({
    phone_number: { type: String },
    email: { type: String },
    google_user_id: { type: String },
    created_at: { type: Date, default: Date.now },
    source_path: { type: String },
});

export default mongoose.model<IUser>("User", UserSchema);
