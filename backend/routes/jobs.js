// ============================================
// routes/jobs.js - Job Recommendations & Skill Gap
// ============================================
const express = require("express");
const router = express.Router();
const { generateContent, parseAIJson } = require("../utils/gemini");
const store = require("../utils/store");

// ── GET /api/jobs/:userId/recommendations ─────
router.get("/:userId/recommendations", async (req, res) => {
  try {
    const user = store.getUser(req.params.userId);
    const skills = (user.skills || []).map((s) => s.name).join(", ") || "beginner programmer";
    const goals = user.careerGoals || "software engineering";
    const resumeAnalysis = user.resumeAnalysis;

    const prompt = `You are a job market expert specializing in the Indian tech industry and internships.

Student Profile:
- Skills: ${skills}
- Career Goals: ${goals}
- Experience Level: ${resumeAnalysis?.experienceLevel || "Fresher/Student"}
- Target Roles from Resume: ${resumeAnalysis?.targetRoles?.join(", ") || "General Tech"}

Generate personalized internship and job recommendations.
Respond ONLY with raw JSON:
{
  "recommendations": [
    {
      "id": "1",
      "title": "<job title>",
      "type": "<Internship/Full-time/Part-time>",
      "companies": ["<company1>", "<company2>", "<company3>"],
      "platforms": ["<platform1>", "<platform2>"],
      "requiredSkills": ["<skill1>", "<skill2>", "<skill3>"],
      "matchScore": <0-100>,
      "salaryRange": "<range in INR>",
      "difficulty": "<Easy/Medium/Hard to get>",
      "reason": "<why this is a good fit>",
      "applyTips": ["<tip1>", "<tip2>"]
    }
  ],
  "topPlatforms": [
    {"name": "<platform>", "url": "<url>", "focus": "<what it's best for>"}
  ],
  "quickWins": ["<actionable thing to do today1>", "<action2>", "<action3>"]
}
Include 5-6 recommendations covering internships and entry-level roles. Focus on Indian market.`;

    const rawResponse = await generateContent(prompt);
    const result = parseAIJson(rawResponse);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Recommendations error:", err);
    res.status(500).json({ error: "Failed to get recommendations: " + err.message });
  }
});

// ── GET /api/jobs/:userId/skill-gap ───────────
router.post("/:userId/skill-gap", async (req, res) => {
  try {
    const { targetRole } = req.body;
    const user = store.getUser(req.params.userId);
    const userSkills = (user.skills || []).map((s) => s.name);

    if (!targetRole) {
      return res.status(400).json({ error: "Target role is required" });
    }

    const prompt = `You are a career coach and technical hiring expert. Analyze the skill gap.

Target Role: ${targetRole}
Student's Current Skills: ${userSkills.join(", ") || "none listed"}
Experience Level: ${user.resumeAnalysis?.experienceLevel || "Fresher"}

Respond ONLY with raw JSON:
{
  "targetRole": "${targetRole}",
  "overallReadiness": <0-100>,
  "readinessLabel": "<Not Ready/Getting There/Almost Ready/Ready>",
  "currentStrengths": ["<matching skill1>", "<matching skill2>"],
  "criticalGaps": [
    {
      "skill": "<skill name>",
      "importance": "<Critical/Important/Nice to have>",
      "resources": [
        {"name": "<resource name>", "url": "<url or platform>", "free": true/false}
      ],
      "timeToLearn": "<estimated time>"
    }
  ],
  "learningRoadmap": [
    {"week": "Week 1-2", "focus": "<what to learn>", "goal": "<milestone>"},
    {"week": "Week 3-4", "focus": "<what to learn>", "goal": "<milestone>"},
    {"week": "Month 2", "focus": "<what to learn>", "goal": "<milestone>"},
    {"week": "Month 3", "focus": "<what to learn>", "goal": "<milestone>"}
  ],
  "projectIdeas": ["<project to build1>", "<project2>", "<project3>"],
  "certifications": ["<cert1>", "<cert2>"],
  "estimatedTimeReady": "<e.g., 2-3 months with consistent effort>"
}`;

    const rawResponse = await generateContent(prompt);
    const result = parseAIJson(rawResponse);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Skill gap error:", err);
    res.status(500).json({ error: "Skill gap analysis failed: " + err.message });
  }
});

module.exports = router;
