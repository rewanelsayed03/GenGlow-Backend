const User = require('../models/User');

// For hashing and comparing passwords securely.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// Self User
exports.getUserProfile = async (req, res) => {

    // Sends the logged-in user’s data as JSON.
    // req.user comes from your auth middleware (after verifying JWT).
    res.json(req.user);
};

// Update User Profile
exports.updateUserProfile = async (req, res) => {

    // Gets the logged-in user object from middleware.
    const user = req.user;
    const { name, email, password } = req.body;

    // Update fields only if they are provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
        const salt = await bcrypt.genSalt(10);  // generates a salt using factor 10
        user.password = await bcrypt.hash(password, salt); // hashes the new password securely
    }

    // Save to DB (The password is never saved as plain text)
    await user.save();
    res.json(user);
};

// Delete User
exports.deleteUserAccount = async (req, res) => {
    try {

        // Deletes the logged-in user from the database using their ID.
        await User.findByIdAndDelete(req.user._id);
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete account' });
    }
};

