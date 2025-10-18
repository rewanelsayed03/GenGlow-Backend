const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const pharmacistController = require('../controllers/pharmacistController');

router.use(authMiddleware, roleMiddleware('pharmacist'));

// Examinations
router.get('/examinations', pharmacistController.getAllExaminations);
router.put('/examinations/:id', pharmacistController.updateExamination);

// Sample Requests
router.get('/samples', pharmacistController.getAllSampleRequests);
router.put('/samples/:id', pharmacistController.updateSampleRequestStatus);

module.exports = router;
