module.exports = (req, res, next) => {
  // 🚨 DO NOT TOUCH req.body

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next(); // ✅ MUST call next
};
