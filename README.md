# 🎓 AI Career Advisor

An AI-powered career platform for students to track skills, analyze resumes, 
get personalized mentorship, and find internships.

Built with: React.js · Node.js · Express · Gemini AI · Hindsight Cloud

---

## ✨ Features

- 📊 **Student Dashboard** — Track skills, projects, internship applications
- 🤖 **AI Career Mentor** — Chat with an AI that remembers your profile
- 📄 **Resume Analyzer** — Score, analyze, and optimize your resume
- 🎯 **Job Matcher** — Match your resume against any job description
- 📈 **Skill Gap Analysis** — Get a learning roadmap for your target role

---

## 🚀 Setup

### 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/career-advisor.git
cd career-advisor

### 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

### 3. Add your API keys
cd backend
copy .env.example .env

Open backend/.env and fill in:
- GEMINI_API_KEY → https://aistudio.google.com/app/apikey
- HINDSIGHT_API_KEY → https://ui.hindsight.vectorize.io
- HINDSIGHT_PIPELINE_ID → from your Hindsight dashboard

### 4. Run the app
Terminal 1: cd backend && npm run dev
Terminal 2: cd frontend && npm start

Open http://localhost:3000

---

## ⚠️ API Keys

This project requires your own API keys.
Never commit your .env file — it is already in .gitignore.

---

Made by Pranish Mali
