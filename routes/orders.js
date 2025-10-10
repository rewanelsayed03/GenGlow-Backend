const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const orderController = require('../controllers/orderController');

// All endpoints need authentication
router.use(authMiddleware);

// Normal users can: place order, see own orders, delete own orders
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.delete('/:id', orderController.deleteOrder);

// Only admins/pharmacists can update shippingPartner or products
router.put('/:id', roleMiddleware('admin', 'pharmacist'), orderController.updateOrder);

// Only users/admins can cancel orders
router.patch('/:id/cancel', authMiddleware, orderController.cancelOrder);

module.exports = router;
