import mongoose from "mongoose";
import { config } from "./config.js";

export const connectDB = async () => {
    try {
        await mongoose.connect(config.mongodb_uri);
        console.log("MongoDB Database connected successfully!");
    } catch (err) {
        console.error("MongoDB Connection Failed:", err.message);
    }
};
