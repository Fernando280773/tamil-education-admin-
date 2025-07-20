const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['admin', 'coordinator', 'reviewer'],
        default: 'reviewer'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    permissions: {
        canReviewApplications: {
            type: Boolean,
            default: true
        },
        canApproveApplications: {
            type: Boolean,
            default: false
        },
        canDeleteApplications: {
            type: Boolean,
            default: false
        },
        canManageUsers: {
            type: Boolean,
            default: false
        },
        canViewReports: {
            type: Boolean,
            default: true
        }
    },
    profile: {
        phone: String,
        organization: String,
        bio: String
    }
}, {
    timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user has permission
userSchema.methods.hasPermission = function(permission) {
    if (this.role === 'admin') return true;
    return this.permissions[permission] || false;
};

// Method to get role display name in Tamil
userSchema.methods.getRoleTamil = function() {
    const roleMap = {
        'admin': 'நிர்வாகி',
        'coordinator': 'ஒருங்கிணைப்பாளர்',
        'reviewer': 'மதிப்பாய்வாளர்'
    };
    return roleMap[this.role] || this.role;
};

module.exports = mongoose.model('User', userSchema);
