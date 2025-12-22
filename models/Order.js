const mongoose = require('mongoose');

const orderProductSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 }

    // Cleaner data: No extra _id for each item in the array
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Each order can have multiple products with quantities
    products: [orderProductSchema],

    totalPrice: { type: Number, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Processed', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },

    shippingAddress: {
        fullName: String,
        phone: String,
        street: String,
        city: String,
        governorate: String
    },

    shippingPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'ShippingPartner', default: null },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
