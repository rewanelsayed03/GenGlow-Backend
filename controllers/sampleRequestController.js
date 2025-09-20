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

// Admin: Get all requests
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

// Admin: Update status
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
