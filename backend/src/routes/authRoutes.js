const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public & Admin Auth Routes
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/profile', authController.getProfile);

// Admin Routes: Officer Approval
router.get('/pending-officers', authController.getPendingOfficers);
router.post('/approve-officer', authController.approveOfficer);

module.exports = router;
