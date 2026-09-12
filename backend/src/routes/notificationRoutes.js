import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { listNotifications, createNotification } from "../controllers/notificationController.js";
const router = Router();
router.get("/", protect, listNotifications);
router.post("/", protect, createNotification);
export default router;
