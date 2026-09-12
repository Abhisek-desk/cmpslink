import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import matchingRoutes from "./routes/matchingRoutes.js";
import driveRoutes from "./routes/driveRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

await connectDB();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/api/health", (_, res) => res.json({ ok: true, service: "CAMPUSLINK API" }));
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/drives", driveRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`CAMPUSLINK API running on ${port}`));
