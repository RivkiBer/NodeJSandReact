import { Request, Response, NextFunction } from "express";
import jwt, { type Secret } from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.js";

interface JwtPayloadData {
  userId: string;
  username?: string;
  iat?: number;
  exp?: number;
}

interface AuthenticatedRequest extends Request {
  user?: JwtPayloadData;
}

export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, jwtConfig.secret as Secret) as JwtPayloadData;
    (req as AuthenticatedRequest).user = {
      userId: decoded.userId,
      username: (decoded as any).username,
      iat: decoded.iat,
      exp: decoded.exp,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

