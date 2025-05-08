const express = require("express");
const router = express.Router();
const {getDoctors, getPatients} = require("../controllers/userController");

router.get('/doctors', getDoctors);
router.get('/patients', getPatients);

module.exports = router;