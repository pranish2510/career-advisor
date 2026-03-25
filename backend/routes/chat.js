// ============================================
// routes/chat.js - AI Career Mentor Chat API
// ============================================
const express = require("express");
const router = express.Router();
const { chatWithHistory } = require("../utils/gemini");
const { buildMemoryContext, storeConversation } = require("../utils/hindsight");
const store = require("../utils/store");

// ── Career mentor system prompt ───────────────
function buildSystemPrompt(user, memoryContext) {
  const skills = (user.skills || []).map((s) => s.name).join(", ") || "none listed";
  const projects = (user.projects || []).map((p) => p.name).join(", ") || "none listed";
  const applications = (user.applications || []).length;
  const goals = user.careerGoals || "not specified";

  return `You are an expert AI Career Advisor and Mentor for students and fresh graduates in India. 
You have deep knowledge of the Indian tech job market, internship landscape, and career growth strategies.

STUDENT PROFILE:
- Skills: ${skills}
- Projects: ${projects}
- Internship Applications: ${applications} tracked
- Career Goals: ${goals}
- Resume Score: ${user.resumeScore ? `${user.resumeScore}/100` : "not analyzed yet"}

${memoryContext ? `MEMORY FROM PAST SESSIONS:\n${memoryContext}` : ""}

YOUR ROLE:
- Give personalized, actionable career advice based on the student's actual profile
- Suggest specific internships, skills to learn, and resources (prefer Indian platforms like LinkedIn, Internshala, Naukri, AngelList India)
- Help with resume tips, interview prep, and skill gap analysis
- Be encouraging but realistic — give honest feedback
- Keep responses concise and practical (use bullet points when listing multiple items)
- Remember context from this conversation and past sessions
- For Indian students: mention relevant platforms like Internshala, LeetCode, GFG, Codeforces, etc.

Always be warm, motivating, and treat the student as a smart individual with potential.`;
}

// ── POST /api/chat/:userId - Send message ─────
router.post("/:userId", async (req, res) => {
  try {
    const { message } = req.body;
    const { userId } = req.params;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    // Get user data and chat history
    const user = store.getUser(userId);
    const history = (user.chatHistory || []).slice(-20); // Last 20 messages for context

    // Retrieve relevant memories from Hindsight
    const memoryContext = await buildMemoryContext(userId, message);

    // Build system prompt with user context
    const systemPrompt = buildSystemPrompt(user, memoryContext);

    // Store user message
    store.addChatMessage(userId, "user", message);

    // Get AI response
    const aiResponse = await chatWithHistory(history, message, systemPrompt);

    // Store AI response
    store.addChatMessage(userId, "assistant", aiResponse);

    // Async: save conversation to Hindsight (don't await - non-blocking)
    storeConversation(userId, message, aiResponse).catch(console.error);

    res.json({
      success: true,
      data: {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: err.message || "Chat failed" });
  }
});

// ── GET /api/chat/:userId/history ─────────────
router.get("/:userId/history", (req, res) => {
  try {
    const user = store.getUser(req.params.userId);
    res.json({ success: true, data: user.chatHistory || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/chat/:userId/history ──────────
router.delete("/:userId/history", (req, res) => {
  try {
    store.updateUser(req.params.userId, { chatHistory: [] });
    res.json({ success: true, message: "Chat history cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
