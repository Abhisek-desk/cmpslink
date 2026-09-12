import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  companyName: String,
  role: { type: String, required: true },
  description: String,
  requiredSkills: [String],
  minimumCGPA: { type: Number, default: 0 },
  eligibleBranches: [String],
  certifications: [String],
  driveId: { type: mongoose.Schema.Types.ObjectId, ref: "Drive" }
}, { timestamps: true });

export default mongoose.model("Job", jobSchema);
