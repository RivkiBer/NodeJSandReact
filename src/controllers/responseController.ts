import { Request, Response } from "express";
import {
  createResponse,
  getAllResponses,
  getResponseById,
  updateResponse,
  deleteResponse,
} from "../services/responseService.js";

const formatError = (error: unknown, fallback: string) => {
  const err = error as { status?: number; message?: string };
  return {
    status: err.status && [400, 404, 500].includes(err.status) ? err.status : 500,
    message: err.message || fallback,
  };
};

export const createResponseController = async (req: Request, res: Response) => {
  try {
    const responseObj = await createResponse(req.body);
    res.status(201).json(responseObj);
  } catch (error) {
    const { status, message } = formatError(error, "Failed to create response");
    res.status(status).json({ message });
  }
};

export const getAllResponsesController = async (req: Request, res: Response) => {
  try {
    const list = await getAllResponses();
    res.status(200).json(list);
  } catch (error) {
    const { status, message } = formatError(error, "Failed to get responses");
    res.status(status).json({ message });
  }
};

export const getResponseByIdController = async (req: Request, res: Response) => {
  try {
    const responseObj = await getResponseById(req.params.id);
    res.status(200).json(responseObj);
  } catch (error) {
    const { status, message } = formatError(error, "Failed to get response");
    res.status(status).json({ message });
  }
};

export const updateResponseController = async (req: Request, res: Response) => {
  try {
    const updated = await updateResponse(req.params.id, req.body);
    res.status(200).json(updated);
  } catch (error) {
    const { status, message } = formatError(error, "Failed to update response");
    res.status(status).json({ message });
  }
};

export const deleteResponseController = async (req: Request, res: Response) => {
  try {
    const result = await deleteResponse(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    const { status, message } = formatError(error, "Failed to delete response");
    res.status(status).json({ message });
  }
};
