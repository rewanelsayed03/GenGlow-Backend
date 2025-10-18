const Payment = require('../models/Payment');
const Order = require('../models/Order');
const mongoose = require('mongoose');


// Create Product
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category, supplier } = req.body;

        // Validate supplier exists
        if (supplier) {
            const supplierExists = await Supplier.findById(supplier);
            if (!supplierExists) return res.status(400).json({ error: 'Supplier not found' });
        }

        if (!req.files || !req.files.image) {
            return res.status(400).json({ error: 'Please upload an image' });
        }

        const file = req.files.image;
        const result = await cloudinary.uploader.upload(file.tempFilePath, { folder: 'GenGlow/Products' });

        if (fs.existsSync(file.tempFilePath)) fs.unlinkSync(file.tempFilePath);

        const product = new Product({ name, description, price, stock, category, imageUrl: result.secure_url, supplier });
        await product.save();

        await product.populate('supplier', 'name _id');

        res.status(201).json({ message: 'Product created successfully', product });

    } catch (error) {
        console.error('Create Product Error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};



// Checkout
exports.createPayment = async (req, res) => {
    try {
        const { orderId, method } = req.body;
        if (!orderId) return res.status(400).json({ error: 'Order ID is required' });

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ error: 'Invalid order ID' });
        }

        const order = await Order.findById(orderId).populate('user', 'name email');
        if (!order) return res.status(404).json({ error: 'Order not found' });

        if (!order.user) return res.status(400).json({ error: 'Order has no user assigned' });

        if (order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

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

        order.status = method === 'Cash On Delivery' ? 'Pending' : 'Completed';
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


