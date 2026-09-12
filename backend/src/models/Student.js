import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  branch: String,
  cgpa: { type: Number, default: 0 },
  backlogs: { type: Number, default: 0 },
  skills: [String],
  certifications: [String],
  projects: [{ title: String, description: String, technologies: [String] }],
  resumeUrl: String,
  aptitudeScore: { type: Number, default: 0 },
  interviewScore: { type: Number, default: 0 },
  communicationScore: { type: Number, default: 0 },
  readinessScore: { type: Number, default: 0 },
  readinessLevel: { type: String, default: "Not Ready" },
  targetRoles: [String]
}, { timestamps: true });

export default mongoose.model("Student", studentSchema);
