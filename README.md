# CAMPUSLINK — AI Powered Campus-to-Corporate Placement Management

A MERN prototype implementing the placement lifecycle described in the supplied problem statement:

**Profiling → Matching → Scheduling → Notification → Offer Tracking → Analytics**

## Stack

- Frontend: React + Vite + React Router + Axios + Recharts
- Backend: Node.js + Express + MongoDB/Mongoose + JWT
- AI-ready layer: Python FastAPI service scaffold for resume analysis, readiness scoring, skill gaps, matching and risk prediction
- The AI service is intentionally provider/model agnostic. Add your preferred LLM/embedding/ML provider and credentials.

## Project structure

```text
CAMPUSLINK/
├── frontend/          # React application
├── backend/           # Express REST API + MongoDB models
├── ai/                # Optional Python AI microservice scaffold
├── docs/              # Architecture, API and AI integration notes
├── docker-compose.yml
└── .env.example
```

## Quick start

### 1. MongoDB

Run MongoDB locally or use MongoDB Atlas.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

API: http://localhost:5000

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

UI: http://localhost:5173

### 4. Optional AI service

```bash
cd ai
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

AI service: http://localhost:8000

## Demo credentials

Run:

```bash
cd backend
npm run seed
```

The seed script creates:
- admin@campuslink.local / Admin@123
- recruiter@campuslink.local / Recruiter@123
- student@campuslink.local / Student@123

## What is implemented

- Role-based authentication
- Student profiles and readiness data
- Recruiter/job management
- AI-ready matching endpoint
- Drive conflict detection
- Offer/document tracking
- Notifications
- Analytics dashboard
- AI microservice endpoints and deterministic fallback logic

## What you still need to add for a production/hackathon AI build

See `docs/AI_INTEGRATION.md`.

The supplied problem statement asks for AI/ML/NLP/recommendation capabilities such as readiness scoring, skill-gap analysis, recruiter-student matching, explainable recommendations, predictive insights and automation. This repository provides the application foundation and AI integration points; it does not claim that a real trained ML model or external LLM is included.
