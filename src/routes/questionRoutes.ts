import { Router } from "express";

import {
  createQuestionController,
  getAllQuestionsController,
  getQuestionByIdController,
  updateQuestionController,
  deleteQuestionController,
} from "../controllers/questionController.js";

const questionRouter = Router();

questionRouter.post("/", createQuestionController);

questionRouter.get("/", getAllQuestionsController);

questionRouter.get("/:id", getQuestionByIdController);

questionRouter.put("/:id", updateQuestionController);

questionRouter.delete("/:id", deleteQuestionController);

export default questionRouter;