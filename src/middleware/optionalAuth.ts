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

/**
 * 로그인 여부에 따라 req.user를 채워주는 선택적 인증 미들웨어
 * 토큰이 없거나 유효하지 않으면 그대로 next()
 */
export const optionalAuth = (
    req: UserRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split("Bearer ")[1]
        : undefined;

    if (!token) return next(); // 토큰이 없으면 인증 생략

    const result = verifyAccessToken(token);
    if (result.ok && typeof result.key !== "string") {
        const payload = result.key as UserPayload;
        if (payload.id && payload.email && payload.google_user_id) {
            req.user = payload;
        }
    }

    return next(); // 실패해도 계속 진행
};
