const mongoose = require('mongoose');

const shippingPartnerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
}, { timestamps: true });

module.exports = mongoose.model('ShippingPartner', shippingPartnerSchema);
