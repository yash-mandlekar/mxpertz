const User = require("../models/User");

exports.getDoctors = async (req, res) => {
  const doctors = await User.find({ role: 'doctor' });
  res.json(doctors);
};

exports.getPatients = async (req, res) => {
  const patients = await User.find({ role: 'patient' });
  res.json(patients);
};