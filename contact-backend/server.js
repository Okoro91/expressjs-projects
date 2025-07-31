import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
const PORT = 3001;
const dbPath = path.resolve("./db.json");

app.use(cors());
app.use(express.json());

const readDb = () => {
  try {
    const dbData = fs.readFileSync(dbPath, "utf8");
    return JSON.parse(dbData);
  } catch (error) {
    console.error("Error reading db.json:", error);
    return { users: [] };
  }
};

const writeDb = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");
};

app.get("/users", (req, res) => {
  const db = readDb();
  res.json(db.users);
});

app.post("/users", (req, res) => {
  const db = readDb();
  const { users } = db;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  const nextId =
    users.length > 0 ? Math.max(...users.map((u) => parseInt(u.id))) + 1 : 1;

  const newUser = {
    id: String(nextId),
    name: name,
  };

  db.users.push(newUser);

  writeDb(db);

  res.status(201).json(newUser);
});

app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required for update" });
  }
  const db = readDb();
  let { users } = db;

  const userIndex = users.findIndex((user) => user.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  users[userIndex].name = name;
  writeDb(db);

  console.log(`PUT /users/${id} - Updated user to:`, db.users[userIndex]);
  res.json(users[userIndex]);
});

app.delete("/users/:id", (req, res) => {
  const { id } = req.params;

  const db = readDb();
  let { users } = db;
  const initialLength = users.length;

  db.users = users.filter((user) => user.id !== id);

  if (db.users.length === initialLength) {
    return res.status(404).json({ error: "User not found" });
  }

  writeDb(db);

  console.log(`DELETE /users/${id} - User deleted`);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
