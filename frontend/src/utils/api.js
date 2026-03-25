// ============================================
// utils/api.js - Frontend API Helper
// ============================================
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Default user ID (replace with real auth later)
export const getUserId = () => {
  let uid = localStorage.getItem("career_advisor_uid");
  if (!uid) {
    uid = "user_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("career_advisor_uid", uid);
  }
  return uid;
};

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// ── Dashboard API ──────────────────────────────
export const dashboardApi = {
  get: (userId) => api.get(`/dashboard/${userId}`),
  addSkill: (userId, skill) => api.post(`/dashboard/${userId}/skills`, skill),
  deleteSkill: (userId, id) => api.delete(`/dashboard/${userId}/skills/${id}`),
  addProject: (userId, project) => api.post(`/dashboard/${userId}/projects`, project),
  updateProject: (userId, id, data) => api.put(`/dashboard/${userId}/projects/${id}`, data),
  deleteProject: (userId, id) => api.delete(`/dashboard/${userId}/projects/${id}`),
  addApplication: (userId, app) => api.post(`/dashboard/${userId}/applications`, app),
  updateApplication: (userId, id, data) => api.put(`/dashboard/${userId}/applications/${id}`, data),
  deleteApplication: (userId, id) => api.delete(`/dashboard/${userId}/applications/${id}`),
  updateProfile: (userId, data) => api.put(`/dashboard/${userId}/profile`, data),
  syncMemory: (userId) => api.post(`/dashboard/${userId}/sync-memory`),
};

// ── Chat API ───────────────────────────────────
export const chatApi = {
  send: (userId, message) => api.post(`/chat/${userId}`, { message }),
  getHistory: (userId) => api.get(`/chat/${userId}/history`),
  clearHistory: (userId) => api.delete(`/chat/${userId}/history`),
};

// ── Resume API ─────────────────────────────────
export const resumeApi = {
  get: (userId) => api.get(`/resume/${userId}`),
  upload: (userId, formData) =>
    api.post(`/resume/${userId}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    }),
  analyze: (userId, resumeText) => api.post(`/resume/${userId}/analyze`, { resumeText }),
  match: (userId, jobDescription) => api.post(`/resume/${userId}/match`, { jobDescription }),
  improve: (userId, text, type, context) =>
    api.post(`/resume/${userId}/improve`, { text, type, context }),
};

// ── Jobs API ───────────────────────────────────
export const jobsApi = {
  getRecommendations: (userId) => api.get(`/jobs/${userId}/recommendations`),
  getSkillGap: (userId, targetRole) =>
    api.post(`/jobs/${userId}/skill-gap`, { targetRole }),
};

export default api;
