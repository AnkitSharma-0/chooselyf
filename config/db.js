const mongoose = require('mongoose');
const colors = require('colors');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`.bgGreen.white);
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`.bgRed.white);
        process.exit(1);
    }
};

module.exports = connectDB;