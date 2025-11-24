const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // (Enum) can only be one of user, admin, or pharmacist
    role: { type: String, enum: ['user', 'admin', 'pharmacist'], default: 'user' },

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    // (Boolean) tracks if the user’s email is verified
    isVerified: { type: Boolean, default: false },

    verificationCode: { type: String },
    verificationCodeExpires: { type: Date }

    // Automatically adds: (createdAt) when the user was created
                        // (updatedAt) when the user was last updated 
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
