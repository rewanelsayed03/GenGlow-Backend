const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const orderController = require('../controllers/orderController');

router.use(authMiddleware);

router.get('/:id', orderController.getOrderById);
router.post('/', roleMiddleware('user'), orderController.createOrder);
router.put('/:id', roleMiddleware('admin', 'pharmacist'), orderController.updateOrder);
router.patch('/:id/cancel', orderController.cancelOrder);

module.exports = router;
