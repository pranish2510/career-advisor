// ============================================
// pages/JobsPage.jsx - Jobs & Skill Gap
// ============================================
import React, { useState } from "react";
import {
  Briefcase, TrendingUp, Loader, Search,
  ExternalLink, CheckCircle, AlertCircle, Zap
} from "lucide-react";
import { jobsApi } from "../utils/api";

const MATCH_COLOR = (score) =>
  score >= 75 ? "var(--accent-green)" : score >= 50 ? "var(--accent-orange)" : "var(--accent-red)";

const MATCH_BADGE = (score) =>
  score >= 75 ? "badge-green" : score >= 50 ? "badge-orange" : "badge-red";

const POPULAR_ROLES = [
  "Software Development Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Data Analyst",
  "Data Scientist",
  "Product Manager",
  "UI/UX Designer",
  "DevOps Engineer",
  "Full Stack Developer",
  "Machine Learning Engineer",
];

export default function JobsPage({ userId }) {
  const [activeTab, setActiveTab] = useState("recommendations");
  const [recommendations, setRecommendations] = useState(null);
  const [skillGap, setSkillGap] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [loadingGap, setLoadingGap] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRecommendations = async () => {
    try {
      setLoadingRecs(true);
      const res = await jobsApi.getRecommendations(userId);
      setRecommendations(res.data.data);
    } catch (e) {
      showToast("Failed to load recommendations. Check your API key.", "error");
    } finally {
      setLoadingRecs(false);
    }
  };

  const fetchSkillGap = async (role) => {
    const r = role || targetRole;
    if (!r.trim()) { showToast("Enter or select a target role", "error"); return; }
    try {
      setLoadingGap(true);
      const res = await jobsApi.getSkillGap(userId, r);
      setSkillGap(res.data.data);
    } catch (e) {
      showToast("Skill gap analysis failed", "error");
    } finally {
      setLoadingGap(false);
    }
  };

  const readinessColor = (r) =>
    r >= 75 ? "var(--accent-green)" : r >= 50 ? "var(--accent-orange)" : "var(--accent-red)";

  const TABS = [
    { id: "recommendations", label: "💼 Job Recommendations" },
    { id: "skillgap", label: "📈 Skill Gap Analysis" },
  ];

  return (
    <div className="page fade-in">
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
        </div>
      )}

      <div className="page-header">
        <h1 className="page-title">Jobs & Career Intelligence</h1>
        <p className="page-subtitle">Personalized recommendations and skill gap analysis for the Indian job market</p>
      </div>

      {/* Tabs */}
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

      {/* ── RECOMMENDATIONS ─────────────────── */}
      {activeTab === "recommendations" && (
        <div>
          {!recommendations ? (
            <div className="card" style={{ textAlign: "center", padding: 56 }}>
              <Briefcase size={44} color="var(--accent-blue)" style={{ margin: "0 auto 16px" }} />
              <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Get Personalized Recommendations</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 24, maxWidth: 440, margin: "0 auto 24px" }}>
                Based on your skills, projects, and career goals — AI will suggest the best internships and jobs for you.
              </p>
              <button className="btn btn-primary" onClick={fetchRecommendations} disabled={loadingRecs} style={{ fontSize: 14, padding: "12px 28px" }}>
                {loadingRecs ? <><Loader size={16} className="spin" /> Generating...</> : <><Zap size={16} /> Get My Recommendations</>}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Quick Wins */}
              {recommendations.quickWins?.length > 0 && (
                <div className="card" style={{ background: "linear-gradient(135deg, var(--accent-blue-light), var(--bg-card))", borderColor: "var(--accent-blue)" }}>
                  <div className="card-title" style={{ color: "var(--accent-blue)" }}>⚡ Quick Wins — Do These Today</div>
                  {recommendations.quickWins.map((w, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, padding: "7px 0", borderBottom: "1px solid var(--border-light)", fontSize: 13 }}>
                      <CheckCircle size={14} color="var(--accent-green)" style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Job Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {recommendations.recommendations?.map((job, i) => (
                  <div key={job.id || i} className="card" style={{ borderLeft: `3px solid ${MATCH_COLOR(job.matchScore)}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{job.title}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{job.type} · {job.salaryRange} · {job.difficulty}</div>
                      </div>
                      <span className={`badge ${MATCH_BADGE(job.matchScore)}`} style={{ fontSize: 13, padding: "4px 12px" }}>
                        {job.matchScore}% match
                      </span>
                    </div>

                    <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>{job.reason}</p>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, fontWeight: 600 }}>COMPANIES</div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {job.companies?.map((c, j) => <span key={j} className="badge badge-blue">{c}</span>)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, fontWeight: 600 }}>APPLY ON</div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {job.platforms?.map((p, j) => <span key={j} className="badge badge-purple">{p}</span>)}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 }}>SKILLS NEEDED</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {job.requiredSkills?.map((s, j) => <span key={j} className="badge badge-orange">{s}</span>)}
                    </div>

                    {job.applyTips?.length > 0 && (
                      <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--bg-tertiary)", borderRadius: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>💡 TIPS</div>
                        {job.applyTips.map((t, j) => <div key={j} style={{ fontSize: 12, color: "var(--text-secondary)" }}>• {t}</div>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Top Platforms */}
              {recommendations.topPlatforms?.length > 0 && (
                <div className="card">
                  <div className="card-title">🌐 Best Platforms to Apply</div>
                  <div className="grid-3">
                    {recommendations.topPlatforms.map((p, i) => (
                      <div key={i} style={{ padding: "12px", background: "var(--bg-tertiary)", borderRadius: 10 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{p.focus}</div>
                        {p.url && <a href={p.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "var(--accent-blue)", display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>Visit <ExternalLink size={10} /></a>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ textAlign: "center" }}>
                <button className="btn btn-secondary" onClick={fetchRecommendations} disabled={loadingRecs}>
                  {loadingRecs ? "Refreshing..." : "🔄 Refresh Recommendations"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SKILL GAP ─────────────────────── */}
      {activeTab === "skillgap" && (
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title"><Search size={16} /> Choose Your Target Role</div>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label className="form-label">Target Role</label>
                <input className="input" placeholder="e.g. Data Scientist" value={targetRole} onChange={e => setTargetRole(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchSkillGap()} />
              </div>
              <button className="btn btn-primary" onClick={() => fetchSkillGap()} disabled={loadingGap}>
                {loadingGap ? <><Loader size={14} className="spin" /> Analyzing...</> : <><TrendingUp size={14} /> Analyze Gap</>}
              </button>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Popular Roles:</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {POPULAR_ROLES.map(r => (
                  <button key={r} onClick={() => { setTargetRole(r); fetchSkillGap(r); }}
                    className="badge badge-blue"
                    style={{ cursor: "pointer", border: "none", fontFamily: "var(--font)", fontSize: 11 }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {skillGap && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Readiness */}
              <div className="card" style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <div className="score-circle" style={{
                  borderColor: readinessColor(skillGap.overallReadiness),
                  color: readinessColor(skillGap.overallReadiness),
                  width: 90, height: 90,
                }}>
                  <span className="score-number">{skillGap.overallReadiness}</span>
                  <span className="score-label">%</span>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{skillGap.readinessLabel}</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>for <strong>{skillGap.targetRole}</strong></div>
                  <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>⏱ {skillGap.estimatedTimeReady}</div>
                </div>
              </div>

              {/* Current Strengths */}
              {skillGap.currentStrengths?.length > 0 && (
                <div className="card">
                  <div className="card-title" style={{ color: "var(--accent-green)" }}>✅ Your Existing Strengths</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {skillGap.currentStrengths.map((s, i) => <span key={i} className="badge badge-green">{s}</span>)}
                  </div>
                </div>
              )}

              {/* Critical Gaps */}
              <div className="card">
                <div className="card-title" style={{ color: "var(--accent-red)" }}>⚠ Skills You Need to Learn</div>
                {skillGap.criticalGaps?.map((gap, i) => (
                  <div key={i} style={{ padding: "12px 0", borderBottom: "1px solid var(--border-light)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{gap.skill}</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span className={`badge ${gap.importance === "Critical" ? "badge-red" : gap.importance === "Important" ? "badge-orange" : "badge-blue"}`}>{gap.importance}</span>
                        <span className="badge" style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>~{gap.timeToLearn}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {gap.resources?.map((r, j) => (
                        <span key={j} className={`badge ${r.free ? "badge-green" : "badge-orange"}`}
                          style={{ cursor: r.url && r.url !== "#" ? "pointer" : "default" }}>
                          {r.free ? "Free" : "Paid"}: {r.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Learning Roadmap */}
              <div className="card">
                <div className="card-title">🗺 Learning Roadmap</div>
                <div style={{ position: "relative" }}>
                  {skillGap.learningRoadmap?.map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 16, paddingBottom: 20 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent-blue)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                        {i < skillGap.learningRoadmap.length - 1 && <div style={{ width: 2, flex: 1, background: "var(--border)", marginTop: 4 }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{step.week}</div>
                        <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{step.focus}</div>
                        <div style={{ fontSize: 12, color: "var(--accent-green)", marginTop: 4 }}>🎯 {step.goal}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects & Certs */}
              <div className="grid-2">
                <div className="card">
                  <div className="card-title">🚀 Projects to Build</div>
                  {skillGap.projectIdeas?.map((p, i) => (
                    <div key={i} style={{ padding: "6px 0", borderBottom: "1px solid var(--border-light)", fontSize: 13 }}>
                      <span style={{ color: "var(--accent-blue)" }}>→</span> {p}
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div className="card-title">🏅 Certifications</div>
                  {skillGap.certifications?.map((c, i) => (
                    <div key={i} style={{ padding: "6px 0", borderBottom: "1px solid var(--border-light)", fontSize: 13 }}>
                      <span style={{ color: "var(--accent-orange)" }}>✦</span> {c}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`.spin { animation: spin 0.7s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
