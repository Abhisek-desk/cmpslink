import io
import os
import re
import json
from typing import List, Dict, Any

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel, Field

# ============================================================
# ENVIRONMENT
# ============================================================

# IMPORTANT:
# Load .env BEFORE reading GROQ_API_KEY.
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_MODEL = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-120b"
).strip()

# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="CAMPUSLINK AI Service",
    version="2.1"
)


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():
    return {
        "ok": True,
        "service": "campuslink-ai",
        "llmConfigured": bool(GROQ_API_KEY),
        "model": GROQ_MODEL,
    }


# ============================================================
# SKILL NORMALIZATION
# ============================================================

SKILL_ALIASES = {
    # Frontend
    "react": "React",
    "react.js": "React",
    "reactjs": "React",
    "react js": "React",

    "next": "Next.js",
    "next.js": "Next.js",
    "nextjs": "Next.js",
    "next js": "Next.js",

    "vue": "Vue.js",
    "vue.js": "Vue.js",
    "vuejs": "Vue.js",

    "angular": "Angular",
    "angularjs": "Angular",

    # Backend
    "node": "Node.js",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "node js": "Node.js",

    "express": "Express.js",
    "express.js": "Express.js",
    "expressjs": "Express.js",
    "express js": "Express.js",

    # Databases
    "mongodb": "MongoDB",
    "mongo db": "MongoDB",
    "mongo-db": "MongoDB",
    "mongo database": "MongoDB",

    "mysql": "MySQL",
    "my sql": "MySQL",

    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "postgre sql": "PostgreSQL",

    "sql": "SQL",

    # Languages
    "javascript": "JavaScript",
    "js": "JavaScript",

    "typescript": "TypeScript",
    "ts": "TypeScript",

    "python": "Python",

    "java": "Java",

    "c++": "C++",
    "cpp": "C++",

    "c#": "C#",
    "csharp": "C#",

    # Web
    "html": "HTML",
    "html5": "HTML",

    "css": "CSS",
    "css3": "CSS",

    "tailwind": "Tailwind CSS",
    "tailwind css": "Tailwind CSS",

    "bootstrap": "Bootstrap",

    # DevOps
    "docker": "Docker",

    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",

    # Cloud
    "aws": "AWS",
    "amazon web services": "AWS",

    "azure": "Azure",
    "microsoft azure": "Azure",

    "gcp": "Google Cloud",
    "google cloud": "Google Cloud",
    "google cloud platform": "Google Cloud",

    # Version control
    "git": "Git",
    "github": "GitHub",
    "git hub": "GitHub",

    "gitlab": "GitLab",
    "git lab": "GitLab",

    # AI / ML
    "ai": "AI",
    "artificial intelligence": "AI",

    "ml": "Machine Learning",
    "machine learning": "Machine Learning",

    "deep learning": "Deep Learning",

    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",

    # Data
    "power bi": "Power BI",
    "powerbi": "Power BI",

    "excel": "Excel",

    # Core CS
    "dsa": "Data Structures",
    "data structures": "Data Structures",
    "data structures and algorithms": "Data Structures",
}


def clean_skill(skill: str) -> str:
    """
    Normalize spacing/case/punctuation for skill comparison.
    """
    value = str(skill or "").strip().lower()

    value = re.sub(r"\s+", " ", value)

    return value


def normalize_skill(skill: str) -> str:
    """
    Convert aliases into canonical CAMPUSLINK skill names.
    """
    cleaned = clean_skill(skill)

    if not cleaned:
        return ""

    return SKILL_ALIASES.get(
        cleaned,
        str(skill).strip()
    )


def normalize_skills(skills: List[str]) -> List[str]:
    """
    Normalize and remove duplicate skills.
    """
    result = []
    seen = set()

    for skill in skills or []:
        normalized = normalize_skill(skill)

        if not normalized:
            continue

        key = normalized.lower()

        if key not in seen:
            seen.add(key)
            result.append(normalized)

    return result


def skills_match(a: str, b: str) -> bool:
    return (
        normalize_skill(a).lower()
        == normalize_skill(b).lower()
    )


# ============================================================
# READINESS
# ============================================================

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

    normalized = normalize_skills(p.skills)

    technical = min(
        len(normalized) * 10,
        100
    )

    academics = min(
        p.cgpa * 10,
        100
    )

    projects = min(
        p.projects * 25,
        100
    )

    score = max(
        0,
        round(
            technical * 0.25
            + academics * 0.20
            + p.aptitudeScore * 0.20
            + p.interviewScore * 0.15
            + p.communicationScore * 0.10
            + projects * 0.10
            - min(p.backlogs * 5, 30)
        )
    )

    level = (
        "Highly Employable"
        if score >= 80
        else "Ready"
        if score >= 60
        else "Developing"
        if score >= 40
        else "Not Ready"
    )

    return {
        "score": score,
        "level": level,
        "engine": "readiness-v2",
    }


# ============================================================
# SKILL GAP
# ============================================================

class GapRequest(BaseModel):
    studentSkills: List[str] = Field(default_factory=list)
    requiredSkills: List[str] = Field(default_factory=list)


