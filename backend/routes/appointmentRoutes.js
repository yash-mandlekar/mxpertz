var express = require("express");
var router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const {
  bookAppointment,
  cancelAppointment,
  getAppointments,
} = require("../controllers/appointmentController");

router.post("/", authMiddleware, bookAppointment);
router.delete("/:id", authMiddleware, cancelAppointment);
router.get("/", authMiddleware, getAppointments);

module.exports = router;
