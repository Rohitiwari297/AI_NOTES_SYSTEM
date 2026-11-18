import dotenv from "dotenv";
dotenv.config();

export const config = {
    port: process.env.PORT || 5000,
    mongodb_uri: process.env.MONGODB_URI || "mongodb://localhost:27017/ai_notes_db",
    jwt_secret: process.env.JWT_SECRET || "my_super_secret_jwt_key_2026",
    gemini_key: process.env.GEMINI_API_KEY || ""
};