@app.post("/skill-gap")
def skill_gap(r: GapRequest):

    student = normalize_skills(
        r.studentSkills
    )

    required = normalize_skills(
        r.requiredSkills
    )

    matched = [
        skill
        for skill in required
        if any(
            skills_match(skill, student_skill)
            for student_skill in student
        )
    ]

    missing = [
        skill
        for skill in required
        if not any(
            skills_match(skill, student_skill)
            for student_skill in student
        )
    ]

    match_percent = (
        round(
            len(matched)
            / len(required)
            * 100
        )
        if required
        else 100
    )

    return {
        "matched": matched,
        "missing": missing,
        "matchPercent": match_percent,
        "studentSkills": student,
        "requiredSkills": required,
    }


# ============================================================
# JOB MATCHING
# ============================================================

class MatchRequest(BaseModel):
    studentSkills: List[str] = Field(default_factory=list)
    requiredSkills: List[str] = Field(default_factory=list)
    readinessScore: float = 0


@app.post("/match")
def match(r: MatchRequest):

    student = normalize_skills(
        r.studentSkills
    )

    required = normalize_skills(
        r.requiredSkills
    )

    matched = [
        skill
        for skill in required
        if any(
            skills_match(skill, s)
            for s in student
        )
    ]

    missing = [
        skill
        for skill in required
        if not any(
            skills_match(skill, s)
            for s in student
        )
    ]

    skill_match = (
        len(matched)
        / len(required)
        * 100
        if required
        else 100
    )

    final = round(
        skill_match * 0.7
        + r.readinessScore * 0.3
    )

    return {
        "skillMatch": round(skill_match),
        "finalMatch": final,
        "matchedSkills": matched,
        "missingSkills": missing,
    }


# ============================================================
# PLACEMENT RISK
# ============================================================

class RiskRequest(BaseModel):
    readinessScore: float = 0
    applications: int = 0
    interviewScore: float = 0
    skillGaps: int = 0


@app.post("/risk")
def risk(r: RiskRequest):

    risk_value = 100 - (
        r.readinessScore * 0.55
        + min(r.applications * 5, 25)
        + r.interviewScore * 0.15
        + max(0, 25 - r.skillGaps * 5)
    )

    risk_value = max(
        0,
        min(100, round(risk_value))
    )

    level = (
        "High"
        if risk_value >= 60
        else "Medium"
        if risk_value >= 35
        else "Low"
    )

    return {
        "riskPercent": risk_value,
        "level": level,
    }


# ============================================================
# RESUME TEXT EXTRACTION
# ============================================================

def extract_text(
    filename: str,
    content: bytes
) -> str:

    lower = (
        filename or ""
    ).lower()

    # -------------------------
    # PDF
    # -------------------------

    if lower.endswith(".pdf"):

        from pypdf import PdfReader

        reader = PdfReader(
            io.BytesIO(content)
        )

        pages = []

        for page in reader.pages:

            page_text = (
                page.extract_text()
                or ""
            )

            if page_text.strip():
                pages.append(page_text)

        return "\n".join(pages)

    # -------------------------
    # DOCX
    # -------------------------

    if lower.endswith(".docx"):

        from docx import Document

        doc = Document(
            io.BytesIO(content)
        )

        return "\n".join(
            p.text
            for p in doc.paragraphs
            if p.text.strip()
        )

    # -------------------------
    # TXT
    # -------------------------

    return content.decode(
        "utf-8",
        errors="ignore"
    )


# ============================================================
# BASIC RESUME EXTRACTION
# ============================================================

KNOWN_SKILLS = [
    "python",
    "java",
    "javascript",
    "typescript",
    "react",
    "react.js",
    "reactjs",
    "next.js",
    "nextjs",
    "node.js",
    "nodejs",
    "node",
    "express",
    "express.js",
    "mongodb",
    "mongo db",
    "sql",
    "mysql",
    "postgresql",
    "aws",
    "azure",
    "docker",
    "kubernetes",
    "git",
    "github",
    "html",
    "css",
    "tailwind",
    "data structures",
    "machine learning",
    "deep learning",
    "tensorflow",
    "pytorch",
    "power bi",
    "excel",
]


def basic_resume_extract(
    text: str
) -> Dict[str, Any]:

    low = text.lower()

    found_skills = []

    for skill in KNOWN_SKILLS:

        if skill.lower() in low:

            found_skills.append(
                normalize_skill(skill)
            )

    skills = normalize_skills(
        found_skills
    )

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    projects = []

    certifications = []

    for line in lines:

        line_low = line.lower()

        if (
            "project" in line_low
            or "projects" in line_low
        ):
            projects.append(
                line[:200]
            )

        if any(
            word in line_low
            for word in [
                "certification",
                "certified",
                "certificate",
            ]
        ):
            certifications.append(
                line[:200]
            )

    return {
        "skills": skills,
        "projects": projects[:8],
        "certifications": certifications[:8],
        "education": [],
        "experience": [],
    }


# ============================================================
# GROQ RESUME ANALYZER
# ============================================================

