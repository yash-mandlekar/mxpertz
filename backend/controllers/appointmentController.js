const Appointment = require("../models/Appointment");
const UserModel = require("../models/User");

exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, description } = req.body;
    console.log(req.user.id);

    const founduser = await UserModel.findOne({ _id: req.user.id });
    const doctor = await UserModel.findOne({ _id: doctorId });

    const appointment = new Appointment({
      doctorId,
      patientId: req.user.id,
      date,
      description,
    });
    await appointment.save();
    console.log(founduser);

    doctor.appointments.push(appointment._id);
    await doctor.save();
    founduser.appointments.push(appointment._id);
    await founduser.save();

    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const founduser = await UserModel.findOne({ _id: req.user.id });
    if (!founduser) {
      return res.status(404).json({ message: "User not found" });
    }
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    if (appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const doctor = await UserModel.findOne({ _id: appointment.doctorId });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    // Remove appointment from doctor's appointments
    doctor.appointments = doctor.appointments.filter(
      (app) => app.toString() !== appointment._id.toString()
    );
    await doctor.save();
    // Remove appointment from user's appointments
    founduser.appointments = founduser.appointments.filter(
      (app) => app.toString() !== appointment._id.toString()
    );
    await founduser.save();
    // Delete appointment
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: "Appointment canceled" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAppointments = async (req, res) => {
  const founduser = await UserModel.findOne({ _id: req.user.id }).populate([
    {
      path: "appointments",
      populate: "doctorId patientId",
    },
  ]);
  if (!founduser) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(founduser.appointments);
};
