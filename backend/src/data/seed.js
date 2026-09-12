import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Student from "../models/Student.js";
import Job from "../models/Job.js";
import Drive from "../models/Drive.js";

await connectDB();
await Promise.all([User.deleteMany({}), Student.deleteMany({}), Job.deleteMany({}), Drive.deleteMany({})]);

const password = await bcrypt.hash("Student@123", 10);
const admin = await User.create({ name: "Placement Admin", email: "admin@campuslink.local", password: await bcrypt.hash("Admin@123", 10), role: "admin" });
const recruiter = await User.create({ name: "Demo Recruiter", email: "recruiter@campuslink.local", password: await bcrypt.hash("Recruiter@123", 10), role: "recruiter" });
const studentUser = await User.create({ name: "Demo Student", email: "student@campuslink.local", password, role: "student" });

await Student.create({
  userId: studentUser._id,
  branch: "CSE",
  cgpa: 8.4,
  backlogs: 0,
  skills: ["React", "Node.js", "MongoDB", "JavaScript", "SQL"],
  certifications: ["AWS Cloud Practitioner"],
  projects: [{ title: "CampusLink", description: "Placement platform", technologies: ["React", "Node.js", "MongoDB"] }],
  aptitudeScore: 82,
  interviewScore: 78,
  communicationScore: 80,
  readinessScore: 78,
  readinessLevel: "Ready",
  targetRoles: ["Full Stack Developer"]
});

const job = await Job.create({
  recruiterId: recruiter._id,
  companyName: "DemoTech",
  role: "Full Stack Developer",
  description: "Build web applications using React, Node.js and SQL.",
  requiredSkills: ["React", "Node.js", "SQL", "Docker"],
  minimumCGPA: 7.5,
  eligibleBranches: ["CSE", "IT"]
});

await Drive.create({
  recruiterId: recruiter._id,
  companyName: "DemoTech",
  role: job.role,
  date: new Date(Date.now() + 7 * 86400000),
  startTime: "10:00",
  endTime: "13:00",
  venue: "Block A",
  panel: "Panel 1"
});

console.log("Seed complete.");
console.log("admin@campuslink.local / Admin@123");
console.log("recruiter@campuslink.local / Recruiter@123");
console.log("student@campuslink.local / Student@123");
process.exit(0);
