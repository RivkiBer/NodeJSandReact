import { Types } from "mongoose";
import Question, { IQuestion } from "../models/Question.js";
import Survey from "../models/Survey.js";

const VALID_TYPES = ["text", "single-choice", "multiple-choice", "rating"] as const;
type QuestionType = (typeof VALID_TYPES)[number];

class ServiceError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, ServiceError.prototype);
  }
}

const badRequest = (message: string) => new ServiceError(message, 400);
const notFound = (message: string) => new ServiceError(message, 404);

const normalizeText = (text: unknown) => {
  if (typeof text !== "string") {
    throw badRequest("Question text is required and must be a string.");
  }

  const trimmed = text.trim();
  if (trimmed.length < 3) {
    throw badRequest("Question text must be at least 3 characters long.");
  }

  if (trimmed.length > 500) {
    throw badRequest("Question text must be at most 500 characters long.");
  }

  return trimmed;
};

const normalizeType = (type: unknown) => {
  if (typeof type !== "string") {
    throw badRequest("Question type is required and must be a string.");
  }

  if (!VALID_TYPES.includes(type as QuestionType)) {
    throw badRequest(`Question type must be one of: ${VALID_TYPES.join(", ")}.`);
  }

  return type as QuestionType;
};

const normalizeOptions = (options: unknown) => {
  if (!Array.isArray(options)) {
    throw badRequest("Question options must be an array.");
  }

  const normalized = options
    .map((option) =>
      typeof option === "string" ? option.trim() : String(option).trim()
    )
    .filter((option) => option.length > 0);

  if (normalized.length < 2) {
    throw badRequest("Question options must include at least 2 non-empty values.");
  }

  return normalized;
};

const normalizeRatingValue = (value: unknown, field: string) => {
  const numberValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 1 || numberValue > 20) {
    throw badRequest(`${field} must be a number between 1 and 20.`);
  }
  return Math.floor(numberValue);
};

const validateSurveyId = async (surveyId: unknown) => {
  if (typeof surveyId !== "string" || !Types.ObjectId.isValid(surveyId)) {
    throw badRequest("Survey id is required and must be a valid ObjectId.");
  }

  const survey = await Survey.findById(surveyId);
  if (!survey) {
    throw notFound("Referenced survey was not found.");
  }

  return survey;
};

const buildQuestionPayload = async (
  rawData: Record<string, unknown>,
  existingQuestion?: IQuestion
) => {
  const payload: Partial<IQuestion> = {};

  const type =
    rawData.type !== undefined
      ? normalizeType(rawData.type)
      : existingQuestion?.type;
  if (!type) {
    throw badRequest("Question type is required.");
  }

  const text =
    rawData.text !== undefined
      ? normalizeText(rawData.text)
      : existingQuestion?.text;
  if (!text) {
    throw badRequest("Question text is required.");
  }

  payload.type = type;
  payload.text = text;

  if (type === "text") {
    payload.options = [];
  } else if (type === "rating") {
    payload.options = [];
    const minRating = rawData.minRating ?? existingQuestion?.minRating ?? 1;
    const maxRating = rawData.maxRating ?? existingQuestion?.maxRating ?? 5;

    const normalizedMin = normalizeRatingValue(minRating, "minRating");
    const normalizedMax = normalizeRatingValue(maxRating, "maxRating");

    if (normalizedMin >= normalizedMax) {
      throw badRequest("minRating must be lower than maxRating.");
    }

    payload.minRating = normalizedMin;
    payload.maxRating = normalizedMax;
    // optional textual labels for rating endpoints
    const minLabelRaw = rawData.minLabel ?? existingQuestion?.minLabel;
    const maxLabelRaw = rawData.maxLabel ?? existingQuestion?.maxLabel;
    if (minLabelRaw !== undefined) {
      if (typeof minLabelRaw !== "string") throw badRequest("minLabel must be a string.");
      const trimmed = minLabelRaw.trim();
      if (trimmed.length > 100) throw badRequest("minLabel must be at most 100 characters.");
      payload.minLabel = trimmed;
    }
    if (maxLabelRaw !== undefined) {
      if (typeof maxLabelRaw !== "string") throw badRequest("maxLabel must be a string.");
      const trimmed = maxLabelRaw.trim();
      if (trimmed.length > 100) throw badRequest("maxLabel must be at most 100 characters.");
      payload.maxLabel = trimmed;
    }
  } else {
    const optionsProvided =
      rawData.options !== undefined ? rawData.options : existingQuestion?.options;
    if (optionsProvided === undefined) {
      throw badRequest("Question options are required for choice questions.");
    }
    payload.options = normalizeOptions(optionsProvided);
  }

  if (rawData.required !== undefined) {
    payload.required = Boolean(rawData.required);
  } else if (existingQuestion) {
    payload.required = existingQuestion.required;
  }

  if (rawData.survey !== undefined) {
    const survey = await validateSurveyId(rawData.survey);
    payload.survey = survey._id;
  } else if (existingQuestion) {
    payload.survey = existingQuestion.survey;
  }

  return payload;
};

export const createQuestion = async (questionData: any) => {
  const survey = await validateSurveyId(questionData.survey);
  const payload = await buildQuestionPayload(questionData);

  const question = await Question.create(payload);
  await Survey.findByIdAndUpdate(survey._id, {
    $addToSet: { questions: question._id },
  });

  return question;
};

export const getAllQuestions = async () => {
  return await Question.find();
};

export const getQuestionById = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw badRequest("Invalid question id.");
  }

  const question = await Question.findById(id);
  if (!question) {
    throw notFound("Question not found.");
  }

  return question;
};

export const updateQuestion = async (id: string, questionData: any) => {
  if (!Types.ObjectId.isValid(id)) {
    throw badRequest("Invalid question id.");
  }

  const existingQuestion = await Question.findById(id);
  if (!existingQuestion) {
    throw notFound("Question not found.");
  }

  const payload = await buildQuestionPayload(questionData, existingQuestion);

  if (
    questionData.survey !== undefined &&
    String(existingQuestion.survey) !== String(payload.survey)
  ) {
    await Promise.all([
      Survey.findByIdAndUpdate(existingQuestion.survey, {
        $pull: { questions: existingQuestion._id },
      }),
      Survey.findByIdAndUpdate(payload.survey, {
        $addToSet: { questions: existingQuestion._id },
      }),
    ]);
  }

  const updatedQuestion = await Question.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!updatedQuestion) {
    throw notFound("Question not found after update.");
  }

  return updatedQuestion;
};

export const deleteQuestion = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw badRequest("Invalid question id.");
  }

  const question = await Question.findById(id);
  if (!question) {
    throw notFound("Question not found.");
  }

  await Promise.all([
    Question.findByIdAndDelete(id),
    Survey.findByIdAndUpdate(question.survey, {
      $pull: { questions: question._id },
    }),
  ]);

  return { message: "Question deleted successfully." };
};
