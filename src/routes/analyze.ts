import express, { Request, Response } from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { format } from "@fast-csv/format";
import { HttpError } from "../utils/HttpError";
import { uploadToS3 } from "../utils/s3"; // S3 업로드 함수
import { extractTextFromPDF } from "../utils/pdfParser"; // PDF 텍스트 추출 함수
import { callLLM } from "../utils/callLLM"; // LLM 호출 함수
import { saveSession, getSessionById } from "../services/sessonService"; // DB 저장
import { getResultsBySessionId } from "../services/resultService";
import { authToken, UserRequest } from "../middleware/authToken";
import { optionalAuth } from "../middleware/optionalAuth";
import Paper from "../models/Paper";
import { getFileHash } from "../utils/getFileHash";
import fs from "fs";
import { extractTitleWithGemini } from "../utils/extractTitle";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // 로컬 temp 저장

router.post(
    "/upload",
    optionalAuth,
    upload.single("file"),
    async (req: UserRequest, res: Response): Promise<any> => {
        try {
            if (!req.file) {
                return res
                    .status(400)
                    .json({ code: 4006, message: "PDF file is required" });
            }

            const userId = req.user?.id ?? null;
            const fileHash = getFileHash(req.file.path);

            // ✅ 중복 확인
            const existing = await Paper.findOne({ file_hash: fileHash });
            if (existing) {
                fs.unlinkSync(req.file.path); // 임시 파일 삭제
                return res.status(200).json({
                    session_id: existing.session_id,
                    duplicated: true,
                });
            }

            const sessionId = uuidv4();

            // ✅ 텍스트 추출 먼저
            const extractedText = await extractTextFromPDF(req.file.path);

            // 2. 제목 추출 시도
            let paperName = await extractTitleWithGemini(extractedText);
            if (!paperName) {
                paperName = req.file.originalname; // fallback
            }

            // ✅ S3 업로드
            const s3Path = await uploadToS3(req.file, sessionId);

            // ✅ 세션 저장
            await saveSession({
                session_id: sessionId,
                user_id: userId as string,
                paper_name: paperName,
                s3_path: s3Path,
                uploaded_at: new Date(),
                status: "processing",
                file_hash: fileHash,
            });

            // ✅ 비동기 LLM 호출
            callLLM(sessionId, extractedText)
                .then(() =>
                    Paper.updateOne(
                        { session_id: sessionId },
                        { status: "done" }
                    )
                )
                .catch((err) => {
                    console.error("LLM 처리 실패:", err);
                    return Paper.updateOne(
                        { session_id: sessionId },
                        { status: "failed" }
                    );
                });

            return res
                .status(201)
                .json({ session_id: sessionId, duplicated: false });
        } catch (err: any) {
            console.error(err);
            return res.status(500).json({
                code: 5000,
                message: "PDF 처리 실패",
                error: err.message,
            });
        }
    }
);

router.get(
    "/result/:session_id",
    optionalAuth,
    async (req: UserRequest, res: Response): Promise<any> => {
        const sessionId = req.params.session_id;

        const session = await getSessionById(sessionId);
        if (!session) {
            throw new HttpError(404, 4041, "Session not found");
        }

        if (session.status === "failed") {
            // ✅ LLM 처리 실패 시 예외 반환
            throw new HttpError(422, 4220, "LLM processing failed");
        }

        if (session.status === "processing") {
            return res.status(202).json({
                code: 2020,
                message: "LLM processing is still in progress",
                session_id: session.session_id,
                status: session.status,
                results: [],
            });
        }

        const results = await getResultsBySessionId(sessionId);
        const isAuthenticated = !!req.user;

        const formattedResults = (results || []).map((r) => ({
            company: r.company,
            reagent: r.reagent,
            catalog: isAuthenticated ? r.catalog : undefined,
        }));

        return res.json({
            session_id: session.session_id,
            status: session.status,
            results: formattedResults,
        });
    }
);

router.get(
    "/result/:session_id/csv",
    authToken,
    async (req: UserRequest, res: Response): Promise<any> => {
        const sessionId = req.params.session_id;
        const session = await getSessionById(sessionId);

        if (!session) {
            throw new HttpError(404, 4041, "Session not found");
        }

        if (session.status !== "done") {
            throw new HttpError(409, 4090, "Result not ready yet");
        }

        const results = await getResultsBySessionId(sessionId);
        if (!results) {
            throw new HttpError(404, 4042, "Result group not found");
        }

        const isAuthenticated = !!req.user;

        // ✅ CSV 헤더 설정
        const csvHeader = isAuthenticated
            ? ["company", "reagent", "catalog"]
            : ["company", "reagent"];

        // ✅ CSV 본문 구성
        const csvRows = results.map((r) =>
            isAuthenticated
                ? [r.company, r.reagent, r.catalog || ""]
                : [r.company, r.reagent]
        );

        // ✅ 응답 헤더 설정
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="result_${sessionId}.csv"`
        );

        // ✅ fast-csv로 스트리밍 출력
        const stream = format({ headers: csvHeader });
        stream.pipe(res);
        csvRows.forEach((row) => stream.write(row));
        stream.end();
    }
);

export default router;
