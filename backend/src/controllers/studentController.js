import Student from "../models/Student.js";
import { calculateReadiness } from "../services/readinessService.js";

export async function getProfile(req, res) {
  const student = await Student.findOne({ userId: req.user.id }).populate("userId", "name email");
  res.json(student);
}

export async function updateProfile(req, res) {
  const student = await Student.findOne({ userId: req.user.id });
  Object.assign(student, req.body);
  const result = calculateReadiness(student);
  student.readinessScore = result.score;
  student.readinessLevel = result.level;
  await student.save();
  res.json(student);
}

export async function listStudents(req, res) {
  const students = await Student.find().populate("userId", "name email");
  res.json(students);
}
