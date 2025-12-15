const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const authMiddleware = require('../middleware/authMiddleware');
const {
    getUserProfile,
    updateUserProfile,
    deleteUserAccount
} = require('../controllers/userController');

// HANDLE VALIDATION ERRORS
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// UPDATE PROFILE VALIDATION RULES
const updateUserValidation = [
    body('name')
        .optional()
        .notEmpty().withMessage('Name cannot be empty')
        .isString().withMessage('Name must be a string'),

    body('email')
        .optional()
        .notEmpty().withMessage('Email cannot be empty')
        .isEmail().withMessage('Invalid email format'),

    body('password')
        .optional()
        .isString().withMessage('Password must be a string')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// ROUTES
router.get('/profile', authMiddleware, getUserProfile);

router.put(
    '/profile',
    authMiddleware,
    updateUserValidation,
    handleValidation,
    updateUserProfile
);

router.delete('/profile', authMiddleware, deleteUserAccount);

module.exports = router;
