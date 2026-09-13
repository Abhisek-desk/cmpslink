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

const app = express();

const allowedOrigins = [
"http://localhost:5173",
"https://cmpslink.vercel.app",
];

const corsOptions = {
origin: (origin, callback) => {
// Allow requests without an Origin header
// such as Postman/server-to-server requests.
if (!origin) {
return callback(null, true);
}


if (allowedOrigins.includes(origin)) {
  return callback(null, true);
}

console.log("Blocked CORS origin:", origin);
return callback(new Error(`CORS origin not allowed: ${origin}`));


},

credentials: true,

methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

allowedHeaders: [
"Content-Type",
"Authorization",
],

optionsSuccessStatus: 204,
};

// CORS MUST be registered before your routes.
app.use(cors(corsOptions));

// Explicitly handle browser preflight requests.
app.options("*", cors(corsOptions));

app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.get("/api/health", (req, res) => {
res.json({
ok: true,
service: "CAMPUSLINK API",
});
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/drives", driveRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);

// Error handler
app.use((err, req, res, next) => {
console.error("SERVER ERROR:", err);

res.status(500).json({
message: err.message || "Server error",
});
});

const port = process.env.PORT || 5000;

// Local development
if (process.env.NODE_ENV !== "production") {
app.listen(port, () => {
console.log(`CAMPUSLINK API running on ${port}`);
});
}

export default app;
