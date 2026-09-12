import { Router } from "express";
import { protect, roles } from "../middleware/auth.js";
import { getProfile, updateProfile, listStudents } from "../controllers/studentController.js";
const router = Router();
router.get("/me", protect, roles("student"), getProfile);
router.put("/me", protect, roles("student"), updateProfile);
router.get("/", protect, roles("admin", "recruiter"), listStudents);
export default router;
