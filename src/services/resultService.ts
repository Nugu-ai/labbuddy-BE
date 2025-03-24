import ResultGroup from "../models/ResultGroup";
import Result from "../models/Result";
import { IResult } from "../models/Result";

interface ParsedResult {
    company: string;
    reagent: string;
    catalog?: string;
}

/**
 * 주어진 session_id에 대해 result_group과 result 목록을 저장합니다.
 */
export const saveResultGroupAndResults = async (
    session_id: string,
    results: ParsedResult[]
) => {
    // 1. session_id 기준 result_group 생성
    const resultGroup = await ResultGroup.create({ session_id });

    // 2. 각 결과를 result로 변환
    const resultDocs = results.map((item) => ({
        result_group_id: resultGroup._id,
        company: item.company,
        reagent: item.reagent,
        catalog: item.catalog,
    }));

    // 3. MongoDB에 insertMany
    await Result.insertMany(resultDocs);
};

export const getResultsBySessionId = async (
    session_id: string
): Promise<IResult[] | null> => {
    const group = await ResultGroup.findOne({ session_id });
    if (!group) return null;

    const results = await Result.find({ result_group_id: group._id });
    return results;
};