async def llm_resume(
    text: str
):

    if not GROQ_API_KEY:

        return None

    if not text.strip():

        return None

    from openai import OpenAI

    client = OpenAI(
        api_key=GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1",
    )

    prompt = """
You are CAMPUSLINK Resume Analyzer.

Analyze the resume and return ONLY valid JSON.

Use exactly these keys:

{
  "skills": [],
  "projects": [],
  "certifications": [],
  "education": [],
  "experience": []
}

Rules:

1. skills must contain actual technical/professional skills found in the resume.
2. projects must contain project names and short descriptions.
3. certifications must contain certification names.
4. education must contain education details.
5. experience must contain internships/jobs.
6. Do not invent information.
7. If something is not present, return an empty array.
8. Return JSON only.

Resume:
""" + text[:16000]

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        temperature=0.1,
        response_format={
            "type": "json_object"
        },
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
    )

    content = (
        response.choices[0]
        .message
        .content
    )

    data = json.loads(content)

    data["skills"] = normalize_skills(
        data.get("skills", [])
    )

    data.setdefault(
        "projects",
        []
    )

    data.setdefault(
        "certifications",
        []
    )

    data.setdefault(
        "education",
        []
    )

    data.setdefault(
        "experience",
        []
    )

    return data


# ============================================================
# RESUME ANALYZER
# ============================================================

@app.post("/resume/analyze")
async def resume_analyze(
    file: UploadFile = File(...)
):

    content = await file.read()

    if len(content) > 5 * 1024 * 1024:

        return {
            "status": "error",
            "message": "File too large",
        }

    filename = (
        file.filename
        or "resume.txt"
    )

    text = extract_text(
        filename,
        content
    )

    # If the PDF is scanned/image-only,
    # pypdf may return no text.
    if not text.strip():

        return {
            "filename": filename,
            "status": "error",
            "provider": "none",
            "message": (
                "No readable text was found. "
                "Please upload a text-based PDF, DOCX or TXT resume."
            ),
            "skills": [],
            "projects": [],
            "certifications": [],
            "education": [],
            "experience": [],
        }

    try:

        data = await llm_resume(text)

        provider = "groq"

        if data is None:

            data = basic_resume_extract(text)
            provider = "fallback"

    except Exception as error:

        print(
            "Groq resume analysis error:",
            repr(error)
        )

        data = basic_resume_extract(text)
        provider = "fallback"

    return {
        "filename": filename,
        "status": "analyzed",
        "provider": provider,
        "textPreview": re.sub(
            r"\s+",
            " ",
            text
        )[:500],
        **data,
    }


# ============================================================
# CHATBOT
# ============================================================

class ChatRequest(BaseModel):

    message: str

    context: Dict[str, Any] = Field(
        default_factory=dict
    )


@app.post("/chat")
async def chat(
    r: ChatRequest
):

    if not r.message.strip():

        return {
            "answer": "Please enter a question.",
            "provider": "system",
        }

    if GROQ_API_KEY:

        try:

            from openai import OpenAI

            client = OpenAI(
                api_key=GROQ_API_KEY,
                base_url="https://api.groq.com/openai/v1",
            )

            system = """
You are CAMPUSLINK AI, a personal placement coach.

Give short, clear and personalized answers.

Use the student's actual profile data:
- Name
- CGPA
- Skills
- Readiness score
- Projects
- Interview score

Rules:
- Do not invent student information.
- Do not invent company eligibility rules.
- Do not write long generic articles.
- Keep the response easy to scan.
- Focus on the 3 most important improvements.
- Give practical actions the student can take.
- Use short headings and bullet points.
- Keep the response around 250-400 words maximum.
- End with 4-5 clear choices for the student's next action.

For placement check-ins, use this structure:

🎯 Your Status
Show CGPA, readiness score and important skills.

🚀 Top 3 Priorities
Give the three most important areas to improve.

📅 This Week
Give a simple 7-day action plan.

🎯 Target
Give one realistic short-term target.

What should we do next?
Provide these choices:
🧠 DSA Plan
💻 Improve Project
📄 Resume Review
🎤 Mock Interview
📅 30-Day Plan
"""

            user_message = {
                "context": r.context,
                "question": r.message,
            }

            response = client.chat.completions.create(
                model=GROQ_MODEL,
                temperature=0.2,
                messages=[
                    {
                        "role": "system",
                        "content": system,
                    },
                    {
                        "role": "user",
                        "content": json.dumps(
                            user_message
                        ),
                    },
                ],
            )

            answer = (
                response
                .choices[0]
                .message
                .content
            )

            return {
                "answer": answer,
                "provider": "groq",
            }

        except Exception as error:

            print(
                "Groq chat error:",
                repr(error)
            )

            return {
                "answer": (
                    "The AI service is configured, "
                    "but Groq returned an error. "
                    "Please check the AI service terminal."
                ),
                "provider": "error",
            }

    return {
        "answer": (
            "AI chat is ready. Add GROQ_API_KEY "
            "to the AI service .env to enable "
            "the real LLM."
        ),
        "provider": "fallback",
    }
