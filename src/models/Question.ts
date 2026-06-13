import { Schema, model, Document, Types } from "mongoose";

export interface IQuestion extends Document {
  survey: Types.ObjectId;
  text: string;
  type: string;
  options?: string[];
  minRating?: number;
  maxRating?: number;
  minLabel?: string;
  maxLabel?: string;
  required: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    survey: { type: Schema.Types.ObjectId, ref: "Survey", required: true },
    text: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true, default: "text" },
    options: [{ type: String, trim: true }],
    minRating: { type: Number },
    minLabel: { type: String, trim: true },
    maxLabel: { type: String, trim: true },
    maxRating: { type: Number },
    required: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Question = model<IQuestion>("Question", questionSchema);
export default Question;
