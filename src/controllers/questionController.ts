import { Request, Response } from "express";

import {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} from "../services/questionService.js";

const formatError = (error: unknown, fallback: string) => {
  const err = error as { status?: number; message?: string };
  return {
    status: err.status && [400, 404, 500].includes(err.status) ? err.status : 500,
    message: err.message || fallback,
  };
};

export const createQuestionController = async (req: Request, res: Response) => {
  try {
    const question = await createQuestion(req.body);
    res.status(201).json(question);
  } catch (error) {
    const { status, message } = formatError(error, "Failed to create question");
    res.status(status).json({ message });
  }
};

export const getAllQuestionsController = async (req: Request, res: Response) => {
  try {
    const questions = await getAllQuestions();
    res.status(200).json(questions);
  } catch (error) {
    const { status, message } = formatError(error, "Failed to get questions");
    res.status(status).json({ message });
  }
};

export const getQuestionByIdController = async (req: Request, res: Response) => {
  try {
    const question = await getQuestionById(req.params.id);
    res.status(200).json(question);
  } catch (error) {
    const { status, message } = formatError(error, "Failed to get question");
    res.status(status).json({ message });
  }
};

export const updateQuestionController = async (req: Request, res: Response) => {
  try {
    const question = await updateQuestion(req.params.id, req.body);
    res.status(200).json(question);
  } catch (error) {
    const { status, message } = formatError(error, "Failed to update question");
    res.status(status).json({ message });
  }
};

export const deleteQuestionController = async (req: Request, res: Response) => {
  try {
    const result = await deleteQuestion(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    const { status, message } = formatError(error, "Failed to delete question");
    res.status(status).json({ message });
  }
};
