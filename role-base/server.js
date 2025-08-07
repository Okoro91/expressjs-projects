import express from "express";
import dotenv from "dotenv";
import { dbConnect } from "./config/dbconnect.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

dbConnect();

const app = express();
const PORT = process.env.PORT || 3500;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the role base API! Access.");
});

app.use("/api/auth", authRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
