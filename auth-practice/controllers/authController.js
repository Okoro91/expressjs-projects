import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  signupSchema,
  signinSchema,
  acceptedCodeSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
} from "../middlewares/validator.js";
import {
  hashPassword,
  validatePassword,
  hmacProcess,
} from "../utils/hashing.js";
import e from "express";
import { sendEmail } from "../middlewares/sendMail.js";

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
    const { error, value } = signinSchema.validate({ email, password });

    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordValid = await validatePassword(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        varified: user.verified,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res
      .cookie("Authorization", "Bearer " + token, {
        expires: new Date(Date.now() + 8 * 3600000),
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      })
      .json({ message: "Signin successful", token, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const signout = async (req, res) => {
  try {
    res
      .clearCookie("Authorization", {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      })
      .json({ message: "Signout successful", success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const sendVerificationCode = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const verified = user.isVerified;
    if (verified) {
      return res
        .status(400)
        .json({ success: false, message: "user is already verified" });
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    let mailOptions = {
      to: user.email,
      subject: "Verification Code",
      text: `Your verification code is ${verificationCode}`,
    };

    let info = await sendEmail(mailOptions);

    if (info.accepted[0] === user.email) {
      const hashedCode = await hmacProcess(
        verificationCode,
        process.env.HMAC_KEY
      );
      user.verificationCode = hashedCode;
      user.verificationCodeValidation = Date.now();
      await user.save();
      res.status(200).json({
        success: true,
        message: "Verification code sent to email",
      });
    }
    res
      .status(500)
      .json({ message: "Failed to send verification code", success: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyVerificationCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const { error, value } = acceptedCodeSchema.validate({ email, code });

    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const codeValue = code.toString();

    const user = await User.findOne({ email }).select(
      "+verificationCode +verificationCodeValidation"
    );

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "User is already verified" });
    }

    if (!user.verificationCode || !user.verificationCodeValidation) {
      return res
        .status(400)
        .json({ success: false, message: "Verification code not found" });
    }

    if (Date.now() - user.verificationCodeValidation > 5 * 60 * 1000) {
      return res
        .status(400)
        .json({ success: false, message: "Verification code expired" });
    }

    const isCodeValid = await hmacProcess(code, process.env.HMAC_KEY);

    if (!isCodeValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification code" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeValidation = undefined;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "User verified successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const changePassword = async (req, res) => {
  const { userId, isVerified } = req.user;
  const { oldPassword, newPassword } = req.body;

  if (!isVerified) {
    return res
      .status(403)
      .json({ success: false, message: "User not verified" });
  }

  try {
    const { error, value } = resetPasswordSchema.validate({
      oldPassword,
      newPassword,
    });

    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const user = await User.findOne({ _id: userId }).select("+password");

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const isOldPasswordValid = await validatePassword(
      oldPassword,
      user.password
    );
    if (!isOldPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Old password is incorrect" });
    }

    const isSamePassword = await validatePassword(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from old password",
      });
    }

    const hashedNewPassword = await hashPassword(newPassword);
    user.password = hashedNewPassword;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const sendForgotPasswordCode = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const codeValue = Math.floor(100000 + Math.random() * 900000).toString();

    let mailOptions = {
      to: user.email,
      subject: "Forgot password code",
      text: `Your forgot password code is ${codeValue}`,
    };

    let info = await sendEmail(mailOptions);

    if (info.accepted[0] === user.email) {
      const hashedCode = await hmacProcess(codeValue, process.env.HMAC_KEY);
      user.resetPasswordCode = hashedCode;
      user.resetPasswordCodeValidation = Date.now();
      await user.save();
      res.status(200).json({
        success: true,
        message: "Forgot password code sent to email",
      });
    }
    res
      .status(500)
      .json({ message: "Failed to send forgot password code", success: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyForgotPasswordCode = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const { error, value } = forgotPasswordSchema.validate({
      email,
      code,
      newPassword,
    });

    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const codeValue = code.toString();

    const user = await User.findOne({ email }).select(
      "+resetPasswordCode +resetPasswordCodeValidation"
    );

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    if (!user.resetPasswordCode || !user.resetPasswordCodeValidation) {
      return res
        .status(400)
        .json({ success: false, message: "Reset password code not found" });
    }

    if (Date.now() - user.resetPasswordCodeValidation > 5 * 60 * 1000) {
      return res
        .status(400)
        .json({ success: false, message: "Reset password code expired" });
    }

    const isCodeValid = await hmacProcess(code, process.env.HMAC_KEY);

    if (!isCodeValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification code" });
    }
    const hashedNewPassword = await hashPassword(newPassword);
    user.password = hashedNewPassword;
    user.forgotPasswordCode = undefined;
    user.resetPasswordCodeValidation = undefined;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "User verified successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
