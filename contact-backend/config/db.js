import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGO_URI || "mongodb://localhost:27017/userlist_app";

    await mongoose.connect(mongoURI);

    console.log("MongoDB Connected...");
  } catch (err) {
    console.error(err.message);

    process.exit(1);
  }
};

export default connectDB;
