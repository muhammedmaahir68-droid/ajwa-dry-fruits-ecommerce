const { Op } = require('sequelize');
const catchAsyncError = require('../middlewares/catchAsyncError');
const User = require('../models/userModel');
const sendEmail = require('../utils/email');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwt');
const crypto = require('crypto');
const { serializeUser } = require('../utils/serialize');

//Register User - /api/v1/register
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

    const user = await User.create({
        name,
        email,
        password,
        avatar
    });

    sendToken(user, 201, res);
});

//Login User - /api/v1/login
exports.loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler('Please enter email & password', 400));
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    if (!(await user.isValidPassword(password))) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    sendToken(user, 201, res);
});

//Logout - /api/v1/logout
exports.logoutUser = (req, res) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
        .status(200)
        .json({
            success: true,
            message: 'Loggedout'
        });
};

//Forgot Password - /api/v1/password/forgot
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user) {
        return next(new ErrorHandler('User not found with this email', 404));
    }

    const resetToken = user.getResetToken();
    await user.save();

    let BASE_URL = process.env.FRONTEND_URL;
    if (process.env.NODE_ENV === 'production') {
        BASE_URL = `${req.protocol}://${req.get('host')}`;
    }

    const resetUrl = `${BASE_URL}/password/reset/${resetToken}`;
    const message = `Your password reset url is as follows \n\n 
    ${resetUrl} \n\n If you have not requested this email, then ignore it.`;

    try {
        sendEmail({
            email: user.email,
            subject: 'Ajwa Dry Fruits Password Recovery',
            message
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email}`
        });
    } catch (error) {
        user.resetPasswordToken = null;
        user.resetPasswordTokenExpire = null;
        await user.save();
        return next(new ErrorHandler(error.message, 500));
    }
});

//Reset Password - /api/v1/password/reset/:token
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

//Get User Profile - /api/v1/myprofile
exports.getUserProfile = catchAsyncError(async (req, res) => {
    const user = await User.findByPk(req.user.id);
    res.status(200).json({
        success: true,
        user: serializeUser(user)
    });
});

//Change Password  - api/v1/password/change
exports.changePassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findByPk(req.user.id);
    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    if (!(await user.isValidPassword(req.body.oldPassword))) {
        return next(new ErrorHandler('Old password is incorrect', 401));
    }

    user.password = req.body.password;
    await user.save();
    res.status(200).json({
        success: true
    });
});

//Update Profile - /api/v1/update
exports.updateProfile = catchAsyncError(async (req, res, next) => {
    const user = await User.findByPk(req.user.id);
    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    user.name = req.body.name;
    user.email = req.body.email;

    let BASE_URL = process.env.BACKEND_URL;
    if (process.env.NODE_ENV === 'production') {
        BASE_URL = `${req.protocol}://${req.get('host')}`;
    }

    if (req.file) {
        user.avatar = `${BASE_URL}/uploads/user/${req.file.originalname}`;
    }

    await user.save();

    res.status(200).json({
        success: true,
        user: serializeUser(user)
    });
});

//Admin: Get All Users - /api/v1/admin/users
exports.getAllUsers = catchAsyncError(async (req, res) => {
    const users = await User.findAll({ order: [['id', 'DESC']] });
    res.status(200).json({
        success: true,
        users: users.map(serializeUser)
    });
});

//Admin: Get Specific User - api/v1/admin/user/:id
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

//Admin: Update User - api/v1/admin/user/:id
exports.updateUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findByPk(req.params.id);
    if (!user) {
        return next(new ErrorHandler(`User not found with this id ${req.params.id}`, 404));
    }

    user.name = req.body.name;
    user.email = req.body.email;
    user.role = req.body.role;
    await user.save();

    res.status(200).json({
        success: true,
        user: serializeUser(user)
    });
});

//Admin: Delete User - api/v1/admin/user/:id
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
