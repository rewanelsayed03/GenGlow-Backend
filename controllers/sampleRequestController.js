const SampleRequest = require('../models/SampleRequest');
const Product = require('../models/Product');

// Create a sample request (User only)
exports.createSampleRequest = async (req, res) => {
    try {
        if (req.user.role !== 'user') {
            return res.status(403).json({ message: 'Only users can request samples' });
        }

        const { productId } = req.body;
        if (!productId) return res.status(400).json({ message: 'Product ID is required' });

        const productExists = await Product.findById(productId);
        if (!productExists) return res.status(404).json({ message: 'Product not found' });

        const newRequest = await SampleRequest.create({
            user: req.user._id,
            product: productId
        });

        res.status(201).json({ message: 'Sample request submitted', request: newRequest });
    } catch (error) {
        console.error('Create Sample Request Error:', error);
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
        console.error('Get My Sample Requests Error:', error);
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
        console.error('Cancel Sample Request Error:', error);
        res.status(500).json({ error: error.message });
    }
};


