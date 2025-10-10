const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// Self User
exports.getUserProfile = async (req, res) => {
    res.json(req.user);
};

exports.updateUserProfile = async (req, res) => {
    const user = req.user;
    const { name, email, password } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json(user);
};

exports.deleteUserAccount = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user._id);
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete account' });
    }
};

// Admin Only 
exports.getAllUsers = async (req, res) => {
    const users = await User.find().select('-password');
    res.json(users);
};

exports.getUserById = async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
};

exports.updateUserById = async (req, res) => {
    const { name, email, password, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
    }
    if (role) user.role = role;

    await user.save();
    res.json(user);
};

exports.deleteUserById = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
};
