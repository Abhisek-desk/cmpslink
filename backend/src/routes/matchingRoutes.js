import { Router } from "express";
import { protect, roles } from "../middleware/auth.js";
import { matchJob } from "../controllers/matchingController.js";
const router = Router();
router.get("/job/:jobId", protect, roles("recruiter", "admin"), matchJob);
export default router;
