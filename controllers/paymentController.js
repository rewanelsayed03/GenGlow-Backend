const Payment = require('../models/Payment');
const Order = require('../models/Order');
const mongoose = require('mongoose');

// Checkout
exports.createPayment = async (req, res) => {
    try {
        const { orderId } = req.body;

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
        if (existingPayment) {
            return res.status(400).json({ error: 'Payment already exists for this order' });
        }

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
        order.status = 'Pending';
        await order.save();

        res.status(201).json({
            message: 'Payment created successfully',
            payment
        });

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

// Complete Payment (Admin / Pharmacist)
exports.completePayment = async (req, res) => {
    console.log('COMPLETE PAYMENT ENDPOINT HIT');

    try {
        // Fetch payment + order + products
        const payment = await Payment.findById(req.params.id).populate({
            path: 'order',
            populate: { path: 'products.product' }
        });

        // Validate payment
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        if (!payment.order) {
            return res.status(400).json({ error: 'Associated order not found' });
        }

        // Prevent double completion
        if (payment.status === 'Completed') {
            return res.status(400).json({ error: 'Payment already completed' });
        }

        const order = payment.order;

        // Enforce business flow
        if (order.status !== 'Shipped') {
            return res.status(400).json({
                error: 'Order must be shipped before completing payment'
            });
        }

        // Reduce stock
        for (const item of order.products) {
            const product = item.product;

            console.log(`${product.name} | Stock before: ${product.stock}`);

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    error: `Not enough stock for ${product.name}`
                });
            }

            product.stock -= item.quantity;
            await product.save();

            console.log(`Stock after: ${product.stock}`);
        }

        // Finalize payment
        payment.status = 'Completed';
        await payment.save();

        // Finalize order
        order.paymentStatus = 'Completed';
        order.status = 'Delivered';
        await order.save();

        
        res.json({
            message: 'Payment completed, order delivered & stock reduced',
            payment: {
                _id: payment._id,
                status: payment.status,
                user: payment.user,
                method: payment.method,
                amount: payment.amount,
                paymentDate: payment.paymentDate,
                createdAt: payment.createdAt,
                updatedAt: payment.updatedAt,
                order: {
                    _id: order._id,
                    status: order.status,
                    paymentStatus: order.paymentStatus,
                    shippingPartner: order.shippingPartner,
                    products: order.products.map(item => ({
                        quantity: item.quantity,
                        stock: item.product.stock
                    }))
                }
            }
        });

    } catch (error) {
        console.error('Complete Payment Error:', error);
        res.status(500).json({
            error: 'Server error',
            details: error.message
        });
    }
};
