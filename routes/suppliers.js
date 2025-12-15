const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
    createSupplier,
    getAllSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier
} = require('../controllers/supplierController');

// Middleware to handle validation results
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Validation rules for creating/updating supplier
const supplierValidationRules = [
    body('name').notEmpty().withMessage('Supplier name is required'),
    body('email').optional().isEmail().withMessage('Email must be valid'),
    body('phone').optional().isMobilePhone().withMessage('Phone must be valid')
];

// Public: anyone can see suppliers
router.get('/', authMiddleware, roleMiddleware('admin'), getAllSuppliers);
router.get('/:id', authMiddleware, roleMiddleware('admin'), getSupplierById);

// Protected: only admin can manage suppliers
router.post('/', authMiddleware, roleMiddleware('admin'),
    supplierValidationRules,
    handleValidation,
    createSupplier
);

router.put('/:id', authMiddleware, roleMiddleware('admin'),
    supplierValidationRules,
    handleValidation,
    updateSupplier
);

router.delete('/:id', authMiddleware, roleMiddleware('admin'),
    deleteSupplier
);

module.exports = router;
