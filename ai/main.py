from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from typing import List

app = FastAPI(title="CAMPUSLINK AI Service", version="1.0")

@app.get("/health")
def health():
    return {"ok": True, "service": "campuslink-ai"}

class Profile(BaseModel):
    skills: List[str] = []
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
    score = max(0, round(
        technical*.25 + academics*.20 + p.aptitudeScore*.20 +
        p.interviewScore*.15 + p.communicationScore*.10 +
        projects*.10 - min(p.backlogs*5, 30)
    ))
    level = "Highly Employable" if score >= 80 else "Ready" if score >= 60 else "Developing" if score >= 40 else "Not Ready"
    return {"score": score, "level": level}

class GapRequest(BaseModel):
    studentSkills: List[str] = []
    requiredSkills: List[str] = []

@app.post("/skill-gap")
def skill_gap(r: GapRequest):
    student = {x.lower() for x in r.studentSkills}
    missing = [x for x in r.requiredSkills if x.lower() not in student]
    matched = [x for x in r.requiredSkills if x.lower() in student]
    return {"matched": matched, "missing": missing, "matchPercent": round(len(matched)/len(r.requiredSkills)*100) if r.requiredSkills else 100}

class MatchRequest(BaseModel):
    studentSkills: List[str] = []
    requiredSkills: List[str] = []
    readinessScore: float = 0

@app.post("/match")
def match(r: MatchRequest):
    s = {x.lower() for x in r.studentSkills}
    required = [x.lower() for x in r.requiredSkills]
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
    risk = 100 - (r.readinessScore*.55 + min(r.applications*5,25) + r.interviewScore*.15 + max(0,25-r.skillGaps*5))
    risk = max(0, min(100, round(risk)))
    level = "High" if risk >= 60 else "Medium" if risk >= 35 else "Low"
    return {"riskPercent": risk, "level": level}

@app.post("/resume/analyze")
async def resume_analyze(file: UploadFile = File(...)):
    # Placeholder: connect a PDF/DOCX text extractor + LLM here.
    return {
        "filename": file.filename,
        "status": "received",
        "message": "Add PDF/DOCX extraction and your chosen LLM/embedding provider here.",
        "skills": [],
        "projects": [],
        "certifications": []
    }
