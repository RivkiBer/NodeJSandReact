import { Request, Response, NextFunction } from "express";
import Survey from "../models/Survey.js";
import User from "../models/User.js";
import "../models/Question.js";
import { validateCreateSurvey, validateUpdateSurvey } from "../validators/surveyValidators.js";
import { Types } from "mongoose";

// GET all surveys with search, filter, and pagination
export const getAllSurveys = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter: any = {};

    // Add category filter if provided
    if (category && typeof category === "string") {
      filter.category = category;
    }

    // Add search filter if provided
    if (search && typeof search === "string") {
      filter.$text = { $search: search };
    }

    // Parse pagination parameters
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const surveys = await Survey.find(filter)
      .populate("createdBy", "username email")
      .populate("questions")
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    // Get total count for pagination info
    const total = await Survey.countDocuments(filter);

    res.status(200).json({
      surveys,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET survey by ID
export const getSurveyById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      const error = new Error("Invalid survey ID");
      (error as any).status = 400;
      throw error;
    }

    const survey = await Survey.findById(id)
      .populate("createdBy", "username email")
      .populate("questions");

    if (!survey) {
      const error = new Error("Survey not found");
      (error as any).status = 404;
      throw error;
    }

    res.status(200).json(survey);
  } catch (error) {
    next(error);
  }
};

// CREATE new survey
export const createSurvey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, category } = validateCreateSurvey(req);
    const userId = (req as any).user?.userId;

    if (!userId) {
      const error = new Error("User not authenticated");
      (error as any).status = 401;
      throw error;
    }

    const survey = await Survey.create({
      title,
      description,
      category,
      createdBy: userId,
      questions: [],
    });

    const populatedSurvey = await survey.populate("createdBy", "username email");

    res.status(201).json({
      message: "Survey created successfully",
      survey: populatedSurvey,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE survey
export const updateSurvey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = validateUpdateSurvey(req);
    const userId = (req as any).user?.userId;

    if (!Types.ObjectId.isValid(id)) {
      const error = new Error("Invalid survey ID");
      (error as any).status = 400;
      throw error;
    }

    if (!userId) {
      const error = new Error("User not authenticated");
      (error as any).status = 401;
      throw error;
    }
    // Fetch survey and user role
    const survey = await Survey.findById(id);

    if (!survey) {
      const error = new Error("Survey not found");
      (error as any).status = 404;
      throw error;
    }
    const currentUser = await User.findById(userId);
    const userRole = currentUser?.role;

    // Check if user is the creator or an admin
    if (survey.createdBy.toString() !== userId && userRole !== "admin") {
      const error = new Error("You are not authorized to update this survey");
      (error as any).status = 403;
      throw error;
    }

    const updatedSurvey = await Survey.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("createdBy", "username email")
      .populate("questions");

    res.status(200).json({
      message: "Survey updated successfully",
      survey: updatedSurvey,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE survey
export const deleteSurvey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    if (!Types.ObjectId.isValid(id)) {
      const error = new Error("Invalid survey ID");
      (error as any).status = 400;
      throw error;
    }

    if (!userId) {
      const error = new Error("User not authenticated");
      (error as any).status = 401;
      throw error;
    }
    const survey = await Survey.findById(id);

    if (!survey) {
      const error = new Error("Survey not found");
      (error as any).status = 404;
      throw error;
    }
    const currentUser = await User.findById(userId);
    const userRole = currentUser?.role;

    // Check if user is the creator or an admin
    if (survey.createdBy.toString() !== userId && userRole !== "admin") {
      const error = new Error("You are not authorized to delete this survey");
      (error as any).status = 403;
      throw error;
    }

    await Survey.findByIdAndDelete(id);

    res.status(200).json({
      message: "Survey deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
