// ============================================
// pages/Dashboard.jsx - Student Dashboard
// ============================================
import React, { useState, useEffect, useCallback } from "react";
import {
  Plus, Trash2, Code, FolderOpen, Briefcase,
  Target, RefreshCw, CheckCircle, Clock, XCircle, TrendingUp
} from "lucide-react";
import { dashboardApi } from "../utils/api";
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from "recharts";

const STATUS_CONFIG = {
  Applied: { color: "badge-blue", icon: Clock },
  Interview: { color: "badge-purple", icon: Target },
  Offer: { color: "badge-green", icon: CheckCircle },
  Rejected: { color: "badge-red", icon: XCircle },
};

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const SKILL_CATEGORIES = ["Technical", "Frontend", "Backend", "Data", "Design", "Soft Skill", "Other"];

export default function Dashboard({ userId, onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Forms
  const [skillForm, setSkillForm] = useState({ name: "", level: "Beginner", category: "Technical" });
  const [projectForm, setProjectForm] = useState({ name: "", description: "", tech: "", status: "In Progress" });
  const [appForm, setAppForm] = useState({ company: "", role: "", status: "Applied", appliedDate: new Date().toISOString().split("T")[0], notes: "" });
  const [syncing, setSyncing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.get(userId);
      setData(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!skillForm.name.trim()) return;
    await dashboardApi.addSkill(userId, skillForm);
    setSkillForm({ name: "", level: "Beginner", category: "Technical" });
    fetchData();
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!projectForm.name.trim()) return;
    await dashboardApi.addProject(userId, {
      ...projectForm,
      tech: projectForm.tech.split(",").map((t) => t.trim()).filter(Boolean),
    });
    setProjectForm({ name: "", description: "", tech: "", status: "In Progress" });
    fetchData();
  };

  const handleAddApp = async (e) => {
    e.preventDefault();
    if (!appForm.company.trim() || !appForm.role.trim()) return;
    await dashboardApi.addApplication(userId, appForm);
    setAppForm({ company: "", role: "", status: "Applied", appliedDate: new Date().toISOString().split("T")[0], notes: "" });
    fetchData();
  };

  const handleUpdateAppStatus = async (id, status) => {
    await dashboardApi.updateApplication(userId, id, { status });
    fetchData();
  };

  const handleSync = async () => {
    setSyncing(true);
    try { await dashboardApi.syncMemory(userId); } catch (e) {}
    setSyncing(false);
  };

  if (loading) return (
    <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  const { skills = [], projects = [], applications = [] } = data || {};
  const appStats = {
    total: applications.length,
    applied: applications.filter(a => a.status === "Applied").length,
    interview: applications.filter(a => a.status === "Interview").length,
    offer: applications.filter(a => a.status === "Offer").length,
  };

  const chartData = [
    { name: "Skills", value: Math.min(skills.length * 10, 100), fill: "#3b82f6" },
    { name: "Projects", value: Math.min(projects.length * 20, 100), fill: "#10b981" },
    { name: "Applied", value: Math.min(applications.length * 10, 100), fill: "#f59e0b" },
  ];

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "skills", label: `Skills (${skills.length})` },
    { id: "projects", label: `Projects (${projects.length})` },
    { id: "applications", label: `Applications (${applications.length})` },
  ];

  return (
    <div className="page fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">Student Dashboard</h1>
          <p className="page-subtitle">Track your skills, projects, and internship journey</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleSync} disabled={syncing}>
          <RefreshCw size={14} className={syncing ? "spinning" : ""} />
          {syncing ? "Syncing..." : "Sync Memory"}
        </button>
      </div>

      {/* Tab navigation */}
      <div className="tab-nav" style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 16px",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid var(--accent-blue)" : "2px solid transparent",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              color: activeTab === tab.id ? "var(--accent-blue)" : "var(--text-secondary)",
              fontFamily: "var(--font)",
              marginBottom: -1,
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────── */}
      {activeTab === "overview" && (
        <div>
          {/* Stats row */}
          <div className="grid-4" style={{ marginBottom: 24 }}>
            {[
              { label: "Total Skills", value: skills.length, icon: Code, color: "var(--accent-blue)", bg: "var(--accent-blue-light)" },
              { label: "Projects Built", value: projects.length, icon: FolderOpen, color: "var(--accent-green)", bg: "var(--accent-green-light)" },
              { label: "Applications", value: appStats.total, icon: Briefcase, color: "var(--accent-orange)", bg: "var(--accent-orange-light)" },
              { label: "Interviews", value: appStats.interview, icon: Target, color: "var(--accent-purple)", bg: "var(--accent-purple-light)" },
            ].map(stat => (
              <div key={stat.label} className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 44, height: 44, background: stat.bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color }}>
                  <stat.icon size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid-2">
            {/* Progress chart */}
            <div className="card">
              <div className="card-title"><TrendingUp size={16} /> Career Progress</div>
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart innerRadius="30%" outerRadius="90%" data={chartData} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={6} />
                  <Tooltip formatter={(v) => `${v}%`} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
                {chartData.map(d => (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.fill }} />
                    <span style={{ color: "var(--text-secondary)" }}>{d.name}</span>
                    <span style={{ fontWeight: 600 }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="card">
              <div className="card-title"><Target size={16} /> Quick Actions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "🤖 Chat with AI Mentor", action: () => onNavigate("chat"), color: "var(--accent-blue)" },
                  { label: "📄 Analyze My Resume", action: () => onNavigate("resume"), color: "var(--accent-green)" },
                  { label: "💼 Get Job Recommendations", action: () => onNavigate("jobs"), color: "var(--accent-orange)" },
                  { label: "🎯 Add a New Skill", action: () => setActiveTab("skills"), color: "var(--accent-purple)" },
                ].map(a => (
                  <button key={a.label} className="btn btn-secondary" style={{ justifyContent: "flex-start", borderLeft: `3px solid ${a.color}` }} onClick={a.action}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Resume score widget */}
          {data?.resumeScore && (
            <div className="card" style={{ marginTop: 20 }}>
              <div className="card-title">📋 Resume Score</div>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div className="score-circle" style={{
                  borderColor: data.resumeScore >= 70 ? "var(--accent-green)" : data.resumeScore >= 50 ? "var(--accent-orange)" : "var(--accent-red)",
                  color: data.resumeScore >= 70 ? "var(--accent-green)" : data.resumeScore >= 50 ? "var(--accent-orange)" : "var(--accent-red)",
                }}>
                  <span className="score-number">{data.resumeScore}</span>
                  <span className="score-label">/100</span>
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{data.resumeAnalysis?.grade || "B"} Grade</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{data.resumeAnalysis?.summary?.slice(0, 120)}...</div>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => onNavigate("resume")}>
                    Improve Resume →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SKILLS TAB ───────────────────────── */}
      {activeTab === "skills" && (
        <div>
          <form onSubmit={handleAddSkill} className="card" style={{ marginBottom: 20 }}>
            <div className="card-title"><Plus size={16} /> Add a Skill</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Skill Name</label>
                <input className="input" placeholder="e.g. React.js" value={skillForm.name} onChange={e => setSkillForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Level</label>
                <select className="select" value={skillForm.level} onChange={e => setSkillForm(f => ({ ...f, level: e.target.value }))}>
                  {SKILL_LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Category</label>
                <select className="select" value={skillForm.category} onChange={e => setSkillForm(f => ({ ...f, category: e.target.value }))}>
                  {SKILL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Add</button>
            </div>
          </form>

          {skills.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💡</div>
              <div className="empty-state-text">No skills yet. Add your first skill above!</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {skills.map(skill => (
                <div key={skill.id} className="card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{skill.name}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                      <span className={`badge ${skill.level === "Expert" ? "badge-purple" : skill.level === "Advanced" ? "badge-green" : skill.level === "Intermediate" ? "badge-blue" : "badge-orange"}`}>{skill.level}</span>
                      <span className="badge" style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>{skill.category}</span>
                    </div>
                  </div>
                  <button className="btn btn-icon btn-ghost" onClick={() => { dashboardApi.deleteSkill(userId, skill.id); fetchData(); }}>
                    <Trash2 size={14} color="var(--accent-red)" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PROJECTS TAB ─────────────────────── */}
      {activeTab === "projects" && (
        <div>
          <form onSubmit={handleAddProject} className="card" style={{ marginBottom: 20 }}>
            <div className="card-title"><Plus size={16} /> Add a Project</div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input className="input" placeholder="e.g. E-commerce App" value={projectForm.name} onChange={e => setProjectForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="select" value={projectForm.status} onChange={e => setProjectForm(f => ({ ...f, status: e.target.value }))}>
                  {["In Progress", "Completed", "On Hold"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="input" placeholder="Brief description..." value={projectForm.description} onChange={e => setProjectForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Tech Stack (comma separated)</label>
                <input className="input" placeholder="React, Node.js, MongoDB" value={projectForm.tech} onChange={e => setProjectForm(f => ({ ...f, tech: e.target.value }))} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Add Project</button>
          </form>

          {projects.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">🚀</div><div className="empty-state-text">No projects yet. Build something!</div></div>
          ) : (
            <div className="grid-2">
              {projects.map(proj => (
                <div key={proj.id} className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontWeight: 600 }}>{proj.name}</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span className={`badge ${proj.status === "Completed" ? "badge-green" : proj.status === "On Hold" ? "badge-orange" : "badge-blue"}`}>{proj.status}</span>
                      <button className="btn btn-icon btn-ghost" onClick={() => { dashboardApi.deleteProject(userId, proj.id); fetchData(); }}>
                        <Trash2 size={14} color="var(--accent-red)" />
                      </button>
                    </div>
                  </div>
                  {proj.description && <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6 }}>{proj.description}</p>}
                  {proj.tech?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10 }}>
                      {proj.tech.map(t => (
                        <span key={t} className="badge badge-blue" style={{ fontSize: 10 }}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── APPLICATIONS TAB ─────────────────── */}
      {activeTab === "applications" && (
        <div>
          <form onSubmit={handleAddApp} className="card" style={{ marginBottom: 20 }}>
            <div className="card-title"><Plus size={16} /> Track an Application</div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Company *</label>
                <input className="input" placeholder="e.g. Google" value={appForm.company} onChange={e => setAppForm(f => ({ ...f, company: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Role *</label>
                <input className="input" placeholder="e.g. SWE Intern" value={appForm.role} onChange={e => setAppForm(f => ({ ...f, role: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="select" value={appForm.status} onChange={e => setAppForm(f => ({ ...f, status: e.target.value }))}>
                  {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Applied Date</label>
                <input type="date" className="input" value={appForm.appliedDate} onChange={e => setAppForm(f => ({ ...f, appliedDate: e.target.value }))} />
              </div>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Notes</label>
                <input className="input" placeholder="Any notes about this application..." value={appForm.notes} onChange={e => setAppForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Add Application</button>
          </form>

          {applications.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">💼</div><div className="empty-state-text">No applications tracked yet.</div></div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {applications.map(app => {
                const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.Applied;
                return (
                  <div key={app.id} className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{app.role} <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>at</span> {app.company}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Applied: {app.appliedDate} {app.notes && `· ${app.notes}`}</div>
                    </div>
                    <select
                      className="select"
                      value={app.status}
                      style={{ width: "auto", padding: "6px 10px" }}
                      onChange={e => handleUpdateAppStatus(app.id, e.target.value)}
                    >
                      {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
                    </select>
                    <span className={`badge ${cfg.color}`}>{app.status}</span>
                    <button className="btn btn-icon btn-ghost" onClick={() => { dashboardApi.deleteApplication(userId, app.id); fetchData(); }}>
                      <Trash2 size={14} color="var(--accent-red)" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
