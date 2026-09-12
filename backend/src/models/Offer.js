import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  companyName: String,
  role: String,
  ctc: Number,
  offerLetterUrl: String,
  documents: [{
    name: String,
    status: { type: String, enum: ["pending", "submitted", "verified"], default: "pending" }
  }],
  status: { type: String, enum: ["pending", "accepted", "deferred", "withdrawn", "joined"], default: "pending" },
  joiningDate: Date
}, { timestamps: true });

export default mongoose.model("Offer", offerSchema);
