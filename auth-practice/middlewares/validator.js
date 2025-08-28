import Joi from "joi";

export const signupSchema = Joi.object({
  email: Joi.string()
    .min(5)
    .max(255)
    .required()
    .email({
      tids: { allow: ["com", "net", "org"] },
    }),
  password: Joi.string()
    .min(6)
    .max(1024)
    .required()
    .pattern(new RegExp(`^(?=.*[a-z])(?=.*[A-Z]).{8,}$`)),
});

export const signinSchema = Joi.object({
  email: Joi.string()
    .min(5)
    .max(255)
    .required()
    .email({
      tids: { allow: ["com", "net", "org"] },
    }),
  password: Joi.string()
    .min(6)
    .max(1024)
    .required()
    .pattern(new RegExp(`^(?=.*[a-z])(?=.*[A-Z]).{8,}$`)),
});

export const acceptedCodeSchema = Joi.object({
  email: Joi.string()
    .min(5)
    .max(255)
    .required()
    .email({
      tids: { allow: ["com", "net", "org"] },
    }),
  code: Joi.number().required(),
});

export const resetPasswordSchema = Joi.object({
  newPassword: Joi.string()
    .min(6)
    .max(1024)
    .required()
    .pattern(new RegExp(`^(?=.*[a-z])(?=.*[A-Z]).{8,}$`)),

  oldPassword: Joi.string()
    .min(6)
    .max(1024)
    .required()
    .pattern(new RegExp(`^(?=.*[a-z])(?=.*[A-Z]).{8,}$`)),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .min(5)
    .max(255)
    .required()
    .email({
      tids: { allow: ["com", "net", "org"] },
    }),
  code: Joi.number().required(),
  newPassword: Joi.string()
    .min(6)
    .max(1024)
    .required()
    .pattern(new RegExp(`^(?=.*[a-z])(?=.*[A-Z]).{8,}$`)),
});

exports.createPostSchema = Joi.object({
  title: Joi.string().min(3).max(60).required(),
  description: Joi.string().min(3).max(600).required(),
  userId: Joi.string().required(),
});
