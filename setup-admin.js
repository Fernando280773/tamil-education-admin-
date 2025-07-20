const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createDefaultAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tamil_education');
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists:', existingAdmin.email);
            return;
        }

        // Create default admin user
        const defaultAdmin = new User({
            name: 'Admin',
            email: 'admin@tamilcommittee.org',
            password: 'admin123', // This will be hashed automatically
            role: 'admin',
            permissions: ['read', 'write', 'delete', 'approve', 'manage_users'],
            isActive: true
        });

        await defaultAdmin.save();
        console.log('Default admin user created successfully!');
        console.log('Email: admin@tamilcommittee.org');
        console.log('Password: admin123');
        console.log('\nIMPORTANT: Please change the password after first login!');

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the setup
createDefaultAdmin();
