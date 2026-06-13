import { Request } from "express";

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const USERNAME_REGEX = /^[\p{L}0-9_]{2,20}$/u;

export const validateRegisterInput = (req: Request): RegisterInput => {
  const { username, email, password } = req.body;

  if (!username || typeof username !== "string" || !USERNAME_REGEX.test(username)) {
    const error = new Error("שם המשתמש חייב להכיל 2-20 תווים ויכול לכלול אותיות, ספרות וקו תחתי בלבד");
    (error as any).status = 400;
    throw error;
  }

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
    const error = new Error("אנא הכנס כתובת אימייל תקינה");
    (error as any).status = 400;
    throw error;
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    const error = new Error("הסיסמה חייבת להכיל לפחות 6 תווים");
    (error as any).status = 400;
    throw error;
  }

  return {
    username: username.trim().toLowerCase(),
    email: email.trim().toLowerCase(),
    password,
  };
};

export const validateLoginInput = (req: Request): LoginInput => {
  const { email, password } = req.body;

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
    const error = new Error("אנא הכנס כתובת אימייל תקינה");
    (error as any).status = 400;
    throw error;
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    const error = new Error("הסיסמה חייבת להכיל לפחות 6 תווים");
    (error as any).status = 400;
    throw error;
  }

  return {
    email: email.trim().toLowerCase(),
    password,
  };
};
