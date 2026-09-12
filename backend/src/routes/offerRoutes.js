import { Router } from "express";
import { protect, roles } from "../middleware/auth.js";
import { createOffer, listOffers, updateOffer } from "../controllers/offerController.js";
const router = Router();
router.get("/", protect, listOffers);
router.post("/", protect, roles("admin", "recruiter"), createOffer);
router.put("/:id", protect, updateOffer);
export default router;
