import express from "express";

const PORT = 7000;

const app = express();

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("<!doctype html><html><body>Hello Express!</body></html>");
});

app.listen(PORT, () => console.log(`server is life at port: ${PORT}`));
