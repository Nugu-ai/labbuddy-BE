import mongoose, { Document, Schema } from "mongoose";

export interface IPaper extends Document {
    user_id: mongoose.Types.ObjectId;
    file_hash: string;
    paper_name: string;
    uploaded_at: Date;
}

const PaperSchema: Schema<IPaper> = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    file_hash: { type: String, required: true },
    paper_name: { type: String, required: true },
    uploaded_at: { type: Date, default: Date.now },
});

export default mongoose.model<IPaper>("Paper", PaperSchema);
