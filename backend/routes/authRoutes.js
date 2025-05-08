var express = require("express");
var router = express.Router();
const { register, login, mydata } = require("../controllers/authController");
const { authMiddleware } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, mydata);

module.exports = router;
