import express from "express";
import cors from "cors";

const app = express();
const PORT = 3001;
import { users } from "./data.js";

app.use(cors());
app.use(express.json());
let nextId =
  users.length > 0 ? Math.max(...users.map((u) => parseInt(u.id))) + 1 : 1;

app.get("/users", (req, res) => {
  res.send(users);
});

app.post("/users", (req, res) => {
  const { name } = req.body;
  const newUser = {
    id: String(nextId++),
    name: name,
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
