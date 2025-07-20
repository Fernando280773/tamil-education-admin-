const express = require('express');
const Application = require('../models/Application');
const { sendEmail } = require('../utils/email');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   POST /api/applications/submit
// @desc    Submit new application (from frontend form)
// @access  Public
router.post('/submit-application', [
    body('applicationData.firstName').notEmpty().trim(),
    body('applicationData.lastName').notEmpty().trim(),
    body('applicationData.email').isEmail().normalizeEmail(),
    body('applicationData.phone').notEmpty().trim(),
    body('applicationData.age').isInt({ min: 18, max: 100 }),
    body('applicationData.address').notEmpty().trim(),
    body('applicationData.city').notEmpty().trim(),
    body('applicationData.postcode').notEmpty().trim(),
    body('applicationData.qualification').isIn(['undergraduate', 'postgraduate', 'doctoral', 'teacher', 'retired_teacher', 'other']),
    body('applicationData.profession').notEmpty().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid application data',
                errors: errors.array()
            });
        }

        const { applicationData, emailContent, adminEmails } = req.body;

        // Check if application with same email already exists
        const existingApplication = await Application.findOne({ 
            email: applicationData.email,
            status: { $ne: 'rejected' }
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'An application with this email already exists'
            });
        }

        // Create new application
        const application = new Application(applicationData);
        await application.save();

                // Send notification emails to admins (temporarily disabled for testing)
        if (adminEmails && adminEmails.length > 0 && process.env.EMAIL_ENABLED === 'true') {
            try {
                await sendEmail({
                    to: adminEmails,
                    subject: 'புதிய உறுப்பினர் விண்ணப்பம் - New Membership Application',
                    html: `
                        <h2>புதிய உறுப்பினர் விண்ணப்பம் பெறப்பட்டது</h2>
                        <p><strong>விண்ணப்ப எண்:</strong> ${application._id}</p>
                        <p><strong>தேதி:</strong> ${new Date().toLocaleString('ta-IN')}</p>
                        <hr>
                        <pre>${emailContent}</pre>
                        <hr>
                        <p><a href="${process.env.ADMIN_URL || 'http://localhost:3000'}/admin/applications">நிர்வாக பானலில் பார்க்க</a></p>
                    `
                });
                application.emailSent = true;
                await application.save();
            } catch (emailError) {
                console.error('Failed to send admin notification email:', emailError);
                // Don't fail the request if email fails
                application.emailSent = false;
                await application.save();
            }
        } else {
            console.log('Email notifications disabled - application saved successfully');
            application.emailSent = false;
            await application.save();
        }

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            applicationId: application._id
        });

    } catch (error) {
        console.error('Application submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while submitting application'
        });
    }
});

// @route   POST /api/applications/send-confirmation
// @desc    Send confirmation email to applicant
// @access  Public
router.post('/send-confirmation', [
    body('to').isEmail(),
    body('subject').notEmpty(),
    body('message').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email data',
                errors: errors.array()
            });
        }

        const { to, subject, message } = req.body;

        // Temporarily disable email sending for testing
        if (process.env.EMAIL_ENABLED === 'true') {
            await sendEmail({
                to: [to],
                subject,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #764ba2;">தமிழ் சமூக கல்விக் குழு</h2>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                            <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${message}</pre>
                        </div>
                        <hr>
                        <p style="color: #666; font-size: 12px;">
                            This is an automated message from Tamil Education Group - Yorkshire & Lincolnshire
                        </p>
                    </div>
                `
            });
        } else {
            console.log('Confirmation email disabled - email service not configured');
        }

        res.json({
            success: true,
            message: 'Confirmation email sent successfully'
        });

    } catch (error) {
        console.error('Confirmation email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send confirmation email'
        });
    }
});

module.exports = router;
