import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import User from "./models/User.js";

const app = express();
const PORT = process.env.PORT || 3001;

connectDB();

app.use(cors());
app.use(express.json());

app.get("/users", async (req, res) => {
  try {
    const Users = await User.find();
    res.json(Users);
  } catch (err) {
    console.error(err);
  }
});

app.post("/users", async (req, res) => {
  const { name, email, phone, location, dateOfBirth } = req.body;

  if (!name || !email || !phone) {
    return res
      .status(400)
      .json({ error: "Name, Email, and Phone are required" });
  }

  try {
    const newUser = new User({
      name,
      email,
      phone,
      location,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already exists." });
    }
    if (err.name === "ValidationError") {
      let errors = {};
      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors[key].message;
      });
      return res.status(400).json({ errors });
    }
    res.status(500).send("Server Error");
  }
});

app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, location, dateOfBirth } = req.body;

  const updateFields = {};
  if (name !== undefined) updateFields.name = name;
  if (email !== undefined) updateFields.email = email;
  if (phone !== undefined) updateFields.phone = phone;
  if (location !== undefined) updateFields.location = location;
  if (dateOfBirth !== undefined)
    updateFields.dateOfBirth = new Date(dateOfBirth);

  if (!name && !email && !phone) {
    return res.status(400).json({
      error:
        "At least one field (name, email, or phone) is required for update.",
    });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`PUT /users/${id} - Updated user to:`, updatedUser);
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);

    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already exists." });
    }
    if (err.name === "CastError" && err.path === "_id") {
      return res.status(400).json({ msg: "Invalid user ID format" });
    }
    if (err.name === "ValidationError") {
      let errors = {};
      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors[key].message;
      });
      return res.status(400).json({ errors });
    }
    res.status(500).send("Server Error");
  }
});

app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`DELETE /users/${id} - User deleted`);
    res.status(204).send();
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "Invalid user ID" });
    }
    res.status(500).send("Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
