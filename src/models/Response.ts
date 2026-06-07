import { Schema, model, Document, Types } from "mongoose";

export interface IResponse extends Document {
  survey: Types.ObjectId;
  question: Types.ObjectId;
  user?: Types.ObjectId;
  answer: string;
  createdAt: Date;
  updatedAt: Date;
}

const responseSchema = new Schema<IResponse>(
  {
    survey: { type: Schema.Types.ObjectId, ref: "Survey", required: true },
    question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    answer: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Response = model<IResponse>("Response", responseSchema);
export default Response;
