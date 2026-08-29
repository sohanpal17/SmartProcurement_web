const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');

// Public & Web Admin Routes for Live Queue Processing
router.get('/status/:tokenNumber', queueController.getQueueStatusByToken);
router.post('/update-stage', queueController.updateQueueStageByAdmin);
router.get('/mandi-tokens', queueController.getMandiQueueTokens);

module.exports = router;
