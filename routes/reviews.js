const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
    createReview,
    getReviewsForProduct,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');

// Get reviews for a product (public)
router.get('/product/:productId', getReviewsForProduct);

// Protected routes
router.post('/', authMiddleware, createReview);
router.put('/:id', authMiddleware, updateReview);
router.delete('/:id', authMiddleware, deleteReview);

module.exports = router;
