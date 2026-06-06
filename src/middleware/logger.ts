import { NextFunction, Request, Response } from "express";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on("finish", () => {
    const elapsed = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${elapsed}ms`);
  });

  next();
};
