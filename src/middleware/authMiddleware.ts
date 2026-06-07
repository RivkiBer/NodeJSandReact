import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      const error = new Error("No token provided");
      (error as any).status = 401;
      throw error;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    (req as any).user = decoded;
    next();
  } catch (error) {
    (error as any).status = 401;
    next(error);
  }
};
