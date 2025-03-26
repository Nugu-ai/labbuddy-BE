import express, { Request, Response } from "express";
import { verifyGoogleAccessToken } from "../utils/googleAuth";
import {
    findUserByGoogleId,
    createUser,
    issueTokens,
    refreshUserToken,
    logoutUserById,
} from "../services/authService";
import { HttpError } from "../utils/HttpError";
import { authToken, UserRequest } from "../middleware/authToken";

const router = express.Router();

router.post("/login", async (req: Request, res: Response): Promise<any> => {
    const { google_access_token, phone_number, source_path } = req.body;

    if (!google_access_token) {
        throw new HttpError(400, 4001, "google_access_token is required");
    }
    const googleUser = await verifyGoogleAccessToken(google_access_token);
    const { sub: google_user_id, email, name } = googleUser;

    if (!google_user_id || !email) {
        throw new HttpError(400, 4002, "Invalid Google user info");
    }

    let user = await findUserByGoogleId(google_user_id);

    if (!user) {
        if (!phone_number) {
            throw new HttpError(
                400,
                4003,
                "phone_number is required for signup"
            );
        }

        if (!source_path) {
            throw new HttpError(
                400,
                4005,
                "source_path is required for signup"
            );
        }
        await createUser(
            email,
            google_user_id,
            phone_number,
            source_path,
            name
        );
    }

    const { accessToken, refreshToken } = await issueTokens({
        id: user!._id?.toString() as string,
        email: user!.email as string,
        google_user_id: user!.google_user_id as string,
        is_admin: user!.is_admin as boolean,
    });

    return res.json({
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
            id: user!._id,
            name: user!.name,
            email: user!.email,
            phone_number: user!.phone_number,
            created_at: user!.created_at,
            source_path: user!.source_path,
            is_admin: user!.is_admin,
        },
    });
});

router.post("/token", async (req: Request, res: Response): Promise<any> => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        throw new HttpError(400, 4004, "refresh_token is required");
    }

    const { accessToken, refreshToken } = await refreshUserToken(refresh_token);

    return res.json({
        access_token: accessToken,
        refresh_token: refreshToken,
    });
});

router.post(
    "/logout",
    authToken,
    async (req: UserRequest, res: Response): Promise<any> => {
        const userId = req.user?.id;

        await logoutUserById(userId as string);

        return res.status(204).send(); // No Content
    }
);

export default router;
