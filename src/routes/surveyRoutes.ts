import { Router } from "express";
import {
  getAllSurveys,
  getSurveyById,
  createSurvey,
  updateSurvey,
  deleteSurvey,
} from "../controllers/surveyController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

// GET /surveys - Get all surveys with search, filter, and pagination
router.get("/", getAllSurveys);

// GET /surveys/:id - Get survey by ID
router.get("/:id", getSurveyById);

// POST /surveys - Create new survey
router.post("/", authenticate, createSurvey);

// PUT /surveys/:id - Update survey
router.put("/:id", authenticate, updateSurvey);

// DELETE /surveys/:id - Delete survey
router.delete("/:id", authenticate, deleteSurvey);

export default router;
