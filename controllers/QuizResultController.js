const QuizResult = require('../models/QuizResult');
const Product = require('../models/Product');
const Order = require('../models/Order');

//  Submit/Create Quiz Result with Recommendations

exports.createOrderFromQuiz = async (req, res) => {
    try {
        const quizResult = await QuizResult.findById(req.params.id).populate('recommendedProducts');
        if (!quizResult) return res.status(404).json({ error: 'Quiz result not found' });

        if (quizResult.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const recommendedProduct = quizResult.recommendedProducts[0];
        if (!recommendedProduct) return res.status(400).json({ error: 'No recommended product found' });

        const order = new Order({
            user: req.user._id,
            products: [{ product: recommendedProduct._id, quantity: 1 }],
            totalPrice: recommendedProduct.price,
        });

        await order.save();

        const populatedOrder = await Order.findById(order._id)
            .populate('user', 'name email')
            .populate('products.product', 'name price category');

        res.status(201).json({
            message: 'Order created from quiz recommendation',
            order: populatedOrder
        });

    } catch (error) {
        console.error('Create Order from Quiz Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


exports.submitQuiz = async (req, res) => {
    try {
        const { skinType, skinConcerns, hairType, hairConcerns, goals } = req.body;

        let recommendedProduct = null;

        // Rule-based product mapping (1 unique product per quiz)
        if (skinConcerns?.includes('acne')) {
            recommendedProduct = await Product.findOne({ name: /Herbal Acne Serum/i });
        } else if (goals?.includes('anti-aging')) {
            recommendedProduct = await Product.findOne({ name: /Anti-Aging Herbal Cream/i });
        } else if (skinType === 'dry') {
            recommendedProduct = await Product.findOne({ name: /Hydrating Aloe Gel/i });
        } else if (skinType === 'oily') {
            recommendedProduct = await Product.findOne({ name: /Brightening Vitamin C Cream/i });
        } else if (hairType === 'dry') {
            recommendedProduct = await Product.findOne({ name: /Moisturizing Argan Shampoo/i });
        } else if (hairConcerns?.includes('dandruff')) {
            recommendedProduct = await Product.findOne({ name: /Herbal Dandruff Shampoo/i });
        } else if (hairConcerns?.includes('hair fall')) {
            recommendedProduct = await Product.findOne({ name: /Strengthening Hibiscus Oil/i });
        } else if (goals?.includes('relaxation')) {
            recommendedProduct = await Product.findOne({ name: /Relaxing Lavender Oil/i });
        } else {
            // default fallback product
            recommendedProduct = await Product.findOne({ name: /Detox Herbal Tea/i });
        }

        // Save quiz result with exactly 1 recommended product
        const quizResult = new QuizResult({
            ...req.body,
            user: req.user._id,
            recommendedProducts: recommendedProduct ? [recommendedProduct._id] : []
        });

        await quizResult.save();
        const populated = await QuizResult.findById(quizResult._id)
            .populate('user', 'name email')
            .populate('recommendedProducts', 'name price category');

        res.status(201).json({
            message: 'Quiz submitted with personalized recommendation',
            quizResult: populated
        });
    } catch (error) {
        console.error('Submit Quiz Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

//  Get All Quiz Results 
exports.getAllQuizResults = async (req, res) => {
    try {
        let results;
        if (req.user.role === 'admin' || req.user.role === 'pharmacist') {
            results = await QuizResult.find()
                .populate('user', 'name email role')
                .populate('recommendedProducts', 'name price category');
        } else {
            results = await QuizResult.find({ user: req.user._id })
                .populate('user', 'name email')
                .populate('recommendedProducts', 'name price category');
        }
        res.json(results);
    } catch (error) {
        console.error('Get All QuizResults Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

//  Get Single Quiz Result 
exports.getQuizResultById = async (req, res) => {
    try {
        const quizResult = await QuizResult.findById(req.params.id)
            .populate('user', 'name email role')
            .populate('recommendedProducts', 'name price category');

        if (!quizResult) return res.status(404).json({ error: 'Quiz result not found' });

        if (req.user.role === 'user' && quizResult.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(quizResult);
    } catch (error) {
        console.error('Get QuizResultById Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

//  Update Quiz Result 
exports.updateQuizResult = async (req, res) => {
    try {
        const quizResult = await QuizResult.findById(req.params.id);
        if (!quizResult) return res.status(404).json({ error: 'Quiz result not found' });

        if (req.user.role === 'user' && quizResult.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        Object.assign(quizResult, req.body);
        const updatedResult = await quizResult.save();
        const populated = await QuizResult.findById(updatedResult._id).populate('recommendedProducts', 'name price category');

        res.json({ message: 'Quiz result updated', quizResult: populated });
    } catch (error) {
        console.error('Update QuizResult Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

//  Delete Quiz Result
exports.deleteQuizResult = async (req, res) => {
    try {
        const quizResult = await QuizResult.findById(req.params.id);
        if (!quizResult) return res.status(404).json({ error: 'Quiz result not found' });

        if (req.user.role === 'user' && quizResult.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await quizResult.deleteOne();
        res.json({ message: 'Quiz result deleted successfully' });
    } catch (error) {
        console.error('Delete QuizResult Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
