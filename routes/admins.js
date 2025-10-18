const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware('admin'));

// User Management Routes
router.post('/create-user', adminController.createUser);
router.put('/update-role', adminController.updateUserRole);
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.delete('/users/:id', adminController.deleteUserById);

// Examination Management 
router.get('/examinations', adminController.getAllExaminationsAdmin);
router.delete('/examinations/:id', adminController.deleteExamination);

// Order Management 
router.get('/orders', adminController.getAllOrders);
router.delete('/orders/:id', adminController.deleteOrder);

// Payment Management 
router.get('/payments', adminController.getAllPayments);

// Review Management
router.get('/reviews', adminController.getAllReviews);

// Sample Request Management
router.get('/samples', adminController.getAllSampleRequests);
router.put('/samples/:id', adminController.updateSampleRequest);


module.exports = router;
