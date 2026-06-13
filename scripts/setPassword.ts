import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User.js";

dotenv.config();

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("MONGO_URI not set in environment");
  process.exit(1);
}

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error("Usage: npx tsx scripts/setPassword.ts <email> <newPassword>");
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(uri);
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    console.error("User not found:", email);
    await mongoose.disconnect();
    process.exit(2);
  }
  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  await user.save();
  console.log(`Updated password for ${email}`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
