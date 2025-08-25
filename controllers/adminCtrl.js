
const userModel = require('../models/userModels');
const doctorModel = require('../models/doctorModel');


const getAllUsersController = async (req, res) => {
    try {
        // Add pagination support
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const total = await userModel.countDocuments();

        // Get users with selected fields only
        const users = await userModel
            .find({})
            .select('-password -refreshToken')  // Exclude sensitive data
            .skip(skip)
            .limit(limit)
            .lean();  // Convert to plain JS objects for better performance

        if (!users?.length) {
            return res.status(404).send({
                success: false,
                message: "No users found",
                data: []
            });
        }

        res.status(200).send({
            success: true,
            message: "Users data retrieved successfully",
            data: users,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        });
    } catch (error) {
        console.error('Error in getAllUsersController: ', error);
        res.status(500).send({
            success: false,
            message: "Error while fetching users",
            error: error.message || "Internal server error"
        });
    }
}


const getAllDoctorsController = async (req, res) => {
    try {
        // Add pagination support
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Add filtering support
        const filter = {};
        if (req.query.specialization) {
            filter.specialization = req.query.specialization;
        }
        if (req.query.status) {
            filter.status = req.query.status;
        }

        // Get total count for pagination
        const total = await doctorModel.countDocuments(filter);

        // Get doctors with selected fields and populate necessary references
        const doctors = await doctorModel
            .find(filter)
            .select('-password -refreshToken')  // Exclude sensitive data
            .populate('userId', 'name email')   // Populate user details
            .skip(skip)
            .limit(limit)
            .lean();  // Convert to plain JS objects for better performance

        res.status(200).send({
            success: true,
            message: "Doctors data retrieved successfully",
            data: doctors,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        });
    } catch (error) {
        console.error('Error in getAllDoctorsController: ', error);
        res.status(500).send({
            success: false,
            message: "Error while getting doctors data",
            error: error.message || "Internal server error"
        });
    }
}


const changeDoctorStatusController = async (req, res) => {
    try {
        const { doctorId, status } = req.body;

        if (!doctorId || !status) {
            return res.status(400).send({
                success: false,
                message: "Doctor ID and status are required"
            });
        }

        // Get the doctor application
        const doctorApplication = await doctorModel.findById(doctorId);
        if (!doctorApplication) {
            return res.status(404).send({
                success: false,
                message: "Doctor application not found"
            });
        }

        // If trying to approve, check for existing approved doctor with same email or phone
        if (status === 'approved') {
            const existingDoctor = await doctorModel.findOne({
                $and: [
                    { _id: { $ne: doctorId } }, // Exclude current doctor
                    { status: 'approved' },
                    {
                        $or: [
                            { email: doctorApplication.email },
                            { phone: doctorApplication.phone }
                        ]
                    }
                ]
            });

            if (existingDoctor) {
                return res.status(400).send({
                    success: false,
                    message: "A doctor with this email or phone number already exists"
                });
            }
        }

        // Update doctor status
        const doctor = await doctorModel.findByIdAndUpdate(
            doctorId,
            { status },
            { new: true }
        );

        // Get the user and update their notification and isDoctor status
        const user = await userModel.findById(doctor.userId);
        if (user) {
            // Update isDoctor status if the doctor is approved
            if (status === 'approved') {
                user.isDoctor = true;
                await user.save();
            }

            user.notification.push({
                type: "doctor-account-status",
                message: `Your doctor account has been ${status}`,
                data: {
                    doctorId: doctor._id,
                    status: status
                }
            });
            await user.save();
        }

        res.status(200).send({
            success: true,
            message: `Doctor status updated to ${status}`,
            data: doctor
        });
    } catch (error) {
        console.error('Error in changeDoctorStatusController: ', error);
        res.status(500).send({
            success: false,
            message: "Error while updating doctor status",
            error: error.message || "Internal server error"
        });
    }
}


const deleteDoctorController = async (req, res) => {
    try {
        const { doctorId } = req.params;

        const doctor = await doctorModel.findByIdAndDelete(doctorId);

        if (!doctor) {
            return res.status(404).send({
                success: false,
                message: "Doctor not found"
            });
        }

        // Update user's isDoctor status and notify them
        const user = await userModel.findById(doctor.userId);
        if (user) {
            user.isDoctor = false;  // Set isDoctor to false
            user.notification.push({
                type: "doctor-account-deleted",
                message: "Your doctor account has been deleted by admin",
                data: {
                    doctorId: doctor._id
                }
            });
            await user.save();  // Save the changes
        }

        res.status(200).send({
            success: true,
            message: "Doctor deleted successfully",
            data: doctor
        });
    } catch (error) {
        console.error('Error in deleteDoctorController: ', error);
        res.status(500).send({
            success: false,
            message: "Error while deleting doctor",
            error: error.message || "Internal server error"
        });
    }
}


const blockUserController = async (req, res) => {
    try {
        const { userId } = req.body;
        const adminId = req.user.id; // Get admin ID from req.user instead of req.body

        if (!userId) {
            return res.status(400).send({
                success: false,
                message: "User ID is required"
            });
        }

        // Prevent admin from blocking themselves
        if (userId === adminId) {
            return res.status(400).send({
                success: false,
                message: "Admin cannot block themselves"
            });
        }

        // Find the target user first
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            });
        }

        // Prevent blocking other admins
        if (user.isAdmin) {
            return res.status(400).send({
                success: false,
                message: "Cannot block another admin user"
            });
        }

        // Toggle the blocked status
        user.isBlocked = !user.isBlocked;
        await user.save();

        // Send notification to the user
        user.notification.push({
            type: "user-status-change",
            message: `Your account has been ${user.isBlocked ? 'blocked' : 'unblocked'} by admin`,
            onClickPath: "/"
        });
        await user.save();

        res.status(200).send({
            success: true,
            message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
            data: user
        });
    } catch (error) {
        console.error('Error in blockUserController: ', error);
        res.status(500).send({
            success: false,
            message: "Error while updating user status",
            error: error.message || "Internal server error"
        });
    }
};

module.exports = {
    getAllUsersController,
    getAllDoctorsController,
    changeDoctorStatusController,
    deleteDoctorController,
    blockUserController
}

