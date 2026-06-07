import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { validateRegisterInput, validateLoginInput } from "../validators/authValidators.js";
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

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = validateLoginInput(req);

    const user = await User.findOne({ username });
    if (!user) {
      const error = new Error("Invalid username or password");
      (error as any).status = 401;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Invalid username or password");
      (error as any).status = 401;
      throw error;
    }

    const token = jwt.sign({ id: user._id, username: user.username }, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};
