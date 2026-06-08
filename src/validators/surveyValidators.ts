import { Request } from "express";

export const validateCreateSurvey = (req: Request) => {
  const { title, description, category } = req.body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    const error = new Error("Title is required and must be a non-empty string");
    (error as any).status = 400;
    throw error;
  }

  return {
    title: title.trim(),
    description: description ? description.trim() : undefined,
    category: category ? category.trim() : undefined,
  };
};

export const validateUpdateSurvey = (req: Request) => {
  const { title, description, category } = req.body;

  const updateData: any = {};

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim() === "") {
      const error = new Error("Title must be a non-empty string");
      (error as any).status = 400;
      throw error;
    }
    updateData.title = title.trim();
  }

  if (description !== undefined) {
    updateData.description = description ? description.trim() : "";
  }

  if (category !== undefined) {
    updateData.category = category ? category.trim() : "";
  }

  if (Object.keys(updateData).length === 0) {
    const error = new Error("At least one field must be updated");
    (error as any).status = 400;
    throw error;
  }

  return updateData;
};
