const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const userModel = require("../models/userModels");
const moment = require("moment");

// Utility function for error handling
const handleError = (error, res) => {
    console.error("Error:", error);
    res.status(500).send({
        success: false,
        message: "Internal server error",
        error: error.message
    });
};

// Get doctor information by ID or userId
const getDoctorInfoController = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { userId } = req.body;

        if (!doctorId && !userId) {
            return res.status(400).send({
                success: false,
                message: "Doctor ID or User ID is required"
            });
        }

        const query = doctorId ? { _id: doctorId } : { userId };
        const doctor = await doctorModel.findOne(query)
            .populate('userId', 'name email')
            .lean();

        if (!doctor) {
            return res.status(404).send({
                success: false,
                message: "Doctor information not found"
            });
        }

        res.status(200).send({
            success: true,
            message: "Doctor information fetched successfully",
            data: doctor
        });
    } catch (error) {
        handleError(error, res);
    }
};

const updateProfileController = async (req, res) => {
    try {
        const {
            userId,
            firstName,
            lastName,
            phone,
            email,
            website,
            address,
            specialization,
            experience,
            feesPerConsultation,
            timings
        } = req.body;

        // Input validation
        if (!userId || !firstName || !lastName || !phone || !email || !address ||
            !specialization || !experience || !feesPerConsultation || !timings) {
            return res.status(400).send({
                success: false,
                message: "Please provide all required fields"
            });
        }

        const doctor = await doctorModel.findOneAndUpdate(
            { userId },
            {
                firstName,
                lastName,
                phone,
                email,
                website,
                address,
                specialization,
                experience,
                feesPerConsultation,
                timings,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!doctor) {
            return res.status(404).send({
                success: false,
                message: "Doctor not found"
            });
        }

        res.status(200).send({
            success: true,
            message: "Doctor profile updated successfully",
            data: doctor
        });
    } catch (error) {
        console.error("Error in updateProfileController: ", error);
        res.status(500).send({
            success: false,
            message: "Error in updating profile",
            error: error.message
        });
    }
};

const getDoctorAppointmentsController = async (req, res) => {
    try {
        const doctor = await doctorModel.findOne({ userId: req.body.userId });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        const appointments = await appointmentModel
            .find({ doctor: doctor._id })
            .sort({ date: 1, time: 1 })
            .populate('user', 'name email phone')
            .lean();

        const formattedAppointments = appointments.map(appointment => ({
            _id: appointment._id,
            date: moment(appointment.date).format('DD-MM-YYYY'),
            time: appointment.time,
            status: appointment.status,
            reason: appointment.reason,
            user: {
                _id: appointment.user._id,
                name: appointment.user.name,
                email: appointment.user.email,
                phone: appointment.user.phone
            }
        }));

        res.status(200).json({
            success: true,
            message: 'Appointments fetched successfully',
            data: formattedAppointments
        });
    } catch (error) {
        handleError(error, res);
    }
};

const updateAppointmentStatusController = async (req, res) => {
    try {
        const { appointmentId, status } = req.body;

        // Validate status
        if (!['confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be either "confirmed" or "cancelled"'
            });
        }

        // Find and update appointment with populated doctor field
        const appointment = await appointmentModel
            .findById(appointmentId)
            .populate('doctor', 'firstName lastName')
            .populate('user', 'name email notification');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Update status
        appointment.status = status;
        await appointment.save();

        // Add notification for user
        const user = appointment.user;
        if (user) {
            const doctorName = appointment.doctor ?
                `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}` :
                'the doctor';

            const notification = {
                type: 'appointment-status-update',
                message: `Your appointment with ${doctorName} for ${moment(appointment.date).format('DD-MM-YYYY')} at ${appointment.time} has been ${status}`,
                data: {
                    appointmentId: appointment._id,
                    status: status,
                    date: appointment.date,
                    time: appointment.time,
                    doctorName: doctorName
                },
                onClickPath: '/appointments'
            };

            // Initialize notification array if it doesn't exist
            if (!user.notification) {
                user.notification = [];
            }

            user.notification.push(notification);
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: `Appointment ${status} successfully`,
            data: { appointment }
        });

    } catch (error) {
        console.error('Update Appointment Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating appointment status',
            error: error.message
        });
    }
};

module.exports = {
    getDoctorInfoController,
    updateProfileController,
    getDoctorAppointmentsController,
    updateAppointmentStatusController
}; 