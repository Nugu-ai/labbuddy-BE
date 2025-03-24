import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
    res.send("test route");
});

export default router;
