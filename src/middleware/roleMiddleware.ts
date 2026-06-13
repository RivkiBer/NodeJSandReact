import { Request, Response, NextFunction } from "express";
import User from "../models/User.js";

// requireRole('admin') or requireRole('creator','admin')
export const requireRole = (...allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userPayload = (req as any).user;
      if (!userPayload || !userPayload.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await User.findById(userPayload.userId).select("role");
      if (!user) return res.status(401).json({ message: "User not found" });

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default requireRole;
