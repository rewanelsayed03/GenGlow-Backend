const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Examination = require('../models/Examination');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const SampleRequest = require('../models/SampleRequest');



// Create user with specific role 
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!['user', 'pharmacist', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, password: hashedPassword, role });

        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error('Create User Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update user role
exports.updateUserRole = async (req, res) => {
    try {
        const { userId, role } = req.body;

        if (!['user', 'pharmacist', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.status(200).json({
            message: `User role updated to ${role}`,
            user
        });
    } catch (error) {
        console.error('Update Role Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


// Update sample request status 
exports.updateSampleRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updated = await SampleRequest.findByIdAndUpdate(id, { status }, { new: true });
        res.json({ message: 'Sample request updated', request: updated });
    } catch (error) {
        console.error('Update Sample Request Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error('Get All Users Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all Examinations 
exports.getAllExaminationsAdmin = async (req, res) => {
    try {
        const exams = await Examination.find()
            .populate('customer', 'name email')
            .populate('pharmacist', 'name email');
        res.json(exams);
    } catch (error) {
        console.error('Admin Get All Examinations Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all Orders
exports.getAllOrders = async (req, res) => {
    try {
        let orders;
        if (req.user.role === 'admin' || req.user.role === 'pharmacist') {
            orders = await Order.find()
                .populate('user', 'name email')
                .populate('products.product', 'name price')
                .populate('shippingPartner', 'name phone');
        } else {
            orders = await Order.find({ user: req.user._id })
                .populate('user', 'name email')
                .populate('products.product', 'name price')
                .populate('shippingPartner', 'name phone');
        }
        res.json(orders);
    } catch (error) {
        console.error('Get Orders Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all payments 
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

// Get all reviews
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('user', 'name email')
            .populate('product', 'name')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        console.error('Admin Get All Reviews Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all sample requests
exports.getAllSampleRequests = async (req, res) => {
    try {
        const requests = await SampleRequest.find()
            .populate('user', 'name email')
            .populate('product', 'name price');
        res.json(requests);
    } catch (error) {
        console.error('Get All Sample Requests Error:', error);
        res.status(500).json({ error: error.message });
    }
};


// Get single user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        console.error('Get User Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete user
exports.deleteUserById = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete Examination 
exports.deleteExamination = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admin can delete examinations' });
        }

        const exam = await Examination.findByIdAndDelete(req.params.id);
        if (!exam) return res.status(404).json({ error: 'Examination not found' });

        res.json({ message: 'Examination deleted' });
    } catch (error) {
        console.error('Delete Examination Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete Order
exports.deleteOrder = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admin can delete orders' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Delete Order Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


