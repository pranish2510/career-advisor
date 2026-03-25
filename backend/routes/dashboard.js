// ============================================
// routes/dashboard.js - Student Dashboard API
// ============================================
const express = require("express");
const router = express.Router();
const store = require("../utils/store");
const { storeUserProfile } = require("../utils/hindsight");

// ── GET full dashboard data ───────────────────
router.get("/:userId", (req, res) => {
  try {
    const user = store.getUser(req.params.userId);
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── UPDATE profile (goals, summary) ──────────
router.put("/:userId/profile", (req, res) => {
  try {
    const { careerGoals, resumeSummary } = req.body;
    const updated = store.updateUser(req.params.userId, {
      careerGoals,
      resumeSummary,
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────
// SKILLS
// ──────────────────────────────────────────────
router.get("/:userId/skills", (req, res) => {
  const user = store.getUser(req.params.userId);
  res.json({ success: true, data: user.skills });
});

router.post("/:userId/skills", (req, res) => {
  try {
    const { name, level, category } = req.body;
    if (!name) return res.status(400).json({ error: "Skill name required" });
    const item = store.addToArray(req.params.userId, "skills", {
      name,
      level: level || "Beginner",
      category: category || "Technical",
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:userId/skills/:id", (req, res) => {
  try {
    store.removeFromArray(req.params.userId, "skills", req.params.id);
    res.json({ success: true, message: "Skill removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────
// PROJECTS
// ──────────────────────────────────────────────
router.get("/:userId/projects", (req, res) => {
  const user = store.getUser(req.params.userId);
  res.json({ success: true, data: user.projects });
});

router.post("/:userId/projects", (req, res) => {
  try {
    const { name, description, tech, link, status } = req.body;
    if (!name) return res.status(400).json({ error: "Project name required" });
    const item = store.addToArray(req.params.userId, "projects", {
      name,
      description: description || "",
      tech: tech || [],
      link: link || "",
      status: status || "In Progress",
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:userId/projects/:id", (req, res) => {
  try {
    const updated = store.updateInArray(
      req.params.userId,
      "projects",
      req.params.id,
      req.body
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:userId/projects/:id", (req, res) => {
  try {
    store.removeFromArray(req.params.userId, "projects", req.params.id);
    res.json({ success: true, message: "Project removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────
// INTERNSHIP APPLICATIONS
// ──────────────────────────────────────────────
router.get("/:userId/applications", (req, res) => {
  const user = store.getUser(req.params.userId);
  res.json({ success: true, data: user.applications });
});

router.post("/:userId/applications", (req, res) => {
  try {
    const { company, role, status, appliedDate, notes, link } = req.body;
    if (!company || !role)
      return res.status(400).json({ error: "Company and role required" });
    const item = store.addToArray(req.params.userId, "applications", {
      company,
      role,
      status: status || "Applied",
      appliedDate: appliedDate || new Date().toISOString().split("T")[0],
      notes: notes || "",
      link: link || "",
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:userId/applications/:id", (req, res) => {
  try {
    const updated = store.updateInArray(
      req.params.userId,
      "applications",
      req.params.id,
      req.body
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:userId/applications/:id", (req, res) => {
  try {
    store.removeFromArray(req.params.userId, "applications", req.params.id);
    res.json({ success: true, message: "Application removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Sync user profile to Hindsight memory ─────
router.post("/:userId/sync-memory", async (req, res) => {
  try {
    const user = store.getUser(req.params.userId);
    await storeUserProfile(req.params.userId, {
      skills: user.skills.map((s) => s.name),
      projects: user.projects,
      applications: user.applications,
      resumeSummary: user.resumeSummary,
      careerGoals: user.careerGoals,
    });
    res.json({ success: true, message: "Profile synced to memory" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
