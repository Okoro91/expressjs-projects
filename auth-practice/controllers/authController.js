import User from "../models/User.js";
import { signupSchema } from "../middlewares/validator.js";
import { hashPassword } from "../utils/hashing.js";

export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const { error, value } = signupSchema.validate({ email, password });

    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });
    const result = await newUser.save();
    result.password = undefined;
    res
      .status(201)
      .json({ message: "User registered successfully", user: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }
    user.password = undefined; // Remove password from response
    res.status(200).json({ success: true, message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
