import fs from "fs";
import pdfParse from "pdf-parse";

/**
 * PDF 파일에서 텍스트를 추출합니다.
 * @param filePath PDF 파일 경로 (Multer가 저장한 임시 경로)
 * @returns 추출된 전체 텍스트 (string)
 */
export const extractTextFromPDF = async (filePath: string): Promise<string> => {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text; // ✅ 전체 텍스트 반환
};
