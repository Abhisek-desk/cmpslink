import { Router } from "express";
import { protect, roles } from "../middleware/auth.js";
import { createDrive, listDrives, conflicts } from "../controllers/driveController.js";
const router = Router();
router.get("/", protect, listDrives);
router.get("/conflicts", protect, roles("admin", "recruiter"), conflicts);
router.post("/", protect, roles("admin", "recruiter"), createDrive);
export default router;
