const QuizResult = require('../models/QuizResult');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

// Submit Quiz 
exports.submitQuiz = async (req, res) => {
    try {
        const {
            skinType, skinConcerns = [], hairType, hairConcerns = [],
            sleepHours, pollutionExposure, diet,
            familyHistory = [], allergies = [], goals = []
        } = req.body;

        // Create new quiz result
        const newQuiz = new QuizResult({
            user: req.user._id,
            skinType,
            skinConcerns,
            hairType,
            hairConcerns,
            sleepHours,
            pollutionExposure,
            diet,
            familyHistory,
            allergies,
            goals
        });

        // Logic to find best matching product
        const allProducts = await Product.find();
        let bestMatch = null;
        let highestScore = 0;

        for (const product of allProducts) {
            let score = 0;

         
            if (skinType === 'dry' && /Hydrating|Aloe|Moisturizing/i.test(product.name)) score += 4;
            if (skinType === 'oily' && /Vitamin C|Brightening|Clay|Anti-Pollution|Tea Tree/i.test(product.name)) score += 4;
            if (skinType === 'combination' && /Balance|Gentle|Hydrating|Brightening/i.test(product.name)) score += 4;
            if (skinType === 'sensitive' && /Aloe|Calming|Lavender|Chamomile/i.test(product.name)) score += 4;
            if (skinType === 'normal' && /Daily|Gentle|Balance/i.test(product.name)) score += 3;

            if (skinConcerns.includes('acne') && /Acne|Neem|Tea Tree/i.test(product.name)) score += 5;
            if (skinConcerns.includes('pigmentation') && /Brightening|Vitamin C/i.test(product.name)) score += 5;
            if (skinConcerns.includes('wrinkles') && /Anti-Aging|Ginseng/i.test(product.name)) score += 5;
            if (skinConcerns.includes('redness') && /Aloe|Calming|Chamomile/i.test(product.name)) score += 4;
            if (skinConcerns.includes('dryness') && /Hydrating|Moisturizing|Aloe/i.test(product.name)) score += 4;

            if (hairType === 'straight' && /Shampoo|Oil|Tonic/i.test(product.name)) score += 3;
            if (hairType === 'wavy' && /Moisturizing|Argan|Hibiscus/i.test(product.name)) score += 3;
            if (hairType === 'curly' && /Frizz|Argan|Hydrating/i.test(product.name)) score += 3;
            if (hairType === 'coily' && /Strengthening|Hibiscus|Herbal/i.test(product.name)) score += 3;
            if (hairType === 'normal' && /Herbal|Daily|Shampoo/i.test(product.name)) score += 2;

            if (hairConcerns.includes('hair loss') && /Hair Growth|Hibiscus|Bhringraj|Amla/i.test(product.name)) score += 5;
            if (hairConcerns.includes('dandruff') && /Dandruff|Neem|Rosemary/i.test(product.name)) score += 5;
            if (hairConcerns.includes('frizz') && /Argan|Moisturizing/i.test(product.name)) score += 4;
            if (hairConcerns.includes('split ends') && /Oil|Hibiscus/i.test(product.name)) score += 4;

            if (sleepHours === '<5' && /Brightening|Vitamin C|Eye Cream|Anti-Aging/i.test(product.name)) score += 3;
            if (sleepHours === '5–7' && /Hydrating|Moisturizing|Gentle/i.test(product.name)) score += 2;
            if (sleepHours === '7–9' && /Daily|Fresh|Balance/i.test(product.name)) score += 1;

            if (pollutionExposure === 'daily' && /Anti-Pollution|Detox|Charcoal|Clay/i.test(product.name)) score += 5;
            if (pollutionExposure === 'sometimes' && /Vitamin C|Brightening|Protective/i.test(product.name)) score += 3;
            if (pollutionExposure === 'rarely' && /Natural|Gentle|Herbal/i.test(product.name)) score += 2;

            if (diet === 'high in sugar' && /Acne|Detox|Tea Tree|Charcoal/i.test(product.name)) score += 4;
            if (diet === 'low in protein' && /Strengthening|Hair Growth|Keratin/i.test(product.name)) score += 4;
            if (diet === 'vegan' && /Plant|Herbal|Natural|Organic/i.test(product.name)) score += 3;
            if (diet === 'balanced' && /Daily|Hydrating|Gentle/i.test(product.name)) score += 2;

            if (familyHistory.includes('hair loss') && /Hair Growth|Bhringraj|Hibiscus/i.test(product.name)) score += 4;
            if (familyHistory.includes('sensitive skin') && /Calming|Aloe|Chamomile/i.test(product.name)) score += 4;
            if (familyHistory.includes('eczema') && /Soothing|Aloe|Unscented/i.test(product.name)) score += 4;
            if (familyHistory.includes('premature graying') && /Amla|Bhringraj|Herbal/i.test(product.name)) score += 3;

            // Avoid products
            if (allergies.includes('nuts') && /Argan|Almond|Walnut/i.test(product.name)) score -= 5;
            if (allergies.includes('herbs') && /Herbal|Ayurvedic/i.test(product.name)) score -= 5;
            if (allergies.includes('oils') && /Oil|Essential/i.test(product.name)) score -= 5;

            if (goals.includes('brighten skin') && /Brightening|Vitamin C/i.test(product.name)) score += 5;
            if (goals.includes('control acne') && /Acne|Neem|Tea Tree/i.test(product.name)) score += 5;
            if (goals.includes('stimulate hair growth') && /Hair Growth|Hibiscus|Tonic/i.test(product.name)) score += 5;
            if (goals.includes('reduce frizz') && /Argan|Moisturizing/i.test(product.name)) score += 4;
            if (goals.includes('improve scalp health') && /Dandruff|Rosemary|Herbal/i.test(product.name)) score += 4;
            if (goals.includes('relaxation') && /Lavender|Chamomile|Night Cream|Tea/i.test(product.name)) score += 3;

          
            if (score > highestScore) {
                highestScore = score;
                bestMatch = product;
            }
        }

        if (bestMatch) {
            newQuiz.recommendedProducts = [bestMatch._id];
        }

        const savedQuiz = await newQuiz.save();

        const populatedQuiz = await QuizResult.findById(savedQuiz._id)
            .populate('recommendedProducts', 'name price category');

        res.status(201).json({
            message: 'Quiz submitted successfully with recommended product',
            quizResult: populatedQuiz
        });

    } catch (error) {
        console.error('Submit Quiz Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create Order from Quiz
exports.createOrderFromQuiz = async (req, res) => {
    try {
        const quizResult = await QuizResult.findById(req.params.id).populate('recommendedProducts');
        if (!quizResult) return res.status(404).json({ error: 'Quiz result not found' });

        if (quizResult.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const recommendedProduct = quizResult.recommendedProducts[0];
        if (!recommendedProduct) return res.status(400).json({ error: 'No recommended product available' });


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

// Get All Quiz Results
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

// Get Single Quiz Result
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

// Update Quiz Result
exports.updateQuizResult = async (req, res) => {
    try {
        const quizResult = await QuizResult.findById(req.params.id);
        if (!quizResult) return res.status(404).json({ error: 'Quiz result not found' });

        Object.assign(quizResult, req.body);
        const updatedResult = await quizResult.save();
        const populated = await QuizResult.findById(updatedResult._id)
            .populate('recommendedProducts', 'name price category');

        res.json({ message: 'Quiz result updated', quizResult: populated });
    } catch (error) {
        console.error('Update QuizResult Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete Quiz Result
exports.deleteQuizResult = async (req, res) => {
    try {
        const quizResult = await QuizResult.findById(req.params.id);
        if (!quizResult) return res.status(404).json({ error: 'Quiz result not found' });

        await quizResult.deleteOne();
        res.json({ message: 'Quiz result deleted successfully' });
    } catch (error) {
        console.error('Delete QuizResult Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
