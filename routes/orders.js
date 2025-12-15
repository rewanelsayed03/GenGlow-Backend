const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const orderController = require('../controllers/orderController');

// Middleware to handle validation results
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Validation rules for creating/updating order
const  createOrderValidationRules = [
    // Products array required
    body('products').isArray({ min: 1 }).withMessage('Products array is required and cannot be empty'),
    body('products.*.product').notEmpty().withMessage('Product ID is required').isMongoId().withMessage('Invalid product ID'),
    body('products.*.quantity').notEmpty().withMessage('Quantity is required').isInt({ min: 1 }).withMessage('Quantity must be >= 1'),
];

const updateOrderValidationRules = [
    // Optional status with allowed values
    body('status').optional().isIn(['Pending', 'Processed', 'Shipped', 'Delivered', 'Cancelled'])
        .withMessage('Invalid status value'),
    body('shippingPartner').optional().isMongoId().withMessage('Invalid shipping partner ID')
];

// Routes
router.use(authMiddleware);

// Get all orders for logged-in user
router.get('/myorders', roleMiddleware('user'), orderController.getMyOrders);

// Get single order (user can see own; admin/pharmacist can see any)
router.get('/:id', orderController.getOrderById);

// Create order (user only)
router.post('/', roleMiddleware('user'),
    createOrderValidationRules,
    handleValidation,
    orderController.createOrder
);

// Update order (admin/pharmacist only)
router.put('/:id', roleMiddleware('admin', 'pharmacist'),
    updateOrderValidationRules,
    handleValidation,
    orderController.updateOrder
);

// Cancel order (user can cancel own; status checks inside controller)
router.patch('/:id/cancel', orderController.cancelOrder);

module.exports = router;
