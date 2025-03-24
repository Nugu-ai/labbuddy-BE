import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/HttpError";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const status = err.statusCode || 500;
    const code = err.code || 5000;
    const message = err.message || "Internal server error";

    res.status(status).json({ code, message });
};
