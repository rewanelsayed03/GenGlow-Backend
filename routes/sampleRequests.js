const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const sampleRequestController = require('../controllers/sampleRequestController');

// User routes
router.post('/', authMiddleware, sampleRequestController.createSampleRequest);
router.get('/my', authMiddleware, sampleRequestController.getMySampleRequests);

// Admin routes
router.get('/', authMiddleware, roleMiddleware('admin'), sampleRequestController.getAllSampleRequests);
router.put('/:id', authMiddleware, roleMiddleware('admin'), sampleRequestController.updateSampleRequest);

module.exports = router;
