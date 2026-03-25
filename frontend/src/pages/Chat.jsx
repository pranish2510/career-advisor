// ============================================
// pages/Chat.jsx - AI Career Mentor Chat
// ============================================
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send, Trash2, Bot, User, Sparkles, Loader } from "lucide-react";
import { chatApi } from "../utils/api";

const STARTER_PROMPTS = [
  "What internships should I apply for with my current skills?",
  "How do I crack a technical interview at a startup?",
  "Review my career plan and suggest improvements",
  "What skills are most in-demand for SDE roles in India?",
  "Help me write a cold email to a recruiter",
  "How do I build a strong GitHub portfolio?",
];

export default function Chat({ userId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [histLoading, setHistLoading] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const fetchHistory = useCallback(async () => {
    try {
      setHistLoading(true);
      const res = await chatApi.getHistory(userId);
      setMessages(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setHistLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg, timestamp: new Date().toISOString() }]);
    setLoading(true);

    try {
      const res = await chatApi.send(userId, msg);
      setMessages(prev => [...prev, res.data.data]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I ran into an error. Please check your API keys and try again.",
        timestamp: new Date().toISOString(),
        error: true,
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Clear all chat history?")) return;
    await chatApi.clearHistory(userId);
    setMessages([]);
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="ai-avatar"><Bot size={20} /></div>
          <div>
            <div className="chat-title">AI Career Mentor</div>
            <div className="chat-subtitle">
              <span className="online-dot" />
              Powered by Gemini · Memory enabled
            </div>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleClear} title="Clear history">
          <Trash2 size={14} /> Clear
        </button>
      </div>

      {/* Messages area */}
      <div className="chat-messages">
        {histLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
            <div className="spinner" />
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-welcome">
            <div className="welcome-icon"><Sparkles size={28} /></div>
            <h2 className="welcome-title">Your Personal Career Advisor</h2>
            <p className="welcome-sub">
              I know your skills, projects, and goals. Ask me anything about your career.
            </p>
            <div className="starter-grid">
              {STARTER_PROMPTS.map((p) => (
                <button key={p} className="starter-btn" onClick={() => sendMessage(p)}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className={`message-row ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === "user"
                    ? <User size={14} />
                    : <Bot size={14} />}
                </div>
                <div className="message-bubble">
                  {msg.role === "assistant" ? (
                    <div className="message-md">
                      <MarkdownMessage content={msg.content} />
                    </div>
                  ) : (
                    <div className="message-text">{msg.content}</div>
                  )}
                  <div className="message-time">{formatTime(msg.timestamp)}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message-row assistant">
                <div className="message-avatar"><Bot size={14} /></div>
                <div className="message-bubble typing">
                  <Loader size={14} className="spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Ask about internships, resume tips, career advice..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            rows={1}
            disabled={loading}
          />
          <button
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            {loading ? <Loader size={16} className="spin" /> : <Send size={16} />}
          </button>
        </div>
        <div className="chat-hint">Press Enter to send · Shift+Enter for new line · Memory enabled via Hindsight</div>
      </div>

      <style>{`
        .chat-page {
          display: flex; flex-direction: column; height: 100vh;
          background: var(--bg-primary);
        }
        .chat-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 28px; background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
          position: sticky; top: 0; z-index: 10;
        }
        .chat-header-info { display: flex; align-items: center; gap: 12px; }
        .ai-avatar {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          border-radius: 12px; display: flex; align-items: center;
          justify-content: center; color: white;
        }
        .chat-title { font-weight: 700; font-size: 15px; }
        .chat-subtitle { font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 5px; margin-top: 2px; }
        .online-dot { width: 7px; height: 7px; border-radius: 50%; background: #10b981; }

        .chat-messages {
          flex: 1; overflow-y: auto; padding: 24px 28px;
          display: flex; flex-direction: column; gap: 16px;
        }

        .chat-welcome { text-align: center; padding: 40px 0; max-width: 640px; margin: auto; }
        .welcome-icon {
          width: 60px; height: 60px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          border-radius: 18px; display: flex; align-items: center;
          justify-content: center; color: white; margin: 0 auto 16px;
        }
        .welcome-title { font-size: 22px; font-weight: 700; margin-bottom: 8px; }
        .welcome-sub { font-size: 14px; color: var(--text-secondary); margin-bottom: 28px; }
        .starter-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; text-align: left; }
        .starter-btn {
          padding: 12px 16px; background: var(--bg-secondary);
          border: 1px solid var(--border); border-radius: 10px;
          cursor: pointer; font-size: 13px; color: var(--text-secondary);
          font-family: var(--font); text-align: left; transition: all 0.2s;
        }
        .starter-btn:hover {
          border-color: var(--accent-blue); color: var(--accent-blue);
          background: var(--accent-blue-light);
        }

        .message-row {
          display: flex; gap: 10px; align-items: flex-start;
          animation: fadeIn 0.25s ease;
        }
        .message-row.user { flex-direction: row-reverse; }

        .message-avatar {
          width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 13px;
        }
        .message-row.user .message-avatar { background: var(--accent-blue); color: white; }
        .message-row.assistant .message-avatar { background: var(--bg-tertiary); color: var(--text-secondary); }

        .message-bubble {
          max-width: 70%; padding: 12px 16px; border-radius: 14px;
          font-size: 14px; line-height: 1.6;
        }
        .message-row.user .message-bubble {
          background: var(--accent-blue); color: white; border-bottom-right-radius: 4px;
        }
        .message-row.assistant .message-bubble {
          background: var(--bg-secondary); border: 1px solid var(--border);
          border-bottom-left-radius: 4px; color: var(--text-primary);
        }
        .message-bubble.typing {
          display: flex; align-items: center; gap: 8px;
          color: var(--text-muted); font-size: 13px;
          padding: 10px 16px;
        }
        .message-time { font-size: 10px; opacity: 0.55; margin-top: 5px; }
        .message-row.user .message-time { text-align: right; }

        .message-md p { margin-bottom: 8px; }
        .message-md p:last-child { margin-bottom: 0; }
        .message-md ul, .message-md ol { margin: 6px 0 8px 18px; }
        .message-md li { margin-bottom: 3px; }
        .message-md strong { font-weight: 600; }
        .message-md code {
          background: var(--bg-tertiary); padding: 1px 5px;
          border-radius: 4px; font-family: var(--font-mono); font-size: 12px;
        }
        .message-md pre {
          background: var(--bg-tertiary); padding: 12px;
          border-radius: 8px; overflow-x: auto; margin: 8px 0;
        }
        .message-md h3 { font-size: 14px; margin-bottom: 6px; margin-top: 10px; }

        .chat-input-area {
          padding: 16px 28px 20px;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border);
        }
        .chat-input-wrapper { display: flex; gap: 10px; align-items: flex-end; }
        .chat-input {
          flex: 1; padding: 12px 16px; border: 1.5px solid var(--border);
          border-radius: 12px; font-family: var(--font); font-size: 14px;
          color: var(--text-primary); background: var(--bg-primary);
          resize: none; outline: none; max-height: 120px; overflow-y: auto;
          transition: border-color 0.2s;
          line-height: 1.5;
        }
        .chat-input:focus { border-color: var(--accent-blue); }
        .chat-input:disabled { opacity: 0.6; }

        .send-btn {
          width: 44px; height: 44px; border-radius: 12px;
          background: var(--accent-blue); color: white; border: none;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; flex-shrink: 0;
        }
        .send-btn:hover:not(:disabled) { background: var(--accent-blue-dark); transform: scale(1.05); }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .chat-hint { font-size: 11px; color: var(--text-muted); margin-top: 8px; text-align: center; }

        .spin { animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// Simple markdown renderer without extra lib
function MarkdownMessage({ content }) {
  // Basic markdown formatting
  const formatted = content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^### (.*)/gm, "<h3>$1</h3>")
    .replace(/^## (.*)/gm, "<h3>$1</h3>")
    .replace(/^- (.*)/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");

  return (
    <div
      className="message-md"
      dangerouslySetInnerHTML={{ __html: `<p>${formatted}</p>` }}
    />
  );
}