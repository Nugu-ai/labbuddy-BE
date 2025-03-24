import express, { Request, Response } from "express";
import { HttpError } from "../utils/HttpError";
import { authToken, UserRequest } from "../middleware/authToken";

const router = express.Router();

router.get(
    "/",
    authToken,
    async (req: UserRequest, res: Response): Promise<any> => {}
);

export default router;
