import { Request } from "express";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const validateRegisterInput = (req: Request): RegisterInput => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    const error = new Error("Name is required and must be at least 2 characters long");
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
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
  };
};

export const validateLoginInput = (req: Request): LoginInput => {
  const { email, password } = req.body;

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
    email: email.trim().toLowerCase(),
    password,
  };
};
