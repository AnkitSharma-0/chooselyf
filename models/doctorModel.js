const mongoose = require('mongoose')

const doctorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: [true, 'User reference is required']
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required']
    },
    phone: {
        type: String,
        required: [true, 'phone number is required']
    },
    email: {
        type: String,
        required: [true, 'email is required']
    },
    website: {
        type: String,

    },
    address: {
        type: String,
        required: [true, 'Address is required']
    },
    specialization: {
        type: String,
        required: [true, 'specialization is required']
    },
    experience: {
        type: String,
        required: [true, 'experience is required']
    },
    feesPerConsultation: {
        type: Number,
        required: [true, 'Fee is required']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    timings: {
        type: Object,
        required: [true, 'work timing is required']
    }

}, { timestamps: true })
const doctorModel = mongoose.model('doctors', doctorSchema)
module.exports = doctorModel