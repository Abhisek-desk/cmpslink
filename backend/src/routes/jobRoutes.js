import { Router } from "express";
import { protect, roles } from "../middleware/auth.js";
import { createJob, listJobs } from "../controllers/jobController.js";
const router = Router();
router.get("/", protect, listJobs);
router.post("/", protect, roles("recruiter", "admin"), createJob);
export default router;
