const express = require('express')
const colors = require('colors')
const morgan = require('morgan')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const path = require('path')

// env config

dotenv.config();

// mongoDB  connection

connectDB();

// rest obj

const app = express();

// middleware

app.use(express.json())
app.use(morgan('dev'))
const cors = require("cors");
app.use(cors());


//routes
app.use('/api/v1/user', require('./routes/userRoutes'))
app.use('/api/v1/admin', require('./routes/adminRoutes'))
app.use('/api/v1/doctor', require('./routes/doctorRoutes'))

// static files
app.use(express.static(path.join(__dirname, './client/build')));

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, './client/build/index.html'));
});

// port
const port = process.env.PORT || 8080

// Start server
const startServer = async () => {
    try {
        app.listen(port, () => {
            console.log(`Server is running in ${process.env.NODE_MODE} Mode on port ${port}`.bgCyan.white);
        });
    } catch (error) {
        if (error.code === 'EADDRINUSE') {
            console.log(`Port ${port} is busy, trying port ${port + 1}...`.yellow);
            try {
                app.listen(port + 1, () => {
                    console.log(`Server is running in ${process.env.NODE_MODE} Mode on port ${port + 1}`.bgCyan.white);
                });
            } catch (err) {
                console.error('Error starting server:', err);
                process.exit(1);
            }
        } else {
            console.error('Error starting server:', error);
            process.exit(1);
        }
    }
};

startServer();
