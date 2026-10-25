import { Router } from "express";
import { toggleFavorite, getMyFavorites } from "../controllers/favoriteController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// All routes are protected
router.use(protect);

router.get("/", getMyFavorites);
router.post("/toggle/:bookId", toggleFavorite);

export default router;
