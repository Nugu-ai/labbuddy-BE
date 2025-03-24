// models/Token.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IToken extends Document {
    user_id: mongoose.Types.ObjectId;
    jwt_token: string;
    issued_at: Date;
    expires_at: Date;
}

const TokenSchema: Schema<IToken> = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    jwt_token: { type: String, required: true },
    issued_at: { type: Date, default: Date.now },
    expires_at: { type: Date, required: true },
});

export default mongoose.model<IToken>("Token", TokenSchema);
