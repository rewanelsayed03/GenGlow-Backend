const Payment = require('../models/Payment');
const Order = require('../models/Order');

// Checkout/Payment 
exports.createPayment = async (req, res) => {
    try {
        const { orderId, method } = req.body;
        if (!orderId) return res.status(400).json({ error: 'Order ID is required' });

        const order = await Order.findById(orderId).populate('user', 'name email');
        if (!order) return res.status(404).json({ error: 'Order not found' });

        if (order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Check if payment already exists
        const existingPayment = await Payment.findOne({ order: orderId });
        if (existingPayment) return res.status(400).json({ error: 'Payment already exists for this order' });

        const payment = new Payment({
            order: order._id,
            user: req.user._id,
            method: method || 'Cash On Delivery',
            amount: order.totalPrice,
            status: method === 'Cash On Delivery' ? 'Pending' : 'Completed' 
        });

        await payment.save();

        // Update order status based on payment
        order.status = method === 'Cash On Delivery' ? 'Pending Payment' : 'Paid';
        await order.save();

        res.status(201).json({ message: 'Payment created successfully', payment });
    } catch (error) {
        console.error('Create Payment Error:', error);
        res.status(500).json({ error: 'Server error' });
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

// Get all payments (Admin only)
exports.getAllPayments = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const payments = await Payment.find()
            .populate('order', 'totalPrice status user')
            .populate('user', 'name email')
            .sort({ paymentDate: -1 });

        res.json(payments);
    } catch (error) {
        console.error('Get All Payments Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
