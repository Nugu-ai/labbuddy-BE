import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export const extractTitleWithGemini = async (
    text: string
): Promise<string | null> => {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
            temperature: 0.4,
            topP: 1,
            maxOutputTokens: 256,
        },
    });

    const prompt = `
You are an AI that reads academic paper text and extracts the paper title.
Please extract the **exact title** of the following academic paper.

Respond with only the title. No explanation.

Text:
${text.slice(0, 3000)}
`;

    try {
        const result = await model.generateContent(prompt);
        const raw = result.response.text().trim();
        const title = raw.replace(/^["“]|["”]$/g, ""); // 양끝 따옴표 제거
        return title;
    } catch (err) {
        console.warn("❗ 제목 추출 실패. 원본 파일명으로 대체됩니다.");
        return null;
    }
};
