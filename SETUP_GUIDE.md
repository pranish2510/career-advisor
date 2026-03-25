# 🚀 AI Career Advisor — Setup Guide
## Windows + VS Code Friendly

---

## 📋 Prerequisites

Before starting, make sure you have installed:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18 or higher | https://nodejs.org (LTS version) |
| VS Code | Latest | https://code.visualstudio.com |
| Git | Latest | https://git-scm.com |

**Verify Node.js is installed:**
```bash
node --version   # Should show v18.x.x or higher
npm --version    # Should show 9.x.x or higher
```

---

## 🔑 Step 1: Get Your API Keys

### Gemini API Key (Required)
1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key (starts with `AIza...`)

### Hindsight Cloud API Key (Required for memory)
1. Go to: https://ui.hindsight.vectorize.io
2. Create an account
3. Create a new pipeline
4. Copy your **API Key** and **Pipeline ID** from the dashboard

---

## 📁 Step 2: Open in VS Code

```bash
# Open VS Code in the project folder
code .
```

Or: File → Open Folder → select `career-advisor` folder

---

## ⚙️ Step 3: Configure Environment Variables

1. Go to the `backend/` folder
2. Copy `.env.example` and rename it to `.env`

```bash
# In VS Code terminal (Ctrl + `)
cd backend
copy .env.example .env    # Windows
```

3. Open `backend/.env` and fill in your keys:

```env
PORT=5000
NODE_ENV=development
GEMINI_API_KEY=AIzaSy...your_actual_key_here
HINDSIGHT_API_KEY=your_hindsight_key_here
HINDSIGHT_PIPELINE_ID=your_pipeline_id_here
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io/v1
FRONTEND_URL=http://localhost:3000
```

**⚠️ Important:** Never commit `.env` to GitHub!

---

## 📦 Step 4: Install Dependencies

Open VS Code terminal (`Ctrl + \``) and run:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

This will take 2-3 minutes. You'll see packages being downloaded.

---

## 🟢 Step 5: Start the Application

You need **two terminal windows** open side by side.

### Terminal 1 — Backend (API Server)
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Career Advisor API running on http://localhost:5000
📋 Health check: http://localhost:5000/api/health
🌍 Environment: development
```

### Terminal 2 — Frontend (React App)
```bash
cd frontend
npm start
```

Browser will automatically open at `http://localhost:3000`

---

## ✅ Step 6: Test Everything Works

### Test Backend API:
Open your browser and go to:
```
http://localhost:5000/api/health
```
You should see: `{"status":"ok","message":"AI Career Advisor API is running"}`

### Test Frontend:
- App loads at `http://localhost:3000`
- Dashboard shows with sidebar navigation
- Dark mode toggle works (moon icon in sidebar)

### Test AI Chat:
1. Click "AI Mentor" in sidebar
2. Type: "What skills should I learn for a software internship?"
3. Should get a detailed AI response

### Test Resume Analysis:
1. Click "Resume AI" in sidebar
2. Upload a PDF resume
3. Click "Analyze Resume" — should get a score + breakdown

---

## 🗂️ Project Structure

```
career-advisor/
├── backend/                  ← Node.js Express API
│   ├── routes/
│   │   ├── chat.js           ← AI mentor chat endpoint
│   │   ├── dashboard.js      ← Skills, projects, applications CRUD
│   │   ├── resume.js         ← Upload, analyze, match, improve
│   │   ├── jobs.js           ← Recommendations + skill gap
│   │   └── memory.js         ← Hindsight memory endpoints
│   ├── utils/
│   │   ├── gemini.js         ← Gemini AI integration
│   │   ├── hindsight.js      ← Hindsight Cloud memory layer
│   │   └── store.js          ← In-memory data store (MVP)
│   ├── .env                  ← Your API keys (create this!)
│   ├── .env.example          ← Template
│   └── server.js             ← Main Express server
│
├── frontend/                 ← React.js app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx ← Student dashboard
│   │   │   ├── Chat.jsx      ← AI mentor chat UI
│   │   │   ├── ResumeAnalyzer.jsx ← Resume tools
│   │   │   └── JobsPage.jsx  ← Jobs & skill gap
│   │   ├── components/
│   │   │   └── ui/Sidebar.jsx ← Navigation sidebar
│   │   ├── utils/
│   │   │   └── api.js        ← API helper functions
│   │   ├── App.js            ← Main app + routing
│   │   └── App.css           ← Design system
│   └── public/index.html
│
└── package.json              ← Root scripts
```

