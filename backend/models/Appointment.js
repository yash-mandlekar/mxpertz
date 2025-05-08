const mongoose = require("mongoose");

const appointmentSchema = mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: Date,
  description: String,
});

module.exports =  mongoose.model("Appointment", appointmentSchema);
