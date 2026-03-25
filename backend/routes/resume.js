// ============================================
// routes/resume.js - Resume Analyzer API
// ============================================
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { generateContent, parseAIJson } = require("../utils/gemini");
const { storeMemory } = require("../utils/hindsight");
const store = require("../utils/store");

// ── Multer setup (file upload) ─────────────────
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, "_")}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF, DOCX, and TXT files allowed"), false);
  },
});

// ── Extract text from uploaded file ───────────
async function extractText(filePath, mimetype) {
  if (mimetype === "application/pdf") {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } else if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } else {
    return fs.readFileSync(filePath, "utf-8");
  }
}

// ── POST /api/resume/:userId/upload ───────────
router.post("/:userId/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const text = await extractText(req.file.path, req.file.mimetype);

    if (text.trim().length < 50) {
      return res
        .status(400)
        .json({ error: "Could not extract text from resume. Try a text-based PDF." });
    }

    // Save resume text in user store
    store.updateUser(req.params.userId, {
      resumeText: text,
      resumeFileName: req.file.originalname,
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: "Resume uploaded and parsed",
      data: {
        fileName: req.file.originalname,
        textLength: text.length,
        preview: text.substring(0, 300) + "...",
      },
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/resume/:userId/analyze ──────────
router.post("/:userId/analyze", async (req, res) => {
  try {
    const user = store.getUser(req.params.userId);
    const resumeText = req.body.resumeText || user.resumeText;

    if (!resumeText) {
      return res.status(400).json({ error: "No resume text. Upload a resume first." });
    }

    const prompt = `You are an expert resume reviewer and career coach. Analyze this resume thoroughly.

RESUME TEXT:
${resumeText.substring(0, 4000)}

Provide a detailed analysis in this EXACT JSON format (no markdown, raw JSON only):
{
  "score": <number 0-100>,
  "grade": "<A/B/C/D/F>",
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<weakness1>", "<weakness2>", "<weakness3>"],
  "missingKeywords": ["<keyword1>", "<keyword2>", "<keyword3>", "<keyword4>", "<keyword5>"],
  "atsScore": <number 0-100>,
  "atsIssues": ["<ats issue1>", "<ats issue2>"],
  "formattingTips": ["<tip1>", "<tip2>", "<tip3>"],
  "grammarIssues": ["<issue1>", "<issue2>"],
  "topSuggestions": ["<actionable suggestion1>", "<suggestion2>", "<suggestion3>", "<suggestion4>", "<suggestion5>"],
  "extractedSkills": ["<skill1>", "<skill2>", "<skill3>"],
  "experienceLevel": "<Fresher/Junior/Mid/Senior>",
  "targetRoles": ["<suitable role1>", "<suitable role2>", "<suitable role3>"]
}`;

    const rawResponse = await generateContent(prompt);
    const analysis = parseAIJson(rawResponse);

    // Save score and extracted skills to user store
    store.updateUser(req.params.userId, {
      resumeScore: analysis.score,
      resumeAnalysis: analysis,
    });

    // Sync to Hindsight memory
    storeMemory(
      req.params.userId,
      `Resume analyzed. Score: ${analysis.score}/100. Skills found: ${analysis.extractedSkills?.join(", ")}. Target roles: ${analysis.targetRoles?.join(", ")}`,
      { type: "resume_analysis" }
    ).catch(console.error);

    res.json({ success: true, data: analysis });
  } catch (err) {
    console.error("Analysis error:", err);
    res.status(500).json({ error: "Resume analysis failed: " + err.message });
  }
});

// ── POST /api/resume/:userId/match ────────────
// Match resume against a job description
router.post("/:userId/match", async (req, res) => {
  try {
    const { jobDescription } = req.body;
    const user = store.getUser(req.params.userId);
    const resumeText = user.resumeText;

    if (!resumeText) {
      return res.status(400).json({ error: "No resume found. Upload a resume first." });
    }
    if (!jobDescription) {
      return res.status(400).json({ error: "Job description is required" });
    }

    const prompt = `You are an ATS (Applicant Tracking System) and career coach. Compare this resume against the job description.

RESUME:
${resumeText.substring(0, 3000)}

JOB DESCRIPTION:
${jobDescription.substring(0, 2000)}

Respond ONLY with raw JSON (no markdown):
{
  "matchScore": <0-100>,
  "verdict": "<Strong Match/Good Match/Partial Match/Weak Match>",
  "matchedKeywords": ["<keyword1>", "<keyword2>", "<keyword3>"],
  "missingKeywords": ["<missing1>", "<missing2>", "<missing3>", "<missing4>"],
  "matchedSkills": ["<skill1>", "<skill2>"],
  "missingSkills": ["<skill1>", "<skill2>", "<skill3>"],
  "roleSpecificTips": ["<tip1>", "<tip2>", "<tip3>"],
  "resumeChanges": ["<change1>", "<change2>", "<change3>"],
  "coverLetterPoints": ["<point1>", "<point2>", "<point3>"],
  "overallAdvice": "<2-3 sentence summary>"
}`;

    const rawResponse = await generateContent(prompt);
    const matchResult = parseAIJson(rawResponse);

    res.json({ success: true, data: matchResult });
  } catch (err) {
    console.error("Match error:", err);
    res.status(500).json({ error: "Job matching failed: " + err.message });
  }
});

// ── POST /api/resume/:userId/improve ──────────
// Improve a specific bullet point or section
router.post("/:userId/improve", async (req, res) => {
  try {
    const { text, type = "bullet", context = "" } = req.body;

    if (!text) return res.status(400).json({ error: "Text to improve is required" });

    const prompt = `You are an expert resume writer. Improve this resume ${type}.

ORIGINAL TEXT: "${text}"
${context ? `CONTEXT: ${context}` : ""}

Rules:
- Start with a strong action verb
- Make it quantified/measurable where possible
- ATS-friendly with relevant keywords
- Professional and concise
- Max 2 lines

Respond ONLY with raw JSON:
{
  "improved": "<improved version>",
  "alternatives": ["<alternative1>", "<alternative2>"],
  "explanation": "<brief explanation of changes>",
  "actionVerbs": ["<verb1>", "<verb2>", "<verb3>"]
}`;

    const rawResponse = await generateContent(prompt);
    const result = parseAIJson(rawResponse);

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: "Improvement failed: " + err.message });
  }
});

// ── GET /api/resume/:userId ────────────────────
router.get("/:userId", (req, res) => {
  try {
    const user = store.getUser(req.params.userId);
    res.json({
      success: true,
      data: {
        hasResume: !!user.resumeText,
        fileName: user.resumeFileName,
        score: user.resumeScore,
        analysis: user.resumeAnalysis,
        preview: user.resumeText ? user.resumeText.substring(0, 500) : null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
