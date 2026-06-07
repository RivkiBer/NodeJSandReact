import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import User from "../models/User.js";
import { validateRegisterInput, validateLoginInput } from "../validators/authValidators.js";
import { jwtConfig } from "../config/jwt.js";

interface LoginPayload {
  userId: string;
  email: string;
}

const createJwtToken = (payload: LoginPayload) => {
  const secret = jwtConfig.secret as Secret;
  const options: SignOptions = {
    expiresIn: jwtConfig.expiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload as object, secret, options);
};

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

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = validateLoginInput(req);

    const user = await User.findOne({ email });
    console.log("aaaa Login attempt for email:", email);
    if (!user) {
      const error = new Error("Invalid email or password");
      (error as any).status = 401;
      throw error;
    }

    console.log("DB password:", user.password);
    console.log("Plain password:", password);

    let passwordMatches = await bcrypt.compare(password, user.password);

    // Support old users whose password may have been saved without hashing.
    if (!passwordMatches && user.password === password) {
      passwordMatches = true;
      user.password = await bcrypt.hash(password, 10);
      await user.save();
    }

    if (!passwordMatches) {
      const error = new Error("Invalid email or password");
      (error as any).status = 401;
      throw error;
    }

    const token = createJwtToken({
      userId: user._id.toString(),
      email: user.email,
    });

    res.status(200).json({
      token,
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
