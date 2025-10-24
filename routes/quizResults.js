const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const QuizResultController = require('../controllers/QuizResultController');

// Normal user submits quiz
router.post('/', roleMiddleware('user'), authMiddleware, QuizResultController.submitQuiz);

// Admin / pharmacist can see all results
router.get('/', authMiddleware, roleMiddleware('admin', 'pharmacist'), QuizResultController.getAllQuizResults);

// Users and Admins can get a specific quiz result
router.get('/:id', authMiddleware, QuizResultController.getQuizResultById);

// Create order from quiz result (for users)
router.post('/:id/order', authMiddleware, QuizResultController.createOrderFromQuiz);

// Update & delete (restricted to Admin / pharmacist)
router.put('/:id', authMiddleware, roleMiddleware('admin', 'pharmacist'), QuizResultController.updateQuizResult);
router.delete('/:id', authMiddleware, roleMiddleware('admin', 'pharmacist'), QuizResultController.deleteQuizResult);

module.exports = router;
