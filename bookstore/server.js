import express from "express";
import mongoose from "mongoose";
import router from "./routes/userRoute.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

const PORT = 5500;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("welcome to our backend");
});

app.use("/api/users", router);

mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log("mongodb connected successfully");
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
});
