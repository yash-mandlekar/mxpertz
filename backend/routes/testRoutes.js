const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const router = express.Router();

router.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "Protected route accessed", user: req.user });
});

module.exports = router;