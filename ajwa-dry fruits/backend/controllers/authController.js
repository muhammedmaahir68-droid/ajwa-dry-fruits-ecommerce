const { Op } = require('sequelize');
const catchAsyncError = require('../middlewares/catchAsyncError');
const User = require('../models/userModel');
const sendEmail = require('../utils/email');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwt');
const crypto = require('crypto');
const { serializeUser } = require('../utils/serialize');

// Register User - /api/v1/register
exports.registerUser = catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;

    let avatar;
    let BASE_URL = process.env.BACKEND_URL;
    if (process.env.NODE_ENV === 'production') {
        BASE_URL = `${req.protocol}://${req.get('host')}`;
    }

    if (req.file) {
        avatar = `${BASE_URL}/uploads/user/${req.file.originalname}`;
    }

    const normalizedEmail = (email || '').toLowerCase().trim();

    let existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
        return next(new ErrorHandler('An account with this email already exists', 400));
    }

    const user = await User.create({
        name,
        email: normalizedEmail,
        password,
        avatar,
        isEmailVerified: false
    });

    // Auto-generate OTP for email verification
    const otp = user.generateOTP();
    await user.save();

    // Send OTP verification email
    try {
        await sendEmail({
            email: user.email,
            subject: '🔒 Your Ajwa Dry Fruits Verification Code',
            message: `Welcome to Ajwa Dry Fruits! Your email verification code is: ${otp}. This code is valid for 10 minutes.`,
            html: `
                <div style="background-color: #0A0503; color: #FFFFFF; font-family: Arial, sans-serif; padding: 32px; border-radius: 12px; border: 1.5px solid #D4AF37; max-width: 550px; margin: 0 auto;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #D4AF37; margin: 0; letter-spacing: 2px;">AJWA DRY FRUITS</h2>
                        <p style="color: #A0A0A0; font-size: 12px; margin-top: 4px;">SECURE EMAIL VERIFICATION</p>
                    </div>
                    <div style="background-color: #160B07; padding: 24px; border-radius: 8px; border: 1px solid #2C1611; text-align: center;">
                        <p style="color: #D0D0D0; font-size: 14px; margin-bottom: 16px;">Use the 6-digit One-Time Password (OTP) below to complete your registration:</p>
                        <div style="font-size: 36px; font-weight: bold; color: #D4AF37; letter-spacing: 8px; margin: 16px 0; background: #0A0503; padding: 12px; border-radius: 6px; border: 1px dashed #D4AF37;">
                            ${otp}
                        </div>
                        <p style="color: #888888; font-size: 12px; margin-top: 16px;">This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
                    </div>
                </div>
            `
        });
    } catch (e) {
        console.log('OTP Email Notice:', e.message);
    }

    sendToken(user, 201, res);
});

// Login User - /api/v1/login
exports.loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler('Please enter email & password', 400));
    }

    const normalizedEmail = (email || '').toLowerCase().trim();
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    if (!(await user.isValidPassword(password))) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    sendToken(user, 201, res);
});

// Send OTP Endpoint - /api/v1/auth/send-otp
exports.sendOTP = catchAsyncError(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next(new ErrorHandler('Please enter email address', 400));
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
        return next(new ErrorHandler('No registered account found with this email', 404));
    }

    const otp = user.generateOTP();
    await user.save();

    await sendEmail({
        email: user.email,
        subject: '🔑 Your Login OTP — Ajwa Dry Fruits',
        message: `Your login OTP code is: ${otp}. It will expire in 10 minutes.`,
        html: `
            <div style="background-color: #0A0503; color: #FFFFFF; font-family: Arial, sans-serif; padding: 32px; border-radius: 12px; border: 1.5px solid #D4AF37; max-width: 550px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #D4AF37; margin: 0; letter-spacing: 2px;">AJWA DRY FRUITS</h2>
                    <p style="color: #A0A0A0; font-size: 12px; margin-top: 4px;">AUTHENTICATION PASSCODE</p>
                </div>
                <div style="background-color: #160B07; padding: 24px; border-radius: 8px; border: 1px solid #2C1611; text-align: center;">
                    <p style="color: #D0D0D0; font-size: 14px; margin-bottom: 16px;">Enter this 6-digit OTP code to log in securely:</p>
                    <div style="font-size: 36px; font-weight: bold; color: #D4AF37; letter-spacing: 8px; margin: 16px 0; background: #0A0503; padding: 12px; border-radius: 6px; border: 1px dashed #D4AF37;">
                        ${otp}
                    </div>
                    <p style="color: #888888; font-size: 12px; margin-top: 16px;">Valid for 10 minutes.</p>
                </div>
            </div>
        `
    });

    res.status(200).json({
        success: true,
        message: `OTP sent successfully to ${user.email}!`
    });
});

// Verify OTP Endpoint - /api/v1/auth/verify-otp
exports.verifyOTP = catchAsyncError(async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return next(new ErrorHandler('Email and OTP code are required', 400));
    }

    const normalizedEmail = email.toLowerCase().trim();
    const hashedOTP = crypto.createHash('sha256').update(otp.toString().trim()).digest('hex');

    const user = await User.findOne({
        where: {
            email: normalizedEmail,
            otpCode: hashedOTP,
            otpExpires: { [Op.gt]: new Date() }
        }
    });

    if (!user) {
        return next(new ErrorHandler('Invalid or expired OTP verification code', 400));
    }

    user.otpCode = null;
    user.otpExpires = null;
    user.isEmailVerified = true;
    await user.save();

    sendToken(user, 200, res);
});

