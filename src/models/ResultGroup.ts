import mongoose, { Schema, Document } from "mongoose";

export interface IResultGroup extends Document {
    session_id: string;
    created_at: Date;
}

const ResultGroupSchema = new Schema<IResultGroup>({
    session_id: { type: String, required: true, unique: true },
    created_at: { type: Date, default: Date.now },
});

export default mongoose.model<IResultGroup>("ResultGroup", ResultGroupSchema);
