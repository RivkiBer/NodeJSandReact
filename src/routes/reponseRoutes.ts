import { Router } from "express";

import {
  createResponseController,
  getAllResponsesController,
  getResponseByIdController,
  updateResponseController,
  deleteResponseController,
} from "../controllers/responseController.js";

const responseRouter = Router();

responseRouter.post("/", createResponseController);

responseRouter.get("/", getAllResponsesController);

responseRouter.get("/:id", getResponseByIdController);

responseRouter.put("/:id", updateResponseController);

responseRouter.delete("/:id", deleteResponseController);

export default responseRouter;