---

## 🔧 API Endpoints Reference

### Dashboard
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/dashboard/:userId` | Get all user data |
| POST | `/api/dashboard/:userId/skills` | Add a skill |
| DELETE | `/api/dashboard/:userId/skills/:id` | Remove skill |
| POST | `/api/dashboard/:userId/projects` | Add project |
| PUT | `/api/dashboard/:userId/projects/:id` | Update project |
| POST | `/api/dashboard/:userId/applications` | Track application |
| PUT | `/api/dashboard/:userId/applications/:id` | Update status |
| POST | `/api/dashboard/:userId/sync-memory` | Sync to Hindsight |

### Chat
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/chat/:userId` | Send message, get AI response |
| GET | `/api/chat/:userId/history` | Get chat history |
| DELETE | `/api/chat/:userId/history` | Clear history |

### Resume
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/resume/:userId/upload` | Upload PDF/DOCX |
| POST | `/api/resume/:userId/analyze` | Get AI analysis + score |
| POST | `/api/resume/:userId/match` | Match with job description |
| POST | `/api/resume/:userId/improve` | Improve a bullet point |

### Jobs
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/jobs/:userId/recommendations` | Get personalized jobs |
| POST | `/api/jobs/:userId/skill-gap` | Analyze skill gap for role |

---

## ❓ Common Issues & Fixes

### "Port 5000 already in use"
```bash
# Windows: Kill the process
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### "Cannot find module 'pdf-parse'"
```bash
cd backend
npm install pdf-parse mammoth
```

### "CORS Error" in browser
- Make sure backend `.env` has `FRONTEND_URL=http://localhost:3000`
- Restart the backend server

### "Gemini API Error"
- Verify your `GEMINI_API_KEY` in `.env` is correct
- Make sure there are no spaces around the key
- Check billing/quota at https://aistudio.google.com

### "Hindsight not configured - skipping memory"
- This is a **warning, not an error** — the app still works
- Fill in `HINDSIGHT_API_KEY` and `HINDSIGHT_PIPELINE_ID` in `.env`

### Resume upload fails
- Only PDF, DOCX, and TXT files supported
- Max file size: 5MB
- Make sure PDF is text-based (not a scanned image)

---

## 🚀 Running Both Together (VS Code)

Install `concurrently` at root level, then:
```bash
# From root career-advisor/ folder
npm install
npm run dev
```

This starts both servers simultaneously.

---

## 🔮 Next Steps / Upgrades

After the MVP works, consider adding:

1. **Real Database** — Replace `utils/store.js` with MongoDB Atlas (free tier)
2. **Authentication** — Add Firebase Auth or Clerk.dev for real login
3. **Resume Templates** — Add PDF generation with `puppeteer`
4. **Email Reminders** — Add `nodemailer` for application follow-ups
5. **Deploy** — Backend on Railway/Render, Frontend on Vercel (both free)

---

## 💡 Tips for Best Results

- **Add your skills first** in the Dashboard before chatting — the AI uses them to personalize advice
- **Upload your resume** before using Job Match — it compares against the job description
- **Click "Sync Memory"** in Dashboard to save your profile to Hindsight for persistent AI memory
- The AI chat remembers context within a session; Hindsight makes it remember across sessions

---

Built with ❤️ using Gemini AI + Hindsight Cloud + React + Node.js
