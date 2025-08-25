const express = require('express')
const router = express.Router()
const { getAllUsersController, getAllDoctorsController, changeDoctorStatusController, deleteDoctorController, blockUserController } = require('../controllers/adminCtrl')
const authMiddleware = require('../middlewares/authMiddleware')

// Get all users with pagination
router.get('/getAllUsers', authMiddleware, getAllUsersController)

// Get all doctors with pagination and filtering
router.get('/getAllDoctors', authMiddleware, getAllDoctorsController)

// Change doctor status (approve/reject)
router.post('/changeStatus', authMiddleware, changeDoctorStatusController)

// Delete doctor
router.delete('/deleteDoctor/:doctorId', authMiddleware, deleteDoctorController)

// Block/Unblock user
router.post('/blockUser', authMiddleware, blockUserController)

module.exports = router
