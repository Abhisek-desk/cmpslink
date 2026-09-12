import { Router } from "express";
import multer from "multer";
import Student from "../models/Student.js";
import Job from "../models/Job.js";
import { protect } from "../middleware/auth.js";
import { calculateReadiness } from "../services/readinessService.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const AI_SERVICE_URL = () => (process.env.AI_SERVICE_URL || "http://localhost:8000").replace(/\/$/, "");

async function callAI(path, options = {}) {
  const response = await fetch(`${AI_SERVICE_URL()}${path}`, options);
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { message: text }; }
  if (!response.ok) throw new Error(data.message || `AI service returned ${response.status}`);
  return data;
}

router.post("/readiness", protect, async (req, res) => {
  try {
    const student = req.user.role === "student"
      ? await Student.findOne({ userId: req.user.id })
      : await Student.findById(req.body.studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });
    const result = await callAI("/readiness", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student)
    });
    res.json({ ...result, factors: { skills: student.skills?.length || 0, cgpa: student.cgpa, aptitude: student.aptitudeScore, interview: student.interviewScore, communication: student.communicationScore, projects: student.projects?.length || 0 } });
  } catch (e) {
    const student = req.user.role === "student" ? await Student.findOne({ userId: req.user.id }) : await Student.findById(req.body.studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });
    const result = calculateReadiness(student);
    res.json({ ...result, mode: "fallback" });
  }
});

router.post("/skill-gap", protect, async (req, res) => {
  try {
    const data = await callAI("/skill-gap", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });
    res.json(data);
  } catch (e) { res.status(502).json({ message: e.message }); }
});

router.post("/risk", protect, async (req, res) => {
  try {
    const data = await callAI("/risk", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });
    res.json(data);
  } catch (e) { res.status(502).json({ message: e.message }); }
});

router.post("/match", protect, async (req, res) => {
  try {
    const data = await callAI("/match", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });
    res.json(data);
  } catch (e) { res.status(502).json({ message: e.message }); }
});

router.post("/resume/analyze", protect, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Resume file is required" });
  try {
    const form = new FormData();
    form.append("file", new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname);
    const data = await callAI("/resume/analyze", { method: "POST", body: form });
    res.json(data);
  } catch (e) { res.status(502).json({ message: e.message }); }
});

router.post("/chat", protect, async (req, res) => {
  try {
    const data = await callAI("/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: req.body.message, context: req.body.context || {} })
    });
    res.json(data);
  } catch (e) { res.status(502).json({ message: e.message }); }
});

router.get("/recommendations", protect, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: "Student profile not found" });
    const jobs = await Job.find().limit(50);
    const recommendations = jobs.map(job => {
      const studentSkills = new Set((student.skills || []).map(s => s.toLowerCase()));
      const required = job.requiredSkills || [];
      const matched = required.filter(s => studentSkills.has(s.toLowerCase()));
      const skillMatch = required.length ? Math.round(matched.length / required.length * 100) : 100;
      const eligibility = student.cgpa >= (job.minimumCGPA || 0) && (!job.eligibleBranches?.length || job.eligibleBranches.includes(student.branch));
      return { job, score: Math.round(skillMatch * 0.7 + (student.readinessScore || 0) * 0.3), skillMatch, eligibility, missingSkills: required.filter(s => !studentSkills.has(s.toLowerCase())) };
    }).filter(x => x.eligibility).sort((a, b) => b.score - a.score).slice(0, 8);
    res.json({ recommendations });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;
