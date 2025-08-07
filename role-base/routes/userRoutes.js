import express from "express";
import varifyToken from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/admin", varifyToken, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome to the admin routes!" });
});

router.get(
  "/manager",
  varifyToken,
  authorizeRoles("admin", "manager"),
  (req, res) => {
    res.json({ message: "Welcome to the manager routes!" });
  }
);
router.get("/user", (req, res) => {
  res.json({ message: "Welcome to the user routes!" });
});

export default router;
