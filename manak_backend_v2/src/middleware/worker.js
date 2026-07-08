module.exports = (req, res, next) => {
  if (
    req.user?.role !== "worker" &&
    req.user?.role !== "admin"
  ) {
    return res.status(403).json({
      message: "Worker access required",
    });
  }

  next();
};