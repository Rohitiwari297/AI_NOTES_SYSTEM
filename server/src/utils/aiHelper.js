import { config } from "../config/config.js";

// =========================================================================
// 1. AI NOTE SUMMARY GENERATOR
// =========================================================================
// Agar GEMINI_API_KEY available hai to Gemini se summary mangta hai,
// warna smart fallback se summary generate karta hai taki API kabhi fail na ho.
export const generateAiSummary = async (content) => {
    if (!content || content.trim().length === 0) {
        return "";
    }

    // 1. Gemini AI API Call (Agar key available ho)
    if (config.gemini_key) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.gemini_key}`;
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `Summarize the following note into 2 clear, concise sentences:\n\n${content}`
                                }
                            ]
                        }
                    ]
                })
            });

            if (response.ok) {
                const data = await response.json();
                const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (aiText && aiText.trim()) {
                    return aiText.trim();
                }
            }
        } catch (error) {
            console.warn("Gemini API call failed, using fallback summary:", error.message);
        }
    }

    // 2. Fallback Summary Generator (Interview me explain karna easy hai)
    // Sentences me split karke top 2 informative sentences pick karta hai
    const sentences = content
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 10);

    if (sentences.length <= 2) {
        return sentences.join(". ") + (sentences.length > 0 ? "." : "");
    }

    return `${sentences[0]}. ${sentences[1]}.`;
};

// =========================================================================
// 2. SEMANTIC SEARCH (AI Vector / Cosine Similarity)
// =========================================================================
// Search query aur Note ke text ke beech word-vector overlap calculate karta hai
export const calculateSimilarity = (query, text) => {
    if (!query || !text) return 0;

    const queryWords = query.toLowerCase().match(/\b\w+\b/g) || [];
    const textWords = text.toLowerCase().match(/\b\w+\b/g) || [];

    if (queryWords.length === 0 || textWords.length === 0) return 0;

    // Create unique vocabulary
    const vocab = Array.from(new Set([...queryWords, ...textWords]));

    // Query frequency vector
    const queryVec = vocab.map(word => queryWords.filter(w => w === word).length);

    // Text frequency vector
    const textVec = vocab.map(word => textWords.filter(w => w === word).length);

    // Cosine Similarity: (A . B) / (||A|| * ||B||)
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vocab.length; i++) {
        dotProduct += queryVec[i] * textVec[i];
        normA += queryVec[i] * queryVec[i];
        normB += textVec[i] * textVec[i];
    }

    if (normA === 0 || normB === 0) return 0;
    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    return Number(similarity.toFixed(4));
};

