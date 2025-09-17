const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'pharmacist'], default: 'user' },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    verificationCodeExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
