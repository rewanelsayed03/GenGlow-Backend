const Examination = require('../models/Examination');

//  Create Examination  (Customer books with Pharmacist)

exports.createExamination = async (req, res) => {
    try {
        if (req.user.role !== 'user') {
            return res.status(403).json({ error: 'Only users can book examinations' });
        }

        const { date, notes } = req.body;
        if (!date) return res.status(400).json({ error: 'Date is required' });

        const examination = new Examination({
            customer: req.user._id,   
            date,
            notes: notes || '',
            status: 'Pending'
        });

        await examination.save();

        const populated = await Examination.findById(examination._id)
            .populate('customer', 'name email');

        res.status(201).json({ message: 'Examination booked', examination: populated });
    } catch (error) {
        console.error('Create Examination Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


// Get all Examinations (Admin/Pharmacist see all, customer sees own)
exports.getAllExaminations = async (req, res) => {
    try {
        let exams;
        if (req.user.role === 'admin' || req.user.role === 'pharmacist') {
            exams = await Examination.find().populate('customer', 'name email').populate('pharmacist', 'name email');
        } else {
            exams = await Examination.find({ customer: req.user._id }).populate('pharmacist', 'name email');
        }
        res.json(exams);
    } catch (error) {
        console.error('Get All Examinations Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get single Examination
exports.getExaminationById = async (req, res) => {
    try {
        const exam = await Examination.findById(req.params.id)
            .populate('customer', 'name email')
            .populate('pharmacist', 'name email');

        if (!exam) return res.status(404).json({ error: 'Examination not found' });

        if (req.user.role === 'user' && exam.customer._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(exam);
    } catch (error) {
        console.error('Get Examination Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update Examination (Pharmacist/Admin can update, customer can cancel)
exports.updateExamination = async (req, res) => {
    try {
        const exam = await Examination.findById(req.params.id);
        if (!exam) return res.status(404).json({ error: 'Examination not found' });

        if (req.user.role === 'user' && exam.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Customer can only cancel
        if (req.user.role === 'user') {
            exam.status = 'Cancelled';
        } else {
            Object.assign(exam, req.body);
        }

        const updated = await exam.save();
        res.json({ message: 'Examination updated', examination: updated });
    } catch (error) {
        console.error('Update Examination Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete Examination (Admin only)
exports.deleteExamination = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admin can delete examinations' });
        }

        const exam = await Examination.findByIdAndDelete(req.params.id);
        if (!exam) return res.status(404).json({ error: 'Examination not found' });

        res.json({ message: 'Examination deleted' });
    } catch (error) {
        console.error('Delete Examination Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
