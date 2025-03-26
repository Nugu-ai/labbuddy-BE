import mongoose, { Schema, Document } from "mongoose";

export interface IResult extends Document {
    result_group_id: mongoose.Types.ObjectId;
    company: string;
    reagent: string;
    catalog: string;
}

const ResultSchema = new Schema<IResult>({
    result_group_id: {
        type: Schema.Types.ObjectId,
        ref: "ResultGroup",
        required: true,
    },
    company: { type: String, required: true },
    reagent: { type: String, required: true },
    catalog: { type: String, required: true },
});

export default mongoose.model<IResult>("Result", ResultSchema);
