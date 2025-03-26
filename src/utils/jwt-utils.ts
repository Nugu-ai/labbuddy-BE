import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import Token from "../models/Token";
import mongoose from "mongoose";
import ms from "ms";

dotenv.config();

const secret = process.env.SECRET_KEY as string;

interface JwtVerifyResult {
    ok: boolean;
    key?: JwtPayload;
    message?: string;
}

export interface TokenPayload {
    id: string;
    email: string;
    google_user_id: string;
    is_admin: boolean;
}

export const generateAccessToken = (user: TokenPayload): string => {
    const payload = {
        id: user.id,
        email: user.email,
        google_user_id: user.google_user_id,
        is_admin: user.is_admin,
    };

    return jwt.sign(payload, secret, {
        algorithm: "HS256",
        expiresIn: "1d",
    });
};

export const verifyAccessToken = (token: string): JwtVerifyResult => {
    try {
        const decoded = jwt.verify(token, secret);

        if (typeof decoded === "string") {
            return {
                ok: false,
                message: "Invalid token format",
            };
        }

        return {
            ok: true,
            key: decoded,
        };
    } catch (err: any) {
        return {
            ok: false,
            message: err.message,
        };
    }
};

const saveToken = async (
    token: string,
    userId: string | number,
    expiresIn: string
) => {
    const issuedAt = new Date();
    const msValue = ms(expiresIn as string);
    if (msValue === undefined) throw new Error("Invalid expiresIn format");

    const expiresAt = new Date(issuedAt.getTime() + msValue);

    const newToken = new Token({
        user_id: new mongoose.Types.ObjectId(userId.toString()),
        jwt_token: token,
        issued_at: issuedAt,
        expires_at: expiresAt,
    });

    await newToken.save();
};

export const generateRefreshToken = async (
    memberId: string
): Promise<string> => {
    await Token.deleteMany({ user_id: memberId });

    const token = jwt.sign({}, secret, {
        algorithm: "HS256",
        expiresIn: "7d",
    });

    await saveToken(token, memberId, "7d");
    return token;
};

export const verifyRefreshToken = async (
    token: string
): Promise<string | null> => {
    try {
        const storedToken = await Token.findOne({ jwt_token: token });
        if (storedToken) {
            jwt.verify(token, secret);
            return storedToken.user_id.toString();
        } else {
            return null;
        }
    } catch (err) {
        return null;
    }
};

export const deleteRefreshToken = async (token: string): Promise<void> => {
    await Token.deleteOne({ jwt_token: token });
};
