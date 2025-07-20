const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true,
        min: 18,
        max: 100
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    postcode: {
        type: String,
        required: true,
        trim: true
    },
    qualification: {
        type: String,
        required: true,
        enum: ['undergraduate', 'postgraduate', 'doctoral', 'teacher', 'retired_teacher', 'other']
    },
    profession: {
        type: String,
        required: true,
        trim: true
    },
    experience: {
        type: String,
        trim: true
    },
    contribution: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'under_review'],
        default: 'pending'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    reviewedAt: {
        type: Date
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        type: String,
        trim: true
    },
    emailSent: {
        type: Boolean,
        default: false
    },
    confirmationEmailSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for better query performance
applicationSchema.index({ email: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ submittedAt: -1 });
applicationSchema.index({ firstName: 1, lastName: 1 });

// Virtual for full name
applicationSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Method to get qualification display name in Tamil
applicationSchema.methods.getQualificationTamil = function() {
    const qualificationMap = {
        'undergraduate': 'பட்டப்படிப்பு',
        'postgraduate': 'முதுகலை',
        'doctoral': 'மருத்துவர் பட்டம்',
        'teacher': 'ஆசிரியர்',
        'retired_teacher': 'ஓய்வுபெற்ற ஆசிரியர்',
        'other': 'பிற'
    };
    return qualificationMap[this.qualification] || this.qualification;
};

// Method to get status display name in Tamil
applicationSchema.methods.getStatusTamil = function() {
    const statusMap = {
        'pending': 'நிலுவையில்',
        'approved': 'அங்கீகரிக்கப்பட்டது',
        'rejected': 'நிராகரிக்கப்பட்டது',
        'under_review': 'மதிப்பாய்வில்'
    };
    return statusMap[this.status] || this.status;
};

module.exports = mongoose.model('Application', applicationSchema);
