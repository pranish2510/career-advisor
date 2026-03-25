// ============================================
// utils/hindsight.js - Hindsight Cloud Memory
// Docs: https://ui.hindsight.vectorize.io
// ============================================
const axios = require("axios");

const BASE_URL =
  process.env.HINDSIGHT_BASE_URL || "https://api.hindsight.vectorize.io/v1";
const API_KEY = process.env.HINDSIGHT_API_KEY;
const PIPELINE_ID = process.env.HINDSIGHT_PIPELINE_ID;

// Axios instance for Hindsight
const hindsightClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/**
 * Store a memory/document into Hindsight pipeline
 * @param {string} userId - Unique user identifier
 * @param {string} content - Content to store
 * @param {object} metadata - Extra metadata tags
 */
async function storeMemory(userId, content, metadata = {}) {
  try {
    if (!API_KEY || !PIPELINE_ID) {
      console.warn("⚠️  Hindsight not configured - skipping memory storage");
      return null;
    }

    const payload = {
      pipeline_id: PIPELINE_ID,
      documents: [
        {
          content,
          metadata: {
            user_id: userId,
            timestamp: new Date().toISOString(),
            ...metadata,
          },
        },
      ],
    };

    const response = await hindsightClient.post("/ingest", payload);
    return response.data;
  } catch (error) {
    console.error("Hindsight storeMemory error:", error.message);
    return null; // Fail gracefully - don't break the app
  }
}

/**
 * Retrieve relevant memories for a user query
 * @param {string} userId - Unique user identifier
 * @param {string} query - Query to search memories
 * @param {number} topK - Number of results to return
 */
async function retrieveMemory(userId, query, topK = 5) {
  try {
    if (!API_KEY || !PIPELINE_ID) {
      console.warn("⚠️  Hindsight not configured - skipping memory retrieval");
      return [];
    }

    const payload = {
      pipeline_id: PIPELINE_ID,
      query,
      top_k: topK,
      filter: { user_id: userId },
    };

    const response = await hindsightClient.post("/retrieve", payload);
    return response.data?.results || [];
  } catch (error) {
    console.error("Hindsight retrieveMemory error:", error.message);
    return [];
  }
}

/**
 * Store complete user profile into memory
 * @param {string} userId
 * @param {object} profile - {skills, projects, applications, resumeData}
 */
async function storeUserProfile(userId, profile) {
  const content = `
User Profile Update for ${userId}:
Skills: ${(profile.skills || []).join(", ")}
Projects: ${(profile.projects || []).map((p) => p.name).join(", ")}
Applications: ${(profile.applications || []).length} total
Resume Summary: ${profile.resumeSummary || "Not provided"}
Career Goals: ${profile.careerGoals || "Not specified"}
  `.trim();

  return storeMemory(userId, content, { type: "user_profile", ...profile });
}

/**
 * Store a conversation turn into memory
 */
async function storeConversation(userId, userMsg, aiResponse) {
  const content = `
Conversation:
User: ${userMsg}
AI Advisor: ${aiResponse}
  `.trim();

  return storeMemory(userId, content, { type: "conversation" });
}

/**
 * Build a memory context string to inject into AI prompts
 * @param {string} userId
 * @param {string} query
 */
async function buildMemoryContext(userId, query) {
  const memories = await retrieveMemory(userId, query, 5);
  if (!memories.length) return "";

  const context = memories
    .map((m, i) => `[Memory ${i + 1}]: ${m.content || m.text || ""}`)
    .join("\n");

  return `\nRelevant context from past interactions:\n${context}\n`;
}

module.exports = {
  storeMemory,
  retrieveMemory,
  storeUserProfile,
  storeConversation,
  buildMemoryContext,
};
