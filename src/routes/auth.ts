import express, { Request, Response, NextFunction } from "express";
import { verifyGoogleAccessToken } from "../utils/googleAuth";
import {
    findUserByGoogleId,
    createUser,
    issueTokens,
    refreshUserToken,
    logoutUserById,
} from "../services/authService";
import axios from "axios";
import qs from "qs";
import { HttpError } from "../utils/HttpError";
import { authToken, UserRequest } from "../middleware/authToken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post(
    "/signup",
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const { google_access_token, phone_number, source_path } = req.body;

            if (!google_access_token || !phone_number || !source_path) {
                throw new HttpError(400, 4001, "Missing required fields");
            }

            const googleUser = await verifyGoogleAccessToken(
                google_access_token
            );
            const { sub: google_user_id, email, name } = googleUser;

            if (!google_user_id || !email) {
                throw new HttpError(400, 4002, "Invalid Google user info");
            }

            const existingUser = await findUserByGoogleId(google_user_id);
            if (existingUser) {
                throw new HttpError(409, 4091, "User already exists");
            }

            const user = await createUser(
                email,
                google_user_id,
                phone_number,
                source_path,
                name
            );

            const { accessToken, refreshToken } = await issueTokens({
                id: user._id?.toString() as string,
                email: user.email as string,
                google_user_id: user.google_user_id as string,
                is_admin: user.is_admin,
            });

            return res.status(201).json({
                access_token: accessToken,
                refresh_token: refreshToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone_number: user.phone_number,
                    created_at: user.created_at,
                    source_path: user.source_path,
                    is_admin: user.is_admin,
                },
            });
        } catch (err) {
            next(err);
        }
    }
);

router.post(
    "/login",
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const { google_access_token } = req.body;

            if (!google_access_token) {
                throw new HttpError(
                    400,
                    4001,
                    "google_access_token is required"
                );
            }

            const googleUser = await verifyGoogleAccessToken(
                google_access_token
            );
            const { sub: google_user_id, email } = googleUser;

            if (!google_user_id || !email) {
                throw new HttpError(400, 4002, "Invalid Google user info");
            }

            const user = await findUserByGoogleId(google_user_id);
            if (!user) {
                throw new HttpError(404, 4040, "User not found");
            }

            const { accessToken, refreshToken } = await issueTokens({
                id: user._id?.toString() as string,
                email: user.email as string,
                google_user_id: user.google_user_id as string,
                is_admin: user.is_admin,
            });

            return res.json({
                access_token: accessToken,
                refresh_token: refreshToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone_number: user.phone_number,
                    created_at: user.created_at,
                    source_path: user.source_path,
                    is_admin: user.is_admin,
                },
            });
        } catch (err) {
            next(err);
        }
    }
);

router.post(
    "/token",
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const { refresh_token } = req.body;

            if (!refresh_token) {
                throw new HttpError(400, 4004, "refresh_token is required");
            }

            const { accessToken, refreshToken } = await refreshUserToken(
                refresh_token
            );

            return res.json({
                access_token: accessToken,
                refresh_token: refreshToken,
            });
        } catch (err) {
            next(err);
        }
    }
);

router.post(
    "/logout",
    authToken,
    async (
        req: UserRequest,
        res: Response,
        next: NextFunction
    ): Promise<any> => {
        try {
            const userId = req.user?.id;

            await logoutUserById(userId as string);

            return res.status(204).send(); // No Content
        } catch (err) {
            next(err);
        }
    }
);

router.get(
    "/google/callback",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const code = req.query.code as string;
            if (!code) {
                throw new HttpError(400, 4007, "Google auth code is required");
            }

            // 1. 환경변수에서 직접 불러옴
            const clientId = process.env.GOOGLE_CLIENT_ID!;
            const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
            const redirectUri = process.env.GOOGLE_REDIRECT_URI!;
            const frontendRedirect = process.env.FRONTEND_REDIRECT_URL!;

            console.log("redirectURI:", redirectUri);
            // 2. 토큰 요청
            const tokenRes = await axios.post(
                "https://oauth2.googleapis.com/token",
                qs.stringify({
                    code,
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: redirectUri,
                    grant_type: "authorization_code",
                }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            const accessToken = tokenRes.data.access_token;
            if (!accessToken) {
                throw new HttpError(400, 4008, "Failed to get access token");
            }
            console.log("Access Token:", accessToken);

            // 3. 프론트로 리다이렉트
            return res.redirect(
                `${frontendRedirect}?google_access_token=${accessToken}`
            );
        } catch (err) {
            next(err);
        }
    }
);

export default router;
