import createHmac from "crypto";
import { hash, compare } from "bcryptjs";

export const hashPassword = async (password) => {
  try {
    const hashedPassword = await hash(password, 10);
    return hashedPassword;
  } catch (error) {
    throw new Error("Error hashing password");
  }
};

export const validatePassword = async (password, hashedPassword) => {
  const isValid = await compare(password, hashedPassword);
  return isValid;
};

export const hmacProcess = async (data, key) => {
  const hmac = createHmac("sha256", key);
  hmac.update(data);
  return hmac.digest("hex");
};
