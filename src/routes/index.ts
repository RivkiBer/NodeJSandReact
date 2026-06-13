import { Router } from "express";
import healthRoutes from "./healthRoutes.js";
import authRoutes from "./authRoutes.js";
import surveyRoutes from "./surveyRoutes.js";
import questionRoutes from "./questionRoutes.js";
import responseRoutes from "./reponseRoutes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/surveys", surveyRoutes);
router.use("/questions", questionRoutes);
router.use("/responses", responseRoutes);

export default router;
