import { hash } from "bcryptjs";

export const hashPassword = async (password) => {
  try {
    const hashedPassword = await hash(password, 10);
    return hashedPassword;
  } catch (error) {
    throw new Error("Error hashing password");
  }
};
