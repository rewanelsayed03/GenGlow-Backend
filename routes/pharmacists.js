const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const pharmacistController = require('../controllers/pharmacistController');

// Middleware to handle validation results
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.use(authMiddleware, roleMiddleware('pharmacist'));


// Examination Validations
const updateExaminationValidation = [
    param('id')
        .isMongoId()
        .withMessage('Invalid examination ID'),

    body('status')
        .optional()
        .isIn(['Pending', 'Scheduled', 'Completed', 'Cancelled'])
        .withMessage('Invalid examination status'),

    body('notes')
        .optional()
        .isString()
        .withMessage('Notes must be a string')
];


// Sample Request Validations
const updateSampleRequestValidation = [
    param('id')
        .isMongoId()
        .withMessage('Invalid sample request ID'),

    body('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['Pending', 'Approved', 'Rejected', 'Shipped', 'Cancelled'])
        .withMessage('Invalid sample request status')
];


// Routes

// Examinations
router.get('/examinations', pharmacistController.getAllExaminations);

router.put(
    '/examinations/:id',
    updateExaminationValidation,
    handleValidation,
    pharmacistController.updateExamination
);

// Sample Requests
router.get('/samples', pharmacistController.getAllSampleRequests);

router.put(
    '/samples/:id',
    updateSampleRequestValidation,
    handleValidation,
    pharmacistController.updateSampleRequestStatus
);

module.exports = router;
