// ============================================
// utils/store.js - In-Memory Data Store
// (Replace with MongoDB/Firebase in production)
// ============================================
const NodeCache = require("node-cache");

// Cache with no TTL (persists for session)
const cache = new NodeCache({ stdTTL: 0, useClones: false });

// ── Default user profile structure ────────────
const defaultProfile = () => ({
  skills: [],
  projects: [],
  applications: [],
  education: [],
  experience: [],
  careerGoals: "",
  resumeText: "",
  resumeScore: null,
  chatHistory: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// ── Get user data (create if not exists) ──────
function getUser(userId) {
  if (!cache.has(userId)) {
    cache.set(userId, defaultProfile());
  }
  return cache.get(userId);
}

// ── Update user data ──────────────────────────
function updateUser(userId, updates) {
  const user = getUser(userId);
  const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
  cache.set(userId, updated);
  return updated;
}

// ── Add item to an array field ─────────────────
function addToArray(userId, field, item) {
  const user = getUser(userId);
  const arr = user[field] || [];
  const newItem = { id: Date.now().toString(), ...item, createdAt: new Date().toISOString() };
  arr.push(newItem);
  updateUser(userId, { [field]: arr });
  return newItem;
}

// ── Remove item from array by id ──────────────
function removeFromArray(userId, field, itemId) {
  const user = getUser(userId);
  const arr = (user[field] || []).filter((i) => i.id !== itemId);
  updateUser(userId, { [field]: arr });
  return arr;
}

// ── Update item in array by id ────────────────
function updateInArray(userId, field, itemId, updates) {
  const user = getUser(userId);
  const arr = (user[field] || []).map((i) =>
    i.id === itemId ? { ...i, ...updates } : i
  );
  updateUser(userId, { [field]: arr });
  return arr;
}

// ── Add chat message ──────────────────────────
function addChatMessage(userId, role, content) {
  const user = getUser(userId);
  const history = user.chatHistory || [];
  const message = { role, content, timestamp: new Date().toISOString() };
  history.push(message);
  // Keep last 50 messages to avoid memory bloat
  const trimmed = history.slice(-50);
  updateUser(userId, { chatHistory: trimmed });
  return message;
}

module.exports = {
  getUser,
  updateUser,
  addToArray,
  removeFromArray,
  updateInArray,
  addChatMessage,
};
