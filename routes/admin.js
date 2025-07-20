const express = require('express');
const Application = require('../models/Application');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(authMiddleware);

// @route   GET /api/admin/applications
// @desc    Get all applications with filters
// @access  Private
router.get('/applications', async (req, res) => {
    try {
        const { 
            status, 
            page = 1, 
            limit = 10, 
            search,
            sortBy = 'submittedAt',
            sortOrder = 'desc'
        } = req.query;

        const query = {};
        
        // Status filter
        if (status && status !== 'all') {
            query.status = status;
        }

        // Search filter
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { profession: { $regex: search, $options: 'i' } }
            ];
        }

        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const applications = await Application.find(query)
            .populate('reviewedBy', 'name email')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Application.countDocuments(query);

        res.json({
            success: true,
            applications,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching applications'
        });
    }
});

// @route   GET /api/admin/applications/:id
// @desc    Get single application
// @access  Private
router.get('/applications/:id', async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('reviewedBy', 'name email role');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        res.json({
            success: true,
            application
        });

    } catch (error) {
        console.error('Get application error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching application'
        });
    }
});

// @route   PUT /api/admin/applications/:id/status
// @desc    Update application status
// @access  Private
router.put('/applications/:id/status', async (req, res) => {
    try {
        const { status, notes } = req.body;
        const userId = req.user.id;

        // Check permissions
        if (status === 'approved' && !req.user.hasPermission('canApproveApplications')) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to approve applications'
            });
        }

        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Update application
        application.status = status;
        application.notes = notes || application.notes;
        application.reviewedBy = userId;
        application.reviewedAt = new Date();

        await application.save();

        // Send status update email to applicant
        try {
            const statusMessages = {
                'approved': {
                    subject: 'விண்ணப்பம் அங்கீகரிக்கப்பட்டது - Application Approved',
                    message: `வணக்கம் ${application.firstName},

உங்கள் தமிழ் சமூக கல்விக் குழு உறுப்பினர் விண்ணப்பம் அங்கீகரிக்கப்பட்டது!

நீங்கள் இப்போது எங்கள் குழுவின் அதிகாரபூர்வ உறுப்பினர் ஆகிவிட்டீர்கள். விரைவில் நாங்கள் உங்களை வாட்ஸ்அப் குழுவில் சேர்த்து, அடுத்த கூட்டம் மற்றும் நடவடிக்கைகள் பற்றிய தகவல்களை அனுப்புவோம்.

நன்றி,
தமிழ் சமூக கல்விக் குழு`
                },
                'rejected': {
                    subject: 'விண்ணப்பம் நிராகரிக்கப்பட்டது - Application Update',
                    message: `வணக்கம் ${application.firstName},

உங்கள் தமிழ் சமூக கல்விக் குழு உறுப்பினர் விண்ணப்பம் பற்றி உங்களுக்கு தெரிவிக்கிறோம்.

தற்போது உங்கள் விண்ணப்பத்தை ஏற்க முடியவில்லை. எதிர்காலத்தில் மீண்டும் விண்ணப்பிக்க வரவேற்கிறோம்.

நன்றி,
தமிழ் சமூக கல்விக் குழு`
                },
                'under_review': {
                    subject: 'விண்ணப்பம் மதிப்பாய்வில் - Application Under Review',
                    message: `வணக்கம் ${application.firstName},

உங்கள் தமிழ் சமூக கல்விக் குழு உறுப்பினர் விண்ணப்பம் தற்போது மதிப்பாய்வில் உள்ளது.

விரைவில் உங்களுக்கு முடிவு தெரிவிக்கப்படும்.

நன்றி,
தமிழ் சமூக கல்விக் குழு`
                }
            };

            if (statusMessages[status]) {
                await sendEmail({
                    to: [application.email],
                    subject: statusMessages[status].subject,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #764ba2;">தமிழ் சமூக கல்விக் குழு</h2>
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                                <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${statusMessages[status].message}</pre>
                                ${notes ? `<hr><p><strong>குறிப்பு:</strong> ${notes}</p>` : ''}
                            </div>
                        </div>
                    `
                });
            }
        } catch (emailError) {
            console.error('Failed to send status update email:', emailError);
        }

        // Populate the updated application
        await application.populate('reviewedBy', 'name email role');

        res.json({
            success: true,
            message: 'Application status updated successfully',
            application
        });

    } catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating application status'
        });
    }
});

// @route   DELETE /api/admin/applications/:id
// @desc    Delete application
// @access  Private (Admin only)
router.delete('/applications/:id', async (req, res) => {
    try {
        if (!req.user.hasPermission('canDeleteApplications')) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete applications'
            });
        }

        const application = await Application.findByIdAndDelete(req.params.id);
        
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        res.json({
            success: true,
            message: 'Application deleted successfully'
        });

    } catch (error) {
        console.error('Delete application error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting application'
        });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', adminMiddleware, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        res.json({
            success: true,
            users
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching users'
        });
    }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private (Admin only)
router.put('/users/:id', adminMiddleware, async (req, res) => {
    try {
        const { name, email, role, isActive, permissions } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update user fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (typeof isActive === 'boolean') user.isActive = isActive;
        if (permissions) user.permissions = { ...user.permissions, ...permissions };

        await user.save();

        res.json({
            success: true,
            message: 'User updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                permissions: user.permissions
            }
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating user'
        });
    }
});

module.exports = router;
