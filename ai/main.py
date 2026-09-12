import io
import os
import re
from typing import List, Dict, Any

from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel, Field

app = FastAPI(title="CAMPUSLINK AI Service", version="2.0")

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

@app.get("/health")
def health():
    return {"ok": True, "service": "campuslink-ai", "llmConfigured": bool(GROQ_API_KEY)}

class Profile(BaseModel):
    skills: List[str] = Field(default_factory=list)
    cgpa: float = 0
    aptitudeScore: float = 0
    interviewScore: float = 0
    communicationScore: float = 0
    projects: int = 0
    backlogs: int = 0

@app.post("/readiness")
def readiness(p: Profile):
    technical = min(len(p.skills) * 10, 100)
    academics = min(p.cgpa * 10, 100)
    projects = min(p.projects * 25, 100)
    score = max(0, round(technical*.25 + academics*.20 + p.aptitudeScore*.20 + p.interviewScore*.15 + p.communicationScore*.10 + projects*.10 - min(p.backlogs*5, 30)))
    level = "Highly Employable" if score >= 80 else "Ready" if score >= 60 else "Developing" if score >= 40 else "Not Ready"
    return {"score": score, "level": level, "engine": "readiness-v2"}

class GapRequest(BaseModel):
    studentSkills: List[str] = Field(default_factory=list)
    requiredSkills: List[str] = Field(default_factory=list)

@app.post("/skill-gap")
def skill_gap(r: GapRequest):
    student = {x.lower().strip() for x in r.studentSkills}
    matched = [x for x in r.requiredSkills if x.lower().strip() in student]
    missing = [x for x in r.requiredSkills if x.lower().strip() not in student]
    return {"matched": matched, "missing": missing, "matchPercent": round(len(matched)/len(r.requiredSkills)*100) if r.requiredSkills else 100}

class MatchRequest(BaseModel):
    studentSkills: List[str] = Field(default_factory=list)
    requiredSkills: List[str] = Field(default_factory=list)
    readinessScore: float = 0

@app.post("/match")
def match(r: MatchRequest):
    s = {x.lower().strip() for x in r.studentSkills}
    required = [x.lower().strip() for x in r.requiredSkills]
    matched = [x for x in required if x in s]
    skill = len(matched)/len(required)*100 if required else 100
    final = round(skill*.7 + r.readinessScore*.3)
    return {"skillMatch": round(skill), "finalMatch": final, "missingSkills": [x for x in required if x not in s]}

class RiskRequest(BaseModel):
    readinessScore: float = 0
    applications: int = 0
    interviewScore: float = 0
    skillGaps: int = 0

@app.post("/risk")
def risk(r: RiskRequest):
    risk_value = 100 - (r.readinessScore*.55 + min(r.applications*5,25) + r.interviewScore*.15 + max(0,25-r.skillGaps*5))
    risk_value = max(0, min(100, round(risk_value)))
    level = "High" if risk_value >= 60 else "Medium" if risk_value >= 35 else "Low"
    return {"riskPercent": risk_value, "level": level}


def extract_text(filename: str, content: bytes) -> str:
    lower = filename.lower()
    if lower.endswith(".pdf"):
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(content))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    if lower.endswith(".docx"):
        from docx import Document
        doc = Document(io.BytesIO(content))
        return "\n".join(p.text for p in doc.paragraphs)
    return content.decode("utf-8", errors="ignore")

KNOWN_SKILLS = ["python", "java", "javascript", "typescript", "react", "node.js", "node", "express", "mongodb", "sql", "postgresql", "aws", "azure", "docker", "kubernetes", "git", "github", "html", "css", "tailwind", "next.js", "data structures", "machine learning", "deep learning", "tensorflow", "pytorch", "power bi", "excel"]

def basic_resume_extract(text: str) -> Dict[str, Any]:
    low = text.lower()
    skills = [skill for skill in KNOWN_SKILLS if skill in low]
    projects = []
    for line in text.splitlines():
        if "project" in line.lower() and line.strip(): projects.append(line.strip()[:120])
    certs = []
    for line in text.splitlines():
        if any(word in line.lower() for word in ["certification", "certified", "certificate"]): certs.append(line.strip()[:120])
    return {"skills": skills, "projects": projects[:8], "certifications": certs[:8]}

async def llm_resume(text: str):
    if not GROQ_API_KEY:
        return None
    from openai import OpenAI
    client = OpenAI(api_key=GROQ_API_KEY)
    prompt = """Extract a candidate resume into JSON with keys skills (array of strings), projects (array of strings), certifications (array of strings), education (array of strings), experience (array of strings). Return only JSON. Resume:\n""" + text[:16000]
    response = client.chat.completions.create(model=GROQ_MODEL, temperature=0.1, response_format={"type":"json_object"}, messages=[{"role":"user", "content": prompt}])
    import json
    return json.loads(response.choices[0].message.content)

@app.post("/resume/analyze")
async def resume_analyze(file: UploadFile = File(...)):
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        return {"status": "error", "message": "File too large"}
    text = extract_text(file.filename or "resume.txt", content)
    data = await llm_resume(text) or basic_resume_extract(text)
    return {"filename": file.filename, "status": "analyzed", "provider": "groq" if GROQ_API_KEY else "fallback", "textPreview": re.sub(r"\s+", " ", text)[:500], **data}

class ChatRequest(BaseModel):
    message: str
    context: Dict[str, Any] = Field(default_factory=dict)

@app.post("/chat")
async def chat(r: ChatRequest):
    if GROQ_API_KEY:
        from openai import OpenAI
        client = OpenAI(api_key=GROQ_API_KEY)
        system = "You are CAMPUSLINK AI, a concise placement assistant. Use the supplied student context. Never invent eligibility rules. If data is missing, say so. Give practical next steps."
        import json
        response = client.chat.completions.create(model=GROQ_MODEL, temperature=0.2, messages=[{"role":"system", "content": system}, {"role":"user", "content": json.dumps({"context": r.context, "question": r.message})}])
        return {"answer": response.choices[0].message.content, "provider": "groq"}
    return {"answer": "AI chat is ready. Add GROQ_API_KEY to the AI service .env to enable the real LLM. Meanwhile, use the Readiness, Skill Gap, Risk and Resume Analyzer tools.", "provider": "fallback"}
