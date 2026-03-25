// ============================================
// pages/ResumeAnalyzer.jsx
// ============================================
import React, { useState, useEffect, useRef } from "react";
import {
  Upload, FileText, Zap, Target, CheckCircle,
  AlertTriangle, TrendingUp, Loader, Copy, Wand2
} from "lucide-react";
import { resumeApi } from "../utils/api";

export default function ResumeAnalyzer({ userId }) {
  const [activeTab, setActiveTab] = useState("upload");
  const [resumeData, setResumeData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [improvingText, setImprovingText] = useState("");
  const [improveResult, setImproveResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [matching, setMatching] = useState(false);
  const [improving, setImproving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await resumeApi.get(userId);
        setResumeData(res.data.data);
        if (res.data.data.analysis) setAnalysis(res.data.data.analysis);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [userId]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFile = async (file) => {
    if (!file) return;
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!allowed.includes(file.type)) { showToast("Only PDF, DOCX, or TXT allowed", "error"); return; }

    const fd = new FormData();
    fd.append("resume", file);

    try {
      setUploading(true);
      const res = await resumeApi.upload(userId, fd);
      setResumeData({ ...resumeData, hasResume: true, fileName: file.name });
      showToast("Resume uploaded! Click Analyze to score it.");
      setActiveTab("analyze");
    } catch (e) {
      showToast(e.response?.data?.error || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      const res = await resumeApi.analyze(userId);
      setAnalysis(res.data.data);
      setResumeData(prev => ({ ...prev, score: res.data.data.score }));
      showToast("Analysis complete!");
    } catch (e) {
      showToast(e.response?.data?.error || "Analysis failed", "error");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleMatch = async () => {
    if (!jobDesc.trim()) { showToast("Paste a job description first", "error"); return; }
    try {
      setMatching(true);
      const res = await resumeApi.match(userId, jobDesc);
      setMatchResult(res.data.data);
    } catch (e) {
      showToast(e.response?.data?.error || "Match failed", "error");
    } finally {
      setMatching(false);
    }
  };

  const handleImprove = async () => {
    if (!improvingText.trim()) { showToast("Enter text to improve", "error"); return; }
    try {
      setImproving(true);
      const res = await resumeApi.improve(userId, improvingText, "bullet");
      setImproveResult(res.data.data);
    } catch (e) {
      showToast(e.response?.data?.error || "Improvement failed", "error");
    } finally {
      setImproving(false);
    }
  };

  const scoreColor = (s) => s >= 75 ? "var(--accent-green)" : s >= 50 ? "var(--accent-orange)" : "var(--accent-red)";

  const TABS = [
    { id: "upload", label: "📤 Upload" },
    { id: "analyze", label: "📊 Analyze" },
    { id: "match", label: "🎯 Job Match" },
    { id: "improve", label: "✨ Improve" },
  ];

  if (loading) return (
    <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  return (
    <div className="page fade-in">
      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
        </div>
      )}

      <div className="page-header">
        <h1 className="page-title">Resume AI Analyzer</h1>
        <p className="page-subtitle">
          Upload, score, and optimize your resume with AI
          {resumeData?.fileName && <span> · <strong>{resumeData.fileName}</strong></span>}
        </p>
      </div>

      {/* Score bar at top if analyzed */}
      {analysis && (
        <div className="card" style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 20, background: `linear-gradient(135deg, ${scoreColor(analysis.score)}15, var(--bg-card))` }}>
          <div className="score-circle" style={{ borderColor: scoreColor(analysis.score), color: scoreColor(analysis.score), width: 80, height: 80 }}>
            <span className="score-number" style={{ fontSize: 22 }}>{analysis.score}</span>
            <span className="score-label">/100</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20, fontWeight: 700 }}>{analysis.grade} Grade</span>
              <span className="badge badge-blue">{analysis.experienceLevel}</span>
              <span className="badge badge-green">ATS: {analysis.atsScore}/100</span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>{analysis.summary}</p>
          </div>
        </div>
      )}

      {/* Tab navigation */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid var(--border)" }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 16px", background: "none", border: "none",
              borderBottom: activeTab === tab.id ? "2px solid var(--accent-blue)" : "2px solid transparent",
              cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "var(--font)",
              color: activeTab === tab.id ? "var(--accent-blue)" : "var(--text-secondary)",
              marginBottom: -1, transition: "all 0.2s",
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── UPLOAD TAB ─────────────────────── */}
      {activeTab === "upload" && (
        <div>
          <div
            className="card"
            style={{
              border: `2px dashed ${dragOver ? "var(--accent-blue)" : "var(--border)"}`,
              background: dragOver ? "var(--accent-blue-light)" : "var(--bg-card)",
              textAlign: "center", padding: 48, cursor: "pointer", transition: "all 0.2s",
            }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" hidden onChange={(e) => handleFile(e.target.files[0])} />
            {uploading ? (
              <div><div className="spinner" style={{ margin: "0 auto 12px", width: 36, height: 36 }} /><p>Uploading & parsing...</p></div>
            ) : (
              <>
                <Upload size={40} color="var(--accent-blue)" style={{ margin: "0 auto 16px", display: "block" }} />
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Drop your resume here</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>PDF, DOCX, or TXT · Max 5MB</p>
                <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  <Upload size={14} /> Choose File
                </button>
              </>
            )}
          </div>

          {resumeData?.hasResume && (
            <div className="card" style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
              <FileText size={20} color="var(--accent-green)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{resumeData.fileName || "Resume uploaded"}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Ready for analysis</div>
              </div>
              <button className="btn btn-primary" onClick={() => setActiveTab("analyze")}>Analyze Now →</button>
            </div>
          )}
        </div>
      )}

      {/* ── ANALYZE TAB ─────────────────────── */}
      {activeTab === "analyze" && (
        <div>
          {!resumeData?.hasResume ? (
            <div className="empty-state">
              <div className="empty-state-icon">📄</div>
              <div className="empty-state-text">Upload a resume first</div>
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setActiveTab("upload")}>Upload Resume</button>
            </div>
          ) : (
            <>
              {!analysis ? (
                <div className="card" style={{ textAlign: "center", padding: 48 }}>
                  <Zap size={40} color="var(--accent-blue)" style={{ margin: "0 auto 16px" }} />
                  <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Ready to Analyze</h3>
                  <p style={{ color: "var(--text-secondary)", marginBottom: 20, fontSize: 13 }}>
                    Get your resume score, ATS compatibility, strengths/weaknesses, and more.
                  </p>
                  <button className="btn btn-primary" onClick={handleAnalyze} disabled={analyzing} style={{ fontSize: 15, padding: "12px 28px" }}>
                    {analyzing ? <><Loader size={16} className="spin" /> Analyzing...</> : <><Zap size={16} /> Analyze Resume</>}
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div className="grid-2">
                    {/* Strengths */}
                    <div className="card">
                      <div className="card-title" style={{ color: "var(--accent-green)" }}><CheckCircle size={16} /> Strengths</div>
                      {analysis.strengths?.map((s, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13 }}>
                          <span style={{ color: "var(--accent-green)" }}>✓</span>
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>

                    {/* Weaknesses */}
                    <div className="card">
                      <div className="card-title" style={{ color: "var(--accent-red)" }}><AlertTriangle size={16} /> Areas to Improve</div>
                      {analysis.weaknesses?.map((w, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13 }}>
                          <span style={{ color: "var(--accent-red)" }}>⚠</span>
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Suggestions */}
                  <div className="card">
                    <div className="card-title"><TrendingUp size={16} /> Top Suggestions</div>
                    {analysis.topSuggestions?.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border-light)", fontSize: 13 }}>
                        <span className="badge badge-blue" style={{ flexShrink: 0 }}>{i + 1}</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid-2">
                    {/* Missing Keywords */}
                    <div className="card">
                      <div className="card-title">🔑 Missing Keywords</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {analysis.missingKeywords?.map((k, i) => (
                          <span key={i} className="badge badge-orange">{k}</span>
                        ))}
                      </div>
                    </div>

                    {/* Target Roles */}
                    <div className="card">
                      <div className="card-title">🎯 Suitable Roles</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {analysis.targetRoles?.map((r, i) => (
                          <span key={i} className="badge badge-purple">{r}</span>
                        ))}
                      </div>
                      <div className="divider" style={{ margin: "12px 0" }} />
                      <div className="card-title" style={{ marginBottom: 8 }}>✅ Extracted Skills</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {analysis.extractedSkills?.map((s, i) => (
                          <span key={i} className="badge badge-green">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ATS Issues */}
                  {analysis.atsIssues?.length > 0 && (
                    <div className="card">
                      <div className="card-title">🤖 ATS Issues</div>
                      {analysis.atsIssues.map((issue, i) => (
                        <div key={i} style={{ fontSize: 13, padding: "6px 0", borderBottom: "1px solid var(--border-light)", color: "var(--text-secondary)" }}>
                          • {issue}
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ textAlign: "center" }}>
                    <button className="btn btn-secondary" onClick={handleAnalyze} disabled={analyzing}>
                      {analyzing ? "Re-analyzing..." : "🔄 Re-analyze"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── JOB MATCH TAB ─────────────────────── */}
      {activeTab === "match" && (
        <div>
          {!resumeData?.hasResume ? (
            <div className="empty-state">
              <div className="empty-state-icon">📄</div>
              <div className="empty-state-text">Upload a resume first</div>
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setActiveTab("upload")}>Upload Resume</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="card">
                <div className="card-title"><Target size={16} /> Paste Job Description</div>
                <textarea
                  className="textarea"
                  placeholder="Paste the full job description here..."
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  style={{ minHeight: 160 }}
                />
                <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={handleMatch} disabled={matching}>
                  {matching ? <><Loader size={14} className="spin" /> Matching...</> : <><Target size={14} /> Match Resume</>}
                </button>
              </div>

              {matchResult && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Score header */}
                  <div className="card" style={{ display: "flex", alignItems: "center", gap: 20, background: `linear-gradient(135deg, ${scoreColor(matchResult.matchScore)}15, var(--bg-card))` }}>
                    <div className="score-circle" style={{ borderColor: scoreColor(matchResult.matchScore), color: scoreColor(matchResult.matchScore), width: 80, height: 80 }}>
                      <span className="score-number" style={{ fontSize: 22 }}>{matchResult.matchScore}</span>
                      <span className="score-label">%</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>{matchResult.verdict}</div>
                      <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>{matchResult.overallAdvice}</p>
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="card">
                      <div className="card-title" style={{ color: "var(--accent-green)" }}>✅ Matched Keywords</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {matchResult.matchedKeywords?.map((k, i) => <span key={i} className="badge badge-green">{k}</span>)}
                      </div>
                    </div>
                    <div className="card">
                      <div className="card-title" style={{ color: "var(--accent-red)" }}>❌ Missing Keywords</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {matchResult.missingKeywords?.map((k, i) => <span key={i} className="badge badge-red">{k}</span>)}
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-title">📝 Resume Changes to Make</div>
                    {matchResult.resumeChanges?.map((c, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, padding: "8px 0", borderBottom: "1px solid var(--border-light)", fontSize: 13 }}>
                        <span className="badge badge-blue" style={{ flexShrink: 0 }}>{i + 1}</span>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>

                  <div className="card">
                    <div className="card-title">💌 Cover Letter Key Points</div>
                    {matchResult.coverLetterPoints?.map((p, i) => (
                      <div key={i} style={{ fontSize: 13, padding: "6px 0", borderBottom: "1px solid var(--border-light)", color: "var(--text-secondary)" }}>• {p}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── IMPROVE TAB ─────────────────────── */}
      {activeTab === "improve" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <div className="card-title"><Wand2 size={16} /> AI Bullet Point Improver</div>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 14 }}>
              Paste any resume bullet point or sentence. AI will rewrite it with stronger action verbs and quantifiable impact.
            </p>
            <textarea
              className="textarea"
              placeholder="e.g. 'worked on backend features for the company website'"
              value={improvingText}
              onChange={(e) => setImprovingText(e.target.value)}
              style={{ minHeight: 80 }}
            />
            <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={handleImprove} disabled={improving}>
              {improving ? <><Loader size={14} className="spin" /> Improving...</> : <><Wand2 size={14} /> Improve Text</>}
            </button>
          </div>

          {improveResult && (
            <div className="card" style={{ borderLeft: "3px solid var(--accent-blue)" }}>
              <div className="card-title" style={{ color: "var(--accent-blue)" }}>✨ Improved Version</div>
              <div style={{ padding: "12px 16px", background: "var(--accent-blue-light)", borderRadius: 8, fontSize: 14, fontWeight: 500, marginBottom: 12 }}>
                {improveResult.improved}
                <button className="btn btn-ghost btn-sm" style={{ marginLeft: 8 }} onClick={() => navigator.clipboard.writeText(improveResult.improved)}>
                  <Copy size={12} />
                </button>
              </div>

              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 10 }}>
                <strong>Why this works:</strong> {improveResult.explanation}
              </div>

              {improveResult.alternatives?.length > 0 && (
                <>
                  <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 8 }}>Alternatives:</div>
                  {improveResult.alternatives.map((alt, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "var(--bg-tertiary)", borderRadius: 6, marginBottom: 6, fontSize: 13 }}>
                      <span>{alt}</span>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard.writeText(alt)}><Copy size={12} /></button>
                    </div>
                  ))}
                </>
              )}

              {improveResult.actionVerbs?.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 6 }}>Power Action Verbs:</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {improveResult.actionVerbs.map((v, i) => <span key={i} className="badge badge-purple">{v}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`.spin { animation: spin 0.7s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
