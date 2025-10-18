const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const sampleRequestController = require('../controllers/sampleRequestController');

// User routes
router.post('/', authMiddleware, sampleRequestController.createSampleRequest);
router.get('/my', authMiddleware, sampleRequestController.getMySampleRequests);
router.patch('/:id/cancel', authMiddleware, sampleRequestController.cancelSampleRequest);

module.exports = router;
