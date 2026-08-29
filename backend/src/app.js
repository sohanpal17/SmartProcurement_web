const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const queueRoutes = require('./routes/queueRoutes');

const app = express();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan('dev'));

// Root Status Endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'SmartProcure Node.js Express Backend API Server Running',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            bookings: '/api/bookings',
            queue: '/api/queue',
            health: '/health',
        },
    });
});

// Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/queue', queueRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        service: 'SmartProcure Node.js Express Backend',
        timestamp: new Date().toISOString(),
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 SmartProcure Backend Server running on port ${PORT}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    console.log(`=================================================`);
});

module.exports = app;
