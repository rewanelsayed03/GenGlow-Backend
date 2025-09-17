const express = require('express');
const router = express.Router();
const {
    registerUser,
    verifyEmail,
    resendVerificationCode,
    loginUser,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');


router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);
router.post('/resend-code', resendVerificationCode);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
