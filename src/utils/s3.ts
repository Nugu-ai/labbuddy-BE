import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: process.env.AWS_REGION!,
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

export const uploadToS3 = async (
    file: Express.Multer.File,
    sessionId: string
): Promise<string> => {
    const fileContent = fs.readFileSync(file.path);
    const ext = path.extname(file.originalname);
    const key = `uploads/${sessionId}${ext}`; // 예: uploads/uuid.pdf

    const params = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileContent,
        ContentType: file.mimetype,
        ACL: "public-read", // 필요에 따라 private로 변경
    };

    const data = await s3.upload(params).promise();

    // 파일 업로드 후 로컬에 임시 저장된 파일 삭제
    fs.unlinkSync(file.path);

    return data.Location; // S3 파일 URL
};
