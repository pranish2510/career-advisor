// ============================================
// routes/memory.js - Hindsight Memory Routes
// ============================================
const express = require("express");
const router = express.Router();
const { storeMemory, retrieveMemory, storeUserProfile } = require("../utils/hindsight");
const store = require("../utils/store");

// ── POST /api/memory/:userId/store ────────────
router.post("/:userId/store", async (req, res) => {
  try {
    const { content, metadata } = req.body;
    if (!content) return res.status(400).json({ error: "Content required" });
    const result = await storeMemory(req.params.userId, content, metadata || {});
    res.json({ success: true, data: result || { message: "Stored (Hindsight not configured)" } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/memory/:userId/retrieve ─────────
router.post("/:userId/retrieve", async (req, res) => {
  try {
    const { query, topK = 5 } = req.body;
    if (!query) return res.status(400).json({ error: "Query required" });
    const results = await retrieveMemory(req.params.userId, query, topK);
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/memory/:userId/sync ─────────────
router.post("/:userId/sync", async (req, res) => {
  try {
    const user = store.getUser(req.params.userId);
    await storeUserProfile(req.params.userId, {
      skills: user.skills?.map((s) => s.name) || [],
      projects: user.projects || [],
      applications: user.applications || [],
      resumeSummary: user.resumeAnalysis?.summary,
      careerGoals: user.careerGoals,
    });
    res.json({ success: true, message: "Synced to Hindsight Cloud" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
