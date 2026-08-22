const express = require('express');
const multer = require('multer');
const path = require('path');

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(__dirname, '..', 'uploads/user'));
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        }
    })
});

const {
    registerUser,
    loginUser,
    logoutUser,
    forgotPassword,
    resetPassword,
    getUserProfile,
    changePassword,
    updateProfile,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    googleLogin,
    sendOTP,
    verifyOTP,
    adminLogin
} = require('../controllers/authController');

const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/authenticate');

router.route('/register').post(upload.single('avatar'), registerUser);
router.route('/login').post(loginUser);
router.route('/auth/send-otp').post(sendOTP);
router.route('/auth/verify-otp').post(verifyOTP);
router.route('/google-login').post(googleLogin);
router.route('/admin/login').post(adminLogin);
router.route('/logout').get(logoutUser);
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').post(resetPassword);
router.route('/password/change').put(isAuthenticatedUser, changePassword);
router.route('/myprofile').get(isAuthenticatedUser, getUserProfile);
router.route('/update').put(isAuthenticatedUser, upload.single('avatar'), updateProfile);

// Admin routes
router.route('/admin/users').get(isAuthenticatedUser, authorizeRoles('admin'), getUsers);
router.route('/admin/user/:id').get(isAuthenticatedUser, authorizeRoles('admin'), getUser)
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateUser)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUser);

module.exports = router;