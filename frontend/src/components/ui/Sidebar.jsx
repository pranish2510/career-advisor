// ============================================
// components/ui/Sidebar.jsx
// ============================================
import React from "react";
import {
  LayoutDashboard, MessageSquare, FileText,
  Briefcase, Moon, Sun, ChevronLeft, ChevronRight, Sparkles
} from "lucide-react";
import "./Sidebar.css";

const NAV_ITEMS = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "chat", icon: MessageSquare, label: "AI Mentor" },
  { id: "resume", icon: FileText, label: "Resume AI" },
  { id: "jobs", icon: Briefcase, label: "Jobs & Skills" },
];

export default function Sidebar({
  activePage, onNavigate, darkMode, onToggleDark, isOpen, onToggle, userId
}) {
  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon"><Sparkles size={18} /></div>
        {isOpen && (
          <div className="logo-text">
            <span className="logo-name">CareerAI</span>
            <span className="logo-tagline">Your smart advisor</span>
          </div>
        )}
        <button className="sidebar-toggle" onClick={onToggle} title="Toggle sidebar">
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* User ID pill */}
      {isOpen && (
        <div className="sidebar-user">
          <div className="user-avatar">{userId.slice(5, 7).toUpperCase()}</div>
          <div className="user-info">
            <span className="user-name">Student</span>
            <span className="user-id">{userId.slice(0, 14)}...</span>
          </div>
        </div>
      )}

      <div className="sidebar-divider" />

      {/* Nav items */}
      <nav className="sidebar-nav">
        {isOpen && <span className="nav-section-label">NAVIGATION</span>}
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            className={`nav-item ${activePage === id ? "active" : ""}`}
            onClick={() => onNavigate(id)}
            title={!isOpen ? label : ""}
          >
            <Icon size={18} className="nav-icon" />
            {isOpen && <span className="nav-label">{label}</span>}
            {activePage === id && isOpen && <span className="nav-indicator" />}
          </button>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="sidebar-bottom">
        <div className="sidebar-divider" />
        <button
          className="nav-item theme-toggle"
          onClick={onToggleDark}
          title={darkMode ? "Light mode" : "Dark mode"}
        >
          {darkMode
            ? <Sun size={18} className="nav-icon" />
            : <Moon size={18} className="nav-icon" />}
          {isOpen && <span className="nav-label">{darkMode ? "Light Mode" : "Dark Mode"}</span>}
        </button>
      </div>
    </aside>
  );
}
