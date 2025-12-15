const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const {
    registerUser,
    verifyEmail,
    resendVerificationCode,
    loginUser,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');

// Middleware to handle validation results  
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Validation rules
const registerValidationRules = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const verifyEmailValidationRules = [
    body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email'),
    body('code').notEmpty().withMessage('Verification code is required')
];

const resendCodeValidationRules = [
    body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email')
];

const loginValidationRules = [
    body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required')
];

const forgotPasswordValidationRules = [
    body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email')
];

const resetPasswordValidationRules = [
    body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Routes
router.post('/register', registerValidationRules, handleValidation, registerUser);
router.post('/verify-email', verifyEmailValidationRules, handleValidation, verifyEmail);
router.post('/resend-code', resendCodeValidationRules, handleValidation, resendVerificationCode);
router.post('/login', loginValidationRules, handleValidation, loginUser);
router.post('/forgot-password', forgotPasswordValidationRules, handleValidation, forgotPassword);
router.post('/reset-password/:token', resetPasswordValidationRules, handleValidation, resetPassword);

module.exports = router;
