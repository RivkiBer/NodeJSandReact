import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const validRoles = ["user", "creator", "admin"];

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search = "", page = "1", limit = "20" } = req.query;
    const pageNumber = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNumber = Math.max(1, Math.min(parseInt(limit as string, 10) || 20, 100));
    const skip = (pageNumber - 1) * limitNumber;

    const filter: any = {};
    if (search && typeof search === "string") {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).select("_id username email role").skip(skip).limit(limitNumber).lean(),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      users,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, role = "user" } = req.body as {
      username?: string;
      email?: string;
      password?: string;
      role?: string;
    };

    if (!username || !email || !password) {
      const err = new Error("Username, email and password are required");
      (err as any).status = 400;
      throw err;
    }

    if (!validRoles.includes(role)) {
      const err = new Error("Invalid role");
      (err as any).status = 400;
      throw err;
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      const err = new Error("Username or email already in use");
      (err as any).status = 409;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword, role });

    res.status(201).json({
      message: "User created successfully",
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { username, email, role, password } = req.body as {
      username?: string;
      email?: string;
      role?: string;
      password?: string;
    };

    const user = await User.findById(id);
    if (!user) {
      const err = new Error("User not found");
      (err as any).status = 404;
      throw err;
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (role) {
      if (!validRoles.includes(role)) {
        const err = new Error("Invalid role");
        (err as any).status = 400;
        throw err;
      }
      user.role = role;
    }
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

export const changeUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { role } = req.body as { role?: string };

    if (!role || !validRoles.includes(role)) {
      const err = new Error("Invalid role");
      (err as any).status = 400;
      throw err;
    }

    const user = await User.findById(id);
    if (!user) {
      const err = new Error("User not found");
      (err as any).status = 404;
      throw err;
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      message: "User role updated successfully",
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      const err = new Error("User not found");
      (err as any).status = 404;
      throw err;
    }

    await user.deleteOne();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export default { getUsers, createUser, updateUser, changeUserRole, deleteUser };
