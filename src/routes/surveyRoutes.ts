import { Router } from "express";
import {
  getAllSurveys,
  getSurveyById,
  createSurvey,
  updateSurvey,
  deleteSurvey,
} from "../controllers/surveyController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = Router();

// GET /surveys - Get all surveys with search, filter, and pagination
router.get("/", getAllSurveys);

// GET /surveys/:id - Get survey by ID
router.get("/:id", getSurveyById);

// POST /surveys - Create new survey (requires authentication)
router.post("/", authenticateUser, createSurvey);

// PUT /surveys/:id - Update survey (requires authentication)
router.put("/:id", authenticateUser, updateSurvey);

// DELETE /surveys/:id - Delete survey (requires authentication)
router.delete("/:id", authenticateUser, deleteSurvey);

export default router;
