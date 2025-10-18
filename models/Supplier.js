const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    address: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
