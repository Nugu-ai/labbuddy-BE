import Paper, { IPaper } from "../models/Paper";

interface CreateSessionInput {
    session_id: string;
    user_id: string;
    paper_name: string;
    s3_path: string;
    uploaded_at: Date;
    status: "processing" | "done" | "failed";
    file_hash: string;
}

export const saveSession = async (
    data: CreateSessionInput
): Promise<IPaper> => {
    const session = new Paper({
        session_id: data.session_id,
        user_id: data.user_id,
        paper_name: data.paper_name,
        s3_path: data.s3_path,
        uploaded_at: data.uploaded_at,
        status: data.status,
        file_hash: data.file_hash,
    });

    return await session.save();
};

export const getSessionById = async (
    session_id: string
): Promise<IPaper | null> => {
    return await Paper.findOne({ session_id });
};
