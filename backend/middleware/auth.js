const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send("Access Denied");

  try {
    const verified = jwt.verify(token, "your-secret-key");
    req.user = verified;
    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    res.status(400).send("Invalid Token");
  }
};

module.exports = {
  authMiddleware,
};