// Google Gmail Authentication - /api/v1/google-login
exports.googleLogin = catchAsyncError(async (req, res, next) => {
    const { email, name, avatar, googleId } = req.body;

    if (!email) {
        return next(new ErrorHandler('Google account email is required', 400));
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
        const randomPassword = crypto.randomBytes(12).toString('hex') + 'A1!';
        user = await User.create({
            name: name || email.split('@')[0],
            email: normalizedEmail,
            password: randomPassword,
            avatar: avatar || '/images/default_avatar.png',
            googleId: googleId || 'google_' + Date.now(),
            isEmailVerified: true,
            role: 'user'
        });
    } else {
        user.isEmailVerified = true;
        if (googleId) user.googleId = googleId;
        await user.save();
    }

    sendToken(user, 200, res);
});

// Logout - /api/v1/logout
exports.logoutUser = (req, res) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
        .status(200)
        .json({
            success: true,
            message: 'Logged out successfully'
        });
};

// Forgot Password - /api/v1/password/forgot
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ where: { email: (req.body.email || '').toLowerCase().trim() } });

    if (!user) {
        return next(new ErrorHandler('User not found with this email', 404));
    }

    const resetToken = user.getResetToken();
    await user.save();

    let BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
    if (process.env.NODE_ENV === 'production') {
        BASE_URL = `${req.protocol}://${req.get('host')}`;
    }

    const resetUrl = `${BASE_URL}/password/reset/${resetToken}`;
    const message = `Your password reset URL is: \n\n ${resetUrl} \n\n If you did not request this, please ignore.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Ajwa Dry Fruits Password Recovery',
            message
        });

        res.status(200).json({
            success: true,
            message: `Reset email sent to ${user.email}`
        });
    } catch (error) {
        user.resetPasswordToken = null;
        user.resetPasswordTokenExpire = null;
        await user.save();
        return next(new ErrorHandler(error.message, 500));
    }
});

// Reset Password - /api/v1/password/reset/:token
exports.resetPassword = catchAsyncError(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        where: {
            resetPasswordToken,
            resetPasswordTokenExpire: {
                [Op.gt]: new Date()
            }
        }
    });

    if (!user) {
        return next(new ErrorHandler('Password reset token is invalid or expired'));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Password does not match'));
    }

    user.password = req.body.password;
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpire = null;
    await user.save();
    sendToken(user, 201, res);
});

// Get User Profile - /api/v1/myprofile
exports.getUserProfile = catchAsyncError(async (req, res) => {
    const user = await User.findByPk(req.user.id);
    res.status(200).json({
        success: true,
        user: serializeUser(user)
    });
});

// Change Password - api/v1/password/change
exports.changePassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findByPk(req.user.id);
    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    if (!(await user.isValidPassword(req.body.oldPassword))) {
        return next(new ErrorHandler('Old password is incorrect', 400));
    }

    user.password = req.body.password;
    await user.save();

    res.status(200).json({
        success: true
    });
});

// Update Profile - api/v1/update
exports.updateProfile = catchAsyncError(async (req, res, next) => {
    let newUserData = {
        name: req.body.name,
        email: (req.body.email || '').toLowerCase().trim()
    };

    if (req.file) {
        let BASE_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
        if (process.env.NODE_ENV === 'production') {
            BASE_URL = `${req.protocol}://${req.get('host')}`;
        }
        newUserData.avatar = `${BASE_URL}/uploads/user/${req.file.originalname}`;
    }

    let user = await User.findByPk(req.user.id);
    user.name = newUserData.name;
    user.email = newUserData.email;
    if (newUserData.avatar) user.avatar = newUserData.avatar;
    await user.save();

    res.status(200).json({
        success: true,
        user: serializeUser(user)
    });
});

// Admin: Get All Users - api/v1/admin/users
exports.getUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.findAll();
    res.status(200).json({
        success: true,
        users: users.map(u => serializeUser(u))
    });
});

// Admin: Get Specific User - api/v1/admin/user/:id
exports.getUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findByPk(req.params.id);
    if (!user) {
        return next(new ErrorHandler(`User not found with this id ${req.params.id}`));
    }
    res.status(200).json({
        success: true,
        user: serializeUser(user)
    });
});

// Admin: Update User - api/v1/admin/user/:id
exports.updateUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findByPk(req.params.id);
    if (!user) {
        return next(new ErrorHandler(`User not found with this id ${req.params.id}`, 404));
    }

    user.name = req.body.name;
    user.email = (req.body.email || '').toLowerCase().trim();
    user.role = req.body.role;
    await user.save();

    res.status(200).json({
        success: true,
        user: serializeUser(user)
    });
});

// Admin: Delete User - api/v1/admin/user/:id
exports.deleteUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findByPk(req.params.id);
    if (!user) {
        return next(new ErrorHandler(`User not found with this id ${req.params.id}`));
    }
    await user.destroy();
    res.status(200).json({
        success: true
    });
});

// Dedicated Admin Login - /api/v1/admin/login
exports.adminLogin = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler('Please enter email & password', 400));
    }

    const user = await User.findOne({ where: { email: (email || '').toLowerCase().trim() } });

    if (!user) {
        return next(new ErrorHandler('Invalid administrator credentials', 401));
    }

    if (user.role !== 'admin') {
        return next(new ErrorHandler('Access Denied: Administrator privileges required', 403));
    }

    if (!(await user.isValidPassword(password))) {
        return next(new ErrorHandler('Invalid administrator credentials', 401));
    }

    sendToken(user, 200, res);
});
