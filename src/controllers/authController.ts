import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { validateRegisterInput } from "../validators/authValidators.js";

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = validateRegisterInput(req);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("Email already in use");
      (error as any).status = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};
