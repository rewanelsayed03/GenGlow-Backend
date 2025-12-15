const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const shippingPartnerController = require('../controllers/shippingPartnerController');

// VALIDATION MIDDLEWARE
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// VALIDATION RULES
const shippingPartnerValidationRules = [
    body('name')
        .notEmpty().withMessage('Name is required'),

    body('phone')
        .notEmpty().withMessage('Phone is required')
        .isMobilePhone().withMessage('Phone must be valid'),

    body('address')
        .notEmpty().withMessage('Address is required')
        .isString().withMessage('Address must be a string'),

    body('orders')
        .optional()
        .isArray().withMessage('Orders must be an array'),

    body('orders.*')
        .optional()
        .isMongoId().withMessage('Each order ID must be a valid Mongo ID'),
];

// ADMIN-ONLY ACCESS
router.use(authMiddleware, roleMiddleware('admin'));

// ROUTES
router.post(
    '/',
    shippingPartnerValidationRules,
    handleValidation,
    shippingPartnerController.createShippingPartner
);

router.get('/', shippingPartnerController.getAllShippingPartners);

router.get('/:id', shippingPartnerController.getShippingPartnerById);

router.put(
    '/:id',
    shippingPartnerValidationRules,
    handleValidation,
    shippingPartnerController.updateShippingPartner
);

router.delete('/:id', shippingPartnerController.deleteShippingPartner);

module.exports = router;
