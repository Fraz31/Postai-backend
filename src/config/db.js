import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB() {
  try {
    if (!env.MONGODB_URI) {
      throw new Error("MONGODB_URI missing in environment variables");
    }

    await mongoose.connect(env.MONGODB_URI);

    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
}
