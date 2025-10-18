const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

// Create Payment
router.post('/checkout', authMiddleware, paymentController.createPayment);

// Get user's payment history
router.get('/my-payments', authMiddleware, paymentController.getUserPayments);

module.exports = router;
