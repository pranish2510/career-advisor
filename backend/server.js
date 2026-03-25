// ============================================
// SERVER.JS - Main Express Application
// ============================================
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security & Middleware ────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Rate Limiting ────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api/", apiLimiter);

// ── Static uploads ────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ────────────────────────────────────
app.use("/api/chat", require("./routes/chat"));
app.use("/api/resume", require("./routes/resume"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/jobs", require("./routes/jobs"));
app.use("/api/memory", require("./routes/memory"));

// ── Health Check ──────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "AI Career Advisor API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// ── Global Error Handler ─────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ── 404 Handler ───────────────────────────────
app.use("*", (req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Career Advisor API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}\n`);
});

module.exports = app;
