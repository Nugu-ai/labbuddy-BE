import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    name?: string;
    phone_number?: string;
    email?: string;
    google_user_id?: string;
    created_at: Date;
    source_path?: string;
    is_admin: boolean;
}

const UserSchema: Schema<IUser> = new Schema({
    name: { type: String },
    phone_number: { type: String },
    email: { type: String },
    google_user_id: { type: String },
    created_at: { type: Date, default: Date.now },
    source_path: { type: String },
    is_admin: { type: Boolean, default: false },
});

export default mongoose.model<IUser>("User", UserSchema);
