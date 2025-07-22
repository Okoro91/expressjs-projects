import express from "express";

const PORT = 8000;

const items = {
  name: "book",
  size: "large",
  cost: "20 million",
  quantity: "5 buddle",
  totalCost: "100 million",
};

const app = express();

app.get("/", (req, res) => {
  res.json(items);
});

app.listen(PORT, () => console.log(`server connected on port ${PORT}`));
