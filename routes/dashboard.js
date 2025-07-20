const express = require('express');
const Application = require('../models/Application');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all dashboard routes
router.use(authMiddleware);

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', async (req, res) => {
    try {
        const [
            totalApplications,
            pendingApplications,
            approvedApplications,
            rejectedApplications,
            recentApplications,
            totalUsers,
            activeUsers
        ] = await Promise.all([
            Application.countDocuments(),
            Application.countDocuments({ status: 'pending' }),
            Application.countDocuments({ status: 'approved' }),
            Application.countDocuments({ status: 'rejected' }),
            Application.find().sort({ submittedAt: -1 }).limit(5).select('firstName lastName email status submittedAt'),
            User.countDocuments(),
            User.countDocuments({ isActive: true })
        ]);

        // Get monthly statistics for the current year
        const currentYear = new Date().getFullYear();
        const monthlyStats = await Application.aggregate([
            {
                $match: {
                    submittedAt: {
                        $gte: new Date(currentYear, 0, 1),
                        $lt: new Date(currentYear + 1, 0, 1)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$submittedAt' },
                    count: { $sum: 1 },
                    approved: {
                        $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
                    },
                    rejected: {
                        $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
                    },
                    pending: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Get qualification distribution
        const qualificationStats = await Application.aggregate([
            {
                $group: {
                    _id: '$qualification',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Get age distribution
        const ageStats = await Application.aggregate([
            {
                $group: {
                    _id: {
                        $switch: {
                            branches: [
                                { case: { $lt: ['$age', 30] }, then: '18-29' },
                                { case: { $lt: ['$age', 40] }, then: '30-39' },
                                { case: { $lt: ['$age', 50] }, then: '40-49' },
                                { case: { $lt: ['$age', 60] }, then: '50-59' },
                                { case: { $gte: ['$age', 60] }, then: '60+' }
                            ],
                            default: 'Unknown'
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json({
            success: true,
            stats: {
                overview: {
                    totalApplications,
                    pendingApplications,
                    approvedApplications,
                    rejectedApplications,
                    totalUsers,
                    activeUsers,
                    approvalRate: totalApplications > 0 ? ((approvedApplications / totalApplications) * 100).toFixed(1) : 0
                },
                recentApplications,
                monthlyStats,
                qualificationStats,
                ageStats
            }
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching dashboard statistics'
        });
    }
});

// @route   GET /api/dashboard/activities
// @desc    Get recent activities
// @access  Private
router.get('/activities', async (req, res) => {
    try {
        const { limit = 20 } = req.query;

        // Get recent applications with status changes
        const recentActivities = await Application.find({
            $or: [
                { reviewedAt: { $exists: true } },
                { submittedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
            ]
        })
        .populate('reviewedBy', 'name email')
        .sort({ $natural: -1 })
        .limit(parseInt(limit))
        .select('firstName lastName email status submittedAt reviewedAt reviewedBy');

        const activities = recentActivities.map(app => {
            const activities = [];
            
            // Application submitted
            activities.push({
                type: 'application_submitted',
                description: `${app.firstName} ${app.lastName} submitted a new application`,
                timestamp: app.submittedAt,
                applicationId: app._id,
                userEmail: app.email
            });

            // Status change
            if (app.reviewedAt && app.reviewedBy) {
                activities.push({
                    type: 'status_changed',
                    description: `Application status changed to ${app.status} by ${app.reviewedBy.name}`,
                    timestamp: app.reviewedAt,
                    applicationId: app._id,
                    status: app.status,
                    reviewedBy: app.reviewedBy.name
                });
            }

            return activities;
        }).flat().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json({
            success: true,
            activities: activities.slice(0, limit)
        });

    } catch (error) {
        console.error('Dashboard activities error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching activities'
        });
    }
});

// @route   GET /api/dashboard/exports/applications
// @desc    Export applications data
// @access  Private
router.get('/exports/applications', async (req, res) => {
    try {
        const { format = 'json', status } = req.query;

        const query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const applications = await Application.find(query)
            .populate('reviewedBy', 'name email')
            .sort({ submittedAt: -1 });

        if (format === 'csv') {
            // Convert to CSV format
            const csv = applications.map(app => [
                app._id,
                app.firstName,
                app.lastName,
                app.email,
                app.phone,
                app.age,
                app.city,
                app.postcode,
                app.getQualificationTamil(),
                app.profession,
                app.getStatusTamil(),
                app.submittedAt.toLocaleDateString(),
                app.reviewedBy ? app.reviewedBy.name : '',
                app.reviewedAt ? app.reviewedAt.toLocaleDateString() : ''
            ]).join('\n');

            const header = 'ID,First Name,Last Name,Email,Phone,Age,City,Postcode,Qualification,Profession,Status,Submitted,Reviewed By,Reviewed Date\n';

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=applications.csv');
            res.send(header + csv);
        } else {
            res.json({
                success: true,
                applications,
                exportedAt: new Date(),
                total: applications.length
            });
        }

    } catch (error) {
        console.error('Export applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while exporting applications'
        });
    }
});

module.exports = router;
