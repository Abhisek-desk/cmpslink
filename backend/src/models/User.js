import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "recruiter", "admin"], default: "student" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
