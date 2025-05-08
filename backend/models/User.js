const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: { type: String, unique: true },
  password: {
    type: String,
    required: true,
    select: false, // Exclude password from queries by default
  },
  age: { type: Number },
  specialty: { type: String },
  role: { type: String, enum: ["doctor", "patient"], required: true },
  appointments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
