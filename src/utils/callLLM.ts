import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { saveResultGroupAndResults } from "../services/resultService";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

interface ExtractedResult {
    company: string;
    reagent: string;
    catalog?: string;
}

export const callLLM = async (
    sessionId: string,
    text: string
): Promise<void> => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
You are an AI that extracts reagent information from academic PDF papers.
Based on the following text, extract a list of reagents in the format below:

Format (one line per item):
company,reagent,catalogID

Example:
Sigma-Aldrich,NaCl,S7653
Sigma-Aldrich,HCl,320331

Text:
${text.slice(0, 10000)}
`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const rawText = response.text();

        const lines = rawText.trim().split("\n");
        const extractedData: ExtractedResult[] = lines.map((line) => {
            const [company, reagent, catalog] = line.split(",");
            return {
                company: company?.trim(),
                reagent: reagent?.trim(),
                catalog: catalog?.trim() || undefined,
            };
        });

        await saveResultGroupAndResults(sessionId, extractedData);
    } catch (error) {
        console.error("Gemini API 호출 중 오류 발생:", error);
        throw new Error("LLM 처리 중 오류 발생");
    }
};
