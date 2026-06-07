import { Schema, model, Document, Types } from "mongoose";

export interface ISurvey extends Document {
  title: string;
  description?: string;
  createdBy: Types.ObjectId;
  questions: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const surveySchema = new Schema<ISurvey>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
  },
  {
    timestamps: true,
  }
);

const Survey = model<ISurvey>("Survey", surveySchema);
export default Survey;
