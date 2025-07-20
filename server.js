const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

// Import Routes
const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applications');
const adminRoutes = require('./routes/admin');
const dashboardRoutes = require('./routes/dashboard');

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tamil-education', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Rate Limiting
const limiter = rateLimit({
    windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});

// Middleware
app.use(limiter);
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-domain.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:5500'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files (including the frontend)
app.use(express.static(path.join(__dirname)));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Admin Panel Routes (serve admin HTML files)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

app.get('/admin/applications', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'applications.html'));
});

// Setup admin endpoint for Vercel
app.get('/setup-admin', async (req, res) => {
    try {
        const User = require('./models/User');
        const bcrypt = require('bcryptjs');
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@tamilcommittee.org' });
        
        if (existingAdmin) {
            return res.json({
                success: true,
                message: 'Admin user already exists. You can login with your credentials.',
                adminEmail: process.env.ADMIN_EMAIL || 'admin@tamilcommittee.org'
            });
        }
        
        // Create admin user
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
        
        const adminUser = new User({
            email: process.env.ADMIN_EMAIL || 'admin@tamilcommittee.org',
            password: hashedPassword,
            role: 'admin',
            isActive: true
        });
        
        await adminUser.save();
        
        res.json({
            success: true,
            message: 'Admin user created successfully!',
            adminEmail: process.env.ADMIN_EMAIL || 'admin@tamilcommittee.org',
            note: 'Please change the default password after first login.'
        });
        
    } catch (error) {
        console.error('Setup admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating admin user',
            error: error.message
        });
    }
});

// Serve the main frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`
🚀 Tamil Education Server running on port ${PORT}
📱 Frontend: http://localhost:${PORT}
🔧 Admin Panel: http://localhost:${PORT}/admin
📊 Dashboard: http://localhost:${PORT}/admin/dashboard
🗄️  Database: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/tamil-education'}
    `);
});

module.exports = app;
