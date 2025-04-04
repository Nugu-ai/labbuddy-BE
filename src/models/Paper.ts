import mongoose, { Schema, Document } from "mongoose";

export interface IPaper extends Document {
    session_id: string;
    user_id?: mongoose.Types.ObjectId;
    paper_name: string;
    s3_path: string;
    uploaded_at: Date;
    status: "processing" | "done" | "failed";
    file_hash: string;
}

const PaperSchema = new Schema<IPaper>({
    session_id: { type: String, required: true, unique: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: false },
    paper_name: { type: String, required: true },
    s3_path: { type: String, required: true },
    uploaded_at: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ["processing", "done", "failed"],
        default: "processing",
    },
    file_hash: { type: String, required: true, unique: true },
});

export default mongoose.model<IPaper>("Paper", PaperSchema);
