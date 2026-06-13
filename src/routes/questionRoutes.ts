import { Router } from "express";

import {
  createQuestionController,
  getAllQuestionsController,
  getQuestionByIdController,
  updateQuestionController,
  deleteQuestionController,
} from "../controllers/questionController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const questionRouter = Router();

// Public: list and view
questionRouter.get("/", getAllQuestionsController);
questionRouter.get("/:id", getQuestionByIdController);

// Protected: create/update/delete
questionRouter.post("/", authenticate, createQuestionController);
questionRouter.put("/:id", authenticate, updateQuestionController);
questionRouter.delete("/:id", authenticate, deleteQuestionController);

export default questionRouter;