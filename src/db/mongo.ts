import mongoose from "mongoose";
import createTestBusiness from "../utils/createTestBusiness";

export async function connectMongo() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("Missing env var: MONGO_URI");
  }


  console.log("Mongo URI host:", uri.split("@")[1]?.split("/")[0]);


  await mongoose.connect(uri);
  console.log("✅ MongoDB connected");
  try {
    await createTestBusiness();
  } catch (error) {
    console.error("Error creating test business:", error);
  }
  
}


