const express = require('express');
const {
    getAiRecommendations,
    getDemandForecast,
    getInventoryAlerts,
    chatAssistant
} = require('../controllers/aiController');

const router = express.Router();

router.route('/ai/recommend').post(getAiRecommendations);
router.route('/ai/forecast').post(getDemandForecast);
router.route('/ai/inventory-alerts').get(getInventoryAlerts);
router.route('/ai/chat').post(chatAssistant);

module.exports = router;
