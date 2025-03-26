import User from "../models/User";
import Token from "../models/Token";
import {
    verifyRefreshToken,
    deleteRefreshToken,
    generateAccessToken,
    generateRefreshToken,
} from "../utils/jwt-utils";
import { HttpError } from "../utils/HttpError";

export const findUserByGoogleId = async (google_user_id: string) => {
    return await User.findOne({ google_user_id });
};

export const createUser = async (
    email: string,
    google_user_id: string,
    phone_number: string,
    source_path: string
) => {
    const newUser = new User({
        email,
        google_user_id,
        phone_number,
        created_at: new Date(),
        source_path,
    });

    return await newUser.save();
};

export const issueTokens = async (user: {
    id: string;
    email: string;
    google_user_id: string;
}) => {
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user.id);
    return { accessToken, refreshToken };
};

export const refreshUserToken = async (refreshToken: string) => {
    // 1. refresh token 유효성 검증
    const userId = await verifyRefreshToken(refreshToken);
    if (!userId) {
        throw new HttpError(401, 4013, "Invalid or expired refresh token");
    }

    // 2. 유저 조회
    const user = await User.findById(userId);
    if (!user) {
        throw new HttpError(404, 4040, "User not found");
    }

    if (!user.email || !user.google_user_id) {
        throw new HttpError(400, 4005, "User missing required fields");
    }

    // 3. 기존 refresh token 삭제
    await deleteRefreshToken(refreshToken);

    // 4. 새로운 토큰 발급
    const accessToken = generateAccessToken({
        id: user._id?.toString() as string,
        email: user.email,
        google_user_id: user.google_user_id,
    });

    const newRefreshToken = await generateRefreshToken(
        user._id?.toString() as string
    );

    return { accessToken, refreshToken: newRefreshToken };
};

export const logoutUserById = async (userId: string) => {
    if (!userId) {
        throw new HttpError(400, 4006, "User ID missing from token");
    }

    // 유저의 모든 refresh_token 삭제 (보통 1개만 유지 중)
    await Token.deleteMany({ user_id: userId });
};
