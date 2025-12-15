const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Middleware to handle validation results  
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.use(authMiddleware);
router.use(roleMiddleware('admin'));


// Validation Rules

// Create user
const createUserValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role')
        .notEmpty().withMessage('Role is required')
        .isIn(['user', 'admin', 'pharmacist'])
        .withMessage('Invalid role')
];

// Update user role
const updateRoleValidation = [
    body('userId').notEmpty().withMessage('User ID is required').isMongoId().withMessage('Invalid user ID'),
    body('role')
        .notEmpty().withMessage('Role is required')
        .isIn(['user', 'admin', 'pharmacist'])
        .withMessage('Invalid role')
];

// Mongo ID param validation
const idParamValidation = [
    param('id').isMongoId().withMessage('Invalid ID')
];

// Update sample request status
const updateSampleRequestValidation = [
    param('id').isMongoId().withMessage('Invalid sample request ID'),
    body('status')
        .notEmpty().withMessage('Status is required')
        .isIn(['Pending', 'Approved', 'Rejected', 'Shipped', 'Cancelled'])
        .withMessage('Invalid status')
];


// User Management
router.post(
    '/create-user',
    createUserValidation,
    handleValidation,
    adminController.createUser
);

router.put(
    '/update-role',
    updateRoleValidation,
    handleValidation,
    adminController.updateUserRole
);

router.get('/users', adminController.getAllUsers);

router.get(
    '/users/:id',
    idParamValidation,
    handleValidation,
    adminController.getUserById
);

router.delete(
    '/users/:id',
    idParamValidation,
    handleValidation,
    adminController.deleteUserById
);


// Examination Management
router.get('/examinations', adminController.getAllExaminationsAdmin);

router.delete(
    '/examinations/:id',
    idParamValidation,
    handleValidation,
    adminController.deleteExamination
);


// Order Management
router.get('/orders', adminController.getAllOrders);

router.delete(
    '/orders/:id',
    idParamValidation,
    handleValidation,
    adminController.deleteOrder
);


// Payment Management
router.get('/payments', adminController.getAllPayments);


// Review Management
router.get('/reviews', adminController.getAllReviews);


// Sample Request Management
router.get('/samples', adminController.getAllSampleRequests);

router.put(
    '/samples/:id',
    updateSampleRequestValidation,
    handleValidation,
    adminController.updateSampleRequest
);

module.exports = router;
