const User = require('../models/User');

// For hashing and comparing passwords securely.
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// To generate secure random tokens for password reset.
const crypto = require('crypto');

// Register User
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Checks if a user with this email already exists in the database.
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        // Hashes the password using bcrypt with a salt factor of 10 for security.
        // 10 means bcrypt will re-hash the password 2^10 (1024) times internally.
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generates a 6-digit random verification code as a string.
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: 'user',
            verificationCode,
            verificationCodeExpires: Date.now() + 10 * 60 * 1000, // 10 mins
            isVerified: false
        });

        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify your GenGlow account',
            text: `Your verification code is ${verificationCode}`
        });

        res.status(201).json({
            message: 'User registered successfully. Please check your email for the verification code.',
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Resend Verification Code 
exports.resendVerificationCode = async (req, res) => {
    try {

        // Finds the user by email.
        const { email } = req.body;
        const user = await User.findOne({ email });

        // Checks if the user exists and isn’t already verified.
        if (!user) return res.status(400).json({ error: 'Invalid email or password' });
        if (user.isVerified) return res.status(400).json({ error: 'User is already verified' });

        // Generates a new code, updates the expiry, and saves the user.
        const newCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
        user.verificationCode = newCode;
        user.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 mins
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        // Sends the new verification code via email.
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Resend Verification Code - GenGlow',
            text: `Your new verification code is ${newCode}`
        });

        res.json({ message: 'New verification code sent to your email.' });

    } catch (error) {
        console.error('Resend Code Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Verify Email 
exports.verifyEmail = async (req, res) => {
    try {

        // Finds the user by email.
        const { email, code } = req.body;
        const user = await User.findOne({ email });

        // Checks if the user exists and isn’t already verified.
        if (!user) return res.status(400).json({ error: 'Invalid email or password' });
        if (user.isVerified) return res.status(400).json({ error: 'User already verified' });

        // Verifies that the code matches and hasn’t expired.
        if (user.verificationCode !== code || user.verificationCodeExpires < Date.now()) {
            return res.status(400).json({ error: 'Invalid or expired code' });
        }

        // Marks the user as verified and clears the verification code.
        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully!' });

    } catch (error) {
        console.error('Verify Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

//  Login User 
exports.loginUser = async (req, res) => {
    try {

        // Finds user by email.
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        // Checks if user exists and is verified.
        if (!user) return res.status(400).json({ error: 'Invalid email or password' });
        if (!user.isVerified) return res.status(401).json({ error: 'Please verify your email before logging in' });

        // Compares the provided password with the hashed password in DB.
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

        // Generate JWT token valid for 7 days, containing user ID and role.
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Returns the token and user info.
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role       
            }
        });


    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Forgot Password 
exports.forgotPassword = async (req, res) => {
    try {

        // Finds user by email.
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ error: 'Invalid email or password' });

        // Generates a secure reset token, sets expiration for 15 minutes, and saves it.
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        // Builds a password reset link.
        const resetURL = `http://localhost:5000/api/auth/reset-password/${resetToken}`;

        // Sends the password reset link via email.
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'GenGlow Password Reset',
            text: `Click this link to reset your password: ${resetURL}`
        });

        res.json({ message: 'Password reset link sent to your email.' });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Reset Password 
exports.resetPassword = async (req, res) => {
    try {

        // Finds the user with the matching token that hasn’t expired.
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        // If token is invalid/expired, return an error.
        if (!user) return res.status(400).json({ error: 'Invalid or expired reset token' });

        // Hashes the new password, clears the reset token and expiry, saves user.
        // Hashes the password using bcrypt with a salt factor of 10 for security.
        // 10 means bcrypt will re-hash the password 2^10 (1024) times internally.
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password has been reset successfully!' });

    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
