import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../src/models/User.js";

dotenv.config();

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("MONGO_URI not set in environment");
  process.exit(1);
}

const email = process.argv[2];
const role = process.argv[3];

if (!email || !role) {
  console.error("Usage: tsx scripts/setRole.ts <email> <role>");
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(uri);
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    console.error("User not found:", email);
    process.exit(2);
  }
  user.role = role;
  await user.save();
  console.log(`Updated ${email} -> role=${role}`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
