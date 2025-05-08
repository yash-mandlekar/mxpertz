const express = require("express");
const app = express();
require("dotenv").config();
require("./config/db");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const PORT = process.env.PORT || 4000;
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const testRoutes = require("./routes/testRoutes.js");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api", testRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
