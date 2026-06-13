import { Router } from "express";

import {
  createResponseController,
  getAllResponsesController,
  getResponseByIdController,
  updateResponseController,
  deleteResponseController,
} from "../controllers/responseController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const responseRouter = Router();

// Allow anonymous submissions (answers) via POST
responseRouter.post("/", createResponseController);

// Public read
responseRouter.get("/", getAllResponsesController);
responseRouter.get("/:id", getResponseByIdController);

// Protected updates: only authenticated users can update their responses
responseRouter.put("/:id", authenticate, updateResponseController);

// Protected delete: admin only
responseRouter.delete("/:id", authenticate, requireRole("admin"), deleteResponseController);

export default responseRouter;