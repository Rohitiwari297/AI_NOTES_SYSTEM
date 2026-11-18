import { asyncHandler } from "../../utils/asyncHandler.js";
import { Note } from "../../models/note.model.js";
import { generateAiSummary, calculateSimilarity } from "../../utils/aiHelper.js";

// ==========================================
// 1. CREATE NOTE (Naya Note Banana)
// ==========================================
export const createNote = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, content, tags, category } = req.body;

        // Validation
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Title and Content are required fields"
            });
        }

        // Tags parsing (array ya comma-separated string)
        let parsedTags = [];
        if (Array.isArray(tags)) {
            parsedTags = tags;
        } else if (typeof tags === "string") {
            parsedTags = tags.split(",").map(t => t.trim()).filter(Boolean);
        }

        // Note save karein
        const note = await Note.create({
            user: userId,
            title: title.trim(),
            content: content.trim(),
            tags: parsedTags,
            category: category || "general"
        });

        res.status(201).json({
            success: true,
            message: "Note created successfully",
            note
        });
    } catch (error) {
        console.error("createNote Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 2. GET NOTES LIST (With Pagination: ?page=1&limit=10)
// ==========================================
export const getNotes = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;

        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Search ya Category filter (agar user ne pass kiya ho)
        const filter = { user: userId };
        if (req.query.category) {
            filter.category = req.query.category;
        }
        if (req.query.search) {
            filter.title = { $regex: req.query.search, $options: "i" };
        }

        // Parallel execution for count & data fetch
        const [notes, total] = await Promise.all([
            Note.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Note.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(total / limit) || 1;

        res.json({
            success: true,
            pagination: {
                page,
                limit,
                totalNotes: total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            },
            notes
        });
    } catch (error) {
        console.error("getNotes Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 3. GET SINGLE NOTE (ID se Note Fetch Karna)
// ==========================================
export const getNoteById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const note = await Note.findOne({ _id: id, user: userId });
        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        res.json({
            success: true,
            note
        });
    } catch (error) {
        console.error("getNoteById Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 4. UPDATE NOTE (Note Update Karna)
// ==========================================
export const updateNote = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { title, content, tags, category } = req.body;

        const note = await Note.findOne({ _id: id, user: userId });
        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        if (title) note.title = title.trim();
        if (content) note.content = content.trim();
        if (category) note.category = category;
        if (tags) {
            note.tags = Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim()).filter(Boolean);
        }

        await note.save();

        res.json({
            success: true,
            message: "Note updated successfully",
            note
        });
    } catch (error) {
        console.error("updateNote Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 5. DELETE NOTE (Note Delete Karna)
// ==========================================
export const deleteNote = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const note = await Note.findOneAndDelete({ _id: id, user: userId });
        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        res.json({
            success: true,
            message: "Note deleted successfully",
            id: note._id
        });
    } catch (error) {
        console.error("deleteNote Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 6. AI SUMMARY ENDPOINT (POST /api/notes/:id/summary)
// ==========================================
// Assignment Requirement: Generates an AI-based summary of note content
export const getNoteSummary = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const note = await Note.findOne({ _id: id, user: userId });
        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        // AI Summary generate karein
        const summary = await generateAiSummary(note.content);

        // Note me summary save karein
        note.ai_summary = summary;
        await note.save();

        res.json({
            success: true,
            message: "AI summary generated successfully",
            noteId: note._id,
            title: note.title,
            ai_summary: summary
        });
    } catch (error) {
        console.error("getNoteSummary Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 7. SEMANTIC SEARCH (GET /api/notes/search/semantic?q=...)
// ==========================================
// Assignment Requirement: Semantic / Vector similarity search across notes
export const semanticSearch = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const query = req.query.q;

        if (!query || query.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Search query ('q') parameter is required"
            });
        }

        // User ke sabhi notes le aao
        const notes = await Note.find({ user: userId });

        // Har note ka search query ke sath similarity score nikaalo
        const scoredNotes = notes.map(note => {
            const combinedText = `${note.title} ${note.content} ${note.tags.join(" ")}`;
            const score = calculateSimilarity(query, combinedText);
            return {
                ...note.toObject(),
                similarity_score: score
            };
        });

        // Score ke hisaab se descending order me sort karein (Highest score first)
        scoredNotes.sort((a, b) => b.similarity_score - a.similarity_score);

        // Sirf wahi notes return karo jinka score > 0 ho
        const matchedNotes = scoredNotes.filter(n => n.similarity_score > 0);

        res.json({
            success: true,
            query,
            totalMatches: matchedNotes.length,
            notes: matchedNotes
        });
    } catch (error) {
        console.error("semanticSearch Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});
