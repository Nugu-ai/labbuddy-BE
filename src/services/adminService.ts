import User from "../models/User";
import Paper from "../models/Paper";
import ResultGroup from "../models/ResultGroup";
import Result from "../models/Result";

export const getAdminSummary = async () => {
    const users = await User.find(
        {},
        "name email phone_number source_path"
    ).lean();
    const papers = await Paper.find({}, "paper_name session_id").lean();
    const resultGroups = await ResultGroup.find().lean();
    const results = await Result.find().lean();

    // session_id → result[] 매핑
    const resultMap: Record<string, any[]> = {};

    for (const group of resultGroups) {
        const groupResults = results.filter(
            (r) => r.result_group_id?.toString() === group._id.toString()
        );
        resultMap[group.session_id] = groupResults;
    }

    const papersWithResults = papers.map((p) => ({
        paper_name: p.paper_name,
        session_id: p.session_id,
        results: resultMap[p.session_id] || [],
    }));

    return {
        users,
        papers: papersWithResults,
    };
};
