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
    const { google_access_token, phone_number } = req.body;

    if (!google_access_token) {
        throw new HttpError(400, 4001, "google_access_token is required");
    }
    const googleUser = await verifyGoogleAccessToken(google_access_token);
    const { sub: google_user_id, email } = googleUser;

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
        user = await createUser(email, google_user_id, phone_number);
    }

    const { accessToken, refreshToken } = await issueTokens({
        id: user._id?.toString() as string,
        email: user.email as string,
        google_user_id: user.google_user_id as string,
    });

    return res.json({
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
            id: user._id,
            email: user.email,
            phone_number: user.phone_number,
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
