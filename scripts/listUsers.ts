import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../src/models/User.js";

dotenv.config();

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("MONGO_URI not set in environment");
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(uri);
  const users = await User.find().select("_id username email role").lean();
  console.log(JSON.stringify(users, null, 2));
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
