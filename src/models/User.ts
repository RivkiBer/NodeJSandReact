import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, trim: true, unique: true, lowercase: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  {
    timestamps: true,
  }
);

const User = model<IUser>("User", userSchema);
export default User;
