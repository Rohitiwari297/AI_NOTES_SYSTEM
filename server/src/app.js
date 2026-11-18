import express from "express";
import cors from "cors";
import { connectDB } from "./config/db_conn.js";
import authRouter from "./modules/auth/auth.router.js";
import notesRouter from "./modules/notes/notes.router.js";

const app = express();

// Database connect karein
connectDB();

// CORS - Sabhi origins aur methods allow karein
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "AI Notes Backend API is running successfully!",
        version: "1.0.0"
    });
});

app.get("/api/v1/health", (req, res) => {
    res.json({
        success: true,
        status: "healthy",
        timestamp: new Date().toISOString()
    });
});

// Auth Routes mount karein
app.use("/api/v1/auth", authRouter);
app.use("/api/auth", authRouter);

// Notes Routes mount karein
app.use("/api/v1/notes", notesRouter);
app.use("/api/notes", notesRouter);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

export default app;
