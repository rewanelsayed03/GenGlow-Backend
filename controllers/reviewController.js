const Review = require('../models/Review');
const Product = require('../models/Product');

// Create Review
exports.createReview = async (req, res) => {
    try {
        const { product, rating, comment } = req.body;

        if (!product || !rating) {
            return res.status(400).json({ error: 'Product and rating are required' });
        }

        // Check if product exists
        const productExists = await Product.findById(product);
        if (!productExists) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const review = new Review({
            user: req.user._id,
            product,
            rating,
            comment
        });

        await review.save();
        res.status(201).json({ message: 'Review added', review });
    } catch (error) {
        console.error('Create Review Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all reviews for a product
exports.getReviewsForProduct = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate('user', 'name email')
            .sort({ createdAt: -1 }); // latest review

        res.json(reviews);
    } catch (error) {
        console.error('Get Reviews Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update review (only owner)
exports.updateReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ error: 'Review not found' });

        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // If the client sends a rating/comment, update it.
        // If the client does not send a rating/comment, keep the existing rating/comment.
        review.rating = req.body.rating ?? review.rating;
        review.comment = req.body.comment ?? review.comment;
        await review.save();

        res.json({ message: 'Review updated', review });
    } catch (error) {
        console.error('Update Review Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete review (only owner or admin)
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ error: 'Review not found' });

        // review.user --> owner 
        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        await Review.findByIdAndDelete(req.params.id);
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Delete Review Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
