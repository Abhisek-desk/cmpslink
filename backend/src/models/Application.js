import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
  driveId: { type: mongoose.Schema.Types.ObjectId, ref: "Drive" },
  eligibilityScore: Number,
  skillMatchScore: Number,
  readinessScore: Number,
  finalMatchScore: Number,
  explanation: String,
  status: { type: String, enum: ["recommended", "shortlisted", "interview", "selected", "rejected", "withdrawn"], default: "recommended" }
}, { timestamps: true });

export default mongoose.model("Application", applicationSchema);
