const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
    getUserProfile,
    updateUserProfile,
    deleteUserAccount  // user delete himself
   
} = require('../controllers/userController');

// Logged-in user routes
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.delete('/profile', authMiddleware, deleteUserAccount);


module.exports = router;
