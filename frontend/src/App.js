// ============================================
// App.js - Main Application with Navigation
// ============================================
import React, { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import JobsPage from "./pages/JobsPage";
import Sidebar from "./components/ui/Sidebar";
import { getUserId } from "./utils/api";
import "./App.css";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem("darkMode") === "true"
  );
  const [userId] = useState(getUserId);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const pages = {
    dashboard: <Dashboard userId={userId} onNavigate={setActivePage} />,
    chat: <Chat userId={userId} />,
    resume: <ResumeAnalyzer userId={userId} />,
    jobs: <JobsPage userId={userId} />,
  };

  return (
    <div className={`app-container ${darkMode ? "dark" : ""}`}>
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d) => !d)}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
        userId={userId}
      />
      <main className={`main-content ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        {pages[activePage] || pages.dashboard}
      </main>
    </div>
  );
}
