const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Access denied, no role found" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied, you are not allow to acess this page",
      });
    }
    next();
  };
};

export default authorizeRoles;
