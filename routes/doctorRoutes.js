const express = require("express");
const { getDoctorInfoController, updateProfileController, getDoctorAppointmentsController, updateAppointmentStatusController } = require("../controllers/doctorCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

//GET/POST DOCTOR INFO BY ID OR USERID
router.get("/getDoctorById/:doctorId", authMiddleware, getDoctorInfoController);
router.post("/getDoctorInfo", authMiddleware, getDoctorInfoController);

//POST UPDATE PROFILE
router.post("/updateProfile", authMiddleware, updateProfileController);

// Get doctor appointments
router.post('/get-doctor-appointments', authMiddleware, getDoctorAppointmentsController);

// Update appointment status
router.post('/update-appointment-status', authMiddleware, updateAppointmentStatusController);

module.exports = router;
