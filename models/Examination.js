const mongoose = require('mongoose');

const examinationSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // the user booking
    pharmacist: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // assigned later
    date: { type: Date, required: true },
    notes: { type: String },
    status: {
        type: String,
        enum: ['Pending', 'Scheduled', 'Completed', 'Cancelled'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Examination', examinationSchema);
