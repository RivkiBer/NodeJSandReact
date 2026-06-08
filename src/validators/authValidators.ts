import { Request } from "express";

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}


const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export const validateRegisterInput = (req: Request): RegisterInput => {
  const { username, email, password } = req.body;

  if (!username || typeof username !== "string" || !USERNAME_REGEX.test(username)) {
    const error = new Error("Username must be 3-20 characters (letters, numbers, underscore only)");
    (error as any).status = 400;
    throw error;
  }

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
    const error = new Error("A valid email address is required");
    (error as any).status = 400;
    throw error;
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    const error = new Error("Password is required and must be at least 6 characters long");
    (error as any).status = 400;
    throw error;
  }

  return {
    username: username.trim().toLowerCase(),
    email: email.trim().toLowerCase(),
    password,
  };
};

