const express = require('express')
const { loginController, registerController, authController, applyDoctorController, getAllNotificationController, deleteAllNotificationsController, getAllDoctorsController, bookAppointmentController, checkAvailabilityController, getUserDataController, userAppointmentsController, googleRegisterController } = require('../controllers/userCtrl')
const authMiddleware = require('../middlewares/authMiddleware')

const router = express.Router()

// routes
//login
router.post('/login', loginController)

// register
router.post('/register', registerController)

// Google auth routes
router.post('/google-register', googleRegisterController)
router.post('/google-login', googleRegisterController) // We can reuse the same controller since it handles both cases

// Auth || POSt
router.post('/getUserData', authMiddleware, getUserDataController)

// Apply Doctor ||Post
router.post('/apply-doctor', authMiddleware, applyDoctorController)

//Notifiaction  Doctor || POST
router.post(
    "/get-all-notification",
    authMiddleware,
    getAllNotificationController
);
router.post("/delete-all-notifications", authMiddleware, deleteAllNotificationsController);

// Get All Doctors
router.get('/getAllDoctors', authMiddleware, getAllDoctorsController);

// Appointment routes
router.post('/book-appointment', authMiddleware, bookAppointmentController);
router.post('/check-availability', authMiddleware, checkAvailabilityController);


// Get user appointments
router.get('/get-user-appointments', authMiddleware, userAppointmentsController);

module.exports = router