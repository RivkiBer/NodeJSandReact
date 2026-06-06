import mongoose from "mongoose";

export const connectDatabase = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI must be defined in .env");
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
};
