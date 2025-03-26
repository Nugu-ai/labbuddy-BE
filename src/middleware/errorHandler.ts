import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/HttpError";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error("❌ 서버 오류 발생:", err);

    if (err instanceof HttpError) {
        res.status(err.statusCode).json({
            code: err.code,
            message: err.message,
        });
    } else {
        res.status(500).json({
            code: 5000,
            message: "Internal Server Error",
        });
    }
};
