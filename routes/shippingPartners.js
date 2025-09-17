const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const shippingPartnerController = require('../controllers/shippingPartnerController');

// All routes need authentication + admin restriction
router.use(authMiddleware, roleMiddleware('admin'));

// CRUD
router.post('/', shippingPartnerController.createShippingPartner);
router.get('/', shippingPartnerController.getAllShippingPartners);
router.get('/:id', shippingPartnerController.getShippingPartnerById);
router.put('/:id', shippingPartnerController.updateShippingPartner);
router.delete('/:id', shippingPartnerController.deleteShippingPartner);

module.exports = router;
