import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import userController from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const authRouter = Router();

// POST /api/auth/register
authRouter.post("/register", registerUser);

// POST /api/auth/login
authRouter.post("/login", loginUser);

// GET /api/auth/users - Admin only
authRouter.get("/users", authenticate, requireRole("admin"), userController.getUsers as any);

// POST /api/auth/users - Admin only
authRouter.post("/users", authenticate, requireRole("admin"), userController.createUser as any);

// PUT /api/auth/users/:id - Admin only
authRouter.put("/users/:id", authenticate, requireRole("admin"), userController.updateUser as any);

// PATCH /api/auth/users/:id/role - Admin only
authRouter.patch("/users/:id/role", authenticate, requireRole("admin"), userController.changeUserRole as any);

// DELETE /api/auth/users/:id - Admin only
authRouter.delete("/users/:id", authenticate, requireRole("admin"), userController.deleteUser as any);

export default authRouter;
