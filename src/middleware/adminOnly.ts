import { Response, NextFunction } from "express";
import { UserRequest } from "./authToken";

export const adminOnly = (
    req: UserRequest,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user || req.user.is_admin !== true) {
        res.status(403).json({
            code: 4030,
            message: "관리자 권한이 필요합니다",
        });
        return;
    }

    next(); // ✅ 권한 통과 시 next 호출
};
