import mongoose from "mongoose";

const driveSchema = new mongoose.Schema({
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  companyName: String,
  role: String,
  date: { type: Date, required: true },
  startTime: String,
  endTime: String,
  venue: String,
  panel: String,
  capacity: { type: Number, default: 100 },
  status: { type: String, enum: ["upcoming", "ongoing", "completed", "cancelled"], default: "upcoming" }
}, { timestamps: true });

export default mongoose.model("Drive", driveSchema);
