const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
    getUserProfile,
    updateUserProfile,
    deleteUserAccount,   // user delete self
    getAllUsers,         // admin only
    getUserById,         // admin only
    updateUserById,      // admin only
    deleteUserById       // admin only
} = require('../controllers/userController');

// Logged-in user routes
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.delete('/profile', authMiddleware, deleteUserAccount);

// Admin routes
router.get('/', authMiddleware, roleMiddleware('admin'), getAllUsers);
router.get('/:id', authMiddleware, roleMiddleware('admin'), getUserById);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateUserById);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteUserById);

module.exports = router;
