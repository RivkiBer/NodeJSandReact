import { Router, Request, Response } from "express";

const router = Router();

// POST /api/auth/register
// TODO: לחבר ל-controller של הרשמה בשלב הבא
router.post("/register", (req: Request, res: Response) => {
  res.status(201).json({ message: "register endpoint placeholder" });
});

export default router;
