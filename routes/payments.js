const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Create Payment
router.post('/checkout', authMiddleware, paymentController.createPayment);

// Get user's payment history
router.get('/my-payments', authMiddleware, roleMiddleware('user'), paymentController.getUserPayments);

// Complete Payment (Admin/Pharmacist only)
router.patch('/:id/complete', authMiddleware, roleMiddleware('admin', 'pharmacist'), paymentController.completePayment);

module.exports = router;
