const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const examController = require('../controllers/examinationController');

router.use(authMiddleware);

router.post('/', roleMiddleware('user'), examController.createExamination);
router.get('/', examController.getAllExaminations);
router.get('/:id', examController.getExaminationById);
router.put('/:id', examController.updateExamination);
router.delete('/:id', roleMiddleware('admin'), examController.deleteExamination);

module.exports = router;
