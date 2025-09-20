const mongoose = require('mongoose');

const sampleRequestSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Shipped'],
        default: 'Pending',
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SampleRequest', sampleRequestSchema);
