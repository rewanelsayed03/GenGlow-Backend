const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const orderController = require('../controllers/orderController');

router.use(authMiddleware);

router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.delete('/:id', roleMiddleware('admin'), orderController.deleteOrder);
router.put('/:id', roleMiddleware('admin', 'pharmacist'), orderController.updateOrder);
router.patch('/:id/cancel', orderController.cancelOrder);

module.exports = router;
