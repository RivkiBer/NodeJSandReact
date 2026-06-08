import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.js";

export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      const error = new Error("No token provided");
      (error as any).status = 401;
      throw error;
    }

    const decoded = jwt.verify(token, jwtConfig.secret as jwt.Secret) as {
      id: string;
      username: string;
      role: string;
    };

    (req as any).user = decoded;
    next();
  } catch (error) {
    const authError = new Error("Authentication failed");
    (authError as any).status = 401;
    next(authError);
  }
};
