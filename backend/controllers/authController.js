const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { username, password, role, specialty, age } = req.body;
    console.log(req.body);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      role,
      specialty: role === "doctor" ? specialty : undefined,
      age: role === "patient" ? age : undefined,
    });
    await user.save();
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        specialty: user.specialty,
        age: user.age,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).select("+password");
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, "your-secret-key", {
      expiresIn: "1h",
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        specialty: user.specialty,
        age: user.age,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.mydata = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        specialty: user.specialty,
        age: user.age,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
