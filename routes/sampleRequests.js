const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const sampleRequestController = require('../controllers/sampleRequestController');

// Middleware to handle validation results
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Validation rules for creating a sample request
const sampleRequestValidationRules = [
    body('productId')
        .notEmpty().withMessage('Product ID is required')
        .isMongoId().withMessage('Product ID must be a valid Mongo ID')
];

// User routes
router.post(
    '/',
    authMiddleware,
    roleMiddleware('user'),
    sampleRequestValidationRules,
    handleValidation,
    sampleRequestController.createSampleRequest
);

router.get(
    '/my',
    authMiddleware,
    roleMiddleware('user'),
    sampleRequestController.getMySampleRequests
);

router.patch(
    '/:id/cancel',
    authMiddleware,
    roleMiddleware('user'),
    sampleRequestController.cancelSampleRequest
);

module.exports = router;
