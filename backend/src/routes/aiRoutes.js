import { Router } from "express";
import { protect } from "../middleware/auth.js";
import Student from "../models/Student.js";
import { calculateReadiness } from "../services/readinessService.js";
const router = Router();

router.post("/readiness", protect, async (req, res) => {
  const student = req.user.role === "student"
    ? await Student.findOne({ userId: req.user.id })
    : await Student.findById(req.body.studentId);
  if (!student) return res.status(404).json({ message: "Student not found" });
  const result = calculateReadiness(student);
  res.json({ ...result, factors: {
    skills: student.skills?.length || 0,
    cgpa: student.cgpa,
    aptitude: student.aptitudeScore,
    interview: student.interviewScore,
    communication: student.communicationScore,
    projects: student.projects?.length || 0
  }});
});

export default router;
