import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt-utils";
import { JwtPayload } from "jsonwebtoken";

export interface UserPayload extends JwtPayload {
    id: string;
    email: string;
    google_user_id: string;
}

export interface UserRequest extends Request {
    user?: UserPayload;
}

export const authToken = (
    req: UserRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader && authHeader.split("Bearer ")[1];

    if (!accessToken) {
        res.status(401).json({
            code: 4011,
            message: "Access token missing",
        });
        return;
    }

    const accessTokenResult = verifyAccessToken(accessToken);
    if (accessTokenResult.ok && accessTokenResult.key) {
        if (typeof accessTokenResult.key === "string") {
            res.status(401).json({
                code: 4010,
                message: "Invalid token format",
            });
            return;
        }

        // JwtPayload를 UserPayload로 캐스팅
        const userPayload = accessTokenResult.key as UserPayload;

        if (!userPayload.id || !userPayload.username || !userPayload.email) {
            res.status(401).json({
                code: 4012,
                message: "Invalid token payload",
            });
            return;
        }

        req.user = userPayload;
        next();
    } else {
        res.status(401).json({
            code: 4010,
            message: accessTokenResult.message,
        });
    }
};
