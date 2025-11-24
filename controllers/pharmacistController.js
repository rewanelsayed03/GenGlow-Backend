const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Examination = require('../models/Examination');
const SampleRequest = require('../models/SampleRequest');

// View All Examinations 
exports.getAllExaminations = async (req, res) => {
    try {
        const exams = await Examination.find()
            .populate('customer', 'name email')
            .populate('pharmacist', 'name email');
        res.json(exams);
    } catch (error) {
        console.error('Get All Examinations Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update Examination 
exports.updateExamination = async (req, res) => {
    try {
        const exam = await Examination.findById(req.params.id);
        if (!exam) return res.status(404).json({ error: 'Examination not found' });

        // Pharmacist can update only specific fields
        const { status, notes } = req.body;
        const allowedStatuses = ['Pending', 'Scheduled', 'Completed', 'Cancelled'];

        if (status) {
            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({ error: `Invalid status. Allowed: ${allowedStatuses.join(', ')}` });
            }
            exam.status = status;
        }

        // Update notes even if its empty
        if (typeof notes !== 'undefined') {
            exam.notes = notes;
        }

        // record which pharmacist handled the update (req.user should be set by auth middleware)
        if (req.user && req.user.id) {
            exam.pharmacist = req.user.id;
        }

        const updatedExam = await exam.save();
        res.json({ message: 'Examination updated successfully', examination: updatedExam });
    } catch (error) {
        console.error('Update Examination Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get All Sample Requests 
exports.getAllSampleRequests = async (req, res) => {
    try {
        const requests = await SampleRequest.find()
            .populate('user', 'name email')
            .populate('product', 'name');
        res.json(requests);
    } catch (error) {
        console.error('Get All Sample Requests Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update Sample Request Status 
exports.updateSampleRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const request = await SampleRequest.findById(id);
        if (!request) return res.status(404).json({ error: 'Sample request not found' });

        const allowedSampleStatuses = ['Pending', 'Approved', 'Rejected', 'Shipped', 'Cancelled'];
        if (!allowedSampleStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Allowed: ${allowedSampleStatuses.join(', ')}` });
        }

        request.status = status;
        await request.save();

        res.json({ message: 'Sample request status updated', request });
    } catch (error) {
        console.error('Update Sample Request Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
