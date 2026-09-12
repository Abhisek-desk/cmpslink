import { Router } from "express";
import { protect, roles } from "../middleware/auth.js";
import { dashboard } from "../controllers/analyticsController.js";
const router = Router();
router.get("/dashboard", protect, roles("admin", "recruiter"), dashboard);
export default router;
