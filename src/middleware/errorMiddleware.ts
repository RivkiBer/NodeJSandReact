import { NextFunction, Request, Response } from "express";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack || err.message);
  const status = (err as any).status || 500;
  res.status(status).json({
    message: err.message || "Internal server error",
    status,
  });
};
