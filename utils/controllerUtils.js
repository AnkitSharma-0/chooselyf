const jwt = require('jsonwebtoken');

// Common error handler
const handleError = (error, res) => {
    console.error("Error:", error);
    res.status(500).send({
        success: false,
        message: "Internal server error",
        error: error.message
    });
};

// Verify JWT token
const verifyToken = (req) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        throw new Error('Authorization token required');
    }
    return jwt.verify(token, process.env.JWT_SECRET);
};

// Format date using moment
const formatDate = (date) => {
    return moment(date).format('DD-MM-YYYY');
};

// Common response format
const sendResponse = (res, status, success, message, data = null) => {
    const response = {
        success,
        message
    };
    if (data !== null) {
        response.data = data;
    }
    return res.status(status).send(response);
};

module.exports = {
    handleError,
    verifyToken,
    formatDate,
    sendResponse
}; 