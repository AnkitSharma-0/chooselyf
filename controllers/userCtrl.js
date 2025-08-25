const userModel = require('../models/userModels')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const doctorModel = require('../models/doctorModel')
const appointmentModel = require('../models/appointmentModel')
const moment = require('moment')
const { handleError, verifyToken, formatDate, sendResponse } = require('../utils/controllerUtils')

// Google register callback function
const googleRegisterController = async (req, res) => {
    try {
        const { email, name, picture, googleId } = req.body;

        // Check if user already exists
        let user = await userModel.findOne({ email });

        if (user) {
            // If user exists, generate token and return user data
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

            const userData = {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                isDoctor: user.isDoctor,
                isBlocked: user.isBlocked,
                notification: user.notification || [],
                seennotification: user.seennotification || [],
                picture: user.picture
            };

            return res.status(200).send({
                success: true,
                message: 'Login successful',
                token,
                user: userData
            });
        }

        // If user doesn't exist, create new user
        const newUser = new userModel({
            name,
            email,
            picture,
            googleId,
            isVerified: true // Google accounts are pre-verified
        });

        await newUser.save();

        // Generate token
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        const userData = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            isAdmin: newUser.isAdmin,
            isDoctor: newUser.isDoctor,
            isBlocked: newUser.isBlocked,
            notification: newUser.notification || [],
            seennotification: newUser.seennotification || [],
            picture: newUser.picture
        };

        return res.status(201).send({
            success: true,
            message: 'Registration successful',
            token,
            user: userData
        });
    } catch (error) {
        console.error('Google registration error:', error);
        res.status(500).send({
            success: false,
            message: 'Error in Google registration',
            error: error.message
        });
    }
};

// register callback function
const registerController = async (req, res) => {
    try {
        const existingUser = await userModel.findOne({ email: req.body.email })
        if (existingUser) {
            return sendResponse(res, 200, false, 'User already exists')
        }
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)
        req.body.password = hashedPassword
        const newUser = new userModel(req.body);
        await newUser.save()
        return sendResponse(res, 201, true, 'Registration successful')
    } catch (error) {
        handleError(error, res)
    }
}

