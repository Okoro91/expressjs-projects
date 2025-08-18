import express from "express";
import mongoose from "mongoose";
import router from "./routes/userRoute.js";

const app = express();

const PORT = 5500;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("welcome to our backend");
});

app.use("/api/users", router);

const MONGO_URL =
  "mongodb+srv://mistore:miokoro@store.ueaufps.mongodb.net/?retryWrites=true&w=majority&appName=store";

mongoose.connect(MONGO_URL).then(() => {
  console.log("mongodb connected successfully");
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
});
