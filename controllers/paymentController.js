const Payment = require('../models/Payment');
const Order = require('../models/Order');
const mongoose = require('mongoose');

// Checkout
exports.createPayment = async (req, res) => {
    try {
        const { orderId, method } = req.body;

        // Checks if orderId was provided. 
        if (!orderId) return res.status(400).json({ error: 'Order ID is required' });

        // Validates that orderId is a valid MongoDB ObjectId format.
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ error: 'Invalid order ID' });
        }

        const order = await Order.findById(orderId).populate('user', 'name email');
        if (!order) return res.status(404).json({ error: 'Order not found' });

        // Ensures the order has an associated user.
        if (!order.user) return res.status(400).json({ error: 'Order has no user assigned' });

        // Checks that the authenticated user matches the order’s user.
        if (order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Prevents creating multiple payments for the same order.
        const existingPayment = await Payment.findOne({ order: orderId });
        if (existingPayment) return res.status(400).json({ error: 'Payment already exists for this order' });

        // Creates a new Payment object.
        const payment = new Payment({
            order: order._id,
            user: req.user._id,
            method: 'Cash On Delivery',
            amount: order.totalPrice,
            status: 'Pending'
        });

        // Saves payment to DB.
        await payment.save();
        order.status = 'Pending'
        await order.save();

        res.status(201).json({ message: 'Payment created successfully', payment });

    } catch (error) {
        // Show full error details for debugging
        console.error('Create Payment Error:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);

        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid order ID format' });
        }

        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// Get user's payment history
exports.getUserPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user._id })
            .populate('order', 'totalPrice status')
            .sort({ paymentDate: -1 });

        res.json(payments);
    } catch (error) {
        console.error('Get Payments Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Complete Payment (Admin/Pharmacist only)
exports.completePayment = async (req, res) => {
    try {

        // Fetches the payment by ID, populating the associated order.
        const payment = await Payment.findById(req.params.id).populate('order');
        if (!payment) return res.status(404).json({ error: 'Payment not found' });

        // Checks that the order exists.
        if (!payment.order) {
            return res.status(400).json({ error: 'Associated order not found' });
        }

        // Update payment status
        payment.status = 'Completed';
        await payment.save(); 

        // Update order status safely
        await Order.findByIdAndUpdate(payment.order._id, { status: 'Completed' });

        res.json({ message: 'Payment marked as completed', payment });
    } catch (error) {
        console.error('Complete Payment Error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};
