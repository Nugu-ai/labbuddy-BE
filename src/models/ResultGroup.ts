import mongoose, { Document, Schema } from "mongoose";

export interface IResultGroup extends Document {
    file_hash: string;
}

const ResultGroupSchema: Schema<IResultGroup> = new Schema({
    file_hash: { type: String, required: true },
});

export default mongoose.model<IResultGroup>("ResultGroup", ResultGroupSchema);
