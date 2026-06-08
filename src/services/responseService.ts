import { Types } from "mongoose";
import ResponseModel, { IResponse } from "../models/Response.js";
import Survey from "../models/Survey.js";
import Question, { IQuestion } from "../models/Question.js";

class ServiceError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, ServiceError.prototype);
  }
}

const badRequest = (msg: string) => new ServiceError(msg, 400);
const notFound = (msg: string) => new ServiceError(msg, 404);

const normalizeTextAnswer = (answer: unknown) => {
  if (typeof answer !== "string") throw badRequest("Answer must be a string for text questions.");
  const trimmed = answer.trim();
  if (trimmed.length === 0) throw badRequest("Answer cannot be empty.");
  if (trimmed.length > 2000) throw badRequest("Answer is too long.");
  return trimmed;
};

const normalizeSingleChoiceAnswer = (answer: unknown, options: string[]) => {
  if (typeof answer !== "string") throw badRequest("Answer must be a string for single-choice questions.");
  const trimmed = answer.trim();
  if (!options.includes(trimmed)) throw badRequest("Answer is not one of the allowed options.");
  return trimmed;
};

const normalizeMultipleChoiceAnswer = (answer: unknown, options: string[]) => {
  let arr: string[] = [];
  if (Array.isArray(answer)) {
    arr = answer.map((a) => (typeof a === "string" ? a.trim() : String(a).trim()));
  } else if (typeof answer === "string") {
    // allow comma-separated string
    arr = answer.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
  } else {
    throw badRequest("Answer must be an array or comma-separated string for multiple-choice questions.");
  }

  const unique = Array.from(new Set(arr));
  if (unique.length === 0) throw badRequest("At least one choice must be selected.");
  for (const choice of unique) {
    if (!options.includes(choice)) throw badRequest(`Choice \"${choice}\" is not an allowed option.`);
  }
  return unique;
};

const validateSurveyId = async (surveyId: unknown) => {
  if (typeof surveyId !== "string" || !Types.ObjectId.isValid(surveyId)) throw badRequest("Survey id is required and must be a valid ObjectId.");
  const survey = await Survey.findById(surveyId);
  if (!survey) throw notFound("Survey not found.");
  return survey;
};

const validateQuestionId = async (questionId: unknown) => {
  if (typeof questionId !== "string" || !Types.ObjectId.isValid(questionId)) throw badRequest("Question id is required and must be a valid ObjectId.");
  const question = await Question.findById(questionId);
  if (!question) throw notFound("Question not found.");
  return question;
};

const buildAnswerForStorage = (question: IQuestion, rawAnswer: unknown) => {
  if (question.type === "text") {
    return normalizeTextAnswer(rawAnswer);
  }

  if (question.type === "single-choice") {
    return normalizeSingleChoiceAnswer(rawAnswer, question.options || []);
  }

  if (question.type === "multiple-choice") {
    // store as JSON string
    const arr = normalizeMultipleChoiceAnswer(rawAnswer, question.options || []);
    return JSON.stringify(arr);
  }

  throw badRequest("Unsupported question type.");
};

export const createResponse = async (responseData: any) => {
  // validate survey & question
  const survey = await validateSurveyId(responseData.survey);
  const question = await validateQuestionId(responseData.question);

  // ensure question belongs to survey
  if (String(question.survey) !== String(survey._id)) {
    throw badRequest("Question does not belong to the specified survey.");
  }

  const storedAnswer = buildAnswerForStorage(question as IQuestion, responseData.answer);

  const payload: Partial<IResponse> = {
    survey: survey._id,
    question: question._id,
    user: responseData.user ? responseData.user : undefined,
    answer: storedAnswer as string,
  };

  const created = await ResponseModel.create(payload);
  return created;
};

export const getAllResponses = async () => {
  const responses = await ResponseModel.find();
  return responses.map((r) => ({
    ...r.toObject(),
    answer: tryParseAnswer(r),
  }));
};

const tryParseAnswer = (r: IResponse) => {
  // attempt to parse multiple-choice JSON
  try {
    const qType = (r as any).question?.type;
    if (qType === "multiple-choice") {
      return JSON.parse(r.answer);
    }
  } catch (e) {
    // ignore parse errors
  }
  return r.answer;
};

export const getResponseById = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) throw badRequest("Invalid response id.");
  const resp = await ResponseModel.findById(id).populate("question");
  if (!resp) throw notFound("Response not found.");

  return {
    ...resp.toObject(),
    answer: tryParseAnswer(resp as IResponse),
  };
};

export const updateResponse = async (id: string, responseData: any) => {
  if (!Types.ObjectId.isValid(id)) throw badRequest("Invalid response id.");
  const existing = await ResponseModel.findById(id);
  if (!existing) throw notFound("Response not found.");

  const survey = responseData.survey ? await validateSurveyId(responseData.survey) : await Survey.findById(existing.survey);
  const question = responseData.question ? await validateQuestionId(responseData.question) : await Question.findById(existing.question);
  if (!survey || !question) throw notFound("Referenced survey or question not found.");

  if (String(question.survey) !== String(survey._id)) {
    throw badRequest("Question does not belong to the specified survey.");
  }

  const storedAnswer = buildAnswerForStorage(question as IQuestion, responseData.answer ?? existing.answer);

  const payload: Partial<IResponse> = {
    survey: survey._id,
    question: question._id,
    user: responseData.user !== undefined ? responseData.user : existing.user,
    answer: storedAnswer as string,
  };

  const updated = await ResponseModel.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!updated) throw notFound("Response not found after update.");

  return {
    ...updated.toObject(),
    answer: tryParseAnswer(updated as IResponse),
  };
};

export const deleteResponse = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) throw badRequest("Invalid response id.");
  const existing = await ResponseModel.findById(id);
  if (!existing) throw notFound("Response not found.");

  await ResponseModel.findByIdAndDelete(id);
  return { message: "Response deleted successfully." };
};
