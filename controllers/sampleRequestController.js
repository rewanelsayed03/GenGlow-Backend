const SampleRequest = require('../models/SampleRequest');

// Create a sample request
exports.createSampleRequest = async (req, res) => {
    try {
        const { productId } = req.body;
        const newRequest = await SampleRequest.create({
            user: req.user._id,
            product: productId
        });
        res.status(201).json({ message: 'Sample request submitted', request: newRequest });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get logged-in user’s requests
exports.getMySampleRequests = async (req, res) => {
    try {
        const requests = await SampleRequest.find({ user: req.user._id })
            .populate('product', 'name price');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all requests (admin)
exports.getAllSampleRequests = async (req, res) => {
    try {
        const requests = await SampleRequest.find()
            .populate('user', 'name email')
            .populate('product', 'name price');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update status (Admin only)
exports.updateSampleRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updated = await SampleRequest.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Cancel request (User only)
exports.cancelSampleRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await SampleRequest.findById(id);

        if (!request) return res.status(404).json({ message: 'Sample request not found' });

        if (request.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to cancel this request' });
        }

        if (['Approved', 'Cancelled'].includes(request.status)) {
            return res.status(400).json({ message: 'Cannot cancel this request' });
        }

        request.status = 'Cancelled';
        await request.save();

        res.json({ message: 'Sample request cancelled successfully', request });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

