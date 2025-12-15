const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
    createReview,
    getReviewsForProduct,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');

// Middleware to handle validation results  
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Validation rules for creating/updating review
const reviewValidationRules = [
    body('product').notEmpty().withMessage('Product is required').isMongoId().withMessage('Invalid product ID'),
    body('rating').notEmpty().withMessage('Rating is required').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isString().withMessage('Comment must be a string')
];

// Public route: get reviews for a product
router.get('/product/:productId', getReviewsForProduct);

// Protected routes
router.post('/', authMiddleware, roleMiddleware('user'),
    reviewValidationRules,
    handleValidation,
    createReview
);

router.put('/:id', authMiddleware,
    reviewValidationRules,
    handleValidation,
    updateReview
);

router.delete('/:id', authMiddleware, deleteReview);

module.exports = router;
