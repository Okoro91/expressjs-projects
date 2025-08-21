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
