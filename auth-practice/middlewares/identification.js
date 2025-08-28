import jwd from "jsonwebtoken";

export const identifier = (req, res, next) => {
  let token;

  if (req.header.client == "not-browser") {
    token = req.header.authorization;
  } else {
    token = req.cookies["Authorization"];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const userToken = token.split(" ")[1];

    const decoded = jwt.verify(userToken, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