// login
const loginController = async (req, res) => {
    try {
        // finding user with password field explicitly selected
        const user = await userModel.findOne({ email: req.body.email }).select('+password')
        if (!user) {
            return res.status(200).send({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is blocked
        if (user.isBlocked) {
            return res.status(403).send({
                success: false,
                message: 'Your account has been blocked. Please contact the administrator.'
            });
        }

        // For Google users who don't have a password
        if (user.googleId && !user.password) {
            return res.status(200).send({
                success: false,
                message: 'Please login with Google'
            });
        }

        // password match
        const isMatched = await bcrypt.compare(req.body.password, user.password)
        if (!isMatched) {
            return res.status(200).send({
                success: false,
                message: 'Incorrect password'
            });
        }

        //  token generation
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' })

        // Create user object without sensitive data but including notifications
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            isDoctor: user.isDoctor,
            isBlocked: user.isBlocked,
            notification: user.notification || [],
            seennotification: user.seennotification || [],
            picture: user.picture,
            googleId: user.googleId
        }

        return res.status(200).send({
            success: true,
            message: 'Login successful',
            token,
            user: userData
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).send({
            success: false,
            message: 'Error in login',
            error: error.message
        });
    }
}

// Authorization
const authController = async (req, res) => {
    try {
        if (!req.body.userId) {
            return sendResponse(res, 400, false, 'User ID is required')
        }

        const user = await userModel.findById(req.body.userId)
        if (!user) {
            return sendResponse(res, 404, false, 'User not found')
        }
        user.password = undefined

        return sendResponse(res, 200, true, 'User data retrieved successfully', user)
    } catch (error) {
        handleError(error, res)
    }
}

// Apply doctor controllers
const applyDoctorController = async (req, res) => {
    try {
        // Ensure required fields exist
        const { firstName, lastName, specialization } = req.body;
        if (!firstName || !lastName || !specialization) {
            return sendResponse(res, 400, false, 'Missing required fields: firstName, lastName, specialization');
        }

        // Create and save the new doctor
        const newDoctor = new doctorModel({ ...req.body, status: "pending" });
        await newDoctor.save();

        // Find admin user
        const adminUser = await userModel.findOne({ isAdmin: true });
        if (!adminUser) {
            return sendResponse(res, 404, false, 'Admin user not found');
        }

        if (!adminUser.notification) {
            adminUser.notification = [];
        }

        // Update admin notifications
        adminUser.notification.push({
            type: "apply-doctor-request",
            message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for a Doctor account.`,
            data: {
                doctorId: newDoctor._id,
                name: `${newDoctor.firstName} ${newDoctor.lastName}`,
                onClickPath: "/admin/doctors",
            },
        });

        await adminUser.save();

        return sendResponse(res, 201, true, 'Doctor application submitted successfully');
    } catch (error) {
        handleError(error, res);
    }
};

const getAllNotificationController = async (req, res) => {
    try {
        const user = await userModel.findOne({ _id: req.body.userId });

        if (!user) {
            return res.status(404).send({ success: false, message: "User not found" });
        }

        // Initialize arrays if they don't exist
        user.notification = user.notification || [];
        user.seennotification = user.seennotification || [];

        // Move unread notifications to seen notifications
        if (user.notification.length > 0) {
            user.seennotification = [...user.seennotification, ...user.notification];
            user.notification = [];
            await user.save();
        }

        res.status(200).send({
            success: true,
            message: "All notifications marked as read",
            data: user,
        });
    } catch (error) {
        console.error("Error in notification controller:", error);
        res.status(500).send({
            message: "Error in notification",
            success: false,
            error,
        });
    }
};

const deleteAllNotificationsController = async (req, res) => {
    try {
        const user = await userModel.findOne({ _id: req.body.userId });

        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        user.seennotification = []; // ✅ Clear read notifications
        await user.save();

        res.status(200).send({
            success: true,
            message: "All read notifications deleted successfully.",
        });
    } catch (error) {
        console.error("Error deleting notifications:", error);
        res.status(500).send({
            success: false,
            message: "Error deleting notifications.",
            error: error.message,
        });
    }
};

const getAllDoctorsController = async (req, res) => {
    try {
        // Add pagination support
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Add filtering support
        const filter = { status: 'approved' }; // Only show approved doctors
        if (req.query.specialization) {
            filter.specialization = req.query.specialization;
        }

        // Get total count for pagination
        const total = await doctorModel.countDocuments(filter);

        // Get doctors with selected fields
        const doctors = await doctorModel
            .find(filter)
            .select('-password -refreshToken -notification -seennotification')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }) // Most recent first
            .populate('userId', 'name email')
            .lean(); // Convert to plain JS objects for better performance

        if (!doctors.length) {
            return res.status(200).send({
                success: true,
                message: "No doctors found",
                data: [],
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit),
                    limit
                }
            });
        }

        res.status(200).send({
            success: true,
            message: "Doctors list fetched successfully",
            data: doctors,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        });
    } catch (error) {
        console.error("Error in getAllDoctorsController: ", error);
        res.status(500).send({
            success: false,
            message: "Error while fetching doctors",
            error: error.message
        });
    }
};

//book appointment
const bookAppointmentController = async (req, res) => {
    try {
        const { doctorId, date, time, reason } = req.body;

        // Validate required fields
        if (!doctorId || !date || !time || !reason) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Get user ID from auth token
        if (!req.headers.authorization) {
            return res.status(401).json({
                success: false,
                message: 'Authorization token required'
            });
        }

        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Validate if doctor exists
        const doctor = await doctorModel.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Format date and time
        const appointmentDate = moment(date).startOf('day').toDate();
        let appointmentTime = time;

        // Convert time to 24-hour format if it's in 12-hour format
        if (time.includes('AM') || time.includes('PM')) {
            appointmentTime = moment(time, 'hh:mm A').format('HH:mm');
        }

        // Check if the doctor is available at the requested time
        const existingAppointment = await appointmentModel.findOne({
            doctor: doctorId,
            date: appointmentDate,
            time: appointmentTime,
            status: { $ne: 'cancelled' }
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: 'Appointment slot is already booked'
            });
        }

        // Check if time is within doctor's working hours
        const { start: startTime, end: endTime } = doctor.timings;
        const appointmentMoment = moment(appointmentTime, 'HH:mm');
        const doctorStartTime = moment(startTime, 'HH:mm');
        const doctorEndTime = moment(endTime, 'HH:mm');

        if (appointmentMoment.isBefore(doctorStartTime) || appointmentMoment.isAfter(doctorEndTime)) {
            return res.status(400).json({
                success: false,
                message: 'Selected time is outside doctor\'s working hours'
            });
        }

        // Get user information for notification
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Create new appointment
        const newAppointment = new appointmentModel({
            doctor: doctorId,
            user: userId,
            date: appointmentDate,
            time: appointmentTime,
            reason,
            status: 'pending'
        });

        await newAppointment.save();

        // Add notification for doctor
        const doctorUser = await userModel.findOne({ _id: doctor.userId });
        if (doctorUser) {
            const notification = {
                type: 'New Appointment Request',
                message: `New appointment request from ${user.name} for ${moment(date).format('DD-MM-YYYY')} at ${moment(appointmentTime, 'HH:mm').format('hh:mm A')}`,
                data: {
                    appointmentId: newAppointment._id,
                    name: user.name,
                    onClickPath: '/doctor/appointments'
                }
            };

            // Initialize notification array if it doesn't exist
            if (!doctorUser.notification) {
                doctorUser.notification = [];
            }

            doctorUser.notification.push(notification);
            await doctorUser.save();

            // Send success response
            res.status(200).json({
                success: true,
                message: 'Appointment booked successfully',
                data: newAppointment
            });
        } else {
            // If doctor user not found, still save appointment but return warning
            res.status(200).json({
                success: true,
                message: 'Appointment booked successfully, but doctor notification could not be sent',
                data: newAppointment
            });
        }

    } catch (error) {
        console.error('Booking Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error booking appointment',
            error: error.message
        });
    }
};

// Check availability
const checkAvailabilityController = async (req, res) => {
    try {
        const { date, time, doctorId } = req.body;

        // Convert time to 24-hour format if it's in 12-hour format
        let timeToCheck = time;
        if (time.includes('AM') || time.includes('PM')) {
            timeToCheck = moment(time, 'hh:mm A').format('HH:mm');
        }

        // Find existing appointment for the given date and time
        const existingAppointment = await appointmentModel.findOne({
            doctor: doctorId,
            date: moment(date).startOf('day').toDate(),
            time: timeToCheck,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingAppointment) {
            return res.status(200).send({
                success: true,
                message: "Time slot is not available",
                data: {
                    isAvailable: false,
                    appointmentStatus: existingAppointment.status
                }
            });
        }

        res.status(200).send({
            success: true,
            message: "Time slot is available",
            data: {
                isAvailable: true,
                appointmentStatus: null
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in check availability",
            error
        });
    }
};

// Get User Data
const getUserDataController = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authorization token required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findOne({ _id: decoded.id })
            .select('-password -refreshToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get User Data Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting user data',
            error: error.message
        });
    }
};

const userAppointmentsController = async (req, res) => {
    try {
        // Get user ID from auth token
        if (!req.headers.authorization) {
            return res.status(401).json({
                success: false,
                message: 'Authorization token required'
            });
        }

        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Get all appointments for the user
        const appointments = await appointmentModel
            .find({ user: userId })
            .sort({ date: 1, time: 1 }) // Sort by date and time
            .populate('doctor', 'firstName lastName specialization experience feesPerConsultation timings')
            .lean();

        // Format the appointments data
        const formattedAppointments = appointments.map(appointment => ({
            _id: appointment._id,
            date: moment(appointment.date).format('DD-MM-YYYY'),
            time: appointment.time,
            status: appointment.status,
            reason: appointment.reason,
            doctor: {
                _id: appointment.doctor._id,
                name: `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
                specialization: appointment.doctor.specialization,
                experience: appointment.doctor.experience,
                feesPerConsultation: appointment.doctor.feesPerConsultation,
                timings: appointment.doctor.timings
            }
        }));

        res.status(200).json({
            success: true,
            message: 'Appointments fetched successfully',
            data: formattedAppointments
        });

    } catch (error) {
        console.error('User Appointments Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user appointments',
            error: error.message
        });
    }
};

module.exports = {
    loginController,
    registerController,
    authController,
    applyDoctorController,
    getAllNotificationController,
    deleteAllNotificationsController,
    getAllDoctorsController,
    bookAppointmentController,
    checkAvailabilityController,
    getUserDataController,
    userAppointmentsController,
    googleRegisterController
}