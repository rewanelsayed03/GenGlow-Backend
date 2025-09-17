const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');


// Public: anyone can see products
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected: only admin/pharmacist can manage products
router.post('/', authMiddleware, roleMiddleware('admin', 'pharmacist'), createProduct);
router.put('/:id', authMiddleware, roleMiddleware('admin', 'pharmacist'), updateProduct);
router.delete('/:id', authMiddleware, roleMiddleware('admin', 'pharmacist'), deleteProduct);



module.exports = router;
