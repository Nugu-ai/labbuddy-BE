import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // .env 파일 로드

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI as string;
        await mongoose.connect(uri);
        console.log("MongoDB connected successfully.");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); // 연결 실패 시 프로세스 종료
    }
};

export default connectDB;
