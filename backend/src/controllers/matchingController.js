import Job from "../models/Job.js";
import Student from "../models/Student.js";
import { matchStudentToJob } from "../services/matchingService.js";

export async function matchJob(req, res) {
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.status(404).json({ message: "Job not found" });
  const students = await Student.find().populate("userId", "name email");
  const results = students.map(student => ({
    student,
    ...matchStudentToJob(student, job)
  })).sort((a, b) => b.finalMatchScore - a.finalMatchScore);
  res.json({ job, results });
}
