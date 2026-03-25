// ============================================
// utils/gemini.js - Gemini AI Integration
// ============================================
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get a Gemini model instance
 * @param {string} modelName - model to use
 */
function getModel(modelName = "gemini-1.5-flash") {
  return genAI.getGenerativeModel({ model: modelName });
}

/**
 * Generate a single response from Gemini
 * @param {string} prompt - The prompt to send
 * @param {string} systemPrompt - Optional system instruction
 * @returns {Promise<string>} - The AI response text
 */
async function generateContent(prompt, systemPrompt = "") {
  try {
    const model = getModel();
    const fullPrompt = systemPrompt
      ? `${systemPrompt}\n\n${prompt}`
      : prompt;
    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini generateContent error:", error.message);
    throw new Error(`AI generation failed: ${error.message}`);
  }
}

/**
 * Start or continue a multi-turn chat with history
 * @param {Array} history - Array of {role, parts} objects
 * @param {string} message - New user message
 * @param {string} systemPrompt - System context
 * @returns {Promise<string>} - AI response text
 */
async function chatWithHistory(history = [], message, systemPrompt = "") {
  try {
    const model = getModel();

    // Build the full history for Gemini format
    const formattedHistory = history.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    const fullMessage = systemPrompt
      ? `[Context]: ${systemPrompt}\n\n[User]: ${message}`
      : message;

    const result = await chat.sendMessage(fullMessage);
    return result.response.text();
  } catch (error) {
    console.error("Gemini chat error:", error.message);
    throw new Error(`Chat failed: ${error.message}`);
  }
}

/**
 * Parse JSON from Gemini response (handles markdown code blocks)
 * @param {string} text - Raw AI response
 * @returns {object} - Parsed JSON
 */
function parseAIJson(text) {
  // Remove markdown code fences if present
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(cleaned);
}

module.exports = { generateContent, chatWithHistory, parseAIJson, getModel };
