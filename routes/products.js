const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

// Middleware to handle validation results
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Validation rules for creating/updating product
const productValidationRules = [
    body('name').notEmpty().withMessage('Product name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 1 }).withMessage('Price must be a positive number'),
    body('stock').isInt({ min: 1 }).withMessage('Stock must be a non-negative integer'),
    body('category').notEmpty().withMessage('Category is required'),
    body('supplier').notEmpty().withMessage('Supplier is required')
        .isMongoId().withMessage('Supplier must be a valid Mongo ID')

];

// Public: anyone can see products
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected: only admin/pharmacist can manage products
router.post('/', authMiddleware, roleMiddleware('admin', 'pharmacist'),
    productValidationRules,
    handleValidation,
    createProduct
);

router.put('/:id', authMiddleware, roleMiddleware('admin', 'pharmacist'),
    productValidationRules,
    handleValidation,
    updateProduct
);

router.delete('/:id', authMiddleware, roleMiddleware('admin', 'pharmacist'),
    deleteProduct
);

module.exports = router;
