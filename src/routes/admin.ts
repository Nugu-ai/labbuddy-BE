import express, { Request, Response } from "express";
import { HttpError } from "../utils/HttpError";
import { authToken, UserRequest } from "../middleware/authToken";
import { adminOnly } from "../middleware/adminOnly";
import { getAdminSummary } from "../services/adminService";

const router = express.Router();

router.get(
    "/summary",
    authToken,
    adminOnly,
    async (req: UserRequest, res: Response): Promise<any> => {
        const summary = await getAdminSummary();
        res.json(summary);
    }
);

export default router;
