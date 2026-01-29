import mongoose from "mongoose";
import createTestBusiness from "../utils/createTestBusiness";
import dotenv from "dotenv";

dotenv.config();

export async function connectMongo() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("Missing env var: MONGO_URI");
  }

  await mongoose.connect(uri);
  console.log("✅ MongoDB connected");
  try {
    await createTestBusiness();
  } catch (error) {
    console.error("Error creating test business:", error);
  }
}


