const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    data: {
        type: Object
    },
    onClickPath: {
        type: String
    }
});

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'email is required']
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId; // Password is required only if googleId is not present
        },
        select: false // Don't include password in query results by default
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isDoctor: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    googleId: {
        type: String,
        sparse: true // Allow null/undefined values
    },
    picture: {
        type: String
    },
    notification: [notificationSchema],
    seennotification: [notificationSchema]
}, { timestamps: true });

const userModel = mongoose.model('users', userSchema);

module.exports = userModel;