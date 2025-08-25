const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'doctors',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    reason: {
        type: String,
        required: true
    }
}, {
    timestamps: true // This will automatically manage createdAt and updatedAt
});

// Add index for faster queries
appointmentSchema.index({ doctor: 1, date: 1 });
appointmentSchema.index({ user: 1, date: 1 });
appointmentSchema.index({ status: 1 });

const appointmentModel = mongoose.model('appointments', appointmentSchema);

module.exports = appointmentModel; 