import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import User from "../models/User.js";
import { validateRegisterInput } from "../validators/authValidators.js";
import { jwtConfig } from "../config/jwt.js";

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = validateRegisterInput(req);

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      const error = new Error(
        existingUser.username === username ? "Username already in use" : "Email already in use"
      );
      (error as any).status = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });
    const token = jwt.sign(
      { id: user._id.toString(), username: user.username, role: user.role },
      jwtConfig.secret as jwt.Secret,
      { expiresIn: jwtConfig.expiresIn as jwt.SignOptions["expiresIn"] }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

