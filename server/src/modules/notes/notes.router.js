import express from "express";
import {
    createNote,
    getNotes,
    getNoteById,
    updateNote,
    deleteNote,
    getNoteSummary,
    semanticSearch
} from "./notes.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Sabhi notes routes ke liye JWT token zaroori hai
router.use(verifyToken);

// 1. Semantic Search
router.get("/search/semantic", semanticSearch);

// 2. AI Note Summary (POST /api/notes/:id/summary)
router.post("/:id/summary", getNoteSummary);

// 3. Notes CRUD
router.post("/", createNote);
router.get("/", getNotes);
router.get("/:id", getNoteById);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;